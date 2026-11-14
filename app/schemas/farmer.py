"""Farmer input and validation schemas."""
from pydantic import BaseModel, Field, field_validator


class FarmerProfileBase(BaseModel):
    """Validated schema for farmer profiles and agricultural land inputs."""
    village: str = Field(
        ...,
        min_length=1,
        description="Village or local administrative area (e.g. Singur, Polba, Haripal)",
        examples=["Singur"]
    )
    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="Farm latitude in decimal degrees (-90.0 to 90.0)",
        examples=[22.81]
    )
    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="Farm longitude in decimal degrees (-180.0 to 180.0)",
        examples=[88.23]
    )
    current_crop: str = Field(
        ...,
        min_length=1,
        description="Currently standing or newly sown crop",
        examples=["Potato"]
    )
    previous_crop: str = Field(
        ...,
        min_length=1,
        description="Previously harvested crop on this land plot",
        examples=["Paddy (Aman)"]
    )
    soil_type: str = Field(
        ...,
        min_length=1,
        description="Dominant soil classification (e.g. Alluvial, Clayey, Loamy, Sandy Loam)",
        examples=["Alluvial"]
    )
    land_area_acres: float = Field(
        ...,
        gt=0.0,
        description="Cultivated land area in acres (must be greater than 0)",
        examples=[2.5]
    )
    irrigation_available: bool = Field(
        ...,
        description="Whether assured irrigation (canal, borewell, sub-surface) is available (true/false)",
        examples=[True]
    )
    farming_season: str = Field(
        ...,
        min_length=1,
        description="Target agricultural cropping season (e.g. Kharif, Rabi, Boro, Zaid)",
        examples=["Rabi"]
    )

    @field_validator("village", "current_crop", "previous_crop", "soil_type", "farming_season")
    @classmethod
    def validate_non_empty_strings(cls, value: str) -> str:
        """Ensure required string fields are not empty or solely whitespace."""
        if not value or not value.strip():
            raise ValueError("Field cannot be empty or contain only whitespace.")
        return value.strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "village": "Singur",
                "latitude": 22.81,
                "longitude": 88.23,
                "current_crop": "Potato",
                "previous_crop": "Paddy (Aman)",
                "soil_type": "Alluvial",
                "land_area_acres": 2.5,
                "irrigation_available": True,
                "farming_season": "Rabi"
            }
        }
    }


# Backwards compatibility alias
FarmerProfileInput = FarmerProfileBase


class FarmerProfileResponse(BaseModel):
    """Response model for farmer profile submission."""
    success: bool = Field(True, description="Operation success status")
    message: str = Field("Farmer profile validated successfully.", description="Status message")
    data: FarmerProfileBase
