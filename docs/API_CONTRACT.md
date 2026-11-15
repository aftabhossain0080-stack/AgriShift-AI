# AgriShift AI : API Contract

## Overview
AgriShift AI connects a Next.js 14 frontend to an existing FastAPI backend (`aftabhossain0080-stack/AgriShift-AI`) that ingests NASA Earth observation data (POWER, SMAP Level-4, GPM IMERG) and produces explainable agricultural recommendations for smallholders in Hooghly District, West Bengal.

---

## Base URL Configuration
Configured via `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (defaults to `http://localhost:8000`).
Mock fallback is controlled by `NEXT_PUBLIC_USE_MOCKS=true`.

---

## Client Architecture (`src/lib/api/client.ts`)
All HTTP communication is handled by `apiFetch<T>`:
- **Timeout**: 10,000ms default via `AbortController`.
- **Automatic Retry**: Up to 2 retries on transient network failures with 500ms backoff. Does not retry 4xx or 5xx application errors.
- **Error Typing**: Throws `ApiError` with `status`, `code`, and human-readable `detail`.
- **Headers**: Automatically injects `Content-Type: application/json` and `Accept: application/json`.

---

## Adapters Layer (`src/lib/api/adapters.ts`)
**Single Source of Transformation**: If the FastAPI backend updates field naming, nesting, or data structures, changes must be absorbed strictly within `src/lib/api/adapters.ts` and `src/lib/api/schema.d.ts`. UI components depend only on frontend domain contracts defined in `src/lib/types.ts`.

Key functions:
- `adaptRecommendationResponse(raw, input)`: Normalizes FastAPI recommendations, environmental summaries, and score breakdowns to the UI contract.
- `adaptCropList(raw)`: Maps backend crop catalog arrays into `SupportedCrop[]`.

---

## Endpoint Groups

### 1. Recommendations Router (`src/lib/api/recommendations.ts`)
- **Primary Endpoint**: `POST /api/v1/agriculture/recommendations`
- **Fallback Endpoint**: `POST /api/v1/recommendations/generate`
- **Status Endpoint**: `GET /api/v1/recommendations/status`
- **Request Payload**: `CropRecommendationRequest`
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
- **Response**: `RecommendationResponse` with `top_crops` (100-point transparent score breakdown), `indicators` (NASA POWER, SMAP, GPM IMERG readings), `irrigation_summary`, `risks`, and `rotation_advice`.
- **Resilience**: When unreachable or timeout occurs, gracefully returns validated ICAR/BCKV agronomic data marked with `is_mock: true`.

### 2. Farmer Router (`src/lib/api/farmer.ts`)
- **Submit Profile**: `POST /api/v1/farmer/profile`
- **Crops Catalog**: `GET /api/v1/farmer/crops` (falls back to local knowledge catalog if offline)
- **Service Status**: `GET /api/v1/farmer/status`

### 3. NASA Earth Observation Router (`src/lib/api/nasa.ts`)
- **NASA POWER Daily**: `GET /api/v1/nasa/power?latitude=22.81&longitude=88.23`
- **NASA POWER Summary**: `GET /api/v1/nasa/power/summary`
- **NASA GPM IMERG**: `GET /api/v1/nasa/gpm/summary`
- **NASA SMAP Level-4**: `GET /api/v1/nasa/smap/summary`
- **NASA Services Status**: `GET /api/v1/nasa/status`

### 4. Agriculture Processing Pipeline (`src/lib/api/agriculture.ts`)
- **Process Data**: `POST /api/v1/agriculture/process` (Phase 5 pipeline for multi-source cleaning, sentinel handling, and rainfall harmonization)

---

## Mock Layer (`src/lib/api/mocks/index.ts`)
Realistic agronomic fixtures reflecting Hooghly agricultural realities (Singur, Polba-Dadpur, Haripal) aligned with ICAR and Bidhan Chandra Krishi Viswavidyalaya (BCKV) research.
Supported 8 crops:
1. Mustard (Rabi)
2. Lentil (Rabi)
3. Maize (Rabi, Kharif, Zaid)
4. Potato (Rabi)
5. Paddy Aman (Kharif)
6. Boro Rice (Boro/Rabi)
7. Jute (Zaid/Kharif)
8. Wheat (Rabi)
