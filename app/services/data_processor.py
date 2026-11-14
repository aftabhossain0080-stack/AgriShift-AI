"""Complete Data Cleaning, Integration & Processing Pipeline Service.

Phase 5 Orchestrator:
- Integrates farmer profile with NASA POWER, NASA SMAP, and NASA GPM IMERG
- Executes modular data cleaning, sentinel handling, and sanity bounds checking
- Harmonizes multi-source daily observations while strictly avoiding rainfall double-counting
- Calculates comprehensive agricultural indicators (temperature, rainfall, dry spells, soil moisture, water stress)
- Generates data quality audit and completeness reports
"""
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

from app.schemas.farmer import FarmerProfileBase
from app.services.data_cleaner import (
    clean_daily_observation,
    deduplicate_daily_records,
)
from app.services.data_integrator import (
    generate_date_range_series,
    integrate_environmental_datasets,
)
from app.services.indicator_calculator import (
    calculate_agricultural_indicators,
)
from app.services.nasa_gpm import (
    NasaGpmError,
    fetch_gpm_imerg,
)
from app.services.nasa_power import (
    NasaPowerError,
    fetch_nasa_power,
    get_default_date_range,
    validate_coordinates,
    validate_date_range,
)
from app.services.nasa_smap import (
    NasaSmapError,
    fetch_smap_soil_moisture,
)

logger = logging.getLogger(__name__)


class DataProcessorError(Exception):
    """Base exception for data processing pipeline operations."""
    pass


class DataProcessorValidationError(DataProcessorError):
    """Raised when request parameters fail validation."""
    pass


def process_agricultural_data(
    farmer_profile: FarmerProfileBase,
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    preferred_rainfall_source: str = "NASA POWER",
    include_daily_records: bool = True,
    # Optional dependency injection for testing
    power_fetcher=fetch_nasa_power,
    smap_fetcher=fetch_smap_soil_moisture,
    gpm_fetcher=fetch_gpm_imerg,
) -> Dict[str, Any]:
    """Execute the end-to-end agricultural data cleaning, integration, and processing pipeline.
    
    Args:
        farmer_profile: Validated farmer profile model.
        start_date: Period start date (optional).
        end_date: Period end date (optional).
        preferred_rainfall_source: 'NASA POWER' or 'NASA GPM IMERG'.
        include_daily_records: Whether to include day-by-day harmonized observations in output.
        power_fetcher: Callable for NASA POWER data.
        smap_fetcher: Callable for NASA SMAP data.
        gpm_fetcher: Callable for NASA GPM data.
        
    Returns:
        Structured dictionary matching AgricultureProcessResponse schema.
    """
    # 1. Validate geographic coordinates
    lat = farmer_profile.latitude
    lon = farmer_profile.longitude
    try:
        validate_coordinates(lat, lon)
    except Exception as err:
        raise DataProcessorValidationError(f"Invalid farmer coordinates ({lat}, {lon}): {err}") from err

    # 2. Validate and standardize date range
    try:
        start_obj, end_obj, start_iso, end_iso, _, _ = validate_date_range(start_date, end_date)
    except Exception as err:
        raise DataProcessorValidationError(f"Invalid date range ({start_date} to {end_date}): {err}") from err

    total_days = (end_obj - start_obj).days + 1

    # 3. Collect data from NASA sources
    power_data: Optional[Dict[str, Any]] = None
    smap_data: Optional[Dict[str, Any]] = None
    gpm_data: Optional[Dict[str, Any]] = None
    source_statuses: Dict[str, str] = {}

    # Fetch NASA POWER
    try:
        power_data = power_fetcher(
            latitude=lat,
            longitude=lon,
            start_date=start_iso,
            end_date=end_iso
        )
        source_statuses["nasa_power"] = "success"
    except NasaPowerError as err:
        logger.warning("NASA POWER fetch warning: %s", err)
        source_statuses["nasa_power"] = f"failed: {err}"
    except Exception as err:
        logger.warning("Unexpected error fetching NASA POWER: %s", err)
        source_statuses["nasa_power"] = f"error: {err}"

    # Fetch NASA SMAP
    try:
        smap_data = smap_fetcher(
            latitude=lat,
            longitude=lon,
            start_date=start_iso,
            end_date=end_iso
        )
        source_statuses["nasa_smap"] = "success"
    except NasaSmapError as err:
        logger.warning("NASA SMAP fetch warning: %s", err)
        source_statuses["nasa_smap"] = f"failed: {err}"
    except Exception as err:
        logger.warning("Unexpected error fetching NASA SMAP: %s", err)
        source_statuses["nasa_smap"] = f"error: {err}"

    # Fetch NASA GPM IMERG
    try:
        gpm_data = gpm_fetcher(
            latitude=lat,
            longitude=lon,
            start_date=start_iso,
            end_date=end_iso
        )
        source_statuses["nasa_gpm"] = "success"
    except NasaGpmError as err:
        logger.warning("NASA GPM fetch warning: %s", err)
        source_statuses["nasa_gpm"] = f"failed: {err}"
    except Exception as err:
        logger.warning("Unexpected error fetching NASA GPM: %s", err)
        source_statuses["nasa_gpm"] = f"error: {err}"

    # 4. Integrate multi-source datasets
    integration_result = integrate_environmental_datasets(
        power_data=power_data,
        smap_data=smap_data,
        gpm_data=gpm_data,
        start_date=start_iso,
        end_date=end_iso,
        preferred_rainfall_source=preferred_rainfall_source
    )

    raw_timeseries = integration_result["daily_timeseries"]
    completeness_report = integration_result["completeness"]
    provenance = integration_result["provenance"]

    # 5. Clean, sanitize, and validate each observation
    cleaned_timeseries: List[Dict[str, Any]] = []
    unique_quality_flags: set = set()

    for raw_rec in raw_timeseries:
        cleaned_rec = clean_daily_observation(raw_rec)
        # Preserve rainfall provenance metadata
        cleaned_rec["precipitation_source"] = raw_rec.get("precipitation_source", "Unknown")
        cleaned_rec["power_precipitation_mm"] = raw_rec.get("power_precipitation_mm")
        cleaned_rec["gpm_precipitation_mm"] = raw_rec.get("gpm_precipitation_mm")
        cleaned_rec["surface_soil_moisture_percent"] = raw_rec.get("surface_soil_moisture_percent")
        cleaned_rec["rootzone_soil_moisture_percent"] = raw_rec.get("rootzone_soil_moisture_percent")

        cleaned_timeseries.append(cleaned_rec)
        for flag in cleaned_rec.get("quality_flags", []):
            unique_quality_flags.add(flag)

    # 6. Deduplicate records if duplicate dates are present
    deduped_records, duplicate_count = deduplicate_daily_records(cleaned_timeseries)

    # 7. Compute Agricultural Indicators
    indicators = calculate_agricultural_indicators(
        deduped_records,
        completeness_percentage=completeness_report["overall_completeness_percentage"]
    )

    # 8. Determine overall execution status
    if source_statuses.get("nasa_power") == "success" and source_statuses.get("nasa_smap") == "success":
        status_val = "completed"
    elif any("success" in v for v in source_statuses.values()):
        status_val = "partial"
    else:
        status_val = "failed"

    # 9. Assemble Quality Report
    quality_audit = {
        "total_days_evaluated": total_days,
        "complete_observation_days": completeness_report["complete_observation_days"],
        "overall_completeness_percentage": completeness_report["overall_completeness_percentage"],
        "parameter_completeness": completeness_report["parameter_completeness"],
        "quality_flags_detected": sorted(list(unique_quality_flags)),
        "duplicate_dates_resolved": duplicate_count,
    }

    # 10. Assemble Standard Physical Units
    units = {
        "temperature": "°C",
        "precipitation": "mm/day",
        "total_rainfall": "mm",
        "relative_humidity": "%",
        "solar_radiation": "kWh/m²/day",
        "soil_moisture_fraction": "0.0 - 1.0 (fraction)",
        "soil_moisture_percent": "%",
    }

    # 11. Build Response Payload
    response = {
        "success": status_val != "failed",
        "status": status_val,
        "message": (
            "Agricultural data cleaned, integrated, and indicators calculated successfully."
            if status_val == "completed"
            else "Agricultural data partially processed. Check data quality and sources."
        ),
        "farmer_profile": farmer_profile.model_dump(),
        "location": {
            "village": farmer_profile.village,
            "latitude": lat,
            "longitude": lon,
        },
        "period": {
            "start_date": start_iso,
            "end_date": end_iso,
            "total_days": total_days,
        },
        "indicators": indicators,
        "data_quality": quality_audit,
        "units": units,
        "sources": {
            "statuses": source_statuses,
            "provenance": provenance,
        },
        "daily_records": deduped_records if include_daily_records else None,
    }

    return response
