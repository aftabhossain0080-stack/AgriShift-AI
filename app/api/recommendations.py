"""API routes for Intelligent Crop Recommendation Engine."""
import logging
from fastapi import APIRouter, HTTPException, status

from app.schemas.recommendation import (
    CropRecommendationRequest,
    CropRecommendationResponse,
)
from app.services.data_processor import (
    DataProcessorError,
    DataProcessorValidationError,
    process_agricultural_data,
)
from app.services.recommendation_engine import (
    generate_crop_recommendations,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Crop Recommendations"])


@router.post(
    "/agriculture/recommendations",
    response_model=CropRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Intelligent Agricultural Crop Recommendations",
    description=(
        "Executes Phase 6 crop recommendation engine: combines farmer profile inputs "
        "(soil type, standing crop, past crop, land area, irrigation status) with "
        "Phase 5 cleaned NASA Earth observations (temperature, precipitation trends, dry spells, "
        "soil moisture, and humidity). Applies rule-based, explainable scoring validated by ICAR and BCKV "
        "to deliver top 3 ranked crop recommendations with full agronomic justification, risks, and rotation constraints."
    ),
)
def get_crop_recommendations_endpoint(request: CropRecommendationRequest):
    """Generate explainable, ranked crop recommendations for the upcoming season."""
    try:
        # 1. Execute Phase 5 data cleaning, integration, and processing pipeline
        processed_data = process_agricultural_data(
            farmer_profile=request.farmer_profile,
            start_date=request.start_date,
            end_date=request.end_date,
            preferred_rainfall_source=request.preferred_rainfall_source or "NASA POWER",
            include_daily_records=False,  # Daily records not needed for recommendation synthesis
        )

        # 2. Execute Phase 6 recommendation scoring engine
        recommendation_result = generate_crop_recommendations(
            farmer_profile=request.farmer_profile,
            processed_pipeline_data=processed_data,
            target_season=request.target_farming_season,
        )

        return recommendation_result

    except DataProcessorValidationError as err:
        logger.error("Validation error in crop recommendations: %s", err)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err)
        ) from err
    except DataProcessorError as err:
        logger.error("Data processing failure in crop recommendations: %s", err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Environmental data processing failed: {err}"
        ) from err
    except Exception as err:
        logger.exception("Unexpected error in crop recommendation endpoint: %s", err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred: {err}"
        ) from err


@router.get("/recommendations/status", summary="Recommendation Engine Status")
def get_recommendations_status():
    """Returns operational status for crop recommendation engine."""
    return {
        "status": "operational",
        "phase": "Phase 6: Intelligent Crop Recommendation Engine",
        "supported_crops_count": 8,
        "supported_regions": ["Hooghly, West Bengal, India"],
        "advisory_institutions": ["ICAR", "BCKV", "West Bengal Department of Agriculture"]
    }
