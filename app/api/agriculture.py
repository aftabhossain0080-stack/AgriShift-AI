"""API routes for Agricultural Data Cleaning, Integration & Processing Pipeline."""
import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas.agriculture import (
    AgricultureProcessRequest,
    AgricultureProcessResponse,
)
from app.services.data_processor import (
    DataProcessorError,
    DataProcessorValidationError,
    process_agricultural_data,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Agriculture Data Processing"])


@router.post(
    "/agriculture/process",
    response_model=AgricultureProcessResponse,
    status_code=status.HTTP_200_OK,
    summary="Process, Clean & Integrate Agricultural Earth Observation Data",
    description=(
        "Executes Phase 5 pipeline: combines farmer profile with NASA POWER, NASA SMAP, "
        "and NASA GPM IMERG Earth observation data. Performs sentinel handling (-999 fill values), "
        "range sanity cleaning, temporal alignment, rainfall harmonization (double-counting prevention), "
        "and computes key agricultural indicators (temperature, rainfall trends, dry spells, soil moisture, and water stress)."
    ),
)
def process_agriculture_endpoint(request: AgricultureProcessRequest):
    """Process and integrate farmer inputs with multi-source NASA Earth observations."""
    try:
        result = process_agricultural_data(
            farmer_profile=request.farmer_profile,
            start_date=request.start_date,
            end_date=request.end_date,
            preferred_rainfall_source=request.preferred_rainfall_source or "NASA POWER",
            include_daily_records=request.include_daily_records if request.include_daily_records is not None else True,
        )
        return result
    except DataProcessorValidationError as err:
        logger.error("Validation error in agriculture process endpoint: %s", err)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        ) from err
    except DataProcessorError as err:
        logger.error("Data processing error: %s", err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Agricultural data processing failed: {err}"
        ) from err
    except Exception as err:
        logger.exception("Unexpected error in agriculture processing: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred: {err}"
        ) from err
