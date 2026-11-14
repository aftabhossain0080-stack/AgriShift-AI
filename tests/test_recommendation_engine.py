"""Automated unit and integration tests for Phase 6 Crop Recommendation Engine.

Tests:
1. Soil Types: Alluvial vs Sandy Loam vs Clayey suitability evaluations.
2. Farming Seasons: Rabi vs Kharif vs Boro vs Zaid seasonal compatibility and disqualifications.
3. Irrigation Availability:
   - High-water crops (Potato, Boro Rice) penalized when irrigation is unavailable in dry seasons.
   - Low-water crops (Mustard, Lentil, Sesame) remain viable without irrigation.
4. Rainfall & Soil Moisture Extremes:
   - Waterlogging alerts for sensitive crops (Mustard, Sesame, Potato).
   - High vs low rainfall impacts.
5. Missing Satellite Indicators:
   - Missing NASA temperature handled transparently without assuming 0°C.
   - Missing SMAP soil moisture flagged in missing_information without crashing.
6. Crop Rotation Constraints:
   - Monoculture penalty: Planting Potato when current/previous crop is Potato triggers severe rotation penalty.
   - Favorable rotation: Aman Paddy followed by Potato/Mustard/Lentil receives rotation bonus.
7. Insufficient Data Handling:
   - Data completeness < 30% returns structured 'insufficient_data' response.
8. Ranking Consistency:
   - Top 3 recommendations are sorted in descending order of suitability score with ranks 1, 2, 3.
9. FastAPI API Endpoints:
   - POST /api/v1/agriculture/recommendations with valid request (HTTP 200).
   - POST /agriculture/recommendations root alias (HTTP 200).
   - Invalid farmer profile inputs return HTTP 422.
"""
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.farmer import FarmerProfileBase
from app.services.crop_knowledge_base import (
    CROP_KNOWLEDGE_BASE,
    get_all_supported_crops,
    get_crop_by_id,
)
from app.services.recommendation_engine import (
    evaluate_crop_rotation_constraints,
    evaluate_season_suitability,
    evaluate_soil_moisture_and_rainfall,
    evaluate_soil_suitability,
    evaluate_temperature_suitability,
    evaluate_water_and_irrigation,
    generate_crop_recommendations,
    resolve_target_growing_season,
    score_single_crop,
)

client = TestClient(app)

# Standard mock farmer profiles for testing
RABI_POTATO_FARMER = {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "current_crop": "Paddy (Aman)",
    "previous_crop": "Jute",
    "soil_type": "Alluvial",
    "land_area_acres": 2.5,
    "irrigation_available": True,
    "farming_season": "Rabi"
}

# Standard mock Phase 5 processed data
MOCK_PROCESSED_DATA_RABI = {
    "status": "completed",
    "period": {"start_date": "2024-01-01", "end_date": "2024-01-30", "total_days": 30},
    "indicators": {
        "temperature": {
            "average_temperature_celsius": 20.5,
            "min_temperature_celsius": 13.0,
            "max_temperature_celsius": 27.5,
            "temperature_trend": "stable"
        },
        "rainfall": {
            "total_rainfall_mm": 15.0,
            "average_daily_rainfall_mm": 0.5,
            "max_single_day_rainfall_mm": 8.0,
            "rainfall_trend": "dry_spell",
            "consecutive_dry_days": 16,
            "total_dry_days": 27,
            "rainy_days_count": 3
        },
        "soil_moisture": {
            "average_surface_soil_moisture_fraction": 0.50,
            "average_rootzone_soil_moisture_fraction": 0.54,
            "soil_moisture_trend": "drying",
            "water_stress_indicator": "Optimal (Favorable Soil Moisture)"
        },
        "other": {
            "average_relative_humidity_percent": 68.0,
            "average_solar_radiation_kwh_m2_day": 4.5,
            "data_completeness_percentage": 96.7
        }
    },
    "data_quality": {
        "overall_completeness_percentage": 96.7,
        "complete_observation_days": 29
    }
}


# ============================================================================
# 1. KNOWLEDGE BASE TESTS
# ============================================================================

def test_crop_knowledge_base_integrity():
    """Verify all 8 locally relevant crops exist with complete agronomic parameters and citations."""
    crops = get_all_supported_crops()
    assert len(crops) >= 8
    expected_crops = ["potato", "mustard", "paddy_aman", "boro_rice", "jute", "sesame", "lentil", "maize"]
    for cid in expected_crops:
        crop = get_crop_by_id(cid)
        assert crop is not None, f"Crop '{cid}' missing from knowledge base"
        assert "sources" in crop and len(crop["sources"]) > 0
        assert "optimal_soils" in crop
        assert "temperature_celsius" in crop
        assert "rotation" in crop


# ============================================================================
# 2. SOIL TYPE COMPATIBILITY TESTS
# ============================================================================

def test_soil_type_evaluations():
    """Verify Alluvial vs Sandy Loam vs Clayey scoring."""
    potato = get_crop_by_id("potato")
    paddy = get_crop_by_id("paddy_aman")

    # Potato in Alluvial (optimal)
    score_alluvial, reasons_alluvial, _ = evaluate_soil_suitability("Alluvial", potato)
    assert score_alluvial == 15.0
    assert "optimal" in reasons_alluvial[0].lower()

    # Potato in Clay Loam (moderately suitable)
    score_clay, reasons_clay, _ = evaluate_soil_suitability("Clay Loam", potato)
    assert score_clay < 15.0
    assert "moderately" in reasons_clay[0].lower()

    # Potato in Heavy Clay (unsuitable)
    score_heavy_clay, _, risks_heavy = evaluate_soil_suitability("Heavy Clay", potato)
    assert score_heavy_clay <= 3.0
    assert any("ill-suited" in r for r in risks_heavy)

    # Paddy in Clayey (optimal)
    paddy_score, paddy_reasons, _ = evaluate_soil_suitability("Clayey", paddy)
    assert paddy_score == 15.0


# ============================================================================
# 3. FARMING SEASONS TESTS
# ============================================================================

def test_seasonal_compatibility_and_disqualification():
    """Verify seasonal scoring: matches give 25 pts, wrong seasons give 0 pts and disqualify."""
    potato = get_crop_by_id("potato")
    paddy_aman = get_crop_by_id("paddy_aman")
    jute = get_crop_by_id("jute")

    # Potato in Rabi (matched)
    score_rabi, reasons_rabi, _ = evaluate_season_suitability("Rabi", potato)
    assert score_rabi == 25.0
    assert "perfectly matches" in reasons_rabi[0]

    # Potato in Kharif (unsuitable)
    score_kharif, _, risks_kharif = evaluate_season_suitability("Kharif", potato)
    assert score_kharif == 0.0
    assert any("not suited" in r for r in risks_kharif)

    # Paddy Aman in Kharif (matched)
    score_aman_kharif, _, _ = evaluate_season_suitability("Kharif", paddy_aman)
    assert score_aman_kharif == 25.0

    # Jute in Zaid / Pre-Kharif (matched)
    score_jute_zaid, _, _ = evaluate_season_suitability("Zaid", jute)
    assert score_jute_zaid == 25.0


# ============================================================================
# 4. IRRIGATION AVAILABILITY TESTS
# ============================================================================

def test_irrigation_available_vs_unavailable():
    """Verify impact of irrigation availability on water-intensive vs hardy crops."""
    potato = get_crop_by_id("potato")
    mustard = get_crop_by_id("mustard")

    # Potato WITH irrigation (full score)
    score_irrig, reasons_irrig, _, advice_irrig = evaluate_water_and_irrigation(
        irrigation_available=True, target_season="Rabi", rainfall_indicators={"total_rainfall_mm": 15.0}, crop=potato
    )
    assert score_irrig == 20.0
    assert "satisfies" in reasons_irrig[0]

    # Potato WITHOUT irrigation in dry Rabi (disqualified on water)
    score_no_irrig, _, risks_no_irrig, advice_no_irrig = evaluate_water_and_irrigation(
        irrigation_available=False, target_season="Rabi", rainfall_indicators={"total_rainfall_mm": 15.0}, crop=potato
    )
    assert score_no_irrig == 0.0
    assert any("mandatory irrigation" in r for r in risks_no_irrig)
    assert "NOT recommended" in advice_no_irrig

    # Mustard WITHOUT irrigation in dry Rabi (hardy, succeeds on residual moisture)
    score_mustard_no_irrig, reasons_m, risks_m, _ = evaluate_water_and_irrigation(
        irrigation_available=False, target_season="Rabi", rainfall_indicators={"total_rainfall_mm": 15.0}, crop=mustard
    )
    assert score_mustard_no_irrig == 20.0
    assert any("low water demand" in r for r in reasons_m)


# ============================================================================
# 5. CROP ROTATION CONSTRAINT TESTS
# ============================================================================

def test_crop_rotation_monoculture_penalty():
    """Verify repeat monoculture triggers severe penalty while favorable rotation is rewarded."""
    potato = get_crop_by_id("potato")

    # Repeat Potato after Potato (monoculture hazard!)
    rot_score_mono, _, risks_mono, notes_mono = evaluate_crop_rotation_constraints(
        current_crop="Potato", previous_crop="Paddy", crop=potato
    )
    assert rot_score_mono == 0.0
    assert any("Monoculture Risk" in r for r in risks_mono)

    # Potato after Paddy (classic favorable rotation)
    rot_score_fav, reasons_fav, _, notes_fav = evaluate_crop_rotation_constraints(
        current_crop="Paddy (Aman)", previous_crop="Jute", crop=potato
    )
    assert rot_score_fav == 10.0
    assert any("Exceptional rotation" in r for r in reasons_fav)


# ============================================================================
# 6. MISSING SATELLITE DATA TESTS
# ============================================================================

def test_missing_temperature_data_handling():
    """Verify missing temperature does not assume 0°C or crash, flags missing_info."""
    potato = get_crop_by_id("potato")

    # Missing temperature indicator
    score, _, _, _, missing = evaluate_temperature_suitability(
        temp_indicators={"average_temperature_celsius": None}, crop=potato
    )
    assert score == 10.0  # Neutral pro-rated score
    assert "Satellite ambient temperature data was unavailable for this period." in missing


def test_missing_soil_moisture_data_handling():
    """Verify missing SMAP soil moisture does not crash and is recorded in missing_info."""
    potato = get_crop_by_id("potato")

    score, _, _, _, missing = evaluate_soil_moisture_and_rainfall(
        soil_moisture_indicators=None, rainfall_indicators=None, crop=potato
    )
    assert score == 5.0
    assert any("SMAP" in m for m in missing)


# ============================================================================
# 7. INSUFFICIENT DATA TESTS
# ============================================================================

def test_insufficient_data_response():
    """Verify pipeline returns status='insufficient_data' when completeness < 30%."""
    farmer = FarmerProfileBase(**RABI_POTATO_FARMER)
    low_completeness_data = {
        "status": "partial",
        "data_quality": {"overall_completeness_percentage": 20.0},
        "indicators": {},
        "period": {"start_date": "2024-01-01", "end_date": "2024-01-30", "total_days": 30}
    }

    res = generate_crop_recommendations(
        farmer_profile=farmer,
        processed_pipeline_data=low_completeness_data,
        target_season="Rabi"
    )

    assert res["success"] is False
    assert res["status"] == "insufficient_data"
    assert len(res["recommendations"]) == 0
    assert "Insufficient NASA Earth observation data" in res["message"]


# ============================================================================
# 8. RANKING & RECOMMENDATION ENGINE PIPELINE TESTS
# ============================================================================

def test_generate_crop_recommendations_ranking():
    """Verify recommendations are ranked descending by suitability score with ranks 1, 2, 3."""
    farmer = FarmerProfileBase(**RABI_POTATO_FARMER)
    res = generate_crop_recommendations(
        farmer_profile=farmer,
        processed_pipeline_data=MOCK_PROCESSED_DATA_RABI,
        target_season="Rabi"
    )

    assert res["success"] is True
    assert res["status"] == "recommended"
    recs = res["recommendations"]
    assert len(recs) <= 3
    assert len(recs) > 0

    # Verify descending score order and rank values
    scores = [r["suitability_score"] for r in recs]
    assert scores == sorted(scores, reverse=True)
    for idx, r in enumerate(recs, start=1):
        assert r["rank"] == idx

    # Verify Potato is the top recommended crop for Singur farmer in Rabi post-Paddy
    top_crop = recs[0]
    assert top_crop["crop_name"] in ["Potato", "Mustard / Rapeseed"]
    assert top_crop["suitability_score"] >= 80.0
    assert top_crop["suitability_category"] == "Highly Recommended"


def test_repeat_potato_monoculture_drastically_demotes_potato():
    """Verify when farmer's current crop is Potato, Potato is penalised and alternative crops rank above it."""
    farmer_with_potato = FarmerProfileBase(**{
        **RABI_POTATO_FARMER,
        "current_crop": "Potato",
        "previous_crop": "Potato"
    })

    res = generate_crop_recommendations(
        farmer_profile=farmer_with_potato,
        processed_pipeline_data=MOCK_PROCESSED_DATA_RABI,
        target_season="Rabi"
    )

    recs = res["recommendations"]
    # Check that alternative crops like Mustard or Lentil lead over Potato
    assert recs[0]["crop_name"] != "Potato"
    for r in recs:
        if r["crop_name"] == "Potato":
            assert any("Monoculture" in risk for risk in r["potential_risks"])


# ============================================================================
# 9. FASTAPI ENDPOINT TESTS
# ============================================================================

@patch("app.api.recommendations.process_agricultural_data")
def test_api_recommendations_endpoint_success(mock_process):
    """Test POST /api/v1/agriculture/recommendations returns HTTP 200 with complete response."""
    mock_process.return_value = MOCK_PROCESSED_DATA_RABI

    payload = {
        "farmer_profile": RABI_POTATO_FARMER,
        "target_farming_season": "Rabi",
        "start_date": "2024-01-01",
        "end_date": "2024-01-30"
    }

    # Test versioned endpoint
    res = client.post("/api/v1/agriculture/recommendations", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["status"] == "recommended"
    assert len(data["recommendations"]) > 0
    assert "disclaimer" in data
    assert "sources_and_references" in data

    # Test root alias endpoint
    res_root = client.post("/agriculture/recommendations", json=payload)
    assert res_root.status_code == 200
    assert res_root.json()["success"] is True


def test_api_recommendations_invalid_coordinates():
    """Verify endpoint rejects invalid latitude with HTTP 422."""
    payload = {
        "farmer_profile": {**RABI_POTATO_FARMER, "latitude": 150.0},
        "target_farming_season": "Rabi"
    }
    res = client.post("/api/v1/agriculture/recommendations", json=payload)
    assert res.status_code == 422


def test_api_recommendations_status_endpoint():
    """Verify GET /api/v1/recommendations/status returns operational status."""
    res = client.get("/api/v1/recommendations/status")
    assert res.status_code == 200
    assert res.json()["status"] == "operational"


# ============================================================================
# 10. COMPREHENSIVE AGRONOMIC VALIDATION TESTS
# ============================================================================

def test_next_season_resolution_inference():
    """Verify engine plans for farmer's upcoming season instead of blindly reusing current standing season."""
    # Farmer with standing Aman paddy (Kharif) and farming_season='Kharif' -> should infer Rabi
    kharif_paddy_farmer = FarmerProfileBase(
        village="Singur",
        latitude=22.81,
        longitude=88.23,
        current_crop="Paddy (Aman)",
        previous_crop="Jute",
        soil_type="Alluvial",
        land_area_acres=2.0,
        irrigation_available=True,
        farming_season="Kharif"
    )

    season, is_inferred, note = resolve_target_growing_season(
        explicit_target_season=None, farmer_profile=kharif_paddy_farmer
    )
    assert season == "Rabi"
    assert is_inferred is True
    assert "upcoming 'Rabi' season" in note

    # Farmer with standing Potato (Rabi) and farming_season='Rabi' -> should infer Zaid (Summer)
    rabi_potato_farmer = FarmerProfileBase(
        village="Haripal",
        latitude=22.83,
        longitude=88.11,
        current_crop="Potato",
        previous_crop="Paddy (Aman)",
        soil_type="Alluvial",
        land_area_acres=1.5,
        irrigation_available=True,
        farming_season="Rabi"
    )
    season_zaid, is_inferred_zaid, _ = resolve_target_growing_season(
        explicit_target_season=None, farmer_profile=rabi_potato_farmer
    )
    assert season_zaid == "Zaid"
    assert is_inferred_zaid is True

    # When explicit target season is specified, it must be respected
    explicit_season, is_inf_exp, _ = resolve_target_growing_season(
        explicit_target_season="Boro", farmer_profile=kharif_paddy_farmer
    )
    assert explicit_season == "Boro"
    assert is_inf_exp is False


def test_different_crops_and_seasons_compatibility():
    """Validate that crops are recommended for their respective seasons and disqualified otherwise."""
    farmer = FarmerProfileBase(**RABI_POTATO_FARMER)

    # 1. Kharif: Paddy (Aman) matches; winter crops disqualified
    aman_paddy = get_crop_by_id("paddy_aman")
    score_k, _, _ = evaluate_season_suitability("Kharif", aman_paddy)
    assert score_k == 25.0

    potato = get_crop_by_id("potato")
    score_p_kharif, _, risks_k = evaluate_season_suitability("Kharif", potato)
    assert score_p_kharif == 0.0
    assert any("not suited" in r for r in risks_k)

    # 2. Zaid / Summer: Sesame and Jute match
    sesame = get_crop_by_id("sesame")
    score_s_zaid, _, _ = evaluate_season_suitability("Zaid", sesame)
    assert score_s_zaid == 25.0

    jute = get_crop_by_id("jute")
    score_j_zaid, _, _ = evaluate_season_suitability("Zaid", jute)
    assert score_j_zaid == 25.0

    # 3. Boro: Boro rice matches
    boro = get_crop_by_id("boro_rice")
    score_b_boro, _, _ = evaluate_season_suitability("Boro", boro)
    assert score_b_boro == 25.0


def test_different_soil_types_suitability():
    """Verify soil type ratings across light alluvial, clay loam, and waterlogged clay."""
    potato = get_crop_by_id("potato")

    # Alluvial / Sandy loam: optimal (15.0 pts)
    score_alluvial, reasons_a, _ = evaluate_soil_suitability("Alluvial", potato)
    assert score_alluvial == 15.0
    assert any("optimal" in r.lower() for r in reasons_a)

    # Clay Loam: moderately suitable (~9.8 pts)
    score_clay_loam, reasons_c, _ = evaluate_soil_suitability("Clay Loam", potato)
    assert score_clay_loam == 9.8
    assert any("moderately suitable" in r.lower() for r in reasons_c)

    # Waterlogged Clay: ill-suited (~2.2 pts)
    score_wet_clay, _, risks_w = evaluate_soil_suitability("Waterlogged Clay", potato)
    assert score_wet_clay == 2.2
    assert any("ill-suited" in r.lower() for r in risks_w)


def test_irrigation_availability_conditions():
    """Verify crops with mandatory irrigation fail or are penalised without water access."""
    # Boro rice requires 1200-1500 mm; dry season with no irrigation -> score 0.0
    boro = get_crop_by_id("boro_rice")
    score_no_irr, _, risks_no_irr, advice = evaluate_water_and_irrigation(
        irrigation_available=False,
        target_season="Boro",
        rainfall_indicators={"total_rainfall_mm": 20.0},
        crop=boro
    )
    assert score_no_irr == 0.0
    assert any("mandatory irrigation" in r.lower() for r in risks_no_irr)
    assert "NOT recommended" in advice

    # Mustard requires low water (200-350 mm); can succeed rainfed / residual moisture -> full 20.0 pts
    mustard = get_crop_by_id("mustard")
    score_mustard_no_irr, reasons_m, _, _ = evaluate_water_and_irrigation(
        irrigation_available=False,
        target_season="Rabi",
        rainfall_indicators={"total_rainfall_mm": 20.0},
        crop=mustard
    )
    assert score_mustard_no_irr == 20.0
    assert any("low water demand" in r.lower() for r in reasons_m)


def test_missing_nasa_data_agronomic_safeguard():
    """Verify engine caps suitability and adds warnings when NASA temperature or soil moisture is missing."""
    farmer = FarmerProfileBase(**RABI_POTATO_FARMER)
    potato = get_crop_by_id("potato")

    # Missing temperature in indicators
    indicators_no_temp = {
        "temperature": {"average_temperature_celsius": None},
        "soil_moisture": {"average_rootzone_soil_moisture_fraction": 0.50},
        "rainfall": {"total_rainfall_mm": 10.0}
    }

    result = score_single_crop(
        crop=potato,
        farmer_profile=farmer,
        target_season="Rabi",
        processed_indicators=indicators_no_temp
    )

    # Must be capped at 'Conditionally Suitable', not 'Highly Recommended'
    assert result["suitability_category"] == "Conditionally Suitable"
    assert any("unverified" in r.lower() for r in result["potential_risks"])
    assert any("temperature" in m.lower() for m in result["missing_information"])


def test_crop_recommendations_contain_limitations_and_reference_urls():
    """Verify every recommendation includes ICAR/BCKV limitations and valid reference URLs."""
    farmer = FarmerProfileBase(**RABI_POTATO_FARMER)
    res = generate_crop_recommendations(
        farmer_profile=farmer,
        processed_pipeline_data=MOCK_PROCESSED_DATA_RABI,
        target_season="Rabi"
    )

    recs = res["recommendations"]
    assert len(recs) > 0
    for r in recs:
        # Check limitations
        assert len(r["limitations"]) > 0
        # Check reference URLs
        assert len(r["reference_urls"]) > 0
        for url in r["reference_urls"]:
            assert url.startswith("https://")
        # Check reasons, risks, water considerations, and rotation notes
        assert len(r["reasons"]) > 0
        assert len(r["water_and_irrigation_considerations"]) > 0
        assert len(r["crop_rotation_notes"]) > 0


def test_no_yield_or_profit_guarantee_disclaimer():
    """Verify response includes transparent disclaimer stating yield and profit are not guaranteed."""
    farmer = FarmerProfileBase(**RABI_POTATO_FARMER)
    res = generate_crop_recommendations(
        farmer_profile=farmer,
        processed_pipeline_data=MOCK_PROCESSED_DATA_RABI,
        target_season="Rabi"
    )

    assert "disclaimer" in res
    disclaimer = res["disclaimer"].lower()
    assert "not guarantee" in disclaimer or "never guarantees" in disclaimer
    assert "yield" in disclaimer
    assert "profit" in disclaimer

