"""Automated unit and integration tests for NASA POWER API integration.

Mocks external NASA HTTP requests so that tests run reliably and independently
of network availability or NASA server downtime.
"""
from unittest.mock import MagicMock, patch
import pytest
import requests
from fastapi.testclient import TestClient

from app.main import app
from app.services.nasa_power import (
    NasaPowerConnectionError,
    NasaPowerResponseError,
    NasaPowerValidationError,
    fetch_nasa_power,
    validate_coordinates,
    validate_date_range,
)

client = TestClient(app)

# Sample valid mock NASA POWER payload
MOCK_NASA_SUCCESS_PAYLOAD = {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [88.40, 22.90, 11.0]
    },
    "header": {
        "title": "NASA/POWER Source Native Resolution Daily Data",
        "api": {"version": "v2.10.3", "name": "POWER Daily API"},
        "fill_value": -999.0,
        "time_standard": "LST",
        "start": "20240101",
        "end": "20240103"
    },
    "parameters": {
        "T2M": {"units": "C", "longname": "Temperature at 2 Meters"},
        "PRECTOTCORR": {"units": "mm/day", "longname": "Precipitation Corrected"},
        "RH2M": {"units": "%", "longname": "Relative Humidity at 2 Meters"},
        "ALLSKY_SFC_SW_DWN": {"units": "MJ/m^2/day", "longname": "All Sky Surface Shortwave Downward Irradiance"}
    },
    "properties": {
        "parameter": {
            "T2M": {
                "20240101": 15.65,
                "20240102": 15.08,
                "20240103": 16.20
            },
            "PRECTOTCORR": {
                "20240101": 0.00,
                "20240102": 2.50,
                "20240103": 0.00
            },
            "RH2M": {
                "20240101": 68.50,
                "20240102": 72.10,
                "20240103": 69.40
            },
            "ALLSKY_SFC_SW_DWN": {
                "20240101": 14.20,
                "20240102": 12.80,
                "20240103": 15.10
            }
        }
    }
}

# Mock NASA POWER payload containing -999.0 fill values
MOCK_NASA_MISSING_PAYLOAD = {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [88.40, 22.90, 11.0]
    },
    "header": {
        "title": "NASA/POWER Source Native Resolution Daily Data",
        "fill_value": -999.0,
        "start": "20240101",
        "end": "20240102"
    },
    "parameters": {
        "T2M": {"units": "C", "longname": "Temperature at 2 Meters"},
        "PRECTOTCORR": {"units": "mm/day", "longname": "Precipitation Corrected"},
        "RH2M": {"units": "%", "longname": "Relative Humidity at 2 Meters"},
        "ALLSKY_SFC_SW_DWN": {"units": "MJ/m^2/day", "longname": "All Sky Surface Shortwave Downward Irradiance"}
    },
    "properties": {
        "parameter": {
            "T2M": {
                "20240101": 18.50,
                "20240102": -999.0  # missing observation
            },
            "PRECTOTCORR": {
                "20240101": -999.0, # missing observation
                "20240102": 0.00
            },
            "RH2M": {
                "20240101": 65.00,
                "20240102": 66.50
            },
            "ALLSKY_SFC_SW_DWN": {
                "20240101": 15.00,
                "20240102": -999.0  # missing observation
            }
        }
    }
}


def _create_mock_response(status_code: int = 200, json_data: dict = None, text: str = ""):
    """Helper to generate a mock requests.Response object."""
    mock_resp = MagicMock(spec=requests.Response)
    mock_resp.status_code = status_code
    mock_resp.json.return_value = json_data or {}
    mock_resp.text = text or ""
    return mock_resp


# ==============================================================================
# TEST 1: Default Hooghly Coordinates
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_default_hooghly_coordinates(mock_get):
    """GET /nasa/power without params must default to Hooghly (22.90, 88.40)."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_SUCCESS_PAYLOAD)

    response = client.get("/nasa/power")
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["source"] == "NASA POWER"
    assert data["location"]["latitude"] == 22.90
    assert data["location"]["longitude"] == 88.40

    # Verify query parameters passed to NASA POWER
    called_params = mock_get.call_args[1]["params"]
    assert called_params["latitude"] == 22.90
    assert called_params["longitude"] == 88.40
    assert called_params["community"] == "AG"


# ==============================================================================
# TEST 2: Different Valid Coordinates
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_different_valid_coordinates(mock_get):
    """GET /nasa/power with arbitrary valid coordinates (e.g. Bangalore: 12.97, 77.59)."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_SUCCESS_PAYLOAD)

    response = client.get(
        "/nasa/power",
        params={
            "latitude": 12.97,
            "longitude": 77.59,
            "start_date": "2024-01-01",
            "end_date": "2024-01-03",
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["latitude"] == 12.97
    assert data["location"]["longitude"] == 77.59

    called_params = mock_get.call_args[1]["params"]
    assert called_params["latitude"] == 12.97
    assert called_params["longitude"] == 77.59


# ==============================================================================
# TEST 3: Invalid Latitude
# ==============================================================================
def test_invalid_latitude():
    """GET /nasa/power with latitude outside [-90, 90] returns HTTP 400 or 422."""
    response = client.get("/nasa/power", params={"latitude": 95.0, "longitude": 88.40})
    assert response.status_code in (400, 422)

    response_negative = client.get("/nasa/power", params={"latitude": -91.5, "longitude": 88.40})
    assert response_negative.status_code in (400, 422)


# ==============================================================================
# TEST 4: Invalid Longitude
# ==============================================================================
def test_invalid_longitude():
    """GET /nasa/power with longitude outside [-180, 180] returns HTTP 400 or 422."""
    response = client.get("/nasa/power", params={"latitude": 22.90, "longitude": 185.0})
    assert response.status_code in (400, 422)

    response_negative = client.get("/nasa/power", params={"latitude": 22.90, "longitude": -181.0})
    assert response_negative.status_code in (400, 422)


# ==============================================================================
# TEST 5: Invalid Date Range
# ==============================================================================
def test_invalid_date_range_start_after_end():
    """Start date greater than end date returns HTTP 400."""
    response = client.get(
        "/nasa/power",
        params={
            "start_date": "2024-02-15",
            "end_date": "2024-02-01"
        }
    )
    assert response.status_code == 400
    assert "cannot exceed end date" in response.json()["detail"].lower()


def test_invalid_date_format():
    """Malformed date string returns HTTP 400."""
    response = client.get(
        "/nasa/power",
        params={
            "start_date": "not-a-valid-date",
            "end_date": "2024-01-10"
        }
    )
    assert response.status_code == 400
    assert "invalid date format" in response.json()["detail"].lower()


# ==============================================================================
# TEST 6: NASA Server Failure & Timeout Handling
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_nasa_server_failure_500(mock_get):
    """NASA POWER returning 500 triggers HTTP 502 with informative message."""
    mock_get.return_value = _create_mock_response(
        500,
        json_data={"messages": ["Internal NASA Processing Error"]},
        text="Internal Server Error"
    )

    response = client.get("/nasa/power")
    assert response.status_code == 502
    assert "NASA POWER API returned HTTP status 500" in response.json()["detail"]


@patch("app.services.nasa_power.requests.get")
def test_nasa_server_timeout(mock_get):
    """Network timeout during NASA request triggers HTTP 502."""
    mock_get.side_effect = requests.exceptions.Timeout("Connection timed out")

    response = client.get("/nasa/power")
    assert response.status_code == 502
    assert "timed out" in response.json()["detail"].lower()


@patch("app.services.nasa_power.requests.get")
def test_nasa_server_connection_error(mock_get):
    """Connection drop triggers HTTP 502."""
    mock_get.side_effect = requests.exceptions.ConnectionError("Network unreachable")

    response = client.get("/nasa/power")
    assert response.status_code == 502
    assert "failed to connect" in response.json()["detail"].lower()


# ==============================================================================
# TEST 7: Missing NASA Data Handling
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_missing_nasa_data_not_replaced_with_zero(mock_get):
    """Satellite fill values (-999.0) must be None/null, NEVER replaced with 0.0."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_MISSING_PAYLOAD)

    response = client.get(
        "/nasa/power",
        params={"start_date": "2024-01-01", "end_date": "2024-01-02"}
    )
    assert response.status_code == 200
    data = response.json()

    day_1 = data["data"][0]
    day_2 = data["data"][1]

    # Day 1: precipitation was -999.0 -> MUST BE None, NOT 0.0
    assert day_1["precipitation"] is None
    assert day_1["temperature"] == 18.50

    # Day 2: temperature and solar_radiation were -999.0 -> MUST BE None
    assert day_2["temperature"] is None
    assert day_2["solar_radiation"] is None
    assert day_2["precipitation"] == 0.00  # genuine 0.00 precipitation preserved

    # Summary statistics must exclude missing values from averages and count them
    summary = data["summary"]
    assert summary["average_temperature"] == 18.50  # only day 1 had valid temp
    assert summary["total_rainfall"] == 0.00         # only day 2 had valid precip
    assert summary["missing_observations_count"] == 3 # 3 missing observations
    assert summary["valid_observations_count"] == 0   # 0 days where all 4 were present


# ==============================================================================
# TEST 8: Successful JSON Response Format
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_successful_json_response_structure(mock_get):
    """Verify complete AgriShift AI Phase 2 JSON response structure."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_SUCCESS_PAYLOAD)

    response = client.get(
        "/nasa/power",
        params={"start_date": "2024-01-01", "end_date": "2024-01-03"}
    )
    assert response.status_code == 200
    data = response.json()

    # Core response keys
    assert data["success"] is True
    assert data["source"] == "NASA POWER"
    assert "location" in data
    assert "period" in data
    assert "units" in data
    assert "data" in data
    assert "summary" in data

    # Location
    assert data["location"]["latitude"] == 22.90
    assert data["location"]["longitude"] == 88.40

    # Period
    assert data["period"]["start_date"] == "2024-01-01"
    assert data["period"]["end_date"] == "2024-01-03"

    # Units preservation
    assert data["units"]["T2M"] == "°C"
    assert data["units"]["PRECTOTCORR"] == "mm"
    assert data["units"]["RH2M"] == "%"
    assert data["units"]["ALLSKY_SFC_SW_DWN"] == "kWh/m²/day"

    # Observations array
    assert len(data["data"]) == 3
    first_obs = data["data"][0]
    assert first_obs["date"] == "2024-01-01"
    assert first_obs["temperature"] == 15.65
    assert first_obs["precipitation"] == 0.00
    assert first_obs["relative_humidity"] == 68.50
    assert first_obs["solar_radiation"] == 3.94  # Converted from 14.20 MJ/m^2/day (14.20 / 3.6)

    # Summary
    summary = data["summary"]
    # Mean temp: (15.65 + 15.08 + 16.20) / 3 = 15.6433 -> 15.64
    assert summary["average_temperature"] == 15.64
    assert summary["max_temperature"] == 16.20
    assert summary["min_temperature"] == 15.08
    assert summary["total_rainfall"] == 2.50
    assert summary["average_humidity"] == 70.00
    assert summary["average_solar_radiation"] == 3.90  # Converted to kWh/m^2/day
    assert summary["valid_observations_count"] == 3
    assert summary["missing_observations_count"] == 0


# ==============================================================================
# TEST 9: Summary Endpoint GET /nasa/power/summary
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_nasa_power_summary_endpoint(mock_get):
    """GET /nasa/power/summary returns all required agro-climatic summary stats."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_SUCCESS_PAYLOAD)

    response = client.get(
        "/nasa/power/summary",
        params={"start_date": "2024-01-01", "end_date": "2024-01-03"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["source"] == "NASA POWER"
    assert data["average_temperature"] == 15.64
    assert data["max_temperature"] == 16.20
    assert data["min_temperature"] == 15.08
    assert data["total_rainfall"] == 2.50
    assert data["average_humidity"] == 70.00
    assert data["average_solar_radiation"] == 3.90
    assert data["valid_observations_count"] == 3
    assert data["missing_observations_count"] == 0


# ==============================================================================
# TEST 10: Both Root and /api/v1 Prefixes Work
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_both_route_prefixes_accessible(mock_get):
    """Verify both /nasa/power and /api/v1/nasa/power resolve seamlessly."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_SUCCESS_PAYLOAD)

    res_root = client.get("/nasa/power")
    assert res_root.status_code == 200

    res_v1 = client.get("/api/v1/nasa/power")
    assert res_v1.status_code == 200

    res_sum_root = client.get("/nasa/power/summary")
    assert res_sum_root.status_code == 200

    res_sum_v1 = client.get("/api/v1/nasa/power/summary")
    assert res_sum_v1.status_code == 200


# ==============================================================================
# TEST 11: Unit Tests for fetch_nasa_power Service Function Directly
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_fetch_nasa_power_service_function(mock_get):
    """Direct unit test of fetch_nasa_power reusable function."""
    mock_get.return_value = _create_mock_response(200, MOCK_NASA_SUCCESS_PAYLOAD)

    result = fetch_nasa_power(
        latitude=22.90,
        longitude=88.40,
        start_date="2024-01-01",
        end_date="2024-01-03"
    )
    assert isinstance(result, dict)
    assert result["success"] is True
    assert len(result["data"]) == 3
    assert result["summary"]["valid_observations_count"] == 3

    # Test invalid coordinates raise NasaPowerValidationError
    with pytest.raises(NasaPowerValidationError):
        fetch_nasa_power(latitude=120.0, longitude=88.40)

    with pytest.raises(NasaPowerValidationError):
        fetch_nasa_power(latitude=22.90, longitude=-200.0)

    # Test invalid date range raises NasaPowerValidationError
    with pytest.raises(NasaPowerValidationError):
        fetch_nasa_power(latitude=22.90, longitude=88.40, start_date="2024-02-01", end_date="2024-01-01")


# ==============================================================================
# TEST 12: Future Date Rejection
# ==============================================================================
def test_future_start_date_rejected():
    """Future start date must return HTTP 400 because NASA POWER has historical data only."""
    response = client.get(
        "/nasa/power",
        params={"start_date": "2099-01-01", "end_date": "2099-01-10"}
    )
    assert response.status_code == 400
    assert "future" in response.json()["detail"].lower()


# ==============================================================================
# TEST 13: Malformed & Missing Upstream Parameters
# ==============================================================================
@patch("app.services.nasa_power.requests.get")
def test_unexpected_nasa_payload_missing_properties(mock_get):
    """If NASA returns an unexpected payload without 'properties.parameter', return HTTP 502."""
    mock_get.return_value = _create_mock_response(200, {"type": "Feature", "header": {}})

    response = client.get("/nasa/power")
    assert response.status_code == 502
    assert "missing" in response.json()["detail"].lower()


@patch("app.services.nasa_power.requests.get")
def test_empty_observations_handled_safely(mock_get):
    """If NASA returns valid schema but empty date points, handle cleanly without 500 error."""
    empty_payload = {
        "type": "Feature",
        "header": {"fill_value": -999.0},
        "parameters": {},
        "properties": {
            "parameter": {
                "T2M": {},
                "PRECTOTCORR": {},
                "RH2M": {},
                "ALLSKY_SFC_SW_DWN": {}
            }
        }
    }
    mock_get.return_value = _create_mock_response(200, empty_payload)

    response = client.get(
        "/nasa/power",
        params={"start_date": "2024-01-01", "end_date": "2024-01-02"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == []
    assert data["summary"]["valid_observations_count"] == 0
    assert data["summary"]["average_temperature"] is None
