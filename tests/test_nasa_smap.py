"""Automated unit and integration tests for NASA SMAP Level-4 soil moisture integration.

Mocks external NASA HTTP requests so tests run reliably and independently
of network availability or NASA server downtime.
"""
from unittest.mock import MagicMock, patch
import pytest
import requests
from fastapi.testclient import TestClient

from app.main import app
from app.services.nasa_smap import (
    NasaSmapConnectionError,
    NasaSmapResponseError,
    NasaSmapValidationError,
    evaluate_soil_moisture_trend,
    evaluate_water_stress,
    fetch_smap_soil_moisture,
)

client = TestClient(app)

MOCK_SMAP_PAYLOAD = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [88.40, 22.90, 11.0]},
    "header": {
        "title": "NASA/POWER Daily Soil Moisture",
        "fill_value": -999.0,
        "start": "20240101",
        "end": "20240104"
    },
    "parameters": {
        "GWETTOP": {"units": "1", "longname": "Surface Soil Wetness"},
        "GWETROOT": {"units": "1", "longname": "Root Zone Soil Wetness"},
        "GWETPROF": {"units": "1", "longname": "Profile Soil Wetness"}
    },
    "properties": {
        "parameter": {
            "GWETTOP": {
                "20240101": 0.65,
                "20240102": 0.63,
                "20240103": 0.62,
                "20240104": 0.60
            },
            "GWETROOT": {
                "20240101": 0.70,
                "20240102": 0.69,
                "20240103": 0.68,
                "20240104": 0.67
            },
            "GWETPROF": {
                "20240101": 0.69,
                "20240102": 0.68,
                "20240103": 0.68,
                "20240104": 0.67
            }
        }
    }
}

MOCK_SMAP_STRESS_PAYLOAD = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [88.40, 22.90, 11.0]},
    "header": {"fill_value": -999.0},
    "parameters": {},
    "properties": {
        "parameter": {
            "GWETTOP": {"20240101": 0.20, "20240102": 0.18},
            "GWETROOT": {"20240101": 0.22, "20240102": 0.21},
            "GWETPROF": {"20240101": 0.25, "20240102": 0.23}
        }
    }
}


def _create_mock_response(status_code: int = 200, json_data: dict = None, text: str = ""):
    mock_resp = MagicMock(spec=requests.Response)
    mock_resp.status_code = status_code
    mock_resp.json.return_value = json_data or {}
    mock_resp.text = text or ""
    return mock_resp


# ==============================================================================
# TESTS
# ==============================================================================

@patch("app.services.nasa_smap.requests.get")
def test_smap_summary_default_hooghly(mock_get):
    """GET /api/v1/nasa/smap/summary defaults to Hooghly (22.90, 88.40)."""
    mock_get.return_value = _create_mock_response(200, MOCK_SMAP_PAYLOAD)

    response = client.get("/api/v1/nasa/smap/summary")
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert "NASA SMAP" in data["source"]
    assert data["location"]["latitude"] == 22.90
    assert data["location"]["longitude"] == 88.40

    summary = data["summary"]
    # Average rootzone: (0.70 + 0.69 + 0.68 + 0.67)/4 = 0.685 -> 0.68 or 0.69
    assert 0.68 <= summary["average_rootzone_soil_moisture"] <= 0.69
    assert 0.62 <= summary["average_surface_soil_moisture"] <= 0.63
    assert summary["water_stress_indicator"] == "Optimal / Adequate Moisture"
    assert "daily_data" in data
    assert len(data["daily_data"]) == 4


@patch("app.services.nasa_smap.requests.get")
def test_smap_summary_custom_coordinates(mock_get):
    """GET /api/v1/nasa/smap/summary accepts custom coordinates."""
    mock_get.return_value = _create_mock_response(200, MOCK_SMAP_PAYLOAD)

    response = client.get(
        "/api/v1/nasa/smap/summary",
        params={"latitude": 12.97, "longitude": 77.59, "start_date": "2024-01-01", "end_date": "2024-01-04"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["latitude"] == 12.97
    assert data["location"]["longitude"] == 77.59


def test_smap_invalid_coordinates():
    """Invalid latitude or longitude returns HTTP 422."""
    res_lat = client.get("/api/v1/nasa/smap/summary", params={"latitude": 95.0, "longitude": 88.40})
    assert res_lat.status_code in (400, 422)

    res_lon = client.get("/api/v1/nasa/smap/summary", params={"latitude": 22.90, "longitude": 200.0})
    assert res_lon.status_code in (400, 422)


def test_smap_invalid_date_range():
    """Start date after end date returns HTTP 400."""
    res = client.get(
        "/api/v1/nasa/smap/summary",
        params={"start_date": "2024-02-01", "end_date": "2024-01-01"}
    )
    assert res.status_code == 400
    assert "cannot exceed end date" in res.json()["detail"].lower()


@patch("app.services.nasa_smap.requests.get")
def test_smap_timeout_handling(mock_get):
    """Network timeout returns HTTP 502."""
    mock_get.side_effect = requests.exceptions.Timeout("Connection timed out")
    res = client.get("/api/v1/nasa/smap/summary")
    assert res.status_code == 502
    assert "timed out" in res.json()["detail"].lower()


@patch("app.services.nasa_smap.requests.get")
def test_smap_water_stress_indicators(mock_get):
    """Severe water stress indicator correctly identified when moisture <= 0.30."""
    mock_get.return_value = _create_mock_response(200, MOCK_SMAP_STRESS_PAYLOAD)

    res = client.get(
        "/api/v1/nasa/smap/summary",
        params={"start_date": "2024-01-01", "end_date": "2024-01-02"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["summary"]["water_stress_indicator"] == "Severe Stress / Wilting Risk"


def test_water_stress_function():
    """Direct unit tests for evaluate_water_stress benchmark ranges."""
    assert evaluate_water_stress(0.15, 0.15) == "Severe Stress / Wilting Risk"
    assert evaluate_water_stress(0.38, 0.35) == "Moderate Stress"
    assert evaluate_water_stress(0.65, 0.60) == "Optimal / Adequate Moisture"
    assert evaluate_water_stress(0.88, 0.85) == "High Moisture / Waterlogging Risk"
    assert evaluate_water_stress(None, None) == "Indeterminate (Insufficient Data)"


def test_smap_trend_evaluation():
    """Direct unit tests for soil moisture trend detection."""
    assert evaluate_soil_moisture_trend([0.70, 0.68, 0.60, 0.58]) == "drying"
    assert evaluate_soil_moisture_trend([0.45, 0.46, 0.55, 0.58]) == "wetting"
    assert evaluate_soil_moisture_trend([0.60, 0.60, 0.60, 0.61]) == "stable"


@patch("app.services.nasa_smap.requests.get")
def test_both_smap_routes_accessible(mock_get):
    """Both /nasa/smap/summary and /api/v1/nasa/smap/summary resolve."""
    mock_get.return_value = _create_mock_response(200, MOCK_SMAP_PAYLOAD)

    res_v1 = client.get("/api/v1/nasa/smap/summary")
    assert res_v1.status_code == 200

    res_root = client.get("/nasa/smap/summary")
    assert res_root.status_code == 200
