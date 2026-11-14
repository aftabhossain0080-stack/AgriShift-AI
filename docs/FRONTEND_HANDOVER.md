# Frontend Developer Handover Guide
## AgriShift AI: NASA-Powered Smart Agriculture & Crop Planning Platform

---

### Welcome to AgriShift AI!
This handover guide has been prepared specifically for you as the frontend developer taking over the client-side implementation of **AgriShift AI**.

The backend is **100% complete, fully tested (77/77 passing automated tests), and currently operational**. It handles all external NASA satellite ingestion, data cleaning, sentinel handling (`-999.0`), double-counting prevention, agricultural indicator calculations, and institutional crop recommendation scoring.

**Your mission:** Build a modern, intuitive, responsive, and trustworthy frontend interface that transforms these backend API responses into clear visual decision support for farmers and agricultural advisors in Hooghly, West Bengal.

---

## 1. Golden Architectural Rules

Before you start, please memorize these two non-negotiable rules:

> [!CAUTION]
> **RULE 1: NEVER calculate agricultural indicators in the frontend.**
> All mathematical formulas, consecutive dry-day aggregations, water-stress classifications, and suitability scores are calculated deterministically by the backend. The frontend is strictly a presentation and intake layer.

> [!CAUTION]
> **RULE 2: NEVER hardcode or fabricate NASA data or crop recommendations.**
> If satellite data is unavailable or missing, render the backend's explicit `"Insufficient Data"` or `null` indicators. Never replace missing values with synthetic numbers or zeros.

---

## 2. Quickstart: Connecting to the Backend

### 2.1 Backend Local Address & Swagger Docs
* **Backend Base URL:** `http://127.0.0.1:8000`
* **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **OpenAPI Specification:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

### 2.2 How to Verify the Backend is Running
Open your browser or run this terminal command:
```bash
curl -X GET "http://127.0.0.1:8000/health"
```
You should see:
```json
{
  "status": "healthy",
  "environment": "development",
  "target_region": {
    "name": "Hooghly, West Bengal, India",
    "default_latitude": 22.9,
    "default_longitude": 88.4
  }
}
```

### 2.3 Starting the Backend (If Stopped)
If the backend server is ever stopped, open PowerShell in the project root and run:
```powershell
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 3. Recommended Frontend Technology Stack

You are completely free to choose your preferred frontend framework. We strongly recommend:

* **Framework:** **React 18+ / Next.js 14 (App Router)** or **Vue 3 / Nuxt** (Streamlit is also supported if you prefer pure Python).
* **Styling:** **Tailwind CSS** with Lucide Icons.
* **Charts & Gauges:** **Plotly.js**, **Recharts**, or **Chart.js**.
* **HTTP Client:** **Axios** or native `fetch` wrapped in a typed API client.
* **State Management:** **TanStack React Query** (ideal for caching NASA responses and loading skeletons).

### Recommended Visual Palette (Earth & Agriculture Theme)
* Primary Brand Green: `#1E5128` (Forest / Agriculture)
* Vibrant Accent Green: `#4E9F3D` (Healthy Crop / High Suitability)
* Warm Gold / Amber: `#D4A373` / `#E9C46A` (Harvest / Moderate Suitability / Solar)
* Soft Earth Cream: `#FAEDCD` / `#F4F1DE` (Card Backgrounds)
* Deep Slate Dark: `#191A19` (High Contrast Text for Rural Sunlight)
* Alert / Risk Coral: `#E76F51` (Late Blight / Waterlogging Alert)

---

## 4. Suggested Frontend Folder Structure

```text
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios / fetch instance (baseURL: http://127.0.0.1:8000)
│   │   ├── farmer.ts             # Farmer profile endpoints
│   │   ├── nasa.ts               # NASA POWER, SMAP, GPM endpoints
│   │   └── recommendations.ts    # Advisory & processing endpoints
│   ├── components/
│   │   ├── common/               # Header, Footer, Navbar, LoadingSkeleton, MetricCard
│   │   ├── charts/               # TemperatureChart, RainfallBar, SoilMoistureGauge
│   │   ├── farmer/               # FarmerProfileForm
│   │   └── recommendations/      # CropRecommendationCard, ScoreBadge, RiskAlert
│   ├── pages/ (or app/)
│   │   ├── landing/              # Hero & overview
│   │   ├── farmer-profile/       # Farmer input form
│   │   ├── dashboard/            # High-level regional overview
│   │   ├── environmental/        # Detailed NASA satellite analysis
│   │   ├── processing/           # Phase 5 pipeline execution view
│   │   └── recommendations/      # Top 3 ranked crop recommendations
│   ├── types/                    # TypeScript interfaces matching backend schemas
│   └── utils/                    # Date formatters, unit formatters (°C, mm, %)
├── .env.local                    # NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
├── package.json
└── tailwind.config.js
```

---

## 5. Page-by-Page Specification

### Page 1: Landing Page (Project Overview & Value)
* **Goal:** Introduce the platform to farmers, agronomists, and stakeholders.
* **Key Components:**
  * Hero Section: "NASA-Powered Smart Agriculture & Crop Planning for Hooghly".
  * 3 Key Value Cards:
    1. *Spaceborne Climate Insights* (NASA POWER, SMAP, GPM).
    2. *Agro-Ecological Indicator Engine* (Dry spells, water stress, soil moisture).
    3. *Institutional Crop Advisory* (ICAR & BCKV validated recommendations).
  * "Get Started" CTA button routing to `/farmer-profile`.
* **API Calls:** `GET /health` (Shows green "Backend Operational" status badge).

---

### Page 2: Farmer Profile & Plot Intake
* **Goal:** Collect accurate plot characteristics from the farmer.
* **Key Components:**
  * Interactive Form with default values for Hooghly:
    * `village`: Text input (Default: `"Singur"`).
    * `latitude`: Number input (Default: `22.81`, range: `-90` to `90`).
    * `longitude`: Number input (Default: `88.23`, range: `-180` to `180`).
    * `land_area_acres`: Number input (Default: `2.5`, min: `0.1`).
    * `soil_type`: Dropdown (`"Alluvial"`, `"Clay Loam"`, `"Loamy"`, `"Sandy Loam"`).
    * `irrigation_available`: Toggle / Switch (`true` / `false`).
    * `current_crop`: Dropdown or searchable text (`"Potato"`, `"Paddy (Aman)"`, `"Jute"`, `"Mustard"`, `"Maize"`).
    * `previous_crop`: Dropdown (`"Paddy (Aman)"`, `"Jute"`, `"Potato"`, `"Sesame"`).
    * `farming_season`: Dropdown (`"Rabi"`, `"Kharif"`, `"Boro"`, `"Zaid"`).
  * "Save & Analyze Farm" button.
* **API Calls:** `POST /api/v1/farmer/profile`
* **Handling Errors:** If response is `422`, unpack the `detail` array and display errors next to the exact input field.

---

### Page 3: Main Dashboard (Overview & Regional Snapshot)
* **Goal:** Immediate high-level snapshot after profile submission.
* **Key Components:**
  * Farmer Summary Banner: "Plot in Singur, Hooghly (2.5 Acres, Alluvial Soil, Assured Irrigation)".
  * Metric Cards Grid:
    * Mean Temperature (from NASA POWER).
    * Total Rainfall (from NASA POWER/GPM).
    * Root-Zone Soil Moisture % (from NASA SMAP).
    * Water-Stress Status Pill: e.g. `Optimal (Favorable Soil Moisture)` in green.
  * Quick Action: "Generate Next-Season Crop Advisory" button.
* **API Calls:** `GET /api/v1/nasa/power/summary?latitude=22.81&longitude=88.23` and `GET /api/v1/nasa/smap/summary?latitude=22.81&longitude=88.23`.

---

### Page 4: NASA Environmental Analysis
* **Goal:** Detailed interactive charts for agricultural advisors and researchers.
* **Key Components:**
  * Date Range Filter (Default: Last 30 available days).
  * Line Chart: Daily Air Temperature (`temperature` in °C).
  * Bar Chart: Daily Rainfall (`precipitation` in mm/day).
  * Line Chart: Surface vs. Root-Zone Soil Moisture (`surface_soil_moisture_percent` vs `rootzone_soil_moisture_percent`).
  * Solar Radiation Card: Average daily irradiance in kWh/m²/day.
* **API Calls:**
  * `GET /api/v1/nasa/power?latitude={lat}&longitude={lon}&start_date={s}&end_date={e}`
  * `GET /api/v1/nasa/smap/summary?latitude={lat}&longitude={lon}`

---

### Page 5: Agricultural Processing Pipeline (Phase 5)
* **Goal:** Visual transparency showing how raw satellite data was cleaned and integrated.
* **Key Components:**
  * Processing Status Banner: e.g. `Completed (100% Data Completeness)`.
  * Harmonization Notice: "Rainfall harmonized via NASA POWER (single source attribution; zero double-counting)".
  * Dry Spells Metric: "Max 5 Consecutive Dry Days | Total 5 Dry Days".
  * Quality Flags Drawer: Displays any extreme heat (>42°C) or deluge (>100mm) alerts.
* **API Calls:** `POST /api/v1/agriculture/process`

---

### Page 6: Intelligent Crop Recommendations (Phase 6)
* **Goal:** The core deliverable for the farmer. Displays ranked suitable crops for next season.
* **Key Components:**
  * Top 3 Ranked Recommendation Cards:
    * **Rank Badge:** `#1 Top Recommended`, `#2 Highly Suitable`, `#3 Feasible Alternative`.
    * **Crop Name & Botanical Family:** e.g. "Mustard / Rapeseed (*Brassica juncea*)".
    * **Suitability Score Gauge:** e.g. `92.0 / 100` (circular or progress bar).
    * **Water Needs Tag:** `Low`, `Medium`, or `High` water footprint.
    * **Duration:** e.g. `100 - 115 days`.
    * **Popular Bengal Varieties:** e.g. `B-9 (Binoy), Sarama, Pusa Bold`.
    * **Why This Crop? (Agronomic Reasons):** Bullet list of scientific justifications.
    * **Risks & Mitigation Advice:** e.g. "Aphid risk during cloudy winter spells".
    * **Crop Rotation Alert:** Highlights if potato-potato monocropping was avoided.
  * Disclaimer Footer: Institutional credit to ICAR & BCKV guidelines.
* **API Calls:** `POST /api/v1/agriculture/recommendations`

---

### Page 7: Data Quality & Provenance
* **Goal:** Full scientific auditability.
* **Key Components:**
  * Table of Satellite Sources:
    * NASA POWER: 0.5° × 0.625° daily meteorology.
    * NASA SMAP: Level-4 Catchment Land Surface Model.
    * NASA GPM: 0.1° × 0.1° IMERG constellation precipitation.
  * Observation Completeness meter (0% to 100%).
* **API Calls:** Data extracted from `sources` block in `/api/v1/agriculture/process`.

---

## 6. UI States & Error Handling Contract

To ensure a resilient user experience in rural connectivity environments, your UI should support 4 distinct states:

| UI State | What the User Sees | Trigger Condition |
|---|---|---|
| **1. Loading State** | Skeleton card loaders with animated pulse, and text: *"Querying NASA spaceborne observations..."* | Immediately upon submitting form or date filter. |
| **2. Success State** | Cleanly rendered charts, metrics, and ranked crop cards. | HTTP `200 OK` from backend. |
| **3. Validation Error State** | Red highlights under the invalid input with exact backend message (e.g. *"Land area must be greater than 0"*). | HTTP `422 Unprocessable Entity`. Unpack `response.data.detail`. |
| **4. Upstream Gateway Error** | Friendly banner: *"NASA satellite servers are taking longer than usual. Would you like to retry?"* with a **Retry** button. | HTTP `502 Bad Gateway` (Upstream timeout). |

---

## 7. Step-by-Step Development Sequence

We recommend building the frontend in this order:

1. **Step 1: Setup & API Client (`Day 1`)**
   * Initialize your project (Next.js / React / Vue).
   * Create `src/api/client.ts` pointing to `http://127.0.0.1:8000`.
   * Test `/health` to verify client-backend communication.
2. **Step 2: Farmer Profile Form (`Day 2`)**
   * Build the form with Hooghly default coordinates (`22.81`, `88.23`).
   * Connect to `POST /api/v1/farmer/profile`. Verify validation error handling.
3. **Step 3: Recommendation Cards (`Day 3`)**
   * Connect to `POST /api/v1/agriculture/recommendations`.
   * Render the Top 3 crop cards with suitability score badges, varieties, and agronomic reasons.
4. **Step 4: Environmental Visualizations (`Day 4`)**
   * Build the temperature, rainfall, and soil moisture charts using Plotly or Recharts.
   * Connect to `GET /api/v1/nasa/power` and `GET /api/v1/nasa/smap/summary`.
5. **Step 5: Polish & Responsive Design (`Day 5`)**
   * Test on mobile viewports (smartphones used by extension workers).
   * Refine loading skeletons and error dialogs.

---

## 8. Definition of Done (Frontend Acceptance Criteria)

* [ ] Farmer profile form validates all required fields before submission.
* [ ] Top 3 crop recommendations render with suitability score, popular varieties, and rotation warnings.
* [ ] Environmental charts display temperature, precipitation, and soil moisture without throwing console errors.
* [ ] Missing or null observations from NASA are displayed gracefully as `"N/A"` or `"Insufficient Data"` (never as artificial zeros).
* [ ] Form input errors from backend HTTP 422 are displayed clearly to the user.
* [ ] UI is responsive across desktop, tablet, and mobile screens.
* [ ] No agricultural scoring or calculations are performed in frontend code.

---

*Good luck building the frontend! All backend endpoints are tested, live, and waiting for your connection.*