"""Data Integration Service for AgriShift AI.

Harmonizes, aligns, and standardizes multi-source Earth observation records:
- NASA POWER: Agro-climatology (Temperature, Humidity, Solar Radiation, PRECTOTCORR)
- NASA SMAP: Soil moisture (Surface 0-5cm, Root-Zone 0-100cm)
- NASA GPM IMERG: High-resolution satellite precipitation
- Farmer Profile: Farm coordinates, soil classification, standing crop, irrigation

Ensures:
- Temporal alignment by calendar date (YYYY-MM-DD)
- Geographic alignment to farmer coordinates
- Physical unit standardization (°C, mm/day, %, kWh/m²/day, soil wetness fraction)
- Strict prevention of rainfall double-counting between GPM and NASA POWER
- Complete tracking of parameter completeness and data provenance
"""
import logging
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


def generate_date_range_series(start_date: str, end_date: str) -> List[str]:
    """Generate a list of ISO date strings ('YYYY-MM-DD') from start_date to end_date inclusive."""
    try:
        s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError as err:
        logger.error("Failed to parse start_date '%s' or end_date '%s': %s", start_date, end_date, err)
        return []

    if s_date > e_date:
        return []

    date_list = []
    curr = s_date
    while curr <= e_date:
        date_list.append(curr.strftime("%Y-%m-%d"))
        curr += timedelta(days=1)
    return date_list


def harmonize_rainfall_observations(
    power_precip: Optional[float],
    gpm_precip: Optional[float],
    preferred_source: str = "NASA POWER"
) -> Tuple[Optional[float], str]:
    """Harmonize precipitation from NASA POWER and NASA GPM IMERG to prevent double-counting.
    
    Rule:
    - Never sum NASA POWER and NASA GPM precipitation!
    - If preferred_source is 'NASA GPM IMERG' and GPM has a valid observation, use GPM.
    - Otherwise fallback to NASA POWER PRECTOTCORR.
    - If preferred_source is 'NASA POWER' and POWER has a valid observation, use POWER;
      otherwise fallback to GPM if valid.
    - If both are None, return None.
    
    Returns:
        (harmonized_precipitation_mm, chosen_source_name)
    """
    if preferred_source == "NASA GPM IMERG":
        if gpm_precip is not None:
            return gpm_precip, "NASA GPM IMERG"
        if power_precip is not None:
            return power_precip, "NASA POWER (Fallback)"
        return None, "None (Missing)"
    else:
        # Default: NASA POWER
        if power_precip is not None:
            return power_precip, "NASA POWER"
        if gpm_precip is not None:
            return gpm_precip, "NASA GPM IMERG (Fallback)"
        return None, "None (Missing)"


def integrate_environmental_datasets(
    power_data: Optional[Dict[str, Any]] = None,
    smap_data: Optional[Dict[str, Any]] = None,
    gpm_data: Optional[Dict[str, Any]] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    preferred_rainfall_source: str = "NASA POWER"
) -> Dict[str, Any]:
    """Integrate observations from NASA POWER, SMAP, and GPM into a unified time series.
    
    Args:
        power_data: Output dictionary from fetch_nasa_power.
        smap_data: Output dictionary from fetch_smap_soil_moisture.
        gpm_data: Output dictionary from fetch_gpm_imerg.
        start_date: Desired period start 'YYYY-MM-DD'.
        end_date: Desired period end 'YYYY-MM-DD'.
        preferred_rainfall_source: 'NASA POWER' or 'NASA GPM IMERG'.
        
    Returns:
        Integrated dictionary containing:
        - daily_timeseries: List of daily integrated observations
        - completeness: Completeness percentage and counts
        - provenance: Detailed metadata on data sources used
    """
    # 1. Map data by date for each source
    power_by_date: Dict[str, Dict[str, Any]] = {}
    if power_data and "data" in power_data:
        for item in power_data["data"]:
            d = item.get("date")
            if d:
                power_by_date[d] = item

    smap_by_date: Dict[str, Dict[str, Any]] = {}
    if smap_data and "daily_data" in smap_data:
        for item in smap_data["daily_data"]:
            d = item.get("date")
            if d:
                smap_by_date[d] = item

    gpm_by_date: Dict[str, Dict[str, Any]] = {}
    if gpm_data and "daily_data" in gpm_data:
        for item in gpm_data["daily_data"]:
            d = item.get("date")
            if d:
                gpm_by_date[d] = item

    # 2. Determine complete temporal coverage
    all_dates = set(power_by_date.keys()) | set(smap_by_date.keys()) | set(gpm_by_date.keys())

    if start_date and end_date:
        requested_dates = set(generate_date_range_series(start_date, end_date))
        if requested_dates:
            target_dates = sorted(list(requested_dates | all_dates))
        else:
            target_dates = sorted(list(all_dates))
    else:
        target_dates = sorted(list(all_dates))

    # 3. Assemble integrated daily records
    daily_timeseries: List[Dict[str, Any]] = []

    # Completeness counters
    total_days = len(target_dates)
    temp_present = 0
    precip_present = 0
    rh_present = 0
    solar_present = 0
    smap_surface_present = 0
    smap_root_present = 0
    complete_observation_days = 0

    for d in target_dates:
        p_item = power_by_date.get(d, {})
        s_item = smap_by_date.get(d, {})
        g_item = gpm_by_date.get(d, {})

        t_val = p_item.get("temperature")
        raw_power_p = p_item.get("precipitation")
        raw_gpm_p = g_item.get("precipitation")
        rh_val = p_item.get("relative_humidity")
        solar_val = p_item.get("solar_radiation")

        surf_sm = s_item.get("surface_soil_moisture")
        root_sm = s_item.get("rootzone_soil_moisture")

        # Harmonize rainfall: prevent double counting
        harmonized_p, p_source = harmonize_rainfall_observations(
            raw_power_p, raw_gpm_p, preferred_source=preferred_rainfall_source
        )

        # Track completeness
        is_day_complete = True
        if t_val is not None:
            temp_present += 1
        else:
            is_day_complete = False

        if harmonized_p is not None:
            precip_present += 1
        else:
            is_day_complete = False

        if rh_val is not None:
            rh_present += 1
        else:
            is_day_complete = False

        if solar_val is not None:
            solar_present += 1
        else:
            is_day_complete = False

        if surf_sm is not None:
            smap_surface_present += 1

        if root_sm is not None:
            smap_root_present += 1

        if is_day_complete and (surf_sm is not None or root_sm is not None):
            complete_observation_days += 1

        daily_timeseries.append({
            "date": d,
            "temperature": t_val,
            "precipitation": harmonized_p,
            "precipitation_source": p_source,
            "power_precipitation_mm": raw_power_p,
            "gpm_precipitation_mm": raw_gpm_p,
            "relative_humidity": rh_val,
            "solar_radiation": solar_val,
            "surface_soil_moisture": surf_sm,
            "surface_soil_moisture_percent": round(surf_sm * 100.0, 1) if surf_sm is not None else None,
            "rootzone_soil_moisture": root_sm,
            "rootzone_soil_moisture_percent": round(root_sm * 100.0, 1) if root_sm is not None else None,
        })

    # Calculate percentages
    completeness_pct = round((complete_observation_days / total_days * 100.0), 1) if total_days > 0 else 0.0

    provenance = {
        "nasa_power": {
            "source": "NASA POWER Daily AG",
            "parameters": ["T2M", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_SW_DWN"],
            "records_available": len(power_by_date),
            "status": "connected" if power_by_date else "no_data",
        },
        "nasa_smap": {
            "source": "NASA SMAP L4 (GEOS Catchment Land Surface Model)",
            "parameters": ["GWETTOP (0-5cm)", "GWETROOT (0-100cm)"],
            "records_available": len(smap_by_date),
            "status": "connected" if smap_by_date else "no_data",
        },
        "nasa_gpm": {
            "source": "NASA GPM IMERG (GPM_3IMERGDF V07)",
            "parameters": ["precipitationCal"],
            "records_available": len(gpm_by_date),
            "status": "connected" if gpm_by_date else "no_data",
        },
        "rainfall_harmonization": {
            "strategy": "Primary source with fallback; double-counting prohibited",
            "preferred_source": preferred_rainfall_source,
        }
    }

    completeness_report = {
        "total_days_evaluated": total_days,
        "complete_observation_days": complete_observation_days,
        "overall_completeness_percentage": completeness_pct,
        "parameter_completeness": {
            "temperature_days": temp_present,
            "precipitation_days": precip_present,
            "humidity_days": rh_present,
            "solar_radiation_days": solar_present,
            "smap_surface_moisture_days": smap_surface_present,
            "smap_rootzone_moisture_days": smap_root_present,
        }
    }

    return {
        "daily_timeseries": daily_timeseries,
        "completeness": completeness_report,
        "provenance": provenance,
    }
