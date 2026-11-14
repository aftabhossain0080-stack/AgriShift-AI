"""Data Cleaning Service for AgriShift AI.

Performs robust agronomic data cleaning and validation on satellite and Earth observation
observations before integration:
- Sentinel detection (NASA -999, -9999, <= -900.0 fill values)
- Invalid numerical detection (negative rainfall, out-of-range humidity, unrealistic temperatures)
- Extreme event detection without silent deletion (monsoon deluges, heatwaves)
- Duplicate date detection and deduplication
- Unit and type validation
- Quality flagging for downstream indicators
"""
import logging
from typing import Any, Dict, List, Optional, Tuple, Union

logger = logging.getLogger(__name__)

# NASA fill value threshold (typically -999.0 or -9999.0)
NASA_FILL_THRESHOLD = -900.0

# Physical and Agronomic Bounds
TEMP_MIN_CELSIUS = -50.0
TEMP_MAX_CELSIUS = 60.0
TEMP_EXTREME_HEAT = 42.0     # °C (Heatwave alert for crops)
TEMP_EXTREME_COLD = 4.0      # °C (Frost / cold-injury alert)

PRECIP_MIN_MM = 0.0
PRECIP_EXTREME_HEAVY = 100.0  # mm/day (Extreme downpour / flash flood alert)

RH_MIN_PERCENT = 0.0
RH_MAX_PERCENT = 100.0

SOLAR_MIN_KWH = 0.0
SOLAR_MAX_KWH = 15.0         # Theoretical max on Earth surface rarely exceeds 12-14 kWh/m²/day

SOIL_MOISTURE_MIN = 0.0
SOIL_MOISTURE_MAX = 1.0


def is_sentinel_or_missing(val: Any, fill_value: float = -999.0) -> bool:
    """Check whether a raw observation value is null or a NASA sentinel fill value.
    
    NASA POWER and SMAP use -999.0, -9999.0, or other negative numbers <= -900
    to denote missing satellite measurements or missing grid cells.
    """
    if val is None:
        return True
    try:
        fval = float(val)
        if fval <= NASA_FILL_THRESHOLD or abs(fval - fill_value) < 1e-4:
            return True
        return False
    except (ValueError, TypeError):
        return True


def clean_temperature(val: Any) -> Tuple[Optional[float], List[str]]:
    """Clean and validate temperature observation (°C).
    
    Returns:
        (cleaned_value, flags)
    """
    flags: List[str] = []
    if is_sentinel_or_missing(val):
        return None, ["missing_temperature"]
    try:
        t = round(float(val), 2)
    except (ValueError, TypeError):
        return None, ["invalid_type_temperature"]

    if t < TEMP_MIN_CELSIUS or t > TEMP_MAX_CELSIUS:
        logger.warning("Unrealistic temperature observation out of physical bounds: %s °C", t)
        return None, [f"invalid_range_temperature_{t}C"]

    # Detect extreme events (preserve the value, flag the event)
    if t >= TEMP_EXTREME_HEAT:
        flags.append("heatwave_event")
    elif t <= TEMP_EXTREME_COLD:
        flags.append("cold_event")

    return t, flags


def clean_precipitation(val: Any) -> Tuple[Optional[float], List[str]]:
    """Clean and validate precipitation observation (mm/day).
    
    Negative precipitation is physically impossible and discarded.
    Extreme precipitation is preserved and flagged.
    
    Returns:
        (cleaned_value, flags)
    """
    flags: List[str] = []
    if is_sentinel_or_missing(val):
        return None, ["missing_precipitation"]
    try:
        p = round(float(val), 2)
    except (ValueError, TypeError):
        return None, ["invalid_type_precipitation"]

    if p < PRECIP_MIN_MM:
        logger.warning("Physically impossible negative precipitation observation: %s mm", p)
        return None, ["invalid_negative_precipitation"]

    # Detect heavy rainfall / deluge events without silent removal
    if p >= PRECIP_EXTREME_HEAVY:
        flags.append("extreme_heavy_rainfall_deluge")
    elif p >= 50.0:
        flags.append("heavy_rainfall_alert")

    return p, flags


def clean_relative_humidity(val: Any) -> Tuple[Optional[float], List[str]]:
    """Clean and validate relative humidity observation (%).
    
    Returns:
        (cleaned_value, flags)
    """
    flags: List[str] = []
    if is_sentinel_or_missing(val):
        return None, ["missing_relative_humidity"]
    try:
        rh = round(float(val), 2)
    except (ValueError, TypeError):
        return None, ["invalid_type_relative_humidity"]

    if rh < RH_MIN_PERCENT:
        return None, ["invalid_negative_humidity"]
    if rh > RH_MAX_PERCENT:
        # High atmospheric moisture readings occasionally reach 100.5% due to sensor calibration
        if rh <= 102.0:
            rh = 100.0
            flags.append("humidity_clamped_to_100")
        else:
            return None, [f"invalid_humidity_above_100_{rh}"]

    return rh, flags


def clean_solar_radiation(val: Any) -> Tuple[Optional[float], List[str]]:
    """Clean and validate solar radiation observation (kWh/m²/day).
    
    Returns:
        (cleaned_value, flags)
    """
    flags: List[str] = []
    if is_sentinel_or_missing(val):
        return None, ["missing_solar_radiation"]
    try:
        sr = round(float(val), 2)
    except (ValueError, TypeError):
        return None, ["invalid_type_solar_radiation"]

    if sr < SOLAR_MIN_KWH:
        return None, ["invalid_negative_solar_radiation"]
    if sr > SOLAR_MAX_KWH:
        logger.warning("Solar radiation exceeds theoretical maximum: %s kWh/m²/day", sr)
        return None, [f"invalid_excessive_solar_radiation_{sr}"]

    return sr, flags


def clean_soil_moisture(val: Any, parameter_name: str = "soil_moisture") -> Tuple[Optional[float], List[str]]:
    """Clean and validate soil moisture fraction (0.0 to 1.0).
    
    Returns:
        (cleaned_value, flags)
    """
    flags: List[str] = []
    if is_sentinel_or_missing(val):
        return None, [f"missing_{parameter_name}"]
    try:
        sm = round(float(val), 3)
    except (ValueError, TypeError):
        return None, [f"invalid_type_{parameter_name}"]

    # Some APIs or models return percentage (e.g. 45.0% instead of 0.45)
    if 1.0 < sm <= 100.0:
        sm = round(sm / 100.0, 3)
        flags.append(f"{parameter_name}_percentage_converted_to_fraction")

    if sm < SOIL_MOISTURE_MIN or sm > (SOIL_MOISTURE_MAX + 0.05):
        logger.warning("Soil moisture out of bounds [0.0, 1.0]: %s", sm)
        return None, [f"invalid_range_{parameter_name}_{sm}"]

    sm = min(sm, 1.0)
    return sm, flags


def clean_daily_observation(raw_obs: Dict[str, Any]) -> Dict[str, Any]:
    """Clean a single daily record containing agro-meteorological observations.
    
    Accepts keys: date, temperature, precipitation, relative_humidity,
    solar_radiation, surface_soil_moisture, rootzone_soil_moisture.
    """
    date_val = str(raw_obs.get("date", "")).strip()
    quality_flags: List[str] = []

    # Clean temperature
    temp, t_flags = clean_temperature(raw_obs.get("temperature"))
    quality_flags.extend(t_flags)

    # Clean precipitation
    precip, p_flags = clean_precipitation(raw_obs.get("precipitation"))
    quality_flags.extend(p_flags)

    # Clean relative humidity
    rh, rh_flags = clean_relative_humidity(raw_obs.get("relative_humidity"))
    quality_flags.extend(rh_flags)

    # Clean solar radiation
    solar, s_flags = clean_solar_radiation(raw_obs.get("solar_radiation"))
    quality_flags.extend(s_flags)

    # Clean surface soil moisture
    surface_sm, surf_flags = clean_soil_moisture(
        raw_obs.get("surface_soil_moisture"), parameter_name="surface_soil_moisture"
    )
    quality_flags.extend(surf_flags)

    # Clean root-zone soil moisture
    root_sm, root_flags = clean_soil_moisture(
        raw_obs.get("rootzone_soil_moisture"), parameter_name="rootzone_soil_moisture"
    )
    quality_flags.extend(root_flags)

    return {
        "date": date_val,
        "temperature": temp,
        "precipitation": precip,
        "relative_humidity": rh,
        "solar_radiation": solar,
        "surface_soil_moisture": surface_sm,
        "rootzone_soil_moisture": root_sm,
        "quality_flags": quality_flags,
    }


def deduplicate_daily_records(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
    """Detect and resolve duplicate dates in daily records.
    
    If duplicate records for the same date are found:
    - Merges non-null parameter values from duplicates.
    - Preserves all unique quality flags.
    - Returns the deduplicated list sorted chronologically, along with the duplicate count.
    """
    date_map: Dict[str, Dict[str, Any]] = {}
    duplicate_count = 0

    for rec in records:
        d = rec.get("date")
        if not d:
            continue
        if d not in date_map:
            date_map[d] = dict(rec)
        else:
            duplicate_count += 1
            existing = date_map[d]
            # Merge non-null fields
            for key in ["temperature", "precipitation", "relative_humidity", "solar_radiation",
                        "surface_soil_moisture", "rootzone_soil_moisture"]:
                if existing.get(key) is None and rec.get(key) is not None:
                    existing[key] = rec[key]
            # Merge quality flags
            existing_flags = set(existing.get("quality_flags", []))
            existing_flags.update(rec.get("quality_flags", []))
            existing_flags.add("duplicate_date_merged")
            existing["quality_flags"] = sorted(list(existing_flags))

    # Sort chronological
    sorted_records = [date_map[k] for k in sorted(date_map.keys())]
    return sorted_records, duplicate_count
