# AgriShift AI: Backend API Documentation for Frontend Integration

**Base URL (Local Development):** `http://127.0.0.1:8000`  
**API Version:** `v1.0.0`  
**Swagger UI Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
**ReDoc Reference:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)  
**OpenAPI Specification:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 1. Global Integration Guidelines for Frontend Developers

### 1.1 Dual Route Prefix
Every route is available with two equivalent URL patterns:
- **Recommended Prefix:** `/api/v1/{route}` (e.g. `/api/v1/farmer/profile`)
- **Root Alias:** `/{route}` (e.g. `/farmer/profile`)

Frontend developers should use `/api/v1/` for forward compatibility.

### 1.2 Headers
- `Content-Type: application/json` for all POST requests.
- `Accept: application/json`

### 1.3 CORS Policy
The backend is configured with permissive development CORS (`allow_origins=["*"]`) and supports production whitelisting via the `CORS_ORIGINS` environment variable (e.g., `http://localhost:3000,http://localhost:5173`).

### 1.4 HTTP Status Codes
| Code | Meaning | Context in AgriShift AI |
|---|---|---|
| `200 OK` | Success | Normal successful query or calculation. |
| `400 Bad Request` | Client Logic Error | Logical conflict such as `start_date` occurring after `end_date`. |
| `422 Unprocessable Entity` | Schema Validation Error | Out-of-bounds coordinates, non-positive acreage, or missing required fields. |
| `500 Internal Server Error` | Server Exception | Uncaught runtime error on the backend. |
| `502 Bad Gateway` | Upstream NASA Service Error | Upstream timeout or connection failure when contacting NASA POWER or CMR. |

---

## 2. API Endpoints Reference

### 2.1 Health Check & System Status

#### `GET /health`
Verifies backend operational status, active environment, and default pilot coordinates.

* **Method:** `GET`
* **Query Parameters:** None
* **Sample Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-11-14T13:45:00.000Z",
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

### 2.2 Farmer Profile Validation

#### `POST /api/v1/farmer/profile`
Validates farmer-provided land and crop details before initiating Earth observation workflows.

* **Method:** `POST`
* **Request Body:**
```json
{
  "village": "Singur",
  "latitude": 22.81,
  "longitude": 88.23,
  "current_crop": "Potato",
  "previous_crop": "Paddy (Aman)",
  "soil_type": "Alluvial",
  "land_area_acres": 2.5,
  "irrigation_available": true,
  "farming_season": "Rabi"
}
```

* **Field Specifications:**
  * `village` (*string, required*): Local administrative area or village name.
  * `latitude` (*float, required*): Latitude in decimal degrees ($-90.0 \le \text{lat} \le 90.0$).
  * `longitude` (*float, required*): Longitude in decimal degrees ($-180.0 \le \text{lon} \le 180.0$).
  * `current_crop` (*string, required*): Currently standing or newly sown crop.
  * `previous_crop` (*string, required*): Preceding harvested crop on this plot.
  * `soil_type` (*string, required*): Dominant soil type (e.g., `Alluvial`, `Sandy Loam`, `Clayey`, `Loamy`).
  * `land_area_acres` (*float, required*): Cultivated acreage (must be $> 0.0$).
  * `irrigation_available` (*boolean, required*): Access to borewell, canal, or lift irrigation (`true`/`false`).
  * `farming_season` (*string, required*): Cropping season (`Rabi`, `Kharif`, `Boro`, `Zaid`).

* **Sample Response (200 OK):**
```json
{
  "success": true,
  "message": "Farmer profile validated successfully.",
  "data": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)",
    "soil_type": "Alluvial",
    "land_area_acres": 2.5,
    "irrigation_available": true,
    "farming_season": "Rabi"
  }
}
```

* **Sample Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "type": "less_than_equal",
      "loc": ["body", "latitude"],
      "msg": "Input should be less than or equal to 90",
      "input": 150.0
    }
  ]
}
```

---

### 2.3 NASA POWER Agro-Climatology

#### `GET /api/v1/nasa/power`
Retrieves daily temperature, precipitation (`PRECTOTCORR`), relative humidity (`RH2M`), and solar radiation (`ALLSKY_SFC_SW_DWN`) from the NASA POWER API.

* **Method:** `GET`
* **Query Parameters:**
  * `latitude` (*float, optional, default: 22.90*)
  * `longitude` (*float, optional, default: 88.40*)
  * `start_date` (*string, optional, format: YYYY-MM-DD, default: 34 days ago*)
  * `end_date` (*string, optional, format: YYYY-MM-DD, default: 4 days ago*)

* **Sample Response (200 OK):**
```json
{
  "source": "NASA POWER Daily AG",
  "latitude": 22.9,
  "longitude": 88.4,
  "start_date": "2024-01-01",
  "end_date": "2024-01-03",
  "units": {
    "temperature": "°C",
    "precipitation": "mm/day",
    "relative_humidity": "%",
    "solar_radiation": "kWh/m^2/day"
  },
  "observations": [
    {
      "date": "2024-01-01",
      "temperature": 15.65,
      "precipitation": 0.0,
      "relative_humidity": 75.29,
      "solar_radiation": 3.36,
      "solar_radiation_mj": 12.11
    }
  ],
  "summary": {
    "average_temperature": 16.32,
    "total_precipitation": 0.0,
    "average_humidity": 73.19,
    "average_solar_radiation": 3.7
  }
}
```

---

### 2.4 NASA SMAP Soil Moisture

#### `GET /api/v1/nasa/smap/summary`
Retrieves surface (0–5 cm) and root-zone (0–100 cm) soil wetness fractions and computes water stress indicators.

* **Method:** `GET`
* **Query Parameters:**
  * `latitude` (*float, optional, default: 22.90*)
  * `longitude` (*float, optional, default: 88.40*)
  * `start_date` (*string, optional, format: YYYY-MM-DD*)
  * `end_date` (*string, optional, format: YYYY-MM-DD*)

* **Sample Response (200 OK):**
```json
{
  "success": true,
  "source": "NASA SMAP L4 (GEOS Catchment Land Surface Model)",
  "dataset": "SPL4SMGP V007 via NASA POWER GMAO GEOS API",
  "location": {
    "latitude": 22.9,
    "longitude": 88.4
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-03"
  },
  "units": {
    "surface_soil_moisture": "fraction (0-1)",
    "rootzone_soil_moisture": "fraction (0-1)"
  },
  "summary": {
    "average_surface_soil_moisture": 0.6,
    "average_rootzone_soil_moisture": 0.57,
    "soil_moisture_trend": "stable",
    "water_stress_indicator": "Optimal / Adequate Moisture"
  }
}
```

---

### 2.5 NASA GPM IMERG Rainfall Summary

#### `GET /api/v1/nasa/gpm/summary`
Searches NASA CMR for official GPM IMERG Daily granules (`GPM_3IMERGDF`) and queries GES DISC OPeNDAP for high-resolution precipitation.

* **Method:** `GET`
* **Query Parameters:**
  * `latitude` (*float, optional, default: 22.90*)
  * `longitude` (*float, optional, default: 88.40*)
  * `start_date` (*string, optional, format: YYYY-MM-DD*)
  * `end_date` (*string, optional, format: YYYY-MM-DD*)

* **Behavior & Fallback:**
  * When Earthdata credentials in `.env` are invalid or unauthorized on GES DISC, the service transparently reports `auth_status: "earthdata_auth_failed"`, sets `precipitation: null` (never fabricated zero), and triggers Phase 5 fallback to NASA POWER precipitation.

* **Sample Response (200 OK with Auth Caveat):**
```json
{
  "success": true,
  "source": "NASA GPM IMERG",
  "dataset": "GPM_3IMERGDF V07B (Daily Final)",
  "granules_count": 2,
  "auth_status": "earthdata_auth_failed",
  "total_rainfall": null,
  "rainfall_trend": "insufficient_data",
  "daily_data": [
    {
      "date": "2024-01-01",
      "precipitation": null
    }
  ]
}
```

---

### 2.6 Agricultural Data Processing Pipeline (Phase 5)

#### `POST /api/v1/agriculture/process`
Harmonizes and cleans NASA POWER, SMAP, and GPM datasets, prevents rainfall double-counting, filters `-999` sentinels, and computes agricultural indicators.

* **Method:** `POST`
* **Request Body:**
```json
{
  "farmer_profile": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "current_crop": "Potato",
    "previous_crop": "Paddy (Aman)",
    "soil_type": "Alluvial",
    "land_area_acres": 2.5,
    "irrigation_available": true,
    "farming_season": "Rabi"
  },
  "start_date": "2024-01-01",
  "end_date": "2024-01-05",
  "preferred_rainfall_source": "NASA POWER",
  "include_daily_records": true
}
```

* **Sample Response (200 OK):**
```json
{
  "status": "completed",
  "farmer_location": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-05",
    "total_days": 5
  },
  "sources": {
    "statuses": {
      "nasa_power": "success",
      "nasa_smap": "success",
      "nasa_gpm": "success"
    },
    "provenance": {
      "rainfall_harmonization": {
        "strategy": "Primary source with fallback; double-counting prohibited",
        "preferred_source": "NASA POWER"
      }
    }
  },
  "data_quality": {
    "total_days_evaluated": 5,
    "complete_observation_days": 5,
    "overall_completeness_percentage": 100.0,
    "duplicate_dates_resolved": 0
  },
  "indicators": {
    "temperature": {
      "average_temperature_celsius": 16.32,
      "min_temperature_celsius": 15.08,
      "max_temperature_celsius": 17.93,
      "temperature_trend": "warming"
    },
    "rainfall": {
      "total_rainfall_mm": 0.0,
      "consecutive_dry_days": 5,
      "rainfall_trend": "dry_spell"
    },
    "soil_moisture": {
      "average_surface_soil_moisture_percent": 59.2,
      "average_rootzone_soil_moisture_percent": 56.6,
      "water_stress_indicator": "Optimal (Favorable Soil Moisture)"
    }
  }
}
```

---

### 2.7 Crop Recommendation Engine (Phase 6)

#### `POST /api/v1/agriculture/recommendations`
Generates top 3 ranked, explainable crop recommendations for the intended upcoming season using ICAR/BCKV agronomic rules.

* **Method:** `POST`
* **Request Body:**
```json
{
  "farmer_profile": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23,
    "current_crop": "Paddy (Aman)",
    "previous_crop": "Jute",
    "soil_type": "Alluvial",
    "land_area_acres": 2.5,
    "irrigation_available": true,
    "farming_season": "Kharif"
  },
  "target_farming_season": "Rabi",
  "start_date": "2024-01-01",
  "end_date": "2024-01-30",
  "preferred_rainfall_source": "NASA POWER"
}
```

* **Next-Season Planning Resolution:**
  * If `target_farming_season` is omitted, the backend inspects the standing crop (`Paddy (Aman)`). Recognizing that Aman Paddy occupies the Kharif season, the engine automatically resolves the target season to the **upcoming Rabi season**, prepending an informative note.

* **Sample Response (200 OK):**
```json
{
  "success": true,
  "status": "recommended",
  "message": "Top 3 suitable crop recommendations generated for Rabi season in Hooghly.",
  "farmer_location": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23
  },
  "target_season": "Rabi",
  "recommendations": [
    {
      "rank": 1,
      "crop_name": "Mustard / Rapeseed",
      "botanical_name": "Brassica juncea",
      "suitability_score": 94.0,
      "suitability_category": "Highly Recommended",
      "growing_season": "Rabi",
      "crop_duration": "90 - 105 days",
      "water_requirement": "Low",
      "score_breakdown": {
        "season": 25.0,
        "soil": 15.0,
        "temperature": 20.0,
        "water_irrigation": 20.0,
        "soil_moisture": 7.0,
        "rotation": 7.0
      },
      "reasons": [
        "Assured irrigation satisfies the low water requirement (200 - 350 mm) for Mustard / Rapeseed.",
        "Observed mean temperature (16.32°C) falls squarely within optimal range (15.0–25.0°C).",
        "Soil classification 'Alluvial' is optimal for Mustard / Rapeseed root development and drainage.",
        "Target season 'Rabi' perfectly matches optimal growing window for Mustard / Rapeseed."
      ],
      "environmental_advantages": [
        "Thermal conditions (16.32°C) foster robust vegetative development and reproductive timing."
      ],
      "potential_risks": [],
      "water_and_irrigation_considerations": "Apply approximately 2 scheduled irrigations during critical physiological stages (200 - 350 mm total demand).",
      "crop_rotation_notes": "Exceptional rotation sequence following Paddy (Aman).",
      "missing_information": [],
      "limitations": [
        "High vulnerability to mustard aphid (Lipaphis erysimi) during cloudy/foggy spells in January.",
        "Extreme sensitivity to water stagnation; standing water (>24 hrs) causes rapid root asphyxiation.",
        "High temperatures (>32°C) during flowering/siliqua filling induce flower abortion."
      ],
      "agricultural_sources": [
        "ICAR-Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur",
        "BCKV All India Coordinated Research Project on Oilseeds (Rapeseed-Mustard)",
        "Department of Agriculture, Govt of West Bengal - Oilseeds Mission Guidelines"
      ],
      "reference_urls": [
        "https://www.drmr.res.in",
        "https://bckv.edu.in",
        "https://matirkatha.gov.in"
      ]
    }
  ],
  "disclaimer": "AgriShift AI provides advisory recommendations based on NASA satellite observations and ICAR/BCKV agronomic research. It does NOT guarantee crop yield, market price, or financial profit."
}
```

---

## 3. Frontend Error Handling Recommendations

1. **HTTP 422 Errors:** Render errors beneath the respective input fields using `detail[i].loc` (e.g. highlight the `latitude` field if `loc: ["body", "latitude"]`).
2. **HTTP 502 Errors:** Surface an informative banner: *"NASA Earth Observation data services are experiencing temporary latency. Please retry in a few moments."*
3. **Suitability Categories:** Display badge styling according to `suitability_category`:
   - `Highly Recommended` ($\ge 80$): Green badge
   - `Moderately Recommended` ($65 - 79.9$): Blue badge
   - `Conditionally Suitable` ($50 - 64.9$): Amber/Warning badge
   - `Not Recommended` ($< 50$): Gray/Red badge
