"""Pydantic Schemas for Agricultural Crop Recommendation Engine.

Provides request and response models with detailed Swagger documentation and
explainable agronomic outputs for Hooghly, West Bengal.
"""
from datetime import date
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.farmer import FarmerProfileBase


class CropRecommendationRequest(BaseModel):
    """Request payload for agricultural crop recommendations."""
    farmer_profile: FarmerProfileBase = Field(
        ...,
        description="Farmer profile with village, coordinates, soil, crops, and land details"
    )
    target_farming_season: Optional[str] = Field(
        default=None,
        description="Target agricultural season for upcoming crop (e.g. Rabi, Kharif, Boro, Zaid). Defaults to farmer_profile.farming_season.",
        examples=["Rabi"]
    )
    start_date: Optional[date] = Field(
        default=None,
        description="Historical analysis start date (YYYY-MM-DD). Defaults to 32 days ago.",
        examples=["2024-01-01"]
    )
    end_date: Optional[date] = Field(
        default=None,
        description="Historical analysis end date (YYYY-MM-DD). Defaults to 3 days ago.",
        examples=["2024-01-30"]
    )
    preferred_rainfall_source: Optional[str] = Field(
        default="NASA POWER",
        description="Precipitation source preference: 'NASA POWER' or 'NASA GPM IMERG'",
        examples=["NASA POWER"]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "farmer_profile": {
                    "village": "Singur",
                    "latitude": 22.81,
                    "longitude": 88.23,
                    "current_crop": "Paddy (Aman)",
                    "previous_crop": "Jute",
                    "soil_type": "Alluvial",
                    "land_area_acres": 2.5,
                    "irrigation_available": True,
                    "farming_season": "Rabi"
                },
                "target_farming_season": "Rabi",
                "start_date": "2024-01-01",
                "end_date": "2024-01-30",
                "preferred_rainfall_source": "NASA POWER"
            }
        }
    }


class CropRecommendationItem(BaseModel):
    """Ranked crop recommendation item with explainable agronomic rationale."""
    rank: int = Field(..., description="Recommendation ranking position (1, 2, 3)", examples=[1])
    crop_name: str = Field(..., description="Crop name", examples=["Potato"])
    botanical_name: str = Field(..., description="Botanical binomial nomenclature", examples=["Solanum tuberosum"])
    suitability_score: float = Field(..., description="Overall calculated suitability score (0 to 100)", examples=[92.5])
    suitability_category: str = Field(
        ...,
        description="Category: 'Highly Recommended', 'Moderately Recommended', 'Conditionally Suitable', or 'Not Recommended'",
        examples=["Highly Recommended"]
    )
    growing_season: str = Field(..., description="Target growing season", examples=["Rabi"])
    crop_duration: str = Field(..., description="Estimated duration in days", examples=["80 - 110 days"])
    water_requirement: str = Field(..., description="Crop water demand category (Low, Medium, High, Very High)", examples=["Medium"])
    score_breakdown: Dict[str, float] = Field(
        default_factory=dict,
        description="Detailed score components (season, soil, temperature, water, soil_moisture, rotation)"
    )
    reasons: List[str] = Field(
        default_factory=list,
        description="Primary reasons supporting this recommendation"
    )
    environmental_advantages: List[str] = Field(
        default_factory=list,
        description="Specific agro-climatic conditions currently favoring this crop"
    )
    potential_risks: List[str] = Field(
        default_factory=list,
        description="Identified agronomic, climatic, or disease risks to monitor"
    )
    water_and_irrigation_considerations: str = Field(
        ...,
        description="Practical irrigation and water management guidance for the farmer"
    )
    crop_rotation_notes: str = Field(
        ...,
        description="Agronomic rotation compatibility analysis relative to current and previous crops"
    )
    missing_information: List[str] = Field(
        default_factory=list,
        description="Any environmental or local parameters that could not be verified from satellite data"
    )
    limitations: List[str] = Field(
        default_factory=list,
        description="Agronomic and operational limitations from ICAR and BCKV Package of Practices"
    )
    agricultural_sources: List[str] = Field(
        default_factory=list,
        description="Institutional research citations backing this crop profile (ICAR, BCKV, Dept of Agriculture)"
    )
    reference_urls: List[str] = Field(
        default_factory=list,
        description="Official institutional and research documentation URLs"
    )


class EnvironmentalSummary(BaseModel):
    """Synthesized environmental conditions derived from Phase 5 data processing."""
    analysis_period: Dict[str, Any] = Field(..., description="Date range evaluated")
    temperature: Dict[str, Any] = Field(..., description="Thermal indicators and trend")
    rainfall: Dict[str, Any] = Field(..., description="Precipitation metrics and dry spells")
    soil_moisture: Dict[str, Any] = Field(..., description="Soil wetness fractions and water stress status")
    atmospheric: Dict[str, Any] = Field(..., description="Relative humidity and solar irradiance")
    data_completeness_percentage: float = Field(..., description="Overall satellite data completeness percentage")


class CropRecommendationResponse(BaseModel):
    """Complete response payload for intelligent crop recommendations."""
    success: bool = Field(True, description="Status of recommendation operation")
    status: str = Field(
        ...,
        description="Operational status: 'recommended', 'insufficient_data', or 'no_suitable_crops'",
        examples=["recommended"]
    )
    message: str = Field(..., description="Human-readable status summary message")
    farmer_location: Dict[str, Any] = Field(..., description="Farmer village and verified coordinates")
    target_season: str = Field(..., description="Target cropping season evaluated", examples=["Rabi"])
    environmental_summary: EnvironmentalSummary = Field(..., description="Summary of real Earth observation metrics")
    recommendations: List[CropRecommendationItem] = Field(
        default_factory=list,
        description="Ranked top crop recommendations (up to 3)"
    )
    data_quality_and_confidence: Dict[str, Any] = Field(
        ...,
        description="Data quality audit, completeness, and model confidence rating"
    )
    sources_and_references: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Research institutions and agronomic reference literature cited"
    )
    disclaimer: str = Field(
        (
            "AgriShift AI provides advisory recommendations based on NASA satellite observations "
            "and ICAR/BCKV agronomic research. It does NOT guarantee crop yield, market price, or financial profit. "
            "Actual harvest outcomes depend on seed quality, local field management, fertilizer practices, "
            "and unpredictable micro-climatic weather events."
        ),
        description="Mandatory agronomic disclaimer"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "success": True,
                "status": "recommended",
                "message": "Top 3 suitable crop recommendations generated successfully.",
                "farmer_location": {
                    "village": "Singur",
                    "latitude": 22.81,
                    "longitude": 88.23
                },
                "target_season": "Rabi",
                "environmental_summary": {
                    "analysis_period": {"start_date": "2024-01-01", "end_date": "2024-01-30", "total_days": 30},
                    "temperature": {"average_celsius": 21.0, "min_celsius": 13.5, "max_celsius": 28.0, "trend": "stable"},
                    "rainfall": {"total_mm": 18.4, "dry_days": 26, "consecutive_dry_days": 14, "trend": "dry_spell"},
                    "soil_moisture": {"rootzone_fraction": 0.52, "surface_fraction": 0.48, "water_stress_status": "Optimal (Favorable Soil Moisture)"},
                    "atmospheric": {"relative_humidity_percent": 68.5, "solar_radiation_kwh_m2_day": 4.35},
                    "data_completeness_percentage": 96.7
                },
                "recommendations": [
                    {
                        "rank": 1,
                        "crop_name": "Potato",
                        "botanical_name": "Solanum tuberosum",
                        "suitability_score": 92.5,
                        "suitability_category": "Highly Recommended",
                        "growing_season": "Rabi",
                        "crop_duration": "80 - 110 days",
                        "water_requirement": "Medium",
                        "score_breakdown": {
                            "season": 25.0,
                            "soil": 15.0,
                            "temperature": 18.5,
                            "water_irrigation": 20.0,
                            "soil_moisture": 9.0,
                            "rotation": 10.0
                        },
                        "reasons": [
                            "Target season 'Rabi' is the optimal growing period for Potato in Hooghly.",
                            "Alluvial soil is ideal for root tuberization and aeration.",
                            "Assured irrigation is available for mandatory tuber bulking stages.",
                            "Excellent crop rotation following Aman Paddy."
                        ],
                        "environmental_advantages": [
                            "Average temperature of 21.0°C falls within optimal 14-22°C tuberization range.",
                            "Root-zone soil moisture (0.52) provides optimal germination conditions."
                        ],
                        "potential_risks": [
                            "Watch for Late Blight (Phytophthora infestans) if relative humidity exceeds 85% with cool nights."
                        ],
                        "water_and_irrigation_considerations": "Requires 4-6 light irrigations. Critical stages: stolon formation (20-25 DAP) and tuber bulking (45-60 DAP).",
                        "crop_rotation_notes": "Ideal rotation after Aman Paddy. Break Solanaceae cycle; avoid continuous potato.",
                        "missing_information": [],
                        "agricultural_sources": [
                            "ICAR-Central Potato Research Institute (CPRI), Shimla",
                            "Bidhan Chandra Krishi Viswavidyalaya (BCKV) Directorate of Research"
                        ]
                    }
                ],
                "data_quality_and_confidence": {
                    "overall_completeness_percentage": 96.7,
                    "confidence_rating": "High",
                    "confidence_notes": "NASA Earth observations cover > 90% of the target period with synchronized SMAP root-zone measurements."
                },
                "sources_and_references": [
                    {
                        "institution": "ICAR",
                        "name": "Indian Council of Agricultural Research",
                        "role": "National crop genetics and agronomic packages"
                    },
                    {
                        "institution": "BCKV",
                        "name": "Bidhan Chandra Krishi Viswavidyalaya",
                        "role": "State agricultural university for New and Old Alluvial Zones of West Bengal"
                    }
                ],
                "disclaimer": "AgriShift AI provides advisory recommendations based on NASA satellite observations and ICAR/BCKV agronomic research. It does NOT guarantee crop yield, market price, or financial profit."
            }
        }
    }
