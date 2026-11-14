"""NASA GPM IMERG Precipitation Service.

Integrates with the official NASA Global Precipitation Measurement (GPM)
Integrated Multi-satellitE Retrievals for GPM (IMERG) daily dataset:
- Product: GPM_3IMERGDF (IMERG Final Daily Precipitation)
- Spatial resolution: 0.1° x 0.1° (~10 km)
- Temporal resolution: Daily
- Parameter: precipitationCal (Daily calibrated precipitation in mm/day)

NASA Data Access Workflow:
1. NASA CMR (Common Metadata Repository) Granule Discovery:
   - Endpoint: https://cmr.earthdata.nasa.gov/search/granules.json
   - Authentication: Free open public API (no credentials required).
2. NASA GES DISC OPeNDAP & Data Access:
   - Endpoint: https://opendap.earthdata.nasa.gov/collections/C2723754864-GES_DISC/
   - Authentication: Requires free NASA Earthdata Login (urs.earthdata.nasa.gov).
   - Configured via EARTHDATA_USERNAME and EARTHDATA_PASSWORD in .env.
"""
import logging
import re
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple, Union
from urllib.parse import urlparse

import requests
from app.utils.config import settings

logger = logging.getLogger(__name__)

# Official NASA CMR Granule Search Endpoint
NASA_CMR_SEARCH_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"
GPM_SHORT_NAME = "GPM_3IMERGDF"
GPM_VERSION = "07"
DEFAULT_TIMEOUT = 30
DEFAULT_LAG_DAYS = 90  # GPM IMERG Final runs on ~3.5-month latency; Late runs on ~14-hour latency


class EarthdataSession(requests.Session):
    """Requests Session that preserves HTTP Basic Auth across redirects to urs.earthdata.nasa.gov."""

    def rebuild_auth(self, prepared_request, response):
        headers = prepared_request.headers
        url = prepared_request.url
        redirect_parsed = urlparse(url)

        if "Authorization" in headers:
            orig_req = getattr(response, "request", None)
            orig_url = getattr(orig_req, "url", "") if orig_req else ""
            original_parsed = urlparse(orig_url)
            if (
                original_parsed.hostname != redirect_parsed.hostname
                and redirect_parsed.hostname != "urs.earthdata.nasa.gov"
            ):
                del headers["Authorization"]
        elif self.auth and redirect_parsed.hostname == "urs.earthdata.nasa.gov":
            prepared_request.prepare_auth(self.auth)
        return


class NasaGpmError(Exception):
    """Base exception for NASA GPM operations."""
    pass


class NasaGpmValidationError(NasaGpmError):
    """Raised when coordinates or date ranges fail validation."""
    pass


class NasaGpmAuthenticationError(NasaGpmError):
    """Raised when NASA Earthdata authentication fails."""
    pass


class NasaGpmConnectionError(NasaGpmError):
    """Raised when network, connection, or timeout issues occur."""
    pass


class NasaGpmResponseError(NasaGpmError):
    """Raised when upstream API returns an error or malformed payload."""
    pass


def validate_coordinates(latitude: float, longitude: float) -> None:
    """Validate that coordinates fall within valid geographic bounds."""
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (ValueError, TypeError) as err:
        raise NasaGpmValidationError(
            f"Coordinates must be numeric values. Received latitude='{latitude}', longitude='{longitude}'."
        ) from err

    if lat < -90.0 or lat > 90.0:
        raise NasaGpmValidationError(
            f"Invalid latitude '{latitude}'. Latitude must be between -90.0 and 90.0 degrees."
        )
    if lon < -180.0 or lon > 180.0:
        raise NasaGpmValidationError(
            f"Invalid longitude '{longitude}'. Longitude must be between -180.0 and 180.0 degrees."
        )


def _parse_single_date(d: Union[str, date, datetime]) -> date:
    """Parse date from string or date/datetime object."""
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, date):
        return d
    if isinstance(d, str):
        cleaned = d.strip()
        if len(cleaned) == 10 and cleaned[4] == "-" and cleaned[7] == "-":
            try:
                return datetime.strptime(cleaned, "%Y-%m-%d").date()
            except ValueError as err:
                raise NasaGpmValidationError(f"Invalid date value '{d}': {err}") from err
        if len(cleaned) == 8 and cleaned.isdigit():
            try:
                return datetime.strptime(cleaned, "%Y%m%d").date()
            except ValueError as err:
                raise NasaGpmValidationError(f"Invalid date value '{d}': {err}") from err
        raise NasaGpmValidationError(f"Invalid date format for '{d}'. Expected YYYY-MM-DD or YYYYMMDD.")
    raise NasaGpmValidationError(f"Unsupported date type: {type(d)}")


def validate_date_range(
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    default_days: int = 5,
    lag_days: int = DEFAULT_LAG_DAYS
) -> Tuple[date, date, str, str]:
    """Validate and format start and end dates."""
    reference_today = datetime.now(timezone.utc).date()

    if start_date is None and end_date is None:
        end_obj = reference_today - timedelta(days=lag_days)
        start_obj = end_obj - timedelta(days=default_days - 1)
    elif start_date is not None and end_date is None:
        start_obj = _parse_single_date(start_date)
        end_obj = start_obj + timedelta(days=default_days - 1)
    elif start_date is None and end_date is not None:
        end_obj = _parse_single_date(end_date)
        start_obj = end_obj - timedelta(days=default_days - 1)
    else:
        start_obj = _parse_single_date(start_date)
        end_obj = _parse_single_date(end_date)

    if start_obj > end_obj:
        raise NasaGpmValidationError(
            f"Start date '{start_obj.isoformat()}' cannot exceed end date '{end_obj.isoformat()}'."
        )

    if start_obj > reference_today:
        raise NasaGpmValidationError(
            f"Start date '{start_obj.isoformat()}' cannot be in the future. NASA GPM provides historical satellite observations."
        )

    return start_obj, end_obj, start_obj.strftime("%Y-%m-%d"), end_obj.strftime("%Y-%m-%d")


def evaluate_rainfall_trend(daily_values: List[float]) -> str:
    """Calculate rainfall trend direction over the period."""
    if not daily_values or sum(daily_values) == 0.0:
        return "dry_spell"
    if len(daily_values) < 4:
        return "steady"

    mid = len(daily_values) // 2
    first_half = sum(daily_values[:mid])
    second_half = sum(daily_values[mid:])

    if second_half > first_half * 1.25:
        return "increasing"
    if second_half < first_half * 0.75:
        return "decreasing"
    return "steady"


def search_gpm_granules(
    latitude: float,
    longitude: float,
    start_iso: str,
    end_iso: str,
    timeout: int = DEFAULT_TIMEOUT,
    cmr_url: str = NASA_CMR_SEARCH_URL
) -> List[Dict[str, Any]]:
    """Search NASA CMR API for official GPM IMERG Daily granules covering the coordinate.
    
    This uses the public NASA Earthdata CMR API without requiring credentials.
    """
    params = {
        "short_name": GPM_SHORT_NAME,
        "version": GPM_VERSION,
        "point": f"{longitude},{latitude}",
        "temporal": f"{start_iso}T00:00:00Z,{end_iso}T23:59:59Z",
        "page_size": 100,
    }

    try:
        resp = requests.get(cmr_url, params=params, timeout=timeout)
    except requests.exceptions.Timeout as err:
        logger.error("NASA CMR search timed out: %s", err)
        raise NasaGpmConnectionError(f"NASA CMR granule search timed out after {timeout} seconds.") from err
    except requests.exceptions.RequestException as err:
        logger.error("NASA CMR connection error: %s", err)
        raise NasaGpmConnectionError(f"Failed to connect to NASA CMR search service: {err}") from err

    if resp.status_code != 200:
        raise NasaGpmResponseError(f"NASA CMR returned HTTP status {resp.status_code}.")

    try:
        feed = resp.json().get("feed", {})
        return feed.get("entry", [])
    except Exception as err:
        raise NasaGpmResponseError(f"Failed to parse NASA CMR search response: {err}") from err


def extract_opendap_url(granule: Dict[str, Any]) -> Optional[str]:
    """Find the OPeNDAP or DAP service URL from CMR granule link descriptors."""
    links = granule.get("links", [])
    for link in links:
        href = link.get("href", "")
        rel = link.get("rel", "")
        link_type = link.get("type", "")
        if (
            "opendap" in href.lower()
            or "opendap" in link_type.lower()
            or "service#" in rel
        ):
            return href
    return None


def fetch_opendap_precipitation(
    opendap_url: str,
    latitude: float,
    longitude: float,
    session: requests.Session,
    timeout: int = DEFAULT_TIMEOUT
) -> Tuple[Optional[float], str]:
    """Query NASA GES DISC OPeNDAP DAP endpoint for calibrated daily precipitation at coordinates.
    
    Returns:
        Tuple of (precipitation_value_or_none, status_string)
    """
    lon_idx = max(0, min(3599, int(round((longitude + 179.95) / 0.1))))
    lat_idx = max(0, min(1799, int(round((latitude + 89.95) / 0.1))))

    base_url = opendap_url.split("?")[0]
    if base_url.endswith(".html"):
        base_url = base_url[:-5]
    if not base_url.endswith(".nc4") and not base_url.endswith(".nc4.ascii"):
        if ".nc4" in base_url:
            base_url = base_url[:base_url.find(".nc4") + 4]

    query_url = f"{base_url}.ascii?precipitationCal[{lon_idx}:1:{lon_idx}][{lat_idx}:1:{lat_idx}]"

    try:
        resp = session.get(query_url, timeout=timeout)
        if resp.status_code == 200:
            matches = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", resp.text)
            if matches:
                val = float(matches[-1])
                if val <= -900.0 or val < 0.0:
                    return None, "sentinel"
                return round(val, 2), "success"
            return None, "parse_error"
        elif resp.status_code in (401, 403):
            return None, "earthdata_auth_failed"
        else:
            return None, f"http_{resp.status_code}"
    except (requests.exceptions.Timeout, requests.exceptions.RequestException) as err:
        logger.warning("OPeNDAP connection error: %s", err)
        return None, "connection_error"


def fetch_gpm_imerg(
    latitude: float,
    longitude: float,
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    timeout: int = DEFAULT_TIMEOUT,
    mock_observations: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Retrieve daily GPM IMERG precipitation data and calculate summary statistics.
    
    Args:
        latitude: Target latitude (-90 to 90).
        longitude: Target longitude (-180 to 180).
        start_date: Start date (YYYY-MM-DD).
        end_date: End date (YYYY-MM-DD).
        timeout: HTTP timeout in seconds.
        mock_observations: Optional pre-parsed observation list for automated tests.
        
    Returns:
        Structured response matching NasaGpmSummaryResponse.
    """
    validate_coordinates(latitude, longitude)
    _, _, start_iso, end_iso = validate_date_range(start_date, end_date)

    # 1. Search NASA CMR for official GPM IMERG granules
    granules = search_gpm_granules(latitude, longitude, start_iso, end_iso, timeout=timeout)
    granules_count = len(granules)

    # 2. Check Earthdata authentication credentials
    has_credentials = bool(settings.EARTHDATA_USERNAME and settings.EARTHDATA_PASSWORD)

    # 3. Process Observations
    daily_data: List[Dict[str, Any]] = []

    if mock_observations is not None:
        daily_data = mock_observations
        auth_status = "authenticated_test_mode"
    elif has_credentials:
        # In authenticated mode, we use Earthdata credentials against GES DISC OPeNDAP
        session = EarthdataSession()
        session.auth = (settings.EARTHDATA_USERNAME, settings.EARTHDATA_PASSWORD)
        overall_auth_status = "authenticated"

        for g in granules:
            time_start = g.get("time_start", "")
            obs_date = time_start[:10] if len(time_start) >= 10 else start_iso
            dap_url = extract_opendap_url(g)

            if dap_url:
                precip_val, stat = fetch_opendap_precipitation(
                    dap_url, latitude, longitude, session=session, timeout=timeout
                )
                if stat == "earthdata_auth_failed":
                    overall_auth_status = "earthdata_auth_failed"
                daily_data.append({"date": obs_date, "precipitation": precip_val})
            else:
                daily_data.append({"date": obs_date, "precipitation": None})
        auth_status = overall_auth_status
    else:
        # Transparent reporting when Earthdata credentials are not configured in .env
        auth_status = "earthdata_credentials_required"
        # Granules discovered from NASA CMR metadata
        for g in granules:
            time_start = g.get("time_start", "")
            obs_date = time_start[:10] if len(time_start) >= 10 else start_iso
            daily_data.append({"date": obs_date, "precipitation": None})

    # 4. Compute Statistical Summary over valid precipitation values
    valid_precips = [
        d["precipitation"] for d in daily_data if d.get("precipitation") is not None and d["precipitation"] >= 0.0
    ]

    total_rain = round(sum(valid_precips), 2) if valid_precips else None
    avg_rain = round(sum(valid_precips) / len(valid_precips), 2) if valid_precips else None
    max_rain = round(max(valid_precips), 2) if valid_precips else None
    min_rain = round(min(valid_precips), 2) if valid_precips else None
    rainy_days = sum(1 for p in valid_precips if p >= 1.0)
    dry_days = sum(1 for p in valid_precips if p < 1.0)
    trend = evaluate_rainfall_trend(valid_precips) if valid_precips else ("dry_spell" if not daily_data else "insufficient_data")

    summary = {
        "total_rainfall": total_rain,
        "average_daily_rainfall": avg_rain,
        "max_daily_rainfall": max_rain,
        "min_daily_rainfall": min_rain,
        "rainy_days_count": rainy_days,
        "dry_days_count": dry_days,
        "rainfall_trend": trend,
    }

    units = {
        "precipitation": "mm",
        "daily_rainfall": "mm/day",
        "total_rainfall": "mm",
    }

    return {
        "success": True,
        "source": "NASA GPM IMERG",
        "dataset": "GPM_3IMERGDF V07B (Daily Final)",
        "spatial_resolution": "0.1° x 0.1° (~10 km)",
        "temporal_resolution": "Daily",
        "location": {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
        },
        "period": {
            "start_date": start_iso,
            "end_date": end_iso,
        },
        "units": units,
        "summary": summary,
        "total_rainfall": total_rain,
        "average_daily_rainfall": avg_rain,
        "max_daily_rainfall": max_rain,
        "rainfall_trend": trend,
        "granules_count": granules_count,
        "auth_status": auth_status,
        "daily_data": daily_data,
    }
