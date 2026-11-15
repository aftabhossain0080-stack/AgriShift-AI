# AgriShift AI Backend Integration Guide

## 1. Overview

This document specifies the backend integration points between the AgriShift AI Next.js 14 frontend and the FastAPI backend service (repository: `AgriShift-AI`).

The frontend transforms Earth observation telemetry from NASA POWER, GPM IMERG, and SMAP into actionable crop choices, weekly irrigation depth schedules, and rotation plans for smallholder farmers in Hooghly, West Bengal.

---

## 2. CORS Middleware Configuration

The FastAPI backend must accept cross-origin requests from the Next.js development server (`http://localhost:3000`) and the deployed production domain.

The backend in `AgriShift-AI/app/main.py` already includes CORS middleware:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Parse CORS origins from environment settings
cors_origins = (
    ["*"]
    if settings.CORS_ORIGINS.strip() == "*"
    else [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Configuration in Backend (`.env`)

For local development with the frontend:
```bash
# AgriShift-AI/.env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

For production deployment:
```bash
# AgriShift-AI/.env
CORS_ORIGINS=https://agrishift-ai.vercel.app,http://localhost:3000
```

If testing from mobile devices on the same local Wi-Fi, add the local IP address (for example `http://192.168.1.100:3000`).

---

## 3. Endpoints Called by Frontend

The frontend communicates with the backend via the typed client in `src/lib/api/client.ts`. All endpoints are prefixed with `/api/v1` (with root fallbacks supported).

### 3.1 Primary Crop Recommendations
- **Path**: `POST /api/v1/agriculture/recommendations`
- **Fallback Path**: `POST /api/v1/recommendations/generate`
- **Frontend Caller**: `generateRecommendations()` in `src/lib/api/recommendations.ts`
- **TanStack Hook**: `useRecommendations()` in `src/hooks/useRecommendations.ts`

#### Request Payload Schema
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
  "target_farming_season": "Rabi"
}
```

#### Expected Backend Response Schema
```json
{
  "success": true,
  "status": "completed",
  "message": "Recommendations generated successfully",
  "farmer_location": {
    "village": "Singur",
    "latitude": 22.81,
    "longitude": 88.23
  },
  "target_season": "Rabi",
  "environmental_summary": {
    "analysis_period": {
      "start_date": "2024-10-01",
      "end_date": "2024-11-15",
      "total_days": 45
    },
    "temperature": {
      "average_celsius": 21.4,
      "min_celsius": 16.2,
      "max_celsius": 28.5,
      "trend": "gradual_cooling"
    },
    "rainfall": {
      "total_mm": 18.4,
      "consecutive_dry_days": 12,
      "trend": "dry_spell"
    },
    "soil_moisture": {
      "surface_fraction": 0.42,
      "rootzone_fraction": 0.54,
      "water_stress_status": "Optimal (Favorable Root-Zone Moisture)"
    },
    "atmospheric": {
      "relative_humidity_percent": 68.0,
      "solar_radiation_kwh_m2_day": 4.65
    },
    "data_completeness_percentage": 96.5
  },
  "recommendations": [
    {
      "rank": 1,
      "crop_name": "Mustard",
      "botanical_name": "Brassica juncea",
      "suitability_score": 94.0,
      "suitability_category": "Optimal",
      "growing_season": "Rabi",
      "crop_duration": "90 to 105 days",
      "water_requirement": "Low",
      "score_breakdown": {
        "temperature": 28.0,
        "soil_moisture": 24.0,
        "water_irrigation": 23.5,
        "rotation": 18.5
      },
      "reasons": [
        "Optimal thermal match with current temperatures in Hooghly",
        "Breaks potato blight and pathogen cycles efficiently",
        "Moderate root depth utilizes residual moisture effectively"
      ],
      "environmental_advantages": [
        "Low water demand protects winter groundwater reserves"
      ],
      "potential_risks": [
        "Aphid infestation if relative humidity rises above 75 percent"
      ],
      "water_and_irrigation_considerations": "Requires 2 to 3 light irrigations at critical growth stages: branching, flowering, and siliqua formation.",
      "crop_rotation_notes": "Succeeding potato with mustard leverages residual phosphorus and prevents Ralstonia solanacearum carryover.",
      "missing_information": [],
      "limitations": [
        "Susceptible to late blight if preceding potato residue is not incorporated"
      ],
      "agricultural_sources": [
        "ICAR Directorate of Rapeseed-Mustard Research (DRMR)",
        "Bidhan Chandra Krishi Viswavidyalaya (BCKV) Rabi Package of Practices"
      ],
      "reference_urls": []
    }
  ],
  "data_quality_and_confidence": {
    "overall_completeness_percentage": 96.5,
    "confidence_rating": "High",
    "confidence_notes": "NASA POWER and SMAP observations complete for target coordinates."
  },
  "sources_and_references": [
    {
      "institution": "NASA POWER Project",
      "name": "Agroclimatology Daily Telemetry",
      "role": "Solar radiation and 2m ambient air temperature"
    },
    {
      "institution": "NASA SMAP",
      "name": "Level 4 Global Surface and Root-Zone Soil Moisture",
      "role": "Soil moisture fraction observations"
    },
    {
      "institution": "NASA GPM",
      "name": "IMERG Early Run Precipitation",
      "role": "Satellite precipitation tracking"
    }
  ],
  "disclaimer": "Recommendations are based on public satellite observations and regional agronomic models. Local soil tests and field checks should guide high-stakes investment."
}
```

### 3.2 Supported Crop Catalog
- **Path**: `GET /api/v1/farmer/crops`
- **Frontend Caller**: `getCrops()` in `src/lib/api/farmer.ts`
- **Fallback**: Local catalog of 8 crops in `src/lib/crop-knowledge.ts`

### 3.3 Status and Health Endpoints
- **Path**: `GET /health`
- **Frontend Caller**: `checkBackendHealth()` in `src/lib/api/client.ts` and `src/lib/api.ts`
- **Purpose**: Fast ping to detect whether the live backend service is reachable.

- **Path**: `GET /api/v1/recommendations/status`
- **Frontend Caller**: `getRecommendationsStatus()` in `src/lib/api/recommendations.ts`

- **Path**: `GET /api/v1/nasa/status`
- **Path**: `GET /api/v1/farmer/status`

### 3.4 Earth Observation Raw Summaries
- **Path**: `GET /api/v1/nasa/power?latitude=22.81&longitude=88.23`
- **Path**: `GET /api/v1/nasa/gpm/summary?latitude=22.81&longitude=88.23`
- **Path**: `GET /api/v1/nasa/smap/summary?latitude=22.81&longitude=88.23`
- **Frontend Caller**: Functions in `src/lib/api/nasa.ts`

---

## 4. Adapter Isolation Layer

All transformations between backend Pydantic models and frontend domain models are strictly isolated in:
`src/lib/api/adapters.ts`

### Key Transformations
1. **`recommendations` -> `top_crops`**: Backend returns `recommendations[]`, which the adapter maps to frontend `CropRecommendation[]`.
2. **Suitability Categories**: Maps backend category strings (`"Highly Suitable"`, `"Optimal"`, `"Moderate"`, `"Conditional"`, `"Poor"`) to frontend `CropViability` enum.
3. **Score Breakdown**: Maps backend dictionary keys (`temperature`, `soil_moisture`, `water_irrigation`, `rotation`) into the typed `CropScoreBreakdown` object.
4. **Soil Moisture Percentage**: Converts backend surface and rootzone fractions (`0.42`, `0.54`) into integer percentages (`42%`, `54%`).
5. **No Component Mutations**: UI components NEVER adapt raw backend structures. If backend response fields change, update `adapters.ts` and `schema.d.ts` only.

---

## 5. Network Resilience and Error Handling

1. **Timeout**: Requests time out after 10,000 ms (10 seconds) via `AbortController`.
2. **Retries**: Up to 2 automatic retries are executed for network failures (such as connection refused or aborts) before raising an error. HTTP status errors (4xx, 5xx) are returned immediately without retrying.
3. **Fallback Mode**: When the backend is offline or unreachable, the frontend automatically falls back to ICAR/BCKV calibrated mock data and flags `is_mock: true`.
4. **Loading States**: Full `SkeletonLoader` is presented across all metrics, cards, and charts while queries are active.
5. **Error States**: A dedicated alert banner with a retry button appears on error. The retry button triggers `refetch()` with a 44px minimum touch target.

---

## 6. How to Run and Test Full Stack Locally

### Terminal 1: Backend
```bash
cd AgriShift-AI
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger UI will be accessible at: `http://localhost:8000/docs`

### Terminal 2: Frontend
```bash
# In the NASA project root:
npm install

# Configure environment:
# Copy .env.example to .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# Set NEXT_PUBLIC_USE_MOCKS=false

npm run dev
```
Frontend will be accessible at: `http://localhost:3000`
Interactive Demo: `http://localhost:3000/en/demo`
Farmer Intake Wizard: `http://localhost:3000/en/advice`
Results View: `http://localhost:3000/en/results`

---

## 7. Hard-coded Location Findings

A comprehensive contract inspection of the `AgriShift-AI` FastAPI backend was performed to identify any hard-coded Hooghly coordinates (`22.90°N, 88.40°E` or `22.81°N, 88.23°E`), query parameter mismatches, and regional coupling.

### 7.1 Detailed Inspection Findings by File

| File Path | Line Reference | Observation / Hard-coded Values |
| :--- | :--- | :--- |
| `AgriShift-AI/app/utils/config.py` | Lines 28-30 | Hardcodes `DEFAULT_LATITUDE = 22.90` and `DEFAULT_LONGITUDE = 88.40` for Hooghly, West Bengal. |
| `AgriShift-AI/app/api/nasa.py` | Lines 60-63 | In `/nasa/status`: Hardcodes `"default_region": {"name": "Hooghly, West Bengal, India", "latitude": 22.90, "longitude": 88.40}`. |
| `AgriShift-AI/app/api/nasa.py` | Lines 83-94 | In `GET /nasa/power`: Query parameters are named `latitude` and `longitude` (NOT `lat` and `lon`). Default values default to `latitude=22.90, longitude=88.40`. If a client passes `lat` or `lon`, FastAPI ignores them and silently falls back to Hooghly coordinates. |
| `AgriShift-AI/app/api/nasa.py` | Lines 145-156 | In `GET /nasa/power/summary`: Query parameters `latitude` and `longitude` default to `22.90` and `88.40`. |
| `AgriShift-AI/app/api/nasa.py` | Lines 228-239 | In `GET /nasa/gpm/summary`: Query parameters `latitude` and `longitude` default to `22.90` and `88.40`. |
| `AgriShift-AI/app/api/nasa.py` | Lines 300-311 | In `GET /nasa/smap/summary`: Query parameters `latitude` and `longitude` default to `22.90` and `88.40`. |
| `AgriShift-AI/app/api/recommendations.py` | Lines 84-85 | In `GET /recommendations/status`: Hardcoded `"supported_regions": ["Hooghly, West Bengal, India"]` and advisory institutions (`ICAR`, `BCKV`). |
| `AgriShift-AI/app/api/recommendations.py` | Lines 36-56 | In `POST /agriculture/recommendations`: Properly extracts `latitude` and `longitude` dynamically from `request.farmer_profile.latitude` and `longitude`. |
| `AgriShift-AI/app/api/agriculture.py` | Lines 32-42 | In `POST /agriculture/process`: Properly forwards `farmer_profile` containing dynamic coordinates to `process_agricultural_data`. |
| `AgriShift-AI/app/api/farmer.py` | Lines 20-42 | In `POST /farmer/profile` and `POST /farmer/input`: Dynamic coordinates accepted and validated via `FarmerProfileBase`. |
| `AgriShift-AI/app/schemas/farmer.py` | Lines 18, 25, 75-76 | Pydantic examples hardcode Singur coordinates (`latitude: 22.81, longitude: 88.23`). Validation allows `ge=-90.0, le=90.0` and `ge=-180.0, le=180.0`. |
| `AgriShift-AI/app/services/recommendation_engine.py` | Lines 148, 617, 674 | Recommendation explanations hardcode string messages mentioning Hooghly (e.g. `"Top 3 suitable crop recommendations generated for {chosen_season} season in Hooghly"` and citation to `"District Agriculture Plan for Hooghly"`). |
| `AgriShift-AI/app/services/crop_knowledge_base.py` | Throughout | Agronomic package of practices rules (soil types, sowing calendar, potato late-blight risk rules) are calibrated to West Bengal Gangetic Alluvial agro-ecological zones. |

### 7.2 What Needs to Change in the Backend

1. **Query Parameter Aliases for NASA Endpoints**:
   - Update `app/api/nasa.py` so query parameters accept both `lat`/`latitude` and `lon`/`longitude` using FastAPI aliases:
     ```python
     latitude: float = Query(..., alias="lat") # or custom dependency accepting both lat and latitude
     longitude: float = Query(..., alias="lon")
     ```
2. **Explicit Coordinate Requirements**:
   - Rather than silently falling back to Hooghly (`22.90`, `88.40`) when coordinates are missing, make `latitude` and `longitude` required query parameters (or return an explicit HTTP 422 Unprocessable Entity error when neither is supplied).
3. **Dynamic Advisory Attribution**:
   - In `app/services/recommendation_engine.py`, replace string literals containing `"in Hooghly"` with dynamic regional labels derived from `farmer_profile.village` or reverse-geocoded district names.
4. **Multi-Region Knowledge Base Support**:
   - Abstract the crop rules and calendar from `crop_knowledge_base.py` to allow zone-specific profiles beyond Hooghly/West Bengal.

### 7.3 Current Workaround in Frontend (Mock Layer and Defensive Client)

1. **Dual Query Parameter Transmission**:
   - In `src/lib/api/nasa.ts`, `fetchSatelliteSnapshot()` and all NASA fetchers transmit both naming conventions simultaneously:
     `?lat=${lat}&lon=${lon}&latitude=${lat}&longitude=${lon}`
   - This ensures that whether the backend endpoint expects abbreviated (`lat`/`lon`) or unabbreviated (`latitude`/`longitude`) parameters, FastAPI extracts the correct coordinates and never silently falls back to default Hooghly coordinates.
2. **Defensive Response Adapter (`adaptNasaResponse`)**:
   - In `src/lib/api/nasa.ts`, `adaptNasaResponse()` inspects both flattened keys (`temp_min`, `temp_max`, `rainfall_30d`, `soil_moisture`) and nested Pydantic response structures (`summary.min_temperature`, `summary.average_temperature`, `data` time-series aggregation).
   - If the backend returns un-binned daily observations, the frontend automatically groups the 30-day time-series into 10 three-day precipitation bins for the GPM chart.
3. **Graceful Fallback Mode**:
   - If the FastAPI backend is offline, times out (20s timeout), or returns an unexpected HTTP error code, `fetchSatelliteSnapshot` catches the error and provides `mockSnapshot` calibrated with realistic agro-meteorological values for uninterrupted user testing.

