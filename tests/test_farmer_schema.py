"""Tests for Farmer profile Pydantic schema validation and API endpoints.

Verifies:
- Type correctness (float, bool, str)
- Latitude bounds (-90 to 90)
- Longitude bounds (-180 to 180)
- Land area strictly positive (> 0)
- Non-empty text fields (no blank/whitespace-only strings)
- Irrigation availability boolean handling
- HTTP status codes (200 for valid, 422 for invalid)
- OpenAPI schema types verification (no unintended "string" types)
"""
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.farmer import FarmerProfileBase

client = TestClient(app)

VALID_FARMER_PAYLOAD = {
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


# ==============================================================================
# SCHEMA UNIT TESTS
# ==============================================================================

def test_valid_farmer_profile_schema():
    """Verify that a valid farmer profile passes schema validation with proper types."""
    profile = FarmerProfileBase(**VALID_FARMER_PAYLOAD)
    assert profile.village == "Singur"
    assert isinstance(profile.latitude, float)
    assert profile.latitude == 22.81
    assert isinstance(profile.longitude, float)
    assert profile.longitude == 88.23
    assert isinstance(profile.land_area_acres, float)
    assert profile.land_area_acres == 2.5
    assert isinstance(profile.irrigation_available, bool)
    assert profile.irrigation_available is True
    assert profile.farming_season == "Rabi"


def test_farmer_profile_invalid_latitude():
    """Latitude > 90 or < -90 must raise validation error."""
    with pytest.raises(ValidationError) as exc:
        payload = dict(VALID_FARMER_PAYLOAD, latitude=95.0)
        FarmerProfileBase(**payload)
    assert "latitude" in str(exc.value).lower()

    with pytest.raises(ValidationError) as exc_neg:
        payload_neg = dict(VALID_FARMER_PAYLOAD, latitude=-91.0)
        FarmerProfileBase(**payload_neg)
    assert "latitude" in str(exc_neg.value).lower()


def test_farmer_profile_invalid_longitude():
    """Longitude > 180 or < -180 must raise validation error."""
    with pytest.raises(ValidationError) as exc:
        payload = dict(VALID_FARMER_PAYLOAD, longitude=185.0)
        FarmerProfileBase(**payload)
    assert "longitude" in str(exc.value).lower()

    with pytest.raises(ValidationError) as exc_neg:
        payload_neg = dict(VALID_FARMER_PAYLOAD, longitude=-185.0)
        FarmerProfileBase(**payload_neg)
    assert "longitude" in str(exc_neg.value).lower()


def test_farmer_profile_non_positive_land_area():
    """Land area acres <= 0 must raise validation error."""
    with pytest.raises(ValidationError) as exc_zero:
        payload_zero = dict(VALID_FARMER_PAYLOAD, land_area_acres=0.0)
        FarmerProfileBase(**payload_zero)
    assert "land_area_acres" in str(exc_zero.value).lower()

    with pytest.raises(ValidationError) as exc_neg:
        payload_neg = dict(VALID_FARMER_PAYLOAD, land_area_acres=-2.5)
        FarmerProfileBase(**payload_neg)
    assert "land_area_acres" in str(exc_neg.value).lower()


def test_farmer_profile_empty_or_whitespace_strings():
    """Required text fields must not be empty or contain only whitespace."""
    with pytest.raises(ValidationError) as exc_village:
        payload = dict(VALID_FARMER_PAYLOAD, village="   ")
        FarmerProfileBase(**payload)
    assert "village" in str(exc_village.value).lower()

    with pytest.raises(ValidationError) as exc_crop:
        payload = dict(VALID_FARMER_PAYLOAD, current_crop="")
        FarmerProfileBase(**payload)
    assert "current_crop" in str(exc_crop.value).lower()


# ==============================================================================
# API ENDPOINT TESTS (POST /farmer/profile & POST /api/v1/farmer/profile)
# ==============================================================================

def test_api_submit_valid_farmer_profile():
    """POST /farmer/profile with valid payload returns HTTP 200 and validated data."""
    response = client.post("/farmer/profile", json=VALID_FARMER_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["village"] == "Singur"
    assert data["data"]["latitude"] == 22.81
    assert data["data"]["longitude"] == 88.23
    assert data["data"]["land_area_acres"] == 2.5
    assert data["data"]["irrigation_available"] is True


def test_api_submit_valid_farmer_profile_v1():
    """POST /api/v1/farmer/profile also resolves and returns HTTP 200."""
    response = client.post("/api/v1/farmer/profile", json=VALID_FARMER_PAYLOAD)
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_api_rejects_invalid_latitude():
    """POST /farmer/profile with invalid latitude returns HTTP 422."""
    payload = dict(VALID_FARMER_PAYLOAD, latitude=120.0)
    response = client.post("/farmer/profile", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("latitude" in str(err["loc"]) for err in errors)


def test_api_rejects_invalid_longitude():
    """POST /farmer/profile with invalid longitude returns HTTP 422."""
    payload = dict(VALID_FARMER_PAYLOAD, longitude=-200.0)
    response = client.post("/farmer/profile", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("longitude" in str(err["loc"]) for err in errors)


def test_api_rejects_non_positive_land_area():
    """POST /farmer/profile with land_area_acres <= 0 returns HTTP 422."""
    payload = dict(VALID_FARMER_PAYLOAD, land_area_acres=0.0)
    response = client.post("/farmer/profile", json=payload)
    assert response.status_code == 422

    payload_neg = dict(VALID_FARMER_PAYLOAD, land_area_acres=-5.0)
    response_neg = client.post("/farmer/profile", json=payload_neg)
    assert response_neg.status_code == 422


def test_api_rejects_blank_text_field():
    """POST /farmer/profile with blank village returns HTTP 422."""
    payload = dict(VALID_FARMER_PAYLOAD, village="   ")
    response = client.post("/farmer/profile", json=payload)
    assert response.status_code == 422


def test_api_accepts_boolean_irrigation():
    """POST /farmer/profile accepts both true and false for irrigation_available."""
    payload_false = dict(VALID_FARMER_PAYLOAD, irrigation_available=False)
    res_false = client.post("/farmer/profile", json=payload_false)
    assert res_false.status_code == 200
    assert res_false.json()["data"]["irrigation_available"] is False


# ==============================================================================
# OPENAPI SCHEMA TYPES VERIFICATION (Swagger UI accuracy)
# ==============================================================================

def test_openapi_schema_farmer_profile_types():
    """Verify that OpenAPI schema defines exact field types rather than all 'string'."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    openapi = response.json()

    schemas = openapi["components"]["schemas"]
    assert "FarmerProfileBase" in schemas
    props = schemas["FarmerProfileBase"]["properties"]

    # Verify types are not all 'string'
    assert props["village"]["type"] == "string"
    assert props["latitude"]["type"] == "number", "Latitude must be number (float), not string"
    assert props["longitude"]["type"] == "number", "Longitude must be number (float), not string"
    assert props["current_crop"]["type"] == "string"
    assert props["previous_crop"]["type"] == "string"
    assert props["soil_type"]["type"] == "string"
    assert props["land_area_acres"]["type"] == "number", "Land area must be number (float), not string"
    assert props["irrigation_available"]["type"] == "boolean", "Irrigation must be boolean, not string"
    assert props["farming_season"]["type"] == "string"

    # Verify constraints in schema
    assert props["latitude"]["minimum"] == -90.0
    assert props["latitude"]["maximum"] == 90.0
    assert props["longitude"]["minimum"] == -180.0
    assert props["longitude"]["maximum"] == 180.0
    assert props["land_area_acres"]["exclusiveMinimum"] == 0.0

    # Verify realistic examples exist
    assert props["village"]["examples"] == ["Singur"]
    assert props["latitude"]["examples"] == [22.81]
    assert props["longitude"]["examples"] == [88.23]
    assert props["land_area_acres"]["examples"] == [2.5]
    assert props["irrigation_available"]["examples"] == [True]
