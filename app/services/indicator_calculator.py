"""Agricultural Indicator Calculator Service for AgriShift AI.

Calculates key agronomic indicators from harmonized and cleaned daily observations:
- Temperature indicators (average, min, max, warming/cooling trend)
- Rainfall indicators (total, daily avg, single-day max, consecutive dry days, trend)
- Soil moisture indicators (surface & root-zone averages, trend, agronomic water stress)
- Other indicators (average relative humidity, solar radiation, data completeness)
"""
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


def calculate_temperature_trend(temperatures: List[float]) -> str:
    """Evaluate temperature trend over the observation period.
    
    Returns:
        'warming', 'cooling', or 'stable'
    """
    if len(temperatures) < 2:
        return "stable"
    mid = len(temperatures) // 2
    first_half = temperatures[:mid]
    second_half = temperatures[mid:]

    mean_first = sum(first_half) / len(first_half)
    mean_second = sum(second_half) / len(second_half)
    diff = mean_second - mean_first

    if diff >= 1.0:
        return "warming"
    if diff <= -1.0:
        return "cooling"
    return "stable"


def calculate_consecutive_dry_days(precipitations: List[Optional[float]], threshold: float = 1.0) -> Tuple[int, int]:
    """Calculate maximum consecutive dry days and total dry days in the period.
    
    A dry day is defined as precipitation < 1.0 mm (standard meteorological definition).
    
    Returns:
        (max_consecutive_dry_days, total_dry_days)
    """
    max_consecutive = 0
    current_consecutive = 0
    total_dry = 0

    for p in precipitations:
        if p is None:
            # Missing day resets consecutive counter
            current_consecutive = 0
            continue
        if p < threshold:
            current_consecutive += 1
            total_dry += 1
            if current_consecutive > max_consecutive:
                max_consecutive = current_consecutive
        else:
            current_consecutive = 0

    return max_consecutive, total_dry


def calculate_rainfall_trend(precipitations: List[float]) -> str:
    """Evaluate rainfall trend over the observation period.
    
    Returns:
        'increasing', 'decreasing', 'stable', or 'dry_spell'
    """
    if not precipitations or sum(precipitations) < 1.0:
        return "dry_spell"
    if len(precipitations) < 2:
        return "stable"

    mid = len(precipitations) // 2
    first_half = precipitations[:mid]
    second_half = precipitations[mid:]

    mean_first = sum(first_half) / len(first_half)
    mean_second = sum(second_half) / len(second_half)
    diff = mean_second - mean_first

    if diff >= 2.0:
        return "increasing"
    if diff <= -2.0:
        return "decreasing"
    return "stable"


def evaluate_water_stress_status(
    rootzone_val: Optional[float],
    surface_val: Optional[float]
) -> str:
    """Classify agronomic soil moisture stress level.
    
    Thresholds based on SMAP L4 fraction (0.0 to 1.0):
    - <= 0.20: Severe Stress (Wilting Point Risk)
    - <= 0.40: Moderate Stress (Sub-optimal Root Moisture)
    - 0.40 - 0.75: Optimal (Favorable Soil Moisture)
    - > 0.75: Waterlogging (Saturation Risk / Aeration Deficit)
    """
    val = rootzone_val if rootzone_val is not None else surface_val
    if val is None:
        return "Insufficient Data"
    if val <= 0.20:
        return "Severe Stress (Wilting Point Risk)"
    if val <= 0.40:
        return "Moderate Stress (Sub-optimal Root Moisture)"
    if val <= 0.75:
        return "Optimal (Favorable Soil Moisture)"
    return "Waterlogging (Saturation Risk / Aeration Deficit)"


def calculate_soil_moisture_trend(values: List[float]) -> str:
    """Evaluate soil moisture trend over time.
    
    Returns:
        'wetting', 'drying', or 'stable'
    """
    if len(values) < 2:
        return "stable"
    mid = len(values) // 2
    first_half = values[:mid]
    second_half = values[mid:]

    mean_first = sum(first_half) / len(first_half)
    mean_second = sum(second_half) / len(second_half)
    diff = mean_second - mean_first

    if diff >= 0.03:
        return "wetting"
    if diff <= -0.03:
        return "drying"
    return "stable"


def calculate_agricultural_indicators(
    daily_records: List[Dict[str, Any]],
    completeness_percentage: float = 100.0
) -> Dict[str, Any]:
    """Compute comprehensive agricultural indicators from cleaned daily records.
    
    Args:
        daily_records: List of cleaned, harmonized daily records.
        completeness_percentage: Overall observation completeness percentage.
        
    Returns:
        Dictionary of temperature, rainfall, soil moisture, and other indicators.
    """
    # 1. Extract valid observation sequences
    temps = [r["temperature"] for r in daily_records if r.get("temperature") is not None]
    precips = [r["precipitation"] for r in daily_records if r.get("precipitation") is not None]
    all_daily_precips = [r.get("precipitation") for r in daily_records]
    rhs = [r["relative_humidity"] for r in daily_records if r.get("relative_humidity") is not None]
    solars = [r["solar_radiation"] for r in daily_records if r.get("solar_radiation") is not None]
    surf_sms = [r["surface_soil_moisture"] for r in daily_records if r.get("surface_soil_moisture") is not None]
    root_sms = [r["rootzone_soil_moisture"] for r in daily_records if r.get("rootzone_soil_moisture") is not None]

    # 2. Temperature Indicators
    avg_temp = round(sum(temps) / len(temps), 2) if temps else None
    min_temp = round(min(temps), 2) if temps else None
    max_temp = round(max(temps), 2) if temps else None
    temp_trend = calculate_temperature_trend(temps)

    temperature_indicators = {
        "average_temperature_celsius": avg_temp,
        "min_temperature_celsius": min_temp,
        "max_temperature_celsius": max_temp,
        "temperature_trend": temp_trend,
    }

    # 3. Rainfall Indicators
    total_rain = round(sum(precips), 2) if precips else None
    avg_daily_rain = round(sum(precips) / len(precips), 2) if precips else None
    max_daily_rain = round(max(precips), 2) if precips else None
    rain_trend = calculate_rainfall_trend(precips)
    max_consec_dry, total_dry = calculate_consecutive_dry_days(all_daily_precips)
    rainy_days = sum(1 for p in precips if p >= 1.0)
    heavy_rain_days = sum(1 for p in precips if p >= 25.0)

    rainfall_indicators = {
        "total_rainfall_mm": total_rain,
        "average_daily_rainfall_mm": avg_daily_rain,
        "max_single_day_rainfall_mm": max_daily_rain,
        "rainfall_trend": rain_trend,
        "consecutive_dry_days": max_consec_dry,
        "total_dry_days": total_dry,
        "rainy_days_count": rainy_days,
        "heavy_rain_days_count": heavy_rain_days,
    }

    # 4. Soil Moisture Indicators
    avg_surf_sm = round(sum(surf_sms) / len(surf_sms), 3) if surf_sms else None
    min_surf_sm = round(min(surf_sms), 3) if surf_sms else None
    max_surf_sm = round(max(surf_sms), 3) if surf_sms else None

    avg_root_sm = round(sum(root_sms) / len(root_sms), 3) if root_sms else None
    min_root_sm = round(min(root_sms), 3) if root_sms else None
    max_root_sm = round(max(root_sms), 3) if root_sms else None

    sm_trend_source = root_sms if root_sms else surf_sms
    sm_trend = calculate_soil_moisture_trend(sm_trend_source)
    water_stress = evaluate_water_stress_status(avg_root_sm, avg_surf_sm)

    soil_moisture_indicators = {
        "average_surface_soil_moisture_fraction": avg_surf_sm,
        "average_surface_soil_moisture_percent": round(avg_surf_sm * 100.0, 1) if avg_surf_sm is not None else None,
        "min_surface_soil_moisture_fraction": min_surf_sm,
        "max_surface_soil_moisture_fraction": max_surf_sm,
        "average_rootzone_soil_moisture_fraction": avg_root_sm,
        "average_rootzone_soil_moisture_percent": round(avg_root_sm * 100.0, 1) if avg_root_sm is not None else None,
        "min_rootzone_soil_moisture_fraction": min_root_sm,
        "max_rootzone_soil_moisture_fraction": max_root_sm,
        "soil_moisture_trend": sm_trend,
        "water_stress_indicator": water_stress,
    }

    # 5. Other Indicators
    avg_rh = round(sum(rhs) / len(rhs), 2) if rhs else None
    avg_solar = round(sum(solars) / len(solars), 2) if solars else None

    other_indicators = {
        "average_relative_humidity_percent": avg_rh,
        "average_solar_radiation_kwh_m2_day": avg_solar,
        "data_completeness_percentage": completeness_percentage,
    }

    return {
        "temperature": temperature_indicators,
        "rainfall": rainfall_indicators,
        "soil_moisture": soil_moisture_indicators,
        "other": other_indicators,
    }
