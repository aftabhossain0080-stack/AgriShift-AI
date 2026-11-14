"""NASA Earth Observation endpoints router.

Provides endpoints for:
- NASA POWER Daily agro-meteorological data (temperature, solar radiation, precipitation, humidity)
- NASA GPM IMERG satellite precipitation data (daily rainfall, rainfall trends)
- NASA SMAP Level-4 soil moisture data (surface wetness, root-zone moisture, water-stress indicators)
"""
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.nasa import (
    NasaGpmSummaryResponse,
    NasaPowerResponse,
    NasaPowerSummaryResponse,
    NasaSmapSummaryResponse,
)
from app.services.nasa_gpm import (
    NasaGpmAuthenticationError,
    NasaGpmConnectionError,
    NasaGpmResponseError,
    NasaGpmValidationError,
    fetch_gpm_imerg,
)
from app.services.nasa_power import (
    NasaPowerConnectionError,
    NasaPowerResponseError,
    NasaPowerValidationError,
    fetch_nasa_power,
)
from app.services.nasa_smap import (
    NasaSmapConnectionError,
    NasaSmapResponseError,
    NasaSmapValidationError,
    fetch_smap_soil_moisture,
)
from app.utils.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/nasa", tags=["NASA Earth Observation"])


@router.get(
    "/status",
    summary="NASA Services Status",
    description="Returns active operational status of all NASA Earth Observation services."
)
def get_nasa_service_status():
    """Returns status of NASA Earth Observation services."""
    return {
        "status": "operational",
        "active_services": [
            "NASA POWER Daily API",
            "NASA GPM IMERG Precipitation API",
            "NASA SMAP Level-4 Soil Moisture API"
        ],
        "default_region": {
            "name": "Hooghly, West Bengal, India",
            "latitude": settings.DEFAULT_LATITUDE,
            "longitude": settings.DEFAULT_LONGITUDE,
        }
    }


# ==============================================================================
# NASA POWER ENDPOINTS
# ==============================================================================

@router.get(
    "/power",
    response_model=NasaPowerResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch NASA POWER Daily Meteorological Data",
    description=(
        "Retrieves daily historical solar radiation, 2-meter air temperature, "
        "corrected precipitation, and relative humidity for any geographic coordinate. "
        "Defaults to Hooghly, West Bengal (22.90°N, 88.40°E) for the last 30 available days."
    )
)
def get_nasa_power_data(
    latitude: float = Query(
        default=22.90,
        ge=-90.0,
        le=90.0,
        description="Target latitude (-90.0 to 90.0). Defaults to Hooghly: 22.90"
    ),
    longitude: float = Query(
        default=88.40,
        ge=-180.0,
        le=180.0,
        description="Target longitude (-180.0 to 180.0). Defaults to Hooghly: 88.40"
    ),
    start_date: Optional[str] = Query(
        default=None,
        description="Observation start date in YYYY-MM-DD format (e.g. '2024-01-01'). Defaults to 30 days prior to end_date."
    ),
    end_date: Optional[str] = Query(
        default=None,
        description="Observation end date in YYYY-MM-DD format (e.g. '2024-01-30'). Defaults to latest available day accounting for publication lag."
    ),
):
    """Retrieve full daily agro-meteorological records and summary from NASA POWER."""
    try:
        data = fetch_nasa_power(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
        )
        return data
    except NasaPowerValidationError as err:
        logger.warning("Validation error in /nasa/power: %s", err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        ) from err
    except (NasaPowerConnectionError, NasaPowerResponseError) as err:
        logger.error("Error in /nasa/power: %s", err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        ) from err
    except Exception as err:
        logger.exception("Unexpected error in /nasa/power: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching NASA POWER data: {err}"
        ) from err


@router.get(
    "/power/summary",
    response_model=NasaPowerSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch NASA POWER Agro-Climatic Summary Statistics",
    description=(
        "Retrieves calculated agro-meteorological summary statistics over the requested period, "
        "including average/max/min temperature, total precipitation, mean humidity, "
        "average solar radiation in kWh/m²/day, and counts of valid and missing observations."
    )
)
def get_nasa_power_summary(
    latitude: float = Query(
        default=22.90,
        ge=-90.0,
        le=90.0,
        description="Target latitude (-90.0 to 90.0). Defaults to Hooghly: 22.90"
    ),
    longitude: float = Query(
        default=88.40,
        ge=-180.0,
        le=180.0,
        description="Target longitude (-180.0 to 180.0). Defaults to Hooghly: 88.40"
    ),
    start_date: Optional[str] = Query(
        default=None,
        description="Observation start date in YYYY-MM-DD format. Defaults to 30 days prior to end_date."
    ),
    end_date: Optional[str] = Query(
        default=None,
        description="Observation end date in YYYY-MM-DD format. Defaults to latest available day accounting for publication lag."
    ),
):
    """Retrieve agro-meteorological summary statistics from NASA POWER."""
    try:
        data = fetch_nasa_power(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
        )
        summary = data["summary"]
        return {
            "success": True,
            "source": data["source"],
            "location": data["location"],
            "period": data["period"],
            "units": data["units"],
            "summary": summary,
            "average_temperature": summary["average_temperature"],
            "max_temperature": summary["max_temperature"],
            "min_temperature": summary["min_temperature"],
            "total_rainfall": summary["total_rainfall"],
            "average_humidity": summary["average_humidity"],
            "average_solar_radiation": summary["average_solar_radiation"],
            "valid_observations_count": summary["valid_observations_count"],
            "missing_observations_count": summary["missing_observations_count"],
            "daily_data": data["data"],
        }
    except NasaPowerValidationError as err:
        logger.warning("Validation error in /nasa/power/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        ) from err
    except (NasaPowerConnectionError, NasaPowerResponseError) as err:
        logger.error("Error in /nasa/power/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        ) from err
    except Exception as err:
        logger.exception("Unexpected error in /nasa/power/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching NASA POWER summary: {err}"
        ) from err


# ==============================================================================
# NASA GPM IMERG ENDPOINTS
# ==============================================================================

@router.get(
    "/gpm/summary",
    response_model=NasaGpmSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch NASA GPM IMERG Precipitation Summary",
    description=(
        "Retrieves daily precipitation data and rainfall statistics from the official NASA GPM IMERG "
        "satellite constellation (product GPM_3IMERGDF, 0.1° resolution). "
        "Calculates total rainfall, average daily rainfall, maximum daily rainfall, and rainfall trends."
    )
)
def get_nasa_gpm_summary(
    latitude: float = Query(
        default=22.90,
        ge=-90.0,
        le=90.0,
        description="Target latitude (-90.0 to 90.0). Defaults to Hooghly: 22.90"
    ),
    longitude: float = Query(
        default=88.40,
        ge=-180.0,
        le=180.0,
        description="Target longitude (-180.0 to 180.0). Defaults to Hooghly: 88.40"
    ),
    start_date: Optional[str] = Query(
        default=None,
        description="Observation start date in YYYY-MM-DD format (e.g. '2024-01-01')."
    ),
    end_date: Optional[str] = Query(
        default=None,
        description="Observation end date in YYYY-MM-DD format (e.g. '2024-01-05')."
    ),
):
    """Retrieve daily precipitation summary and trend analysis from NASA GPM IMERG."""
    try:
        data = fetch_gpm_imerg(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
        )
        return data
    except NasaGpmValidationError as err:
        logger.warning("Validation error in /nasa/gpm/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        ) from err
    except NasaGpmAuthenticationError as err:
        logger.warning("Authentication error in /nasa/gpm/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(err)
        ) from err
    except (NasaGpmConnectionError, NasaGpmResponseError) as err:
        logger.error("Upstream error in /nasa/gpm/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        ) from err
    except Exception as err:
        logger.exception("Unexpected error in /nasa/gpm/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching NASA GPM data: {err}"
        ) from err


# ==============================================================================
# NASA SMAP SOIL MOISTURE ENDPOINTS
# ==============================================================================

@router.get(
    "/smap/summary",
    response_model=NasaSmapSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch NASA SMAP Level-4 Soil Moisture Summary",
    description=(
        "Retrieves surface (0–5 cm) and root-zone (0–100 cm) soil wetness from the official NASA SMAP "
        "Level-4 assimilation model. Computes average/min/max moisture levels, drying/wetting trends, "
        "and agronomic water-stress indicators (optimal, moderate stress, severe wilting risk, waterlogging)."
    )
)
def get_nasa_smap_summary(
    latitude: float = Query(
        default=22.90,
        ge=-90.0,
        le=90.0,
        description="Target latitude (-90.0 to 90.0). Defaults to Hooghly: 22.90"
    ),
    longitude: float = Query(
        default=88.40,
        ge=-180.0,
        le=180.0,
        description="Target longitude (-180.0 to 180.0). Defaults to Hooghly: 88.40"
    ),
    start_date: Optional[str] = Query(
        default=None,
        description="Observation start date in YYYY-MM-DD format (e.g. '2026-10-12'). Defaults to 30 days prior to end_date."
    ),
    end_date: Optional[str] = Query(
        default=None,
        description="Observation end date in YYYY-MM-DD format (e.g. '2026-11-10'). Defaults to latest available day accounting for publication lag."
    ),
):
    """Retrieve daily surface and root-zone soil moisture with water-stress analysis."""
    try:
        data = fetch_smap_soil_moisture(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date,
            end_date=end_date,
        )
        return data
    except NasaSmapValidationError as err:
        logger.warning("Validation error in /nasa/smap/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        ) from err
    except (NasaSmapConnectionError, NasaSmapResponseError) as err:
        logger.error("Upstream error in /nasa/smap/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        ) from err
    except Exception as err:
        logger.exception("Unexpected error in /nasa/smap/summary: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching NASA SMAP data: {err}"
        ) from err
