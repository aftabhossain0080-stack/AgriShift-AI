"""Pydantic Schemas for Agricultural Data Cleaning, Integration & Processing Pipeline.

Provides request, indicator, quality report, and response models with detailed
Swagger documentation and realistic agricultural examples for Hooghly, West Bengal.
"""
from datetime import date
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.farmer import FarmerProfileBase


class AgricultureProcessRequest(BaseModel):
    """Request payload for agricultural data processing pipeline."""
    farmer_profile: FarmerProfileBase = Field(
        ...,
        description="Farmer profile and agricultural land inputs"
    )
    start_date: Optional[date] = Field(
        default=None,
        description="Query start date (YYYY-MM-DD). Defaults to 32 days ago if omitted.",
        examples=["2024-01-01"]
    )
    end_date: Optional[date] = Field(
        default=None,
        description="Query end date (YYYY-MM-DD). Defaults to 3 days ago to accommodate NASA latency.",
        examples=["2024-01-30"]
    )
    preferred_rainfall_source: Optional[str] = Field(
        default="NASA POWER",
        description="Primary precipitation source to avoid double counting: 'NASA POWER' or 'NASA GPM IMERG'.",
        examples=["NASA POWER"]
    )
    include_daily_records: Optional[bool] = Field(
        default=True,
        description="Whether to include day-by-day cleaned and harmonized observations in response.",
        examples=[True]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "farmer_profile": {
                    "village": "Singur",
                    "latitude": 22.81,
                    "longitude": 88.23,
                    "current_crop": "Potato",
                    "previous_crop": "Paddy (Aman)",
                    "soil_type": "Alluvial",
                    "land_area_acres": 2.5,
                    "irrigation_available": True,
                    "farming_season": "Rabi"
                },
                "start_date": "2024-01-01",
                "end_date": "2024-01-30",
                "preferred_rainfall_source": "NASA POWER",
                "include_daily_records": True
            }
        }
    }


class TemperatureIndicators(BaseModel):
    """Processed agro-thermal indicators."""
    average_temperature_celsius: Optional[float] = Field(
        22.45, description="Average 2m ambient air temperature in °C"
    )
    min_temperature_celsius: Optional[float] = Field(
        13.50, description="Minimum daily temperature in °C"
    )
    max_temperature_celsius: Optional[float] = Field(
        29.80, description="Maximum daily temperature in °C"
    )
    temperature_trend: str = Field(
        "stable", description="Temperature trend: warming, cooling, or stable"
    )


class RainfallIndicators(BaseModel):
    """Processed precipitation and moisture deficit indicators."""
    total_rainfall_mm: Optional[float] = Field(
        18.40, description="Total cumulative precipitation in mm over the period"
    )
    average_daily_rainfall_mm: Optional[float] = Field(
        0.61, description="Average daily precipitation in mm/day"
    )
    max_single_day_rainfall_mm: Optional[float] = Field(
        12.20, description="Highest single-day precipitation event in mm"
    )
    rainfall_trend: str = Field(
        "dry_spell", description="Rainfall trajectory: increasing, decreasing, stable, or dry_spell"
    )
    consecutive_dry_days: int = Field(
        14, description="Maximum consecutive days with precipitation < 1.0 mm"
    )
    total_dry_days: int = Field(
        26, description="Total days with precipitation < 1.0 mm"
    )
    rainy_days_count: int = Field(
        4, description="Count of days with significant rainfall (>= 1.0 mm)"
    )
    heavy_rain_days_count: int = Field(
        0, description="Count of heavy rainfall days (>= 25.0 mm)"
    )


class SoilMoistureIndicators(BaseModel):
    """Processed surface and root-zone soil wetness indicators."""
    average_surface_soil_moisture_fraction: Optional[float] = Field(
        0.48, description="Average surface wetness fraction (0-5 cm, 0.0 to 1.0)"
    )
    average_surface_soil_moisture_percent: Optional[float] = Field(
        48.0, description="Average surface soil wetness in %"
    )
    min_surface_soil_moisture_fraction: Optional[float] = Field(
        0.35, description="Minimum surface wetness fraction observed"
    )
    max_surface_soil_moisture_fraction: Optional[float] = Field(
        0.62, description="Maximum surface wetness fraction observed"
    )
    average_rootzone_soil_moisture_fraction: Optional[float] = Field(
        0.52, description="Average root-zone wetness fraction (0-100 cm, 0.0 to 1.0)"
    )
    average_rootzone_soil_moisture_percent: Optional[float] = Field(
        52.0, description="Average root-zone soil wetness in %"
    )
    min_rootzone_soil_moisture_fraction: Optional[float] = Field(
        0.42, description="Minimum root-zone wetness fraction observed"
    )
    max_rootzone_soil_moisture_fraction: Optional[float] = Field(
        0.58, description="Maximum root-zone wetness fraction observed"
    )
    soil_moisture_trend: str = Field(
        "drying", description="Soil moisture trend: wetting, drying, or stable"
    )
    water_stress_indicator: str = Field(
        "Optimal (Favorable Soil Moisture)",
        description="Agronomic classification: Severe Stress, Moderate Stress, Optimal, Waterlogging"
    )


class OtherIndicators(BaseModel):
    """Atmospheric and data quality metrics."""
    average_relative_humidity_percent: Optional[float] = Field(
        68.5, description="Average relative humidity in %"
    )
    average_solar_radiation_kwh_m2_day: Optional[float] = Field(
        4.35, description="Average all-sky surface solar irradiance in kWh/m²/day"
    )
    data_completeness_percentage: float = Field(
        96.7, description="Percentage of period with complete observations across all parameters"
    )


class AgriculturalIndicatorsGroup(BaseModel):
    """Aggregated agricultural indicator groups."""
    temperature: TemperatureIndicators
    rainfall: RainfallIndicators
    soil_moisture: SoilMoistureIndicators
    other: OtherIndicators


class DataQualityReport(BaseModel):
    """Audit and data cleaning report."""
    total_days_evaluated: int = Field(30, description="Total days within requested period")
    complete_observation_days: int = Field(29, description="Days with observations for all parameters")
    overall_completeness_percentage: float = Field(96.7, description="Completeness percentage")
    parameter_completeness: Dict[str, int] = Field(
        default_factory=dict, description="Counts of valid days per parameter"
    )
    quality_flags_detected: List[str] = Field(
        default_factory=list, description="Unique quality alerts detected (e.g. extreme_rainfall, heatwave)"
    )
    duplicate_dates_resolved: int = Field(0, description="Count of duplicate date entries resolved")


class DailyHarmonizedRecord(BaseModel):
    """Cleaned and harmonized single-day observation."""
    date: str = Field(..., description="Date (YYYY-MM-DD)", examples=["2024-01-15"])
    temperature: Optional[float] = Field(None, description="2m Temperature in °C")
    precipitation: Optional[float] = Field(None, description="Harmonized precipitation in mm/day")
    precipitation_source: str = Field(..., description="Selected source (NASA POWER or NASA GPM IMERG)")
    power_precipitation_mm: Optional[float] = Field(None, description="Raw NASA POWER PRECTOTCORR in mm")
    gpm_precipitation_mm: Optional[float] = Field(None, description="Raw NASA GPM IMERG precipitation in mm")
    relative_humidity: Optional[float] = Field(None, description="Relative humidity in %")
    solar_radiation: Optional[float] = Field(None, description="Solar irradiance in kWh/m²/day")
    surface_soil_moisture: Optional[float] = Field(None, description="Surface wetness fraction (0.0 to 1.0)")
    surface_soil_moisture_percent: Optional[float] = Field(None, description="Surface wetness in %")
    rootzone_soil_moisture: Optional[float] = Field(None, description="Root-zone wetness fraction (0.0 to 1.0)")
    rootzone_soil_moisture_percent: Optional[float] = Field(None, description="Root-zone wetness in %")
    quality_flags: List[str] = Field(default_factory=list, description="Quality flags for this date")


class AgricultureProcessResponse(BaseModel):
    """Complete response payload for Phase 5 data processing pipeline."""
    success: bool = Field(True, description="Operation success status")
    status: str = Field("completed", description="Execution status: completed, partial, failed")
    message: str = Field("Agricultural data cleaned, integrated, and indicators calculated successfully.", description="Status message")
    farmer_profile: FarmerProfileBase = Field(..., description="Echoed and validated farmer profile")
    location: Dict[str, Any] = Field(..., description="Geographic coordinates and administrative metadata")
    period: Dict[str, Any] = Field(..., description="Observation start date, end date, and total days")
    indicators: AgriculturalIndicatorsGroup = Field(..., description="Computed agricultural indicators")
    data_quality: DataQualityReport = Field(..., description="Data completeness and cleaning audit report")
    units: Dict[str, str] = Field(..., description="Physical units of each indicator")
    sources: Dict[str, Any] = Field(..., description="Data sources queried and integration provenance")
    daily_records: Optional[List[DailyHarmonizedRecord]] = Field(
        None, description="Optional daily cleaned and harmonized records"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "status": "completed",
                "message": "Agricultural data cleaned, integrated, and indicators calculated successfully.",
                "farmer_profile": {
                    "village": "Singur",
                    "latitude": 22.81,
                    "longitude": 88.23,
                    "current_crop": "Potato",
                    "previous_crop": "Paddy (Aman)",
                    "soil_type": "Alluvial",
                    "land_area_acres": 2.5,
                    "irrigation_available": True,
                    "farming_season": "Rabi"
                },
                "location": {
                    "village": "Singur",
                    "latitude": 22.81,
                    "longitude": 88.23
                },
                "period": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-01-30",
                    "total_days": 30
                },
                "indicators": {
                    "temperature": {
                        "average_temperature_celsius": 22.45,
                        "min_temperature_celsius": 13.50,
                        "max_temperature_celsius": 29.80,
                        "temperature_trend": "stable"
                    },
                    "rainfall": {
                        "total_rainfall_mm": 18.40,
                        "average_daily_rainfall_mm": 0.61,
                        "max_single_day_rainfall_mm": 12.20,
                        "rainfall_trend": "dry_spell",
                        "consecutive_dry_days": 14,
                        "total_dry_days": 26,
                        "rainy_days_count": 4,
                        "heavy_rain_days_count": 0
                    },
                    "soil_moisture": {
                        "average_surface_soil_moisture_fraction": 0.48,
                        "average_surface_soil_moisture_percent": 48.0,
                        "min_surface_soil_moisture_fraction": 0.35,
                        "max_surface_soil_moisture_fraction": 0.62,
                        "average_rootzone_soil_moisture_fraction": 0.52,
                        "average_rootzone_soil_moisture_percent": 52.0,
                        "min_rootzone_soil_moisture_fraction": 0.42,
                        "max_rootzone_soil_moisture_fraction": 0.58,
                        "soil_moisture_trend": "drying",
                        "water_stress_indicator": "Optimal (Favorable Soil Moisture)"
                    },
                    "other": {
                        "average_relative_humidity_percent": 68.5,
                        "average_solar_radiation_kwh_m2_day": 4.35,
                        "data_completeness_percentage": 96.7
                    }
                },
                "data_quality": {
                    "total_days_evaluated": 30,
                    "complete_observation_days": 29,
                    "overall_completeness_percentage": 96.7,
                    "parameter_completeness": {
                        "temperature_days": 30,
                        "precipitation_days": 30,
                        "humidity_days": 30,
                        "solar_radiation_days": 30,
                        "smap_surface_moisture_days": 29,
                        "smap_rootzone_moisture_days": 29
                    },
                    "quality_flags_detected": [],
                    "duplicate_dates_resolved": 0
                },
                "units": {
                    "temperature": "°C",
                    "precipitation": "mm/day",
                    "total_rainfall": "mm",
                    "relative_humidity": "%",
                    "solar_radiation": "kWh/m²/day",
                    "soil_moisture_fraction": "0.0 - 1.0 (fraction)",
                    "soil_moisture_percent": "%"
                },
                "sources": {
                    "nasa_power": "NASA POWER Daily Point API (AG Community)",
                    "nasa_smap": "NASA SMAP L4 via GMAO GEOS Catchment Land Surface Model",
                    "nasa_gpm": "NASA GPM IMERG Final Daily Precipitation (GPM_3IMERGDF V07)",
                    "rainfall_selection": "NASA POWER (Primary)"
                }
            }
        }
    }
