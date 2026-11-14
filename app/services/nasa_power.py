"""NASA POWER Daily API Service.

Integrates with the official NASA Prediction of Worldwide Energy Resources (POWER)
Daily Point API to retrieve agro-climatological observations:
- T2M: Temperature at 2 Meters (°C)
- PRECTOTCORR: Corrected Precipitation (mm/day)
- RH2M: Relative Humidity at 2 Meters (%)
- ALLSKY_SFC_SW_DWN: All-Sky Surface Shortwave Downward Irradiance (MJ/m^2/day)
"""
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

import requests
from app.utils.config import settings

logger = logging.getLogger(__name__)

# NASA POWER Daily Point API Endpoint
DEFAULT_NASA_POWER_URL = settings.NASA_POWER_BASE_URL
DEFAULT_TIMEOUT = settings.NASA_POWER_TIMEOUT
DEFAULT_LAG_DAYS = settings.NASA_POWER_LAG_DAYS

# Parameters to fetch from NASA POWER Agricultural (AG) community
NASA_POWER_PARAMETERS = ["T2M", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_SW_DWN"]
NASA_POWER_COMMUNITY = "AG"

# Known fill values indicating missing satellite / model observation in NASA POWER
NASA_FILL_VALUE_THRESHOLD = -900.0

# Conversion constant: 1 kWh = 3.6 MJ -> kWh/m^2/day = (MJ/m^2/day) / 3.6
MJ_TO_KWH = 3.6


class NasaPowerError(Exception):
    """Base exception for NASA POWER API operations."""
    pass


class NasaPowerValidationError(NasaPowerError):
    """Raised when query coordinates or dates fail validation."""
    pass


class NasaPowerConnectionError(NasaPowerError):
    """Raised when network, connection, or timeout issues occur."""
    pass


class NasaPowerResponseError(NasaPowerError):
    """Raised when NASA POWER API returns an error or malformed payload."""
    pass


def validate_coordinates(latitude: float, longitude: float) -> None:
    """Validate that coordinates fall within valid geographic bounds.
    
    Args:
        latitude: Latitude coordinate in decimal degrees.
        longitude: Longitude coordinate in decimal degrees.
        
    Raises:
        NasaPowerValidationError: If coordinates are out of bounds or non-numeric.
    """
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (ValueError, TypeError) as err:
        raise NasaPowerValidationError(
            f"Coordinates must be numeric values. Received latitude='{latitude}', longitude='{longitude}'."
        ) from err

    if lat < -90.0 or lat > 90.0:
        raise NasaPowerValidationError(
            f"Invalid latitude '{latitude}'. Latitude must be a numeric value between -90.0 and 90.0."
        )
    if lon < -180.0 or lon > 180.0:
        raise NasaPowerValidationError(
            f"Invalid longitude '{longitude}'. Longitude must be a numeric value between -180.0 and 180.0."
        )


def _parse_single_date(d: Union[str, date, datetime]) -> date:
    """Parse date from string or date/datetime object.
    
    Supports 'YYYY-MM-DD' and 'YYYYMMDD'.
    """
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, date):
        return d
    if isinstance(d, str):
        cleaned = d.strip()
        # Try YYYY-MM-DD
        if len(cleaned) == 10 and cleaned[4] == "-" and cleaned[7] == "-":
            try:
                return datetime.strptime(cleaned, "%Y-%m-%d").date()
            except ValueError as err:
                raise NasaPowerValidationError(f"Invalid date value '{d}': {err}") from err
        # Try YYYYMMDD
        if len(cleaned) == 8 and cleaned.isdigit():
            try:
                return datetime.strptime(cleaned, "%Y%m%d").date()
            except ValueError as err:
                raise NasaPowerValidationError(f"Invalid date value '{d}': {err}") from err
        raise NasaPowerValidationError(
            f"Invalid date format for '{d}'. Expected 'YYYY-MM-DD' or 'YYYYMMDD'."
        )
    raise NasaPowerValidationError(f"Unsupported date type: {type(d)}")


def get_default_date_range(days: int = 30, lag_days: int = DEFAULT_LAG_DAYS) -> Tuple[date, date]:
    """Calculate default date window accounting for NASA publication lag.
    
    Args:
        days: Duration in days to retrieve (default: 30 days).
        lag_days: NASA publication lag in days (default: 4 days).
        
    Returns:
        Tuple of (start_date, end_date) as date objects.
    """
    reference_today = datetime.now(timezone.utc).date()
    end_date = reference_today - timedelta(days=lag_days)
    start_date = end_date - timedelta(days=days - 1)
    return start_date, end_date


def validate_date_range(
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None
) -> Tuple[date, date, str, str, str, str]:
    """Validate and format start and end dates.
    
    Returns:
        Tuple of:
        (start_obj, end_obj, start_iso, end_iso, start_nasa_str, end_nasa_str)
    """
    if start_date is None and end_date is None:
        start_obj, end_obj = get_default_date_range()
    elif start_date is not None and end_date is None:
        start_obj = _parse_single_date(start_date)
        end_obj = start_obj + timedelta(days=29)
    elif start_date is None and end_date is not None:
        end_obj = _parse_single_date(end_date)
        start_obj = end_obj - timedelta(days=29)
    else:
        start_obj = _parse_single_date(start_date)
        end_obj = _parse_single_date(end_date)

    if start_obj > end_obj:
        raise NasaPowerValidationError(
            f"Start date '{start_obj.isoformat()}' cannot exceed end date '{end_obj.isoformat()}'."
        )

    reference_today = datetime.now(timezone.utc).date()
    if start_obj > reference_today:
        raise NasaPowerValidationError(
            f"Start date '{start_obj.isoformat()}' cannot be in the future. NASA POWER provides historical satellite observations."
        )

    start_iso = start_obj.strftime("%Y-%m-%d")
    end_iso = end_obj.strftime("%Y-%m-%d")
    start_nasa = start_obj.strftime("%Y%m%d")
    end_nasa = end_obj.strftime("%Y%m%d")

    return start_obj, end_obj, start_iso, end_iso, start_nasa, end_nasa


def is_missing_value(val: Any, fill_value: float = -999.0) -> bool:
    """Determine whether an observation value represents missing satellite data."""
    if val is None:
        return True
    try:
        fval = float(val)
        if fval <= NASA_FILL_VALUE_THRESHOLD or abs(fval - fill_value) < 1e-4:
            return True
        return False
    except (ValueError, TypeError):
        return True


def fetch_nasa_power(
    latitude: float,
    longitude: float,
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    timeout: int = DEFAULT_TIMEOUT,
    base_url: str = DEFAULT_NASA_POWER_URL
) -> Dict[str, Any]:
    """Fetch agro-meteorological daily observations from NASA POWER Daily Point API.
    
    Args:
        latitude: Latitude coordinate in decimal degrees (-90 to 90).
        longitude: Longitude coordinate in decimal degrees (-180 to 180).
        start_date: Start date (string 'YYYY-MM-DD' or date object).
        end_date: End date (string 'YYYY-MM-DD' or date object).
        timeout: HTTP request timeout in seconds.
        base_url: NASA POWER API base endpoint.
        
    Returns:
        Structured dictionary matching AgriShift AI Phase 2 specification:
        {
            "success": True,
            "source": "NASA POWER",
            "location": {"latitude": ..., "longitude": ...},
            "period": {"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"},
            "units": {...},
            "data": [...],
            "summary": {...}
        }
        
    Raises:
        NasaPowerValidationError: On invalid coordinate or date inputs.
        NasaPowerConnectionError: On timeout or connection failure.
        NasaPowerResponseError: On HTTP errors or missing expected fields.
    """
    # 1. Validate Geographic Coordinates
    validate_coordinates(latitude, longitude)

    # 2. Validate and Format Dates
    _, _, start_iso, end_iso, start_nasa, end_nasa = validate_date_range(start_date, end_date)

    # 3. Build NASA POWER Daily Query Parameters
    params = {
        "parameters": ",".join(NASA_POWER_PARAMETERS),
        "community": NASA_POWER_COMMUNITY,
        "longitude": round(longitude, 4),
        "latitude": round(latitude, 4),
        "start": start_nasa,
        "end": end_nasa,
        "format": "JSON",
    }

    # 4. Execute HTTP Request
    try:
        response = requests.get(base_url, params=params, timeout=timeout)
    except requests.exceptions.Timeout as err:
        logger.error("NASA POWER request timed out: %s", err)
        raise NasaPowerConnectionError(
            f"NASA POWER API request timed out after {timeout} seconds. The NASA service may be experiencing high load."
        ) from err
    except requests.exceptions.RequestException as err:
        logger.error("NASA POWER connection error: %s", err)
        raise NasaPowerConnectionError(
            f"Failed to connect to NASA POWER API: {err}"
        ) from err

    # 5. Handle Non-200 HTTP Status Codes
    if response.status_code != 200:
        err_msg = f"NASA POWER API returned HTTP status {response.status_code}."
        try:
            payload = response.json()
            if "messages" in payload and payload["messages"]:
                err_msg += f" Details: {payload['messages']}"
        except Exception:
            if response.text:
                err_msg += f" Response: {response.text[:200]}"
        logger.error(err_msg)
        raise NasaPowerResponseError(err_msg)

    # 6. Parse NASA JSON Payload
    try:
        raw_json = response.json()
    except Exception as err:
        raise NasaPowerResponseError(f"Failed to parse NASA POWER response as JSON: {err}") from err

    # 7. Validate Payload Structure
    properties = raw_json.get("properties")
    if not properties or "parameter" not in properties:
        raise NasaPowerResponseError("NASA POWER response is missing 'properties.parameter' data.")

    parameter_data = properties["parameter"]
    for param in NASA_POWER_PARAMETERS:
        if param not in parameter_data:
            raise NasaPowerResponseError(f"NASA POWER response is missing required parameter '{param}'.")

    # 8. Extract Fill Value & Units Metadata
    header = raw_json.get("header", {})
    fill_value = float(header.get("fill_value", -999.0))
    parameters_meta = raw_json.get("parameters", {})

    # Standard agro-meteorological physical units (with solar radiation normalized to kWh/m^2/day)
    units = {
        "temperature": "°C",
        "rainfall": "mm",
        "relative_humidity": "%",
        "solar_radiation": "kWh/m²/day",
        "T2M": "°C",
        "PRECTOTCORR": "mm",
        "RH2M": "%",
        "ALLSKY_SFC_SW_DWN": "kWh/m²/day",
    }

    # 9. Transform Daily Observations & Handle Missing Values
    t2m_dict = parameter_data.get("T2M", {})
    precip_dict = parameter_data.get("PRECTOTCORR", {})
    rh_dict = parameter_data.get("RH2M", {})
    rad_dict = parameter_data.get("ALLSKY_SFC_SW_DWN", {})

    # Gather and sort all observation date keys (in YYYYMMDD format)
    all_date_keys = sorted(
        set(t2m_dict.keys()) | set(precip_dict.keys()) | set(rh_dict.keys()) | set(rad_dict.keys())
    )

    data_list: List[Dict[str, Any]] = []
    valid_days_count = 0
    missing_parameter_count = 0

    valid_temps: List[float] = []
    valid_precips: List[float] = []
    valid_rhs: List[float] = []
    valid_rads: List[float] = []

    for date_key in all_date_keys:
        # Convert YYYYMMDD to YYYY-MM-DD
        if len(date_key) == 8:
            formatted_date = f"{date_key[:4]}-{date_key[4:6]}-{date_key[6:]}"
        else:
            formatted_date = date_key

        raw_t = t2m_dict.get(date_key)
        raw_p = precip_dict.get(date_key)
        raw_rh = rh_dict.get(date_key)
        raw_rad = rad_dict.get(date_key)

        # Identify missing values: never silently replace satellite missing values with zero!
        t_val = None if is_missing_value(raw_t, fill_value) else round(float(raw_t), 2)
        p_val = None if is_missing_value(raw_p, fill_value) else round(float(raw_p), 2)
        rh_val = None if is_missing_value(raw_rh, fill_value) else round(float(raw_rh), 2)
        # Convert solar radiation from NASA AG community MJ/m^2/day to standard kWh/m^2/day
        rad_val_kwh = None if is_missing_value(raw_rad, fill_value) else round(float(raw_rad) / MJ_TO_KWH, 2)
        rad_val_mj = None if is_missing_value(raw_rad, fill_value) else round(float(raw_rad), 2)

        # Track valid and missing counts
        day_missing_params = 0
        if t_val is not None:
            valid_temps.append(t_val)
        else:
            day_missing_params += 1

        if p_val is not None:
            valid_precips.append(p_val)
        else:
            day_missing_params += 1

        if rh_val is not None:
            valid_rhs.append(rh_val)
        else:
            day_missing_params += 1

        if rad_val_kwh is not None:
            valid_rads.append(rad_val_kwh)
        else:
            day_missing_params += 1

        missing_parameter_count += day_missing_params
        if day_missing_params == 0:
            valid_days_count += 1

        data_list.append({
            "date": formatted_date,
            "temperature": t_val,
            "precipitation": p_val,
            "relative_humidity": rh_val,
            "solar_radiation": rad_val_kwh,
            "solar_radiation_mj": rad_val_mj,
        })

    # 10. Compute Summary Statistics over Valid Observations
    summary = {
        "average_temperature": round(sum(valid_temps) / len(valid_temps), 2) if valid_temps else None,
        "max_temperature": round(max(valid_temps), 2) if valid_temps else None,
        "min_temperature": round(min(valid_temps), 2) if valid_temps else None,
        "total_rainfall": round(sum(valid_precips), 2) if valid_precips else None,
        "average_humidity": round(sum(valid_rhs) / len(valid_rhs), 2) if valid_rhs else None,
        "average_solar_radiation": round(sum(valid_rads) / len(valid_rads), 2) if valid_rads else None,
        "valid_observations_count": valid_days_count,
        "missing_observations_count": missing_parameter_count,
    }

    # 11. Return Final Clean Structured Response
    return {
        "success": True,
        "source": "NASA POWER",
        "location": {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
        },
        "period": {
            "start_date": start_iso,
            "end_date": end_iso,
        },
        "units": units,
        "data": data_list,
        "summary": summary,
    }
