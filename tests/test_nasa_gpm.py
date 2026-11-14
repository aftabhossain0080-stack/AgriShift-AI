"""Automated unit and integration tests for NASA GPM IMERG precipitation integration.

Mocks NASA CMR and OPeNDAP responses so tests run reliably and independently of
internet availability or Earthdata service maintenance.
"""
from unittest.mock import MagicMock, patch
import pytest
import requests
from fastapi.testclient import TestClient

from app.main import app
from app.services.nasa_gpm import (
    EarthdataSession,
    NasaGpmAuthenticationError,
    NasaGpmConnectionError,
    NasaGpmResponseError,
    NasaGpmValidationError,
    evaluate_rainfall_trend,
    extract_opendap_url,
    fetch_gpm_imerg,
    fetch_opendap_precipitation,
    search_gpm_granules,
)
from app.services.data_integrator import harmonize_rainfall_observations

client = TestClient(app)

MOCK_CMR_FEED = {
    "feed": {
        "entry": [
            {
                "title": "GPM_3IMERGDF.07:3B-DAY.MS.MRG.3IMERG.20240101-S000000-E235959.V07B.nc4",
                "time_start": "2024-01-01T00:00:00.000Z",
                "time_end": "2024-01-01T23:59:59.999Z"
            },
            {
                "title": "GPM_3IMERGDF.07:3B-DAY.MS.MRG.3IMERG.20240102-S000000-E235959.V07B.nc4",
                "time_start": "2024-01-02T00:00:00.000Z",
                "time_end": "2024-01-02T23:59:59.999Z"
            },
            {
                "title": "GPM_3IMERGDF.07:3B-DAY.MS.MRG.3IMERG.20240103-S000000-E235959.V07B.nc4",
                "time_start": "2024-01-03T00:00:00.000Z",
                "time_end": "2024-01-03T23:59:59.999Z"
            }
        ]
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

@patch("app.services.nasa_gpm.requests.get")
def test_gpm_summary_default_hooghly(mock_get):
    """GET /api/v1/nasa/gpm/summary defaults to Hooghly (22.90, 88.40) and indexes granules."""
    mock_get.return_value = _create_mock_response(200, MOCK_CMR_FEED)

    response = client.get(
        "/api/v1/nasa/gpm/summary",
        params={"start_date": "2024-01-01", "end_date": "2024-01-03"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert "NASA GPM IMERG" in data["source"]
    assert data["location"]["latitude"] == 22.90
    assert data["location"]["longitude"] == 88.40
    assert data["granules_count"] == 3
    assert data["spatial_resolution"] == "0.1° x 0.1° (~10 km)"
    assert data["temporal_resolution"] == "Daily"


@patch("app.services.nasa_gpm.requests.get")
def test_gpm_summary_custom_coordinates(mock_get):
    """GET /api/v1/nasa/gpm/summary accepts custom coordinates."""
    mock_get.return_value = _create_mock_response(200, MOCK_CMR_FEED)

    response = client.get(
        "/api/v1/nasa/gpm/summary",
        params={
            "latitude": 12.97,
            "longitude": 77.59,
            "start_date": "2024-01-01",
            "end_date": "2024-01-03"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location"]["latitude"] == 12.97
    assert data["location"]["longitude"] == 77.59


def test_gpm_invalid_coordinates():
    """Invalid latitude or longitude returns HTTP 422."""
    res_lat = client.get("/api/v1/nasa/gpm/summary", params={"latitude": 105.0, "longitude": 88.40})
    assert res_lat.status_code in (400, 422)

    res_lon = client.get("/api/v1/nasa/gpm/summary", params={"latitude": 22.90, "longitude": -195.0})
    assert res_lon.status_code in (400, 422)


def test_gpm_invalid_date_range():
    """Start date exceeding end date returns HTTP 400."""
    res = client.get(
        "/api/v1/nasa/gpm/summary",
        params={"start_date": "2024-02-01", "end_date": "2024-01-01"}
    )
    assert res.status_code == 400
    assert "cannot exceed end date" in res.json()["detail"].lower()


@patch("app.services.nasa_gpm.requests.get")
def test_gpm_timeout_handling(mock_get):
    """Network timeout during NASA CMR search returns HTTP 502."""
    mock_get.side_effect = requests.exceptions.Timeout("Connection timed out")
    res = client.get(
        "/api/v1/nasa/gpm/summary",
        params={"start_date": "2024-01-01", "end_date": "2024-01-03"}
    )
    assert res.status_code == 502
    assert "timed out" in res.json()["detail"].lower()


def test_rainfall_trend_evaluations():
    """Direct unit tests for rainfall trend detection."""
    assert evaluate_rainfall_trend([]) == "dry_spell"
    assert evaluate_rainfall_trend([0.0, 0.0, 0.0]) == "dry_spell"
    assert evaluate_rainfall_trend([1.0, 2.0, 10.0, 15.0]) == "increasing"
    assert evaluate_rainfall_trend([15.0, 10.0, 2.0, 1.0]) == "decreasing"
    assert evaluate_rainfall_trend([5.0, 5.0, 5.0, 5.0]) == "steady"


@patch("app.services.nasa_gpm.requests.get")
def test_gpm_statistical_calculations_with_observations(mock_get):
    """Test GPM total, average, max, and trend calculations using mock observations."""
    mock_get.return_value = _create_mock_response(200, MOCK_CMR_FEED)

    mock_obs = [
        {"date": "2024-01-01", "precipitation": 0.0},
        {"date": "2024-01-02", "precipitation": 5.0},
        {"date": "2024-01-03", "precipitation": 15.0},
    ]

    result = fetch_gpm_imerg(
        latitude=22.90,
        longitude=88.40,
        start_date="2024-01-01",
        end_date="2024-01-03",
        mock_observations=mock_obs
    )

    assert result["success"] is True
    summary = result["summary"]
    assert summary["total_rainfall"] == 20.0
    assert summary["average_daily_rainfall"] == 6.67
    assert summary["max_daily_rainfall"] == 15.0
    assert summary["min_daily_rainfall"] == 0.0
    assert summary["rainy_days_count"] == 2
    assert summary["dry_days_count"] == 1


@patch("app.services.nasa_gpm.requests.get")
def test_both_gpm_routes_accessible(mock_get):
    """Both /nasa/gpm/summary and /api/v1/nasa/gpm/summary resolve."""
    mock_get.return_value = _create_mock_response(200, MOCK_CMR_FEED)

    res_v1 = client.get(
        "/api/v1/nasa/gpm/summary",
        params={"start_date": "2024-01-01", "end_date": "2024-01-03"}
    )
    assert res_v1.status_code == 200

    res_root = client.get(
        "/nasa/gpm/summary",
        params={"start_date": "2024-01-01", "end_date": "2024-01-03"}
    )
    assert res_root.status_code == 200


def test_earthdata_session_rebuild_auth():
    """EarthdataSession attaches Basic Auth on redirects to urs.earthdata.nasa.gov."""
    session = EarthdataSession()
    session.auth = ("test_user", "test_pass")

    prep_req = requests.PreparedRequest()
    prep_req.url = "https://urs.earthdata.nasa.gov/oauth/authorize"
    prep_req.headers = {}

    resp = requests.Response()
    resp.request = requests.Request("GET", "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/test.nc4").prepare()

    session.rebuild_auth(prep_req, resp)
    assert "Authorization" in prep_req.headers
    assert prep_req.headers["Authorization"].startswith("Basic ")


def test_extract_opendap_url():
    """Extracts OPeNDAP URL from granule links dictionary."""
    granule_with_dap = {
        "links": [
            {
                "rel": "http://esipfed.org/ns/fedsearch/1.1/data#",
                "type": "application/x-opendap",
                "href": "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/GPM_L3/test.nc4"
            }
        ]
    }
    granule_no_dap = {
        "links": [
            {
                "rel": "http://esipfed.org/ns/fedsearch/1.1/data#",
                "type": "application/x-netcdf",
                "href": "https://gpm1.gesdisc.eosdis.nasa.gov/data/GPM_L3/test.nc4"
            }
        ]
    }
    assert extract_opendap_url(granule_with_dap) == "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/GPM_L3/test.nc4"
    assert extract_opendap_url(granule_no_dap) is None


def test_fetch_opendap_precipitation_success():
    """Successfully parses precipitationCal float from OPeNDAP ASCII stream."""
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = (
        "Dataset: GPM_3IMERGDF_07\n"
        "precipitationCal[1][1]\n"
        "[0][0] 4.25\n"
    )
    mock_session.get.return_value = mock_resp

    val, status = fetch_opendap_precipitation(
        "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/test.nc4",
        latitude=22.90,
        longitude=88.40,
        session=mock_session
    )
    assert val == 4.25
    assert status == "success"


def test_fetch_opendap_precipitation_sentinel():
    """Sentinel / fill value (-9999.9) returns None and status 'sentinel'."""
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = (
        "precipitationCal[1][1]\n"
        "[0][0] -9999.9\n"
    )
    mock_session.get.return_value = mock_resp

    val, status = fetch_opendap_precipitation(
        "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/test.nc4",
        latitude=22.90,
        longitude=88.40,
        session=mock_session
    )
    assert val is None
    assert status == "sentinel"


def test_fetch_opendap_precipitation_auth_failure():
    """HTTP 401 Access Denied returns None and status 'earthdata_auth_failed'."""
    mock_session = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_session.get.return_value = mock_resp

    val, status = fetch_opendap_precipitation(
        "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/test.nc4",
        latitude=22.90,
        longitude=88.40,
        session=mock_session
    )
    assert val is None
    assert status == "earthdata_auth_failed"


@patch("app.services.nasa_gpm.search_gpm_granules")
@patch("app.services.nasa_gpm.fetch_opendap_precipitation")
def test_fetch_gpm_imerg_401_auth_failed_handling(mock_fetch_dap, mock_search):
    """When OPeNDAP rejects credentials with 401, service transparently reports earthdata_auth_failed."""
    mock_search.return_value = [
        {
            "title": "GPM_3IMERGDF.07:3B-DAY.MS.MRG.3IMERG.20240101.nc4",
            "time_start": "2024-01-01T00:00:00.000Z",
            "links": [{"type": "application/x-opendap", "href": "https://gpm1.gesdisc.eosdis.nasa.gov/opendap/test.nc4"}]
        }
    ]
    mock_fetch_dap.return_value = (None, "earthdata_auth_failed")

    with patch("app.services.nasa_gpm.settings.EARTHDATA_USERNAME", "some_user"), \
         patch("app.services.nasa_gpm.settings.EARTHDATA_PASSWORD", "some_pass"):
        result = fetch_gpm_imerg(
            latitude=22.90,
            longitude=88.40,
            start_date="2024-01-01",
            end_date="2024-01-01"
        )

    assert result["success"] is True
    assert result["auth_status"] == "earthdata_auth_failed"
    assert result["total_rainfall"] is None
    assert result["daily_data"][0]["precipitation"] is None


@patch("app.services.nasa_gpm.search_gpm_granules")
def test_fetch_gpm_imerg_no_credentials(mock_search):
    """When Earthdata credentials are missing in settings, reports credentials required and returns nulls."""
    mock_search.return_value = [
        {
            "title": "GPM_3IMERGDF.07:3B-DAY.MS.MRG.3IMERG.20240101.nc4",
            "time_start": "2024-01-01T00:00:00.000Z",
            "links": []
        }
    ]

    with patch("app.services.nasa_gpm.settings.EARTHDATA_USERNAME", ""), \
         patch("app.services.nasa_gpm.settings.EARTHDATA_PASSWORD", ""):
        result = fetch_gpm_imerg(
            latitude=22.90,
            longitude=88.40,
            start_date="2024-01-01",
            end_date="2024-01-01"
        )

    assert result["success"] is True
    assert result["auth_status"] == "earthdata_credentials_required"
    assert result["total_rainfall"] is None
    assert result["daily_data"][0]["precipitation"] is None


def test_harmonize_rainfall_gpm_fallback_behavior():
    """Verify fallback from GPM to NASA POWER when GPM is null, and proper attribution."""
    # When GPM is preferred and has data
    val, src = harmonize_rainfall_observations(power_precip=2.0, gpm_precip=5.5, preferred_source="NASA GPM IMERG")
    assert val == 5.5
    assert src == "NASA GPM IMERG"

    # When GPM is preferred but GPM is None (e.g. auth failed), fallback to NASA POWER
    val_fb, src_fb = harmonize_rainfall_observations(power_precip=2.0, gpm_precip=None, preferred_source="NASA GPM IMERG")
    assert val_fb == 2.0
    assert src_fb == "NASA POWER (Fallback)"

    # When both are None
    val_none, src_none = harmonize_rainfall_observations(power_precip=None, gpm_precip=None, preferred_source="NASA GPM IMERG")
    assert val_none is None
    assert "Missing" in src_none

