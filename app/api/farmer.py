"""Farmer profile and farm data endpoints router."""
from fastapi import APIRouter, status

from app.schemas.farmer import FarmerProfileBase, FarmerProfileResponse

router = APIRouter(prefix="/farmer", tags=["Farmer Input"])


@router.get(
    "/status",
    summary="Farmer Service Status",
    description="Returns active operational status of the farmer input service."
)
def get_farmer_service_status():
    """Returns operational status for farmer input service."""
    return {"status": "operational", "service": "Farmer Input Validation"}


@router.post(
    "/profile",
    response_model=FarmerProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit and Validate Farmer Profile",
    description=(
        "Accepts and validates smallholder farmer and plot characteristics including "
        "geolocation (latitude/longitude), current and previous crops, soil type, "
        "cultivated land area, irrigation availability, and target agricultural season."
    )
)
@router.post(
    "/input",
    response_model=FarmerProfileResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def submit_farmer_profile(profile: FarmerProfileBase):
    """Intake and validate farm profile parameters for agricultural recommendations."""
    return {
        "success": True,
        "message": "Farmer profile validated successfully.",
        "data": profile
    }
