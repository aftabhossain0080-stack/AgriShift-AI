"""NASA SMAP Level-4 Soil Moisture Service.

Retrieves surface and root-zone soil wetness data derived from the NASA Global Modeling
and Assimilation Office (GMAO) GEOS Catchment Land Surface Model with SMAP Level-4 assimilation:
- GWETTOP: Surface Soil Wetness (0–5 cm layer, 0.0 to 1.0 fraction)
- GWETROOT: Root-Zone Soil Wetness (0–100 cm root layer, 0.0 to 1.0 fraction)
- GWETPROF: Profile Soil Wetness (0.0 to 1.0 fraction)
"""
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

import requests
from app.utils.config import settings

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = settings.NASA_POWER_TIMEOUT
DEFAULT_LAG_DAYS = settings.NASA_POWER_LAG_DAYS
NASA_SMAP_PARAMETERS = ["GWETTOP", "GWETROOT", "GWETPROF"]
NASA_SMAP_COMMUNITY = "AG"
NASA_FILL_VALUE_THRESHOLD = -900.0


class NasaSmapError(Exception):
    """Base exception for NASA SMAP soil moisture operations."""
    pass


class NasaSmapValidationError(NasaSmapError):
    """Raised when geographic coordinates or date ranges fail validation."""
    pass


class NasaSmapConnectionError(NasaSmapError):
    """Raised when network, connection, or timeout issues occur."""
    pass


class NasaSmapResponseError(NasaSmapError):
    """Raised when upstream API returns an error or malformed payload."""
    pass


def validate_coordinates(latitude: float, longitude: float) -> None:
    """Validate that coordinates fall within valid geographic bounds."""
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (ValueError, TypeError) as err:
        raise NasaSmapValidationError(
            f"Coordinates must be numeric values. Received latitude='{latitude}', longitude='{longitude}'."
        ) from err

    if lat < -90.0 or lat > 90.0:
        raise NasaSmapValidationError(
            f"Invalid latitude '{latitude}'. Latitude must be between -90.0 and 90.0 degrees."
        )
    if lon < -180.0 or lon > 180.0:
        raise NasaSmapValidationError(
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
                raise NasaSmapValidationError(f"Invalid date value '{d}': {err}") from err
        if len(cleaned) == 8 and cleaned.isdigit():
            try:
                return datetime.strptime(cleaned, "%Y%m%d").date()
            except ValueError as err:
                raise NasaSmapValidationError(f"Invalid date value '{d}': {err}") from err
        raise NasaSmapValidationError(f"Invalid date format for '{d}'. Expected YYYY-MM-DD or YYYYMMDD.")
    raise NasaSmapValidationError(f"Unsupported date type: {type(d)}")


def validate_date_range(
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    default_days: int = 30,
    lag_days: int = DEFAULT_LAG_DAYS
) -> Tuple[date, date, str, str, str, str]:
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
        raise NasaSmapValidationError(
            f"Start date '{start_obj.isoformat()}' cannot exceed end date '{end_obj.isoformat()}'."
        )

    if start_obj > reference_today:
        raise NasaSmapValidationError(
            f"Start date '{start_obj.isoformat()}' cannot be in the future. NASA SMAP provides historical observations."
        )

    start_iso = start_obj.strftime("%Y-%m-%d")
    end_iso = end_obj.strftime("%Y-%m-%d")
    start_nasa = start_obj.strftime("%Y%m%d")
    end_nasa = end_obj.strftime("%Y%m%d")

    return start_obj, end_obj, start_iso, end_iso, start_nasa, end_nasa


def is_missing(val: Any, fill_value: float = -999.0) -> bool:
    """Determine whether an observation represents missing/sentinel satellite data."""
    if val is None:
        return True
    try:
        fval = float(val)
        return fval <= NASA_FILL_VALUE_THRESHOLD or abs(fval - fill_value) < 1e-4
    except (ValueError, TypeError):
        return True


def evaluate_water_stress(rootzone_val: Optional[float], surface_val: Optional[float]) -> str:
    """Classify agricultural water-stress indicator based on soil wetness fraction (0.0 - 1.0).
    
    Agronomic benchmarks:
    - <= 0.30: Severe Stress / Wilting Risk (requires immediate irrigation)
    - 0.31 - 0.49: Moderate Stress (irrigation advised for sensitive crops)
    - 0.50 - 0.79: Optimal / Adequate Moisture (ideal root uptake condition)
    - >= 0.80: High Moisture / Waterlogging Risk (aeration stress / drainage check)
    """
    key_val = rootzone_val if rootzone_val is not None else surface_val
    if key_val is None:
        return "Indeterminate (Insufficient Data)"
    if key_val <= 0.30:
        return "Severe Stress / Wilting Risk"
    if key_val <= 0.49:
        return "Moderate Stress"
    if key_val <= 0.79:
        return "Optimal / Adequate Moisture"
    return "High Moisture / Waterlogging Risk"


def evaluate_soil_moisture_trend(values: List[float]) -> str:
    """Determine directional soil moisture trend over the observation window."""
    if len(values) < 4:
        return "stable"
    midpoint = len(values) // 2
    first_half = values[:midpoint]
    second_half = values[midpoint:]

    avg_first = sum(first_half) / len(first_half)
    avg_second = sum(second_half) / len(second_half)
    diff = avg_second - avg_first

    if diff > 0.03:
        return "wetting"
    if diff < -0.03:
        return "drying"
    return "stable"


def fetch_smap_soil_moisture(
    latitude: float,
    longitude: float,
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    timeout: int = DEFAULT_TIMEOUT,
    base_url: str = settings.NASA_POWER_BASE_URL
) -> Dict[str, Any]:
    """Fetch daily surface and root-zone soil moisture from NASA SMAP Level-4 assimilation.
    
    Args:
        latitude: Latitude coordinate (-90 to 90).
        longitude: Longitude coordinate (-180 to 180).
        start_date: Start date string (YYYY-MM-DD) or date object.
        end_date: End date string (YYYY-MM-DD) or date object.
        timeout: HTTP request timeout in seconds.
        base_url: Upstream NASA POWER daily point endpoint.
        
    Returns:
        Structured response matching NasaSmapSummaryResponse schema.
    """
    validate_coordinates(latitude, longitude)
    _, _, start_iso, end_iso, start_nasa, end_nasa = validate_date_range(start_date, end_date)

    params = {
        "parameters": ",".join(NASA_SMAP_PARAMETERS),
        "community": NASA_SMAP_COMMUNITY,
        "longitude": round(longitude, 4),
        "latitude": round(latitude, 4),
        "start": start_nasa,
        "end": end_nasa,
        "format": "JSON",
    }

    try:
        response = requests.get(base_url, params=params, timeout=timeout)
    except requests.exceptions.Timeout as err:
        logger.error("NASA SMAP request timed out: %s", err)
        raise NasaSmapConnectionError(f"NASA SMAP request timed out after {timeout} seconds.") from err
    except requests.exceptions.RequestException as err:
        logger.error("NASA SMAP connection error: %s", err)
        raise NasaSmapConnectionError(f"Failed to connect to NASA SMAP service: {err}") from err

    if response.status_code != 200:
        err_msg = f"NASA SMAP API returned HTTP {response.status_code}."
        try:
            payload = response.json()
            if "messages" in payload and payload["messages"]:
                err_msg += f" Details: {payload['messages']}"
        except Exception:
            if response.text:
                err_msg += f" Response: {response.text[:200]}"
        raise NasaSmapResponseError(err_msg)

    try:
        raw_json = response.json()
    except Exception as err:
        raise NasaSmapResponseError(f"Failed to parse NASA SMAP response as JSON: {err}") from err

    properties = raw_json.get("properties")
    if not properties or "parameter" not in properties:
        raise NasaSmapResponseError("NASA SMAP response is missing 'properties.parameter' data.")

    parameter_data = properties["parameter"]
    top_dict = parameter_data.get("GWETTOP", {})
    root_dict = parameter_data.get("GWETROOT", {})
    prof_dict = parameter_data.get("GWETPROF", {})

    header = raw_json.get("header", {})
    fill_value = float(header.get("fill_value", -999.0))

    all_date_keys = sorted(set(top_dict.keys()) | set(root_dict.keys()) | set(prof_dict.keys()))

    daily_data: List[Dict[str, Any]] = []
    valid_surfaces: List[float] = []
    valid_rootzones: List[float] = []
    valid_profiles: List[float] = []
    valid_days_count = 0
    missing_obs_count = 0

    for dk in all_date_keys:
        formatted_date = f"{dk[:4]}-{dk[4:6]}-{dk[6:]}" if len(dk) == 8 else dk

        raw_top = top_dict.get(dk)
        raw_root = root_dict.get(dk)
        raw_prof = prof_dict.get(dk)

        top_val = None if is_missing(raw_top, fill_value) else round(float(raw_top), 2)
        root_val = None if is_missing(raw_root, fill_value) else round(float(raw_root), 2)
        prof_val = None if is_missing(raw_prof, fill_value) else round(float(raw_prof), 2)

        day_missing = 0
        if top_val is not None:
            valid_surfaces.append(top_val)
        else:
            day_missing += 1

        if root_val is not None:
            valid_rootzones.append(root_val)
        else:
            day_missing += 1

        if prof_val is not None:
            valid_profiles.append(prof_val)
        else:
            day_missing += 1

        missing_obs_count += day_missing
        if day_missing == 0:
            valid_days_count += 1

        daily_data.append({
            "date": formatted_date,
            "surface_soil_moisture": top_val,
            "surface_soil_moisture_percent": round(top_val * 100.0, 1) if top_val is not None else None,
            "rootzone_soil_moisture": root_val,
            "rootzone_soil_moisture_percent": round(root_val * 100.0, 1) if root_val is not None else None,
            "profile_soil_moisture": prof_val,
        })

    avg_surface = round(sum(valid_surfaces) / len(valid_surfaces), 2) if valid_surfaces else None
    min_surface = round(min(valid_surfaces), 2) if valid_surfaces else None
    max_surface = round(max(valid_surfaces), 2) if valid_surfaces else None

    avg_root = round(sum(valid_rootzones) / len(valid_rootzones), 2) if valid_rootzones else None
    min_root = round(min(valid_rootzones), 2) if valid_rootzones else None
    max_root = round(max(valid_rootzones), 2) if valid_rootzones else None

    trend_target = valid_rootzones if valid_rootzones else valid_surfaces
    trend = evaluate_soil_moisture_trend(trend_target)
    stress_indicator = evaluate_water_stress(avg_root, avg_surface)

    summary = {
        "average_surface_soil_moisture": avg_surface,
        "min_surface_soil_moisture": min_surface,
        "max_surface_soil_moisture": max_surface,
        "average_rootzone_soil_moisture": avg_root,
        "min_rootzone_soil_moisture": min_root,
        "max_rootzone_soil_moisture": max_root,
        "soil_moisture_trend": trend,
        "water_stress_indicator": stress_indicator,
        "valid_observations_count": valid_days_count,
        "missing_observations_count": missing_obs_count,
    }

    units = {
        "surface_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0) / %",
        "rootzone_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0) / %",
        "profile_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0)",
        "GWETTOP": "1 (0-1 fraction)",
        "GWETROOT": "1 (0-1 fraction)",
        "GWETPROF": "1 (0-1 fraction)",
    }

    return {
        "success": True,
        "source": "NASA SMAP Level-4 (GMAO GEOS)",
        "spatial_resolution": "0.25° x 0.25° (~25 km, assimilated from 9 km SMAP L4)",
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
        "average_surface_soil_moisture": avg_surface,
        "average_rootzone_soil_moisture": avg_root,
        "water_stress_indicator": stress_indicator,
        "soil_moisture_trend": trend,
        "daily_data": daily_data,
    }
