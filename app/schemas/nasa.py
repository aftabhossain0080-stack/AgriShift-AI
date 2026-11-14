"""Pydantic schemas for NASA Earth Observation endpoints."""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LocationSchema(BaseModel):
    """Geographic location coordinates."""
    latitude: float = Field(
        ...,
        description="Latitude coordinate in decimal degrees between -90.0 and 90.0",
        examples=[22.90]
    )
    longitude: float = Field(
        ...,
        description="Longitude coordinate in decimal degrees between -180.0 and 180.0",
        examples=[88.40]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "latitude": 22.90,
                "longitude": 88.40
            }
        }
    }


class PeriodSchema(BaseModel):
    """Date range period for observations."""
    start_date: str = Field(
        ...,
        description="Observation start date in ISO format (YYYY-MM-DD)",
        examples=["2026-10-12"]
    )
    end_date: str = Field(
        ...,
        description="Observation end date in ISO format (YYYY-MM-DD)",
        examples=["2026-11-10"]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "start_date": "2026-10-12",
                "end_date": "2026-11-10"
            }
        }
    }


class DailyPowerDataPoint(BaseModel):
    """Single-day NASA POWER observation."""
    date: str = Field(
        ...,
        description="Observation date (YYYY-MM-DD)",
        examples=["2026-10-12"]
    )
    temperature: Optional[float] = Field(
        None,
        description="2-meter air temperature in °C (null if satellite observation is missing)",
        examples=[26.59]
    )
    precipitation: Optional[float] = Field(
        None,
        description="Corrected precipitation in mm (null if satellite observation is missing)",
        examples=[0.09]
    )
    relative_humidity: Optional[float] = Field(
        None,
        description="2-meter relative humidity in % (null if satellite observation is missing)",
        examples=[81.77]
    )
    solar_radiation: Optional[float] = Field(
        None,
        description="All-sky surface shortwave downward irradiance in kWh/m²/day (null if missing)",
        examples=[5.07]
    )
    solar_radiation_mj: Optional[float] = Field(
        None,
        description="Raw solar radiation from NASA AG community in MJ/m²/day (null if missing)",
        examples=[18.24]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "date": "2026-10-12",
                "temperature": 26.59,
                "precipitation": 0.09,
                "relative_humidity": 81.77,
                "solar_radiation": 5.07,
                "solar_radiation_mj": 18.24
            }
        }
    }


class PowerSummary(BaseModel):
    """Statistical summary over the requested observation period."""
    average_temperature: Optional[float] = Field(
        None,
        description="Mean temperature across valid observations (°C)",
        examples=[25.40]
    )
    max_temperature: Optional[float] = Field(
        None,
        description="Maximum recorded daily temperature (°C)",
        examples=[27.36]
    )
    min_temperature: Optional[float] = Field(
        None,
        description="Minimum recorded daily temperature (°C)",
        examples=[23.11]
    )
    total_rainfall: Optional[float] = Field(
        None,
        description="Accumulated total precipitation across the period (mm)",
        examples=[39.93]
    )
    average_humidity: Optional[float] = Field(
        None,
        description="Mean relative humidity across valid observations (%)",
        examples=[80.29]
    )
    average_solar_radiation: Optional[float] = Field(
        None,
        description="Mean surface solar radiation in kWh/m²/day",
        examples=[4.17]
    )
    valid_observations_count: int = Field(
        ...,
        description="Count of days with complete valid satellite observations",
        examples=[29]
    )
    missing_observations_count: int = Field(
        ...,
        description="Count of missing/sentinel parameter observations across all days",
        examples=[1]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "average_temperature": 25.40,
                "max_temperature": 27.36,
                "min_temperature": 23.11,
                "total_rainfall": 39.93,
                "average_humidity": 80.29,
                "average_solar_radiation": 4.17,
                "valid_observations_count": 29,
                "missing_observations_count": 1
            }
        }
    }


class NasaPowerResponse(BaseModel):
    """Full structured response for NASA POWER daily observations."""
    success: bool = Field(True, description="Request execution status", examples=[True])
    source: str = Field("NASA POWER", description="Data provider", examples=["NASA POWER"])
    location: LocationSchema
    period: PeriodSchema
    units: Dict[str, str] = Field(
        default_factory=dict,
        description="Physical units for each agro-meteorological parameter",
        examples=[{
            "temperature": "°C",
            "rainfall": "mm",
            "relative_humidity": "%",
            "solar_radiation": "kWh/m²/day",
            "T2M": "°C",
            "PRECTOTCORR": "mm",
            "RH2M": "%",
            "ALLSKY_SFC_SW_DWN": "kWh/m²/day"
        }]
    )
    data: List[DailyPowerDataPoint] = Field(default_factory=list, description="Time-series daily observations")
    summary: PowerSummary

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "source": "NASA POWER",
                "location": {
                    "latitude": 22.90,
                    "longitude": 88.40
                },
                "period": {
                    "start_date": "2026-10-12",
                    "end_date": "2026-11-10"
                },
                "units": {
                    "temperature": "°C",
                    "rainfall": "mm",
                    "relative_humidity": "%",
                    "solar_radiation": "kWh/m²/day",
                    "T2M": "°C",
                    "PRECTOTCORR": "mm",
                    "RH2M": "%",
                    "ALLSKY_SFC_SW_DWN": "kWh/m²/day"
                },
                "data": [
                    {
                        "date": "2026-10-12",
                        "temperature": 26.59,
                        "precipitation": 0.09,
                        "relative_humidity": 81.77,
                        "solar_radiation": 5.07,
                        "solar_radiation_mj": 18.24
                    },
                    {
                        "date": "2026-11-10",
                        "temperature": 25.02,
                        "precipitation": 2.30,
                        "relative_humidity": 77.65,
                        "solar_radiation": None,
                        "solar_radiation_mj": None
                    }
                ],
                "summary": {
                    "average_temperature": 25.40,
                    "max_temperature": 27.36,
                    "min_temperature": 23.11,
                    "total_rainfall": 39.93,
                    "average_humidity": 80.29,
                    "average_solar_radiation": 4.17,
                    "valid_observations_count": 29,
                    "missing_observations_count": 1
                }
            }
        }
    }


class NasaPowerSummaryResponse(BaseModel):
    """Statistical summary response for NASA POWER data."""
    success: bool = Field(True, description="Request execution status", examples=[True])
    source: str = Field("NASA POWER", description="Data provider", examples=["NASA POWER"])
    location: LocationSchema
    period: PeriodSchema
    units: Dict[str, str] = Field(
        default_factory=dict,
        description="Physical units for each parameter",
        examples=[{
            "temperature": "°C",
            "rainfall": "mm",
            "relative_humidity": "%",
            "solar_radiation": "kWh/m²/day",
            "T2M": "°C",
            "PRECTOTCORR": "mm",
            "RH2M": "%",
            "ALLSKY_SFC_SW_DWN": "kWh/m²/day"
        }]
    )
    summary: PowerSummary
    average_temperature: Optional[float] = Field(None, description="Mean temperature (°C)", examples=[25.40])
    max_temperature: Optional[float] = Field(None, description="Maximum temperature (°C)", examples=[27.36])
    min_temperature: Optional[float] = Field(None, description="Minimum temperature (°C)", examples=[23.11])
    total_rainfall: Optional[float] = Field(None, description="Total rainfall accumulated (mm)", examples=[39.93])
    average_humidity: Optional[float] = Field(None, description="Mean relative humidity (%)", examples=[80.29])
    average_solar_radiation: Optional[float] = Field(None, description="Mean solar radiation (kWh/m²/day)", examples=[4.17])
    valid_observations_count: int = Field(..., description="Count of days with complete valid observations", examples=[29])
    missing_observations_count: int = Field(..., description="Count of missing/sentinel parameter observations", examples=[1])
    daily_data: Optional[List[DailyPowerDataPoint]] = Field(default=None, description="Daily observations time series")

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "source": "NASA POWER",
                "location": {
                    "latitude": 22.90,
                    "longitude": 88.40
                },
                "period": {
                    "start_date": "2026-10-12",
                    "end_date": "2026-11-10"
                },
                "units": {
                    "temperature": "°C",
                    "rainfall": "mm",
                    "relative_humidity": "%",
                    "solar_radiation": "kWh/m²/day",
                    "T2M": "°C",
                    "PRECTOTCORR": "mm",
                    "RH2M": "%",
                    "ALLSKY_SFC_SW_DWN": "kWh/m²/day"
                },
                "summary": {
                    "average_temperature": 25.40,
                    "max_temperature": 27.36,
                    "min_temperature": 23.11,
                    "total_rainfall": 39.93,
                    "average_humidity": 80.29,
                    "average_solar_radiation": 4.17,
                    "valid_observations_count": 29,
                    "missing_observations_count": 1
                },
                "average_temperature": 25.40,
                "max_temperature": 27.36,
                "min_temperature": 23.11,
                "total_rainfall": 39.93,
                "average_humidity": 80.29,
                "average_solar_radiation": 4.17,
                "valid_observations_count": 29,
                "missing_observations_count": 1,
                "daily_data": [
                    {
                        "date": "2026-10-12",
                        "temperature": 26.59,
                        "precipitation": 0.09,
                        "relative_humidity": 81.77,
                        "solar_radiation": 5.07,
                        "solar_radiation_mj": 18.24
                    }
                ]
            }
        }
    }


# ==============================================================================
# NASA GPM IMERG SCHEMAS
# ==============================================================================

class GpmDailyPoint(BaseModel):
    """Daily precipitation record from NASA GPM IMERG."""
    date: str = Field(..., description="Observation date (YYYY-MM-DD)", examples=["2024-01-01"])
    precipitation: Optional[float] = Field(None, description="Daily calibrated precipitation (mm/day)", examples=[2.40])


class GpmSummary(BaseModel):
    """Statistical rainfall summary derived from NASA GPM IMERG observations."""
    total_rainfall: Optional[float] = Field(None, description="Accumulated rainfall over the period (mm)", examples=[12.80])
    average_daily_rainfall: Optional[float] = Field(None, description="Mean daily precipitation (mm/day)", examples=[2.56])
    max_daily_rainfall: Optional[float] = Field(None, description="Maximum single-day rainfall event (mm/day)", examples=[6.50])
    min_daily_rainfall: Optional[float] = Field(None, description="Minimum daily rainfall (mm/day)", examples=[0.00])
    rainy_days_count: int = Field(..., description="Count of days with precipitation >= 1.0 mm", examples=[3])
    dry_days_count: int = Field(..., description="Count of days with precipitation < 1.0 mm", examples=[2])
    rainfall_trend: str = Field(..., description="Rainfall trend (increasing, decreasing, steady, dry_spell)", examples=["steady"])


class NasaGpmSummaryResponse(BaseModel):
    """Summary response for NASA GPM IMERG precipitation data."""
    success: bool = Field(True, description="Request status")
    source: str = Field("NASA GPM IMERG", description="Satellite constellation data source")
    dataset: str = Field("GPM_3IMERGDF V07B (Daily Final)", description="Active IMERG dataset product")
    spatial_resolution: str = Field("0.1° x 0.1° (~10 km)", description="Spatial resolution")
    temporal_resolution: str = Field("Daily", description="Temporal resolution")
    location: LocationSchema
    period: PeriodSchema
    units: Dict[str, str] = Field(
        default_factory=dict,
        description="Measurement units",
        examples=[{"precipitation": "mm", "daily_rainfall": "mm/day"}]
    )
    summary: GpmSummary
    total_rainfall: Optional[float] = Field(None, description="Total rainfall accumulated (mm)", examples=[12.80])
    average_daily_rainfall: Optional[float] = Field(None, description="Mean daily rainfall (mm/day)", examples=[2.56])
    max_daily_rainfall: Optional[float] = Field(None, description="Max daily rainfall (mm/day)", examples=[6.50])
    rainfall_trend: Optional[str] = Field(None, description="Trend classification", examples=["steady"])
    granules_count: int = Field(..., description="Number of NASA GPM daily granules indexed", examples=[5])
    auth_status: Optional[str] = Field(None, description="Earthdata authentication status")
    daily_data: Optional[List[GpmDailyPoint]] = Field(default=None, description="Daily precipitation records")

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "source": "NASA GPM IMERG",
                "dataset": "GPM_3IMERGDF V07B (Daily Final)",
                "spatial_resolution": "0.1° x 0.1° (~10 km)",
                "temporal_resolution": "Daily",
                "location": {"latitude": 22.90, "longitude": 88.40},
                "period": {"start_date": "2024-01-01", "end_date": "2024-01-05"},
                "units": {"precipitation": "mm", "daily_rainfall": "mm/day"},
                "summary": {
                    "total_rainfall": 12.80,
                    "average_daily_rainfall": 2.56,
                    "max_daily_rainfall": 6.50,
                    "min_daily_rainfall": 0.00,
                    "rainy_days_count": 3,
                    "dry_days_count": 2,
                    "rainfall_trend": "steady"
                },
                "total_rainfall": 12.80,
                "average_daily_rainfall": 2.56,
                "max_daily_rainfall": 6.50,
                "rainfall_trend": "steady",
                "granules_count": 5,
                "auth_status": "authenticated",
                "daily_data": [
                    {"date": "2024-01-01", "precipitation": 0.00},
                    {"date": "2024-01-02", "precipitation": 2.40},
                    {"date": "2024-01-03", "precipitation": 6.50},
                    {"date": "2024-01-04", "precipitation": 3.90},
                    {"date": "2024-01-05", "precipitation": 0.00}
                ]
            }
        }
    }


# ==============================================================================
# NASA SMAP SOIL MOISTURE SCHEMAS
# ==============================================================================

class SmapDailyPoint(BaseModel):
    """Daily soil moisture record from NASA SMAP Level-4 assimilation."""
    date: str = Field(..., description="Observation date (YYYY-MM-DD)", examples=["2026-10-12"])
    surface_soil_moisture: Optional[float] = Field(None, description="Surface soil wetness fraction 0-5cm (0.0 to 1.0)", examples=[0.67])
    surface_soil_moisture_percent: Optional[float] = Field(None, description="Surface soil moisture percentage (0% to 100%)", examples=[67.0])
    rootzone_soil_moisture: Optional[float] = Field(None, description="Root-zone soil wetness fraction 0-100cm (0.0 to 1.0)", examples=[0.71])
    rootzone_soil_moisture_percent: Optional[float] = Field(None, description="Root-zone soil moisture percentage (0% to 100%)", examples=[71.0])
    profile_soil_moisture: Optional[float] = Field(None, description="Profile soil wetness fraction (0.0 to 1.0)", examples=[0.70])


class SmapSummary(BaseModel):
    """Statistical summary of soil moisture conditions."""
    average_surface_soil_moisture: Optional[float] = Field(None, description="Mean surface soil moisture fraction (0-1)", examples=[0.64])
    min_surface_soil_moisture: Optional[float] = Field(None, description="Minimum surface soil moisture fraction", examples=[0.58])
    max_surface_soil_moisture: Optional[float] = Field(None, description="Maximum surface soil moisture fraction", examples=[0.72])
    average_rootzone_soil_moisture: Optional[float] = Field(None, description="Mean root-zone soil moisture fraction (0-1)", examples=[0.68])
    min_rootzone_soil_moisture: Optional[float] = Field(None, description="Minimum root-zone soil moisture fraction", examples=[0.62])
    max_rootzone_soil_moisture: Optional[float] = Field(None, description="Maximum root-zone soil moisture fraction", examples=[0.73])
    soil_moisture_trend: str = Field(..., description="Soil moisture trend (drying, wetting, stable)", examples=["stable"])
    water_stress_indicator: str = Field(..., description="Water-stress status for agricultural crops", examples=["Optimal / Adequate Moisture"])
    valid_observations_count: int = Field(..., description="Count of valid daily observations", examples=[30])
    missing_observations_count: int = Field(..., description="Count of missing observations", examples=[0])


class NasaSmapSummaryResponse(BaseModel):
    """Summary response for NASA SMAP Level-4 soil moisture data."""
    success: bool = Field(True, description="Request status")
    source: str = Field("NASA SMAP Level-4 (GMAO GEOS)", description="Data provider and mission model")
    spatial_resolution: str = Field("0.25° x 0.25° (~25 km, assimilated from 9 km SMAP L4)", description="Spatial resolution")
    temporal_resolution: str = Field("Daily", description="Temporal resolution")
    location: LocationSchema
    period: PeriodSchema
    units: Dict[str, str] = Field(
        default_factory=dict,
        description="Physical units",
        examples=[{
            "surface_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0) / %",
            "rootzone_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0) / %"
        }]
    )
    summary: SmapSummary
    average_surface_soil_moisture: Optional[float] = Field(None, description="Mean surface wetness (0-1)", examples=[0.64])
    average_rootzone_soil_moisture: Optional[float] = Field(None, description="Mean root-zone wetness (0-1)", examples=[0.68])
    water_stress_indicator: Optional[str] = Field(None, description="Crop water stress indicator", examples=["Optimal / Adequate Moisture"])
    soil_moisture_trend: Optional[str] = Field(None, description="Soil moisture trend", examples=["stable"])
    daily_data: Optional[List[SmapDailyPoint]] = Field(default=None, description="Daily soil moisture time series")

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "source": "NASA SMAP Level-4 (GMAO GEOS)",
                "spatial_resolution": "0.25° x 0.25° (~25 km, assimilated from 9 km SMAP L4)",
                "temporal_resolution": "Daily",
                "location": {"latitude": 22.90, "longitude": 88.40},
                "period": {"start_date": "2026-10-12", "end_date": "2026-11-10"},
                "units": {
                    "surface_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0)",
                    "rootzone_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0)",
                    "profile_soil_moisture": "dimensionless wetness fraction (0.0 to 1.0)"
                },
                "summary": {
                    "average_surface_soil_moisture": 0.64,
                    "min_surface_soil_moisture": 0.58,
                    "max_surface_soil_moisture": 0.72,
                    "average_rootzone_soil_moisture": 0.68,
                    "min_rootzone_soil_moisture": 0.62,
                    "max_rootzone_soil_moisture": 0.73,
                    "soil_moisture_trend": "stable",
                    "water_stress_indicator": "Optimal / Adequate Moisture",
                    "valid_observations_count": 30,
                    "missing_observations_count": 0
                },
                "average_surface_soil_moisture": 0.64,
                "average_rootzone_soil_moisture": 0.68,
                "water_stress_indicator": "Optimal / Adequate Moisture",
                "soil_moisture_trend": "stable",
                "daily_data": [
                    {
                        "date": "2026-10-12",
                        "surface_soil_moisture": 0.67,
                        "surface_soil_moisture_percent": 67.0,
                        "rootzone_soil_moisture": 0.71,
                        "rootzone_soil_moisture_percent": 71.0,
                        "profile_soil_moisture": 0.70
                    }
                ]
            }
        }
    }
