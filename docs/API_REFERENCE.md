# Complete API Reference Documentation
## AgriShift AI: NASA-Powered Smart Agriculture & Crop Planning Backend

---

### API Information
* **Base URL (Local):** `http://127.0.0.1:8000`
* **Version:** `1.0.0`
* **Interactive Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **OpenAPI JSON Specification:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 1. Global Conventions & Standards

### 1.1 Route Mounting Conventions
All functional endpoints are mounted with dual route access:
* Canonical versioned prefix: `/api/v1/...` (e.g. `/api/v1/farmer/profile`)
* Direct root alias: `/{service}/...` (e.g. `/farmer/profile`)
* **Standard Recommendation for Frontend Developers:** Use the versioned `/api/v1/...` prefix across all API calls.

### 1.2 Headers
* `Content-Type: application/json` (Required for all `POST` requests)
* `Accept: application/json`

### 1.3 Standard HTTP Status Codes
| HTTP Status | Meaning | Scenario in AgriShift AI |
|---|---|---|
| `200 OK` | Success | Request succeeded and response payload is returned. |
| `400 Bad Request` | Client Error | Inverted date ranges or logical client request conflicts. |
| `422 Unprocessable Entity` | Schema Validation Error | Pydantic validation failure (e.g. missing required field, coordinates out of range). |
| `500 Internal Server Error` | Server Exception | Uncaught runtime error on the backend server. |
| `502 Bad Gateway` | Upstream Failure | Upstream NASA service (POWER or CMR) connection timeout or network failure. |

---

## 2. System & Health Endpoints

### 2.1 Root Service Information
* **Endpoint:** `GET /`
* **Summary:** Returns service metadata, version, and documentation URLs.

#### Example cURL:
```bash
curl -X GET "http://127.0.0.1:8000/" -H "Accept: application/json"
```

#### Example Response (200 OK):
```json
{
  "project": "AgriShift AI",
  "status": "online",
  "version": "1.0.0",
  "description": "Smart Agriculture Recommendation Backend powered by NASA Earth Observations",
  "target_region": "Hooghly, West Bengal, India",
  "documentation": {
    "swagger": "/docs",
    "redoc": "/redoc",
    "openapi": "/openapi.json"
  }
}
```

---

### 2.2 Health Check
* **Endpoint:** `GET /health`
* **Summary:** Validates backend operational readiness, environment, and regional coordinates.

#### Example cURL:
```bash
curl -X GET "http://127.0.0.1:8000/health" -H "Accept: application/json"
```

#### Example Response (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-11-14T12:29:15.836187+00:00",
  "environment": "development",
  "debug": true,
  "target_region": {
    "name": "Hooghly, West Bengal, India",
    "default_latitude": 22.9,
    "default_longitude": 88.4
  },
  "services": {
    "api": "operational",
    "database": "none_required_stateless",
    "nasa_data_connectors": "configured_for_phase_2"
  }
}
```

---

## 3. Farmer Profile Endpoints

### 3.1 Farmer Service Status
* **Endpoint:** `GET /api/v1/farmer/status`
* **Summary:** Checks operational readiness of the farmer validation service.

#### Example Response (200 OK):
```json
{
  "status": "operational",
  "service": "Farmer Input Validation"
}
```

---

### 3.2 Submit & Validate Farmer Profile
* **Endpoint:** `POST /api/v1/farmer/profile`
* **Summary:** Ingests and validates smallholder farmer characteristics, land area, soil, and cropping history.

#### Request Headers:
`Content-Type: application/json`

#### Request Body Schema (`FarmerProfileBase`):
| Field | Type | Required | Constraints | Description |
|---|---|:---:|---|---|
| `village` | `string` | **Yes** | Min length: 1 | Local village/panchayat in Hooghly. |
| `latitude` | `float` | **Yes** | `-90.0 <= lat <= 90.0` | Farm latitude in decimal degrees. |
| `longitude` | `float` | **Yes** | `-180.0 <= lon <= 180.0` | Farm longitude in decimal degrees. |
| `current_crop` | `string` | **Yes** | Min length: 1 | Currently standing or newly sown crop. |
| `previous_crop` | `string` | **Yes** | Min length: 1 | Crop harvested prior to current crop. |
| `soil_type` | `string` | **Yes** | Min length: 1 | Dominant soil classification (e.g. Alluvial). |
| `land_area_acres` | `float` | **Yes** | `> 0.0` (Must be strictly positive) | Land area in acres. |
| `irrigation_available`| `boolean`| **Yes** | `true` or `false` | Whether assured irrigation is available. |
| `farming_season` | `string` | **Yes** | Min length: 1 | Target cropping season (e.g. Rabi, Kharif). |

#### Example Request:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/farmer/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "land_area_acres": 2.5,
    "soil_type": "Alluvial",
    "irrigation_available": true,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)",
    "farming_season": "Rabi"
  }'
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "message": "Farmer profile validated successfully.",
  "data": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "land_area_acres": 2.5,
    "soil_type": "Alluvial",
    "irrigation_available": true,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)",
    "farming_season": "Rabi"
  }
}
```

#### Example Error Response (422 Unprocessable Entity):
```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "land_area_acres"],
      "msg": "Input should be greater than 0",
      "input": -1.5
    }
  ]
}
```

---

## 4. NASA Earth Observation Endpoints

### 4.1 NASA Services Status
* **Endpoint:** `GET /api/v1/nasa/status`
* **Summary:** Returns operational status of all NASA satellite connectors.

#### Example Response (200 OK):
```json
{
  "status": "operational",
  "active_services": [
    "NASA POWER Daily API",
    "NASA GPM IMERG Precipitation API",
    "NASA SMAP Level-4 Soil Moisture API"
  ],
  "default_region": {
    "name": "Hooghly, West Bengal, India",
    "latitude": 22.9,
    "longitude": 88.4
  }
}
```

---

### 4.2 NASA POWER Daily Meteorological Data
* **Endpoint:** `GET /api/v1/nasa/power`
* **Summary:** Retrieves daily historical solar radiation, air temperature, precipitation, and relative humidity timeseries.

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
|---|---|:---:|---|---|
| `latitude` | `float` | No | `22.90` | Latitude coordinate (-90.0 to 90.0). |
| `longitude` | `float` | No | `88.40` | Longitude coordinate (-180.0 to 180.0). |
| `start_date` | `string`| No | 30 days prior | Start date in `YYYY-MM-DD` format. |
| `end_date` | `string`| No | Latest available | End date in `YYYY-MM-DD` format (accounting for 4-day lag). |

#### Example cURL:
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/nasa/power?latitude=22.90&longitude=88.40&start_date=2024-01-01&end_date=2024-01-05" \
  -H "Accept: application/json"
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "source": "NASA POWER",
  "dataset": "POWER Daily Point Agroclimatology",
  "location": {
    "latitude": 22.9,
    "longitude": 88.4
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-05"
  },
  "units": {
    "temperature": "°C",
    "precipitation": "mm",
    "relative_humidity": "%",
    "solar_radiation": "kWh/m²/day",
    "solar_radiation_mj": "MJ/m²/day"
  },
  "parameters": [
    "T2M",
    "PRECTOTCORR",
    "RH2M",
    "ALLSKY_SFC_SW_DWN"
  ],
  "data": [
    {
      "date": "2024-01-01",
      "temperature": 18.24,
      "precipitation": 0.0,
      "relative_humidity": 68.42,
      "solar_radiation": 4.12,
      "solar_radiation_mj": 14.83
    }
  ],
  "valid_observations_count": 5,
  "missing_observations_count": 0
}
```

---

### 4.3 NASA POWER Agro-Climatic Summary Statistics
* **Endpoint:** `GET /api/v1/nasa/power/summary`
* **Summary:** Aggregates average, max, and min temperature, total rainfall, mean humidity, and solar radiation over the period.

#### Example cURL:
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/nasa/power/summary?latitude=22.90&longitude=88.40"
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "source": "NASA POWER",
  "location": {
    "latitude": 22.9,
    "longitude": 88.4
  },
  "period": {
    "start_date": "2026-10-12",
    "end_date": "2026-11-10"
  },
  "units": {
    "temperature": "°C",
    "rainfall": "mm",
    "relative_humidity": "%",
    "solar_radiation": "kWh/m²/day"
  },
  "summary": {
    "average_temperature": 25.4,
    "max_temperature": 27.36,
    "min_temperature": 23.11,
    "total_rainfall": 39.93,
    "average_humidity": 80.29,
    "average_solar_radiation": 4.17,
    "valid_observations_count": 29,
    "missing_observations_count": 1
  },
  "average_temperature": 25.4,
  "max_temperature": 27.36,
  "min_temperature": 23.11,
  "total_rainfall": 39.93,
  "average_humidity": 80.29,
  "average_solar_radiation": 4.17,
  "valid_observations_count": 29,
  "missing_observations_count": 1
}
```

---

### 4.4 NASA GPM IMERG Precipitation Summary
* **Endpoint:** `GET /api/v1/nasa/gpm/summary`
* **Summary:** Queries NASA CMR for GPM IMERG Daily Final granules, aggregates precipitation, dry spells, and rainfall trend.

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
|---|---|:---:|---|---|
| `latitude` | `float` | No | `22.90` | Latitude coordinate (-90.0 to 90.0). |
| `longitude` | `float` | No | `88.40` | Longitude coordinate (-180.0 to 180.0). |
| `start_date` | `string`| No | 5 days prior | Observation start date (`YYYY-MM-DD`). |
| `end_date` | `string`| No | Latest available | Observation end date (`YYYY-MM-DD`). |

#### Example cURL:
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/nasa/gpm/summary?latitude=22.90&longitude=88.40&start_date=2024-01-01&end_date=2024-01-03"
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "source": "NASA GPM IMERG",
  "dataset": "GPM_3IMERGDF V07B (Daily Final)",
  "spatial_resolution": "0.1° x 0.1° (~10 km)",
  "temporal_resolution": "Daily",
  "location": {
    "latitude": 22.9,
    "longitude": 88.4
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-03"
  },
  "units": {
    "precipitation": "mm",
    "daily_rainfall": "mm/day",
    "total_rainfall": "mm"
  },
  "summary": {
    "total_rainfall": 0.0,
    "average_daily_rainfall": 0.0,
    "max_daily_rainfall": 0.0,
    "min_daily_rainfall": 0.0,
    "rainy_days_count": 0,
    "dry_days_count": 3,
    "rainfall_trend": "dry_spell"
  },
  "total_rainfall": 0.0,
  "average_daily_rainfall": 0.0,
  "max_daily_rainfall": 0.0,
  "rainfall_trend": "dry_spell",
  "granules_count": 3,
  "auth_status": "authenticated",
  "daily_data": [
    {"date": "2024-01-01", "precipitation": 0.0},
    {"date": "2024-01-02", "precipitation": 0.0},
    {"date": "2024-01-03", "precipitation": 0.0}
  ]
}
```

---

### 4.5 NASA SMAP Level-4 Soil Moisture Summary
* **Endpoint:** `GET /api/v1/nasa/smap/summary`
* **Summary:** Ingests surface (0–5 cm) and root-zone (0–100 cm) soil wetness fractions and diagnoses water-stress conditions.

#### Example cURL:
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/nasa/smap/summary?latitude=22.90&longitude=88.40&start_date=2024-01-01&end_date=2024-01-05"
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "source": "NASA SMAP Level-4",
  "dataset": "GMAO GEOS Catchment Land Surface Model with SMAP L4 Assimilation",
  "spatial_resolution": "0.5° x 0.625° (~50 km)",
  "temporal_resolution": "Daily",
  "location": {
    "latitude": 22.9,
    "longitude": 88.4
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-05"
  },
  "units": {
    "surface_soil_moisture": "fraction (0.0 - 1.0)",
    "surface_soil_moisture_percent": "% (0 - 100)",
    "rootzone_soil_moisture": "fraction (0.0 - 1.0)",
    "rootzone_soil_moisture_percent": "% (0 - 100)"
  },
  "summary": {
    "average_surface_soil_moisture": 0.612,
    "average_surface_soil_moisture_percent": 61.2,
    "min_surface_soil_moisture": 0.589,
    "max_surface_soil_moisture": 0.634,
    "average_rootzone_soil_moisture": 0.678,
    "average_rootzone_soil_moisture_percent": 67.8,
    "min_rootzone_soil_moisture": 0.662,
    "max_rootzone_soil_moisture": 0.691,
    "soil_moisture_trend": "stable",
    "water_stress_status": "Optimal (Favorable Soil Moisture)"
  },
  "average_surface_soil_moisture": 0.612,
  "average_rootzone_soil_moisture": 0.678,
  "soil_moisture_trend": "stable",
  "water_stress_status": "Optimal (Favorable Soil Moisture)",
  "valid_observations_count": 5,
  "missing_observations_count": 0
}
```

---

## 5. Phase 5: Agricultural Data Cleaning & Processing Pipeline

### 5.1 Execute Data Cleaning & Integration Pipeline
* **Endpoint:** `POST /api/v1/agriculture/process`
* **Summary:** Ingests farmer profile and multi-source NASA data, strips -999 sentinels, harmonizes rainfall to avoid double-counting, aligns dates, and calculates comprehensive agricultural indicators.

#### Request Schema (`AgricultureProcessRequest`):
```json
{
  "farmer_profile": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "land_area_acres": 2.5,
    "soil_type": "Alluvial",
    "irrigation_available": true,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)",
    "farming_season": "Rabi"
  },
  "start_date": "2024-01-01",
  "end_date": "2024-01-05",
  "preferred_rainfall_source": "NASA POWER",
  "include_daily_records": true
}
```

#### Example cURL:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/agriculture/process" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_profile": {
      "village": "Singur",
      "latitude": 22.81,
      "longitude": 88.23,
      "land_area_acres": 2.5,
      "soil_type": "Alluvial",
      "irrigation_available": true,
      "current_crop": "Potato",
      "previous_crop": "Paddy (Aman)",
      "farming_season": "Rabi"
    },
    "start_date": "2024-01-01",
    "end_date": "2024-01-05",
    "preferred_rainfall_source": "NASA POWER"
  }'
```

#### Example Response (200 OK):
```json
{
  "status": "completed",
  "processed_data_id": "proc_20240101_20240105_22.81_88.23",
  "location": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-05",
    "days_count": 5
  },
  "indicators": {
    "temperature": {
      "average_temperature_celsius": 17.85,
      "min_temperature_celsius": 16.12,
      "max_temperature_celsius": 19.45,
      "temperature_trend": "stable"
    },
    "rainfall": {
      "total_rainfall_mm": 0.0,
      "average_daily_rainfall_mm": 0.0,
      "max_single_day_rainfall_mm": 0.0,
      "rainfall_trend": "dry_spell",
      "consecutive_dry_days": 5,
      "total_dry_days": 5,
      "rainy_days_count": 0,
      "heavy_rain_days_count": 0
    },
    "soil_moisture": {
      "average_surface_soil_moisture_fraction": 0.584,
      "average_surface_soil_moisture_percent": 58.4,
      "min_surface_soil_moisture_fraction": 0.562,
      "max_surface_soil_moisture_fraction": 0.601,
      "average_rootzone_soil_moisture_fraction": 0.642,
      "average_rootzone_soil_moisture_percent": 64.2,
      "min_rootzone_soil_moisture_fraction": 0.631,
      "max_rootzone_soil_moisture_fraction": 0.655,
      "soil_moisture_trend": "stable",
      "water_stress_indicator": "Optimal (Favorable Soil Moisture)"
    },
    "other": {
      "average_relative_humidity_percent": 67.24,
      "average_solar_radiation_kwh_m2_day": 4.21,
      "data_completeness_percentage": 100.0
    }
  },
  "data_quality": {
    "total_records": 5,
    "completeness_percentage": 100.0,
    "quality_flags_count": 0,
    "quality_flags": []
  },
  "sources": {
    "temperature": "NASA POWER Daily Point (0.5° x 0.625°)",
    "precipitation": "NASA POWER PRECTOTCORR (Harmonized, single attribution)",
    "soil_moisture": "NASA GMAO GEOS Catchment SMAP L4 Assimilation (0.5° x 0.625°)",
    "solar_radiation": "NASA POWER ALLSKY_SFC_SW_DWN (Converted to kWh/m²/day)",
    "relative_humidity": "NASA POWER RH2M"
  }
}
```

---

## 6. Phase 6: Intelligent Crop Recommendation Engine

### 6.1 Recommendation Engine Status
* **Endpoint:** `GET /api/v1/recommendations/status`
* **Summary:** Reports active knowledge base count and regional institutions.

#### Example Response (200 OK):
```json
{
  "status": "operational",
  "phase": "Phase 6: Intelligent Crop Recommendation Engine",
  "supported_crops_count": 8,
  "supported_regions": ["Hooghly, West Bengal, India"],
  "advisory_institutions": ["ICAR", "BCKV", "West Bengal Department of Agriculture"]
}
```

---

### 6.2 Generate Intelligent Crop Recommendations
* **Endpoint:** `POST /api/v1/agriculture/recommendations`
* **Summary:** The core endpoint for frontend application integration. Executes the Phase 5 pipeline internally and evaluates the 6-factor weighted agronomic scoring engine to return the Top 3 ranked crops.

#### Request Schema (`CropRecommendationRequest`):
```json
{
  "farmer_profile": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "land_area_acres": 2.5,
    "soil_type": "Alluvial",
    "irrigation_available": true,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)",
    "farming_season": "Rabi"
  },
  "target_farming_season": "Rabi",
  "start_date": "2024-01-01",
  "end_date": "2024-01-05",
  "preferred_rainfall_source": "NASA POWER"
}
```

#### Example cURL:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/agriculture/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_profile": {
      "village": "Singur",
      "latitude": 22.81,
      "longitude": 88.23,
      "land_area_acres": 2.5,
      "soil_type": "Alluvial",
      "irrigation_available": true,
      "current_crop": "Potato",
      "previous_crop": "Paddy (Aman)",
      "farming_season": "Rabi"
    },
    "target_farming_season": "Rabi"
  }'
```

#### Example Response (200 OK):
```json
{
  "success": true,
  "timestamp": "2026-11-14T12:30:08.512410Z",
  "farmer_summary": {
    "village": "Singur",
    "target_season": "Rabi",
    "soil_type": "Alluvial",
    "irrigation_available": true,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)"
  },
  "environmental_context": {
    "average_temperature_celsius": 17.85,
    "total_rainfall_mm": 0.0,
    "rainfall_trend": "dry_spell",
    "water_stress_status": "Optimal (Favorable Soil Moisture)",
    "average_rootzone_soil_moisture_percent": 64.2,
    "consecutive_dry_days": 5
  },
  "recommendations_count": 3,
  "recommendations": [
    {
      "rank": 1,
      "crop_id": "mustard",
      "crop_name": "Mustard / Rapeseed",
      "botanical_name": "Brassica juncea",
      "suitability_score": 92.0,
      "water_requirement_category": "Low",
      "irrigation_guidance": "Requires 1-2 light irrigations at flowering and siliqua development.",
      "duration_days": "100 - 115 days",
      "popular_varieties": ["B-9 (Binoy)", "Sarama", "Pusa Bold", "Sita"],
      "reasons": [
        "Highly suitable for Rabi season in Hooghly.",
        "Optimal temperature compatibility with current conditions (17.85°C).",
        "Excellent crop rotation following Paddy (Aman) to break pest cycles.",
        "Well-adapted to Alluvial soil."
      ],
      "advantages": [
        "Low water footprint avoids over-depleting groundwater reserves.",
        "Short duration allows follow-on Sesame or Summer Moong."
      ],
      "risks": [
        "Susceptible to aphid infestation during cloudy winter spells."
      ],
      "rotation_warning": null,
      "sources": [
        "ICAR-Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur",
        "BCKV Department of Agronomy - Oilseeds Guide for Bengal"
      ]
    },
    {
      "rank": 2,
      "crop_id": "lentil",
      "crop_name": "Lentil / Masoor",
      "botanical_name": "Lens culinaris",
      "suitability_score": 88.5,
      "water_requirement_category": "Low",
      "irrigation_guidance": "Grows largely on residual soil moisture; 1 supplementary irrigation at podding.",
      "duration_days": "110 - 125 days",
      "popular_varieties": ["Moitree (WBL-77)", "Asha", "Subrata"],
      "reasons": [
        "Legume fixes atmospheric nitrogen, restoring depleted soils after heavy Aman harvest.",
        "Thrives in cool dry winter conditions."
      ],
      "advantages": [
        "Low input cost and high local market value."
      ],
      "risks": [
        "Sensitive to waterlogging if sudden winter showers occur."
      ],
      "rotation_warning": null,
      "sources": [
        "ICAR-Indian Institute of Pulses Research (IIPR), Kanpur",
        "BCKV Pulses Improvement Project"
      ]
    },
    {
      "rank": 3,
      "crop_id": "maize",
      "crop_name": "Maize (Corn)",
      "botanical_name": "Zea mays",
      "suitability_score": 84.0,
      "water_requirement_category": "Medium",
      "irrigation_guidance": "Requires 3-4 irrigations at knee-high, tasseling, and grain filling.",
      "duration_days": "105 - 125 days",
      "popular_varieties": ["PAC-740", "HQPM-1", "DeKalb 900M"],
      "reasons": [
        "High yielding potential under alluvial soils with assured irrigation.",
        "Excellent market demand for poultry feed in neighboring districts."
      ],
      "advantages": [
        "More water-productive than Boro paddy."
      ],
      "risks": [
        "High fertilizer demand; avoid consecutive maize cropping."
      ],
      "rotation_warning": null,
      "sources": [
        "ICAR-Indian Institute of Maize Research (IIMR), Ludhiana",
        "BCKV Agronomy Department"
      ]
    }
  ],
  "disclaimer": "Recommendations are based on NASA satellite observations and institutional agronomic guidelines from ICAR and BCKV. Local soil testing and ground conditions should always be confirmed before sowing."
}
```