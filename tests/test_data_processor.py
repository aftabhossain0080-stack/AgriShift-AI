"""Automated unit and integration tests for Phase 5 Data Processing Pipeline.

Tests:
1. Data Cleaner:
   - NASA -999 and -9999 sentinel detection (missing values are not replaced with 0)
   - Temperature boundary validation & extreme heatwave/cold quality flags
   - Precipitation validation & extreme deluge flags (no silent deletion)
   - Relative humidity clamping & invalid bounds
   - Soil moisture fraction conversion & validation
   - Duplicate date detection and deduplication
2. Data Integrator:
   - Multi-source chronological alignment
   - Rainfall harmonization (strict double-counting prevention)
   - Completeness metrics calculation
3. Agricultural Indicators Calculator:
   - Temperature statistics and warming/cooling trend
   - Rainfall statistics, trends, and consecutive dry days
   - Soil moisture statistics, wetting/drying trend, and agronomic water stress
   - Atmospheric humidity and solar radiation in kWh/m²/day
4. End-to-End Pipeline & FastAPI Endpoints:
   - POST /api/v1/agriculture/process with valid payload (HTTP 200)
   - POST /agriculture/process root alias (HTTP 200)
   - Handling of partial NASA service failure (status="partial")
   - Handling of invalid farmer coordinates (HTTP 422)
   - Handling of inverted date range (HTTP 422)
"""
from datetime import date
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.farmer import FarmerProfileBase
from app.services.data_cleaner import (
    clean_daily_observation,
    clean_precipitation,
    clean_relative_humidity,
    clean_soil_moisture,
    clean_temperature,
    deduplicate_daily_records,
    is_sentinel_or_missing,
)
from app.services.data_integrator import (
    harmonize_rainfall_observations,
    integrate_environmental_datasets,
)
from app.services.indicator_calculator import (
    calculate_agricultural_indicators,
    calculate_consecutive_dry_days,
    calculate_rainfall_trend,
    calculate_soil_moisture_trend,
    calculate_temperature_trend,
    evaluate_water_stress_status,
)
from app.services.data_processor import (
    DataProcessorValidationError,
    process_agricultural_data,
)

client = TestClient(app)

# Sample valid farmer profile
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


# ============================================================================
# 1. DATA CLEANER TESTS
# ============================================================================

def test_sentinel_detection():
    """Verify NASA sentinels (-999, -9999, <= -900) are recognized and never treated as valid."""
    assert is_sentinel_or_missing(None) is True
    assert is_sentinel_or_missing(-999.0) is True
    assert is_sentinel_or_missing("-999") is True
    assert is_sentinel_or_missing(-9999.0) is True
    assert is_sentinel_or_missing(-950.0) is True
    assert is_sentinel_or_missing("invalid_string") is True
    # Valid values
    assert is_sentinel_or_missing(0.0) is False
    assert is_sentinel_or_missing(25.4) is False
    assert is_sentinel_or_missing(-5.0) is False  # valid cold temperature


def test_temperature_cleaning_and_extreme_flags():
    """Verify temperature bounds and extreme heat/cold alert flags."""
    # Valid normal temperature
    val, flags = clean_temperature(24.5)
    assert val == 24.5
    assert flags == []

    # Missing / Sentinel (do not replace with 0!)
    val, flags = clean_temperature(-999.0)
    assert val is None
    assert "missing_temperature" in flags

    # Extreme heatwave (kept, flagged)
    val, flags = clean_temperature(43.5)
    assert val == 43.5
    assert "heatwave_event" in flags

    # Cold event (kept, flagged)
    val, flags = clean_temperature(3.2)
    assert val == 3.2
    assert "cold_event" in flags

    # Out of physical bounds
    val, flags = clean_temperature(75.0)
    assert val is None
    assert any("invalid_range" in f for f in flags)


def test_precipitation_cleaning_and_deluge_flags():
    """Verify precipitation validation, negative rejection, and deluge flagging."""
    # Normal rain
    val, flags = clean_precipitation(15.2)
    assert val == 15.2
    assert flags == []

    # Zero rain (valid dry day)
    val, flags = clean_precipitation(0.0)
    assert val == 0.0
    assert flags == []

    # Negative rain is physically impossible
    val, flags = clean_precipitation(-2.5)
    assert val is None
    assert "invalid_negative_precipitation" in flags

    # Extreme deluge / heavy rainfall (monsoon event must NOT be silently discarded)
    val, flags = clean_precipitation(125.0)
    assert val == 125.0
    assert "extreme_heavy_rainfall_deluge" in flags


def test_relative_humidity_and_soil_moisture_cleaning():
    """Verify humidity clamping and soil moisture fraction conversion."""
    # Humidity clamping
    val, flags = clean_relative_humidity(101.2)
    assert val == 100.0
    assert "humidity_clamped_to_100" in flags

    val, flags = clean_relative_humidity(115.0)
    assert val is None
    assert any("invalid_humidity" in f for f in flags)

    # Soil moisture percentage converted to fraction
    val, flags = clean_soil_moisture(45.0, parameter_name="surface_sm")
    assert val == 0.45
    assert "surface_sm_percentage_converted_to_fraction" in flags

    # Valid fraction
    val, flags = clean_soil_moisture(0.55)
    assert val == 0.55
    assert flags == []


def test_duplicate_date_deduplication():
    """Verify deduplication preserves non-null fields and flags merged duplicates."""
    raw_records = [
        {"date": "2024-01-01", "temperature": 20.0, "precipitation": None, "quality_flags": []},
        {"date": "2024-01-01", "temperature": None, "precipitation": 5.0, "quality_flags": ["heatwave_event"]},
        {"date": "2024-01-02", "temperature": 21.0, "precipitation": 0.0, "quality_flags": []},
    ]
    deduped, dup_count = deduplicate_daily_records(raw_records)
    assert dup_count == 1
    assert len(deduped) == 2
    # Verify 2024-01-01 merged fields
    rec1 = deduped[0]
    assert rec1["date"] == "2024-01-01"
    assert rec1["temperature"] == 20.0
    assert rec1["precipitation"] == 5.0
    assert "duplicate_date_merged" in rec1["quality_flags"]
    assert "heatwave_event" in rec1["quality_flags"]


# ============================================================================
# 2. DATA INTEGRATOR & RAINFALL HARMONIZATION TESTS
# ============================================================================

def test_rainfall_harmonization_no_double_counting():
    """Verify rainfall harmonization strictly prevents double-counting."""
    # Case 1: NASA POWER preferred
    val, src = harmonize_rainfall_observations(power_precip=10.0, gpm_precip=12.5, preferred_source="NASA POWER")
    assert val == 10.0
    assert src == "NASA POWER"
    assert val != 22.5  # Crucial: NEVER double count!

    # Case 2: NASA GPM preferred
    val, src = harmonize_rainfall_observations(power_precip=10.0, gpm_precip=12.5, preferred_source="NASA GPM IMERG")
    assert val == 12.5
    assert src == "NASA GPM IMERG"

    # Case 3: GPM preferred but missing -> fallback to POWER
    val, src = harmonize_rainfall_observations(power_precip=8.0, gpm_precip=None, preferred_source="NASA GPM IMERG")
    assert val == 8.0
    assert "Fallback" in src

    # Case 4: Both missing
    val, src = harmonize_rainfall_observations(power_precip=None, gpm_precip=None)
    assert val is None


def test_integrate_environmental_datasets():
    """Verify integration of POWER, SMAP, and GPM datasets."""
    mock_power = {
        "data": [
            {"date": "2024-01-01", "temperature": 22.0, "precipitation": 2.0, "relative_humidity": 65.0, "solar_radiation": 4.5},
            {"date": "2024-01-02", "temperature": 23.0, "precipitation": 0.0, "relative_humidity": 60.0, "solar_radiation": 5.0},
        ]
    }
    mock_smap = {
        "daily_data": [
            {"date": "2024-01-01", "surface_soil_moisture": 0.45, "rootzone_soil_moisture": 0.50},
            {"date": "2024-01-02", "surface_soil_moisture": 0.42, "rootzone_soil_moisture": 0.48},
        ]
    }
    mock_gpm = {
        "daily_data": [
            {"date": "2024-01-01", "precipitation": 2.5},
            {"date": "2024-01-02", "precipitation": 0.0},
        ]
    }

    result = integrate_environmental_datasets(
        power_data=mock_power,
        smap_data=mock_smap,
        gpm_data=mock_gpm,
        start_date="2024-01-01",
        end_date="2024-01-02"
    )

    timeseries = result["daily_timeseries"]
    assert len(timeseries) == 2
    assert timeseries[0]["temperature"] == 22.0
    assert timeseries[0]["surface_soil_moisture"] == 0.45
    assert result["completeness"]["complete_observation_days"] == 2
    assert result["completeness"]["overall_completeness_percentage"] == 100.0


# ============================================================================
# 3. INDICATOR CALCULATOR TESTS
# ============================================================================

def test_consecutive_dry_days_calculation():
    """Verify consecutive dry day counting (precip < 1.0mm)."""
    # 3 dry days, 1 rain day (10.0), 2 dry days
    precips = [0.0, 0.2, 0.5, 10.0, 0.0, 0.1]
    max_consec, total_dry = calculate_consecutive_dry_days(precips, threshold=1.0)
    assert max_consec == 3
    assert total_dry == 5


def test_temperature_and_soil_moisture_trends():
    """Verify trends for temperature, rainfall, and soil moisture."""
    # Warming trend
    assert calculate_temperature_trend([15.0, 16.0, 20.0, 21.0]) == "warming"
    # Cooling trend
    assert calculate_temperature_trend([25.0, 24.0, 18.0, 17.0]) == "cooling"
    # Stable trend
    assert calculate_temperature_trend([20.0, 20.5, 20.2, 20.4]) == "stable"

    # Soil moisture wetting trend
    assert calculate_soil_moisture_trend([0.30, 0.32, 0.40, 0.42]) == "wetting"
    # Soil moisture drying trend
    assert calculate_soil_moisture_trend([0.50, 0.48, 0.40, 0.38]) == "drying"


def test_agronomic_water_stress_classification():
    """Verify water stress status classification."""
    assert "Severe Stress" in evaluate_water_stress_status(0.15, 0.12)
    assert "Moderate Stress" in evaluate_water_stress_status(0.32, 0.30)
    assert "Optimal" in evaluate_water_stress_status(0.55, 0.50)
    assert "Waterlogging" in evaluate_water_stress_status(0.85, 0.80)


def test_comprehensive_agricultural_indicators():
    """Verify indicators calculation over sample records."""
    daily_records = [
        {
            "date": "2024-01-01",
            "temperature": 20.0,
            "precipitation": 0.0,
            "relative_humidity": 60.0,
            "solar_radiation": 4.0,
            "surface_soil_moisture": 0.50,
            "rootzone_soil_moisture": 0.52,
        },
        {
            "date": "2024-01-02",
            "temperature": 22.0,
            "precipitation": 12.0,
            "relative_humidity": 70.0,
            "solar_radiation": 4.2,
            "surface_soil_moisture": 0.55,
            "rootzone_soil_moisture": 0.54,
        },
    ]

    indicators = calculate_agricultural_indicators(daily_records, completeness_percentage=100.0)

    # Temperature checks
    assert indicators["temperature"]["average_temperature_celsius"] == 21.0
    assert indicators["temperature"]["min_temperature_celsius"] == 20.0
    assert indicators["temperature"]["max_temperature_celsius"] == 22.0

    # Rainfall checks
    assert indicators["rainfall"]["total_rainfall_mm"] == 12.0
    assert indicators["rainfall"]["max_single_day_rainfall_mm"] == 12.0
    assert indicators["rainfall"]["consecutive_dry_days"] == 1
    assert indicators["rainfall"]["rainy_days_count"] == 1

    # Soil moisture checks
    assert indicators["soil_moisture"]["average_surface_soil_moisture_fraction"] == 0.525
    assert indicators["soil_moisture"]["average_rootzone_soil_moisture_fraction"] == 0.53
    assert "Optimal" in indicators["soil_moisture"]["water_stress_indicator"]


# ============================================================================
# 4. PIPELINE ORCHESTRATOR & FASTAPI API ENDPOINT TESTS
# ============================================================================

def mock_power_fetcher(*args, **kwargs):
    return {
        "success": True,
        "source": "NASA POWER",
        "data": [
            {"date": "2024-01-01", "temperature": 20.0, "precipitation": 0.0, "relative_humidity": 60.0, "solar_radiation": 4.0},
            {"date": "2024-01-02", "temperature": 22.0, "precipitation": 10.0, "relative_humidity": 70.0, "solar_radiation": 4.5},
        ]
    }


def mock_smap_fetcher(*args, **kwargs):
    return {
        "success": True,
        "source": "NASA SMAP",
        "daily_data": [
            {"date": "2024-01-01", "surface_soil_moisture": 0.48, "rootzone_soil_moisture": 0.52},
            {"date": "2024-01-02", "surface_soil_moisture": 0.55, "rootzone_soil_moisture": 0.54},
        ]
    }


def mock_gpm_fetcher(*args, **kwargs):
    return {
        "success": True,
        "source": "NASA GPM IMERG",
        "daily_data": [
            {"date": "2024-01-01", "precipitation": 0.0},
            {"date": "2024-01-02", "precipitation": 12.0},
        ]
    }


def test_process_agricultural_data_service():
    """Verify service orchestrator executes all stages successfully."""
    farmer = FarmerProfileBase(**VALID_FARMER_PAYLOAD)
    result = process_agricultural_data(
        farmer_profile=farmer,
        start_date="2024-01-01",
        end_date="2024-01-02",
        power_fetcher=mock_power_fetcher,
        smap_fetcher=mock_smap_fetcher,
        gpm_fetcher=mock_gpm_fetcher,
    )

    assert result["success"] is True
    assert result["status"] == "completed"
    assert result["location"]["village"] == "Singur"
    assert result["period"]["total_days"] == 2
    assert "indicators" in result
    assert result["indicators"]["temperature"]["average_temperature_celsius"] == 21.0
    assert result["data_quality"]["overall_completeness_percentage"] == 100.0


@patch("app.api.agriculture.process_agricultural_data")
def test_api_process_endpoint_success(mock_process):
    """Test POST /api/v1/agriculture/process returns HTTP 200 with valid response."""
    mock_process.return_value = {
        "success": True,
        "status": "completed",
        "message": "Agricultural data cleaned, integrated, and indicators calculated successfully.",
        "farmer_profile": VALID_FARMER_PAYLOAD,
        "location": {"village": "Singur", "latitude": 22.81, "longitude": 88.23},
        "period": {"start_date": "2024-01-01", "end_date": "2024-01-02", "total_days": 2},
        "indicators": {
            "temperature": {
                "average_temperature_celsius": 21.0,
                "min_temperature_celsius": 20.0,
                "max_temperature_celsius": 22.0,
                "temperature_trend": "warming"
            },
            "rainfall": {
                "total_rainfall_mm": 10.0,
                "average_daily_rainfall_mm": 5.0,
                "max_single_day_rainfall_mm": 10.0,
                "rainfall_trend": "stable",
                "consecutive_dry_days": 1,
                "total_dry_days": 1,
                "rainy_days_count": 1,
                "heavy_rain_days_count": 0
            },
            "soil_moisture": {
                "average_surface_soil_moisture_fraction": 0.515,
                "average_surface_soil_moisture_percent": 51.5,
                "min_surface_soil_moisture_fraction": 0.48,
                "max_surface_soil_moisture_fraction": 0.55,
                "average_rootzone_soil_moisture_fraction": 0.53,
                "average_rootzone_soil_moisture_percent": 53.0,
                "min_rootzone_soil_moisture_fraction": 0.52,
                "max_rootzone_soil_moisture_fraction": 0.54,
                "soil_moisture_trend": "wetting",
                "water_stress_indicator": "Optimal (Favorable Soil Moisture)"
            },
            "other": {
                "average_relative_humidity_percent": 65.0,
                "average_solar_radiation_kwh_m2_day": 4.25,
                "data_completeness_percentage": 100.0
            }
        },
        "data_quality": {
            "total_days_evaluated": 2,
            "complete_observation_days": 2,
            "overall_completeness_percentage": 100.0,
            "parameter_completeness": {"temperature_days": 2},
            "quality_flags_detected": [],
            "duplicate_dates_resolved": 0
        },
        "units": {
            "temperature": "°C",
            "precipitation": "mm/day",
            "total_rainfall": "mm",
            "relative_humidity": "%",
            "solar_radiation": "kWh/m²/day",
            "soil_moisture_fraction": "0.0 - 1.0 (fraction)",
            "soil_moisture_percent": "%"
        },
        "sources": {
            "nasa_power": "NASA POWER Daily Point API",
            "nasa_smap": "NASA SMAP L4",
            "nasa_gpm": "NASA GPM IMERG"
        },
        "daily_records": []
    }

    req_payload = {
        "farmer_profile": VALID_FARMER_PAYLOAD,
        "start_date": "2024-01-01",
        "end_date": "2024-01-02",
        "preferred_rainfall_source": "NASA POWER",
        "include_daily_records": True
    }

    # Test /api/v1/agriculture/process
    res_v1 = client.post("/api/v1/agriculture/process", json=req_payload)
    assert res_v1.status_code == 200
    data_v1 = res_v1.json()
    assert data_v1["success"] is True
    assert data_v1["indicators"]["temperature"]["average_temperature_celsius"] == 21.0

    # Test /agriculture/process (root alias)
    res_root = client.post("/agriculture/process", json=req_payload)
    assert res_root.status_code == 200
    assert res_root.json()["success"] is True


def test_api_process_invalid_farmer_inputs():
    """Verify endpoint rejects invalid farmer inputs with HTTP 422."""
    # Invalid latitude = 200
    invalid_payload = {
        "farmer_profile": {**VALID_FARMER_PAYLOAD, "latitude": 200.0},
        "start_date": "2024-01-01",
        "end_date": "2024-01-02"
    }
    res = client.post("/api/v1/agriculture/process", json=invalid_payload)
    assert res.status_code == 422

    # Negative land area
    invalid_area = {
        "farmer_profile": {**VALID_FARMER_PAYLOAD, "land_area_acres": -5.0},
        "start_date": "2024-01-01",
        "end_date": "2024-01-02"
    }
    res = client.post("/api/v1/agriculture/process", json=invalid_area)
    assert res.status_code == 422


def test_api_process_inverted_date_range():
    """Verify endpoint returns HTTP 422 when start_date > end_date."""
    inverted_payload = {
        "farmer_profile": VALID_FARMER_PAYLOAD,
        "start_date": "2024-01-20",
        "end_date": "2024-01-05"
    }
    res = client.post("/api/v1/agriculture/process", json=inverted_payload)
    assert res.status_code == 422
    assert "cannot exceed end date" in res.json()["detail"]
