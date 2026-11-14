# AgriShift AI — NASA-Powered Smart Agriculture Backend

AgriShift AI is a Python-based FastAPI backend engineered to deliver data-backed crop selection, irrigation planning, crop rotation, and agricultural risk mitigation for smallholder farmers in Hooghly, West Bengal, India.

The system synthesizes NASA Earth Observation datasets:
- **NASA POWER:** Surface air temperature, solar radiation, relative humidity, and precipitation.
- **NASA GPM IMERG:** Global precipitation measurement satellite constellation data.
- **NASA SMAP:** Soil Moisture Active Passive satellite surface and root-zone soil water indicators.

---

## Architecture Overview

```text
agrishift-ai/
│
├── app/
│   ├── main.py                     # Application entrypoint & FastAPI instance
│   │
│   ├── api/                        # API route controllers
│   │   ├── nasa.py                 # NASA Earth Observation endpoints
│   │   ├── farmer.py               # Farmer input intake endpoints
│   │   ├── agriculture.py          # Phase 5 processing endpoints
│   │   └── recommendations.py      # Phase 6 recommendation endpoints
│   │
│   ├── services/                   # Business logic and external connectors
│   │   ├── nasa_power.py           # NASA POWER API client
│   │   ├── nasa_gpm.py             # NASA GPM IMERG client & fallback
│   │   ├── nasa_smap.py            # NASA SMAP soil moisture client
│   │   ├── data_cleaner.py         # Sentinel (-999) sanitization
│   │   ├── data_integrator.py      # Date alignment & rainfall harmonization
│   │   ├── indicator_calculator.py # Agricultural indicator formulas
│   │   ├── data_processor.py       # Phase 5 pipeline orchestrator
│   │   ├── crop_knowledge_base.py  # 8-crop ICAR/BCKV agronomic knowledge base
│   │   └── recommendation_engine.py# 100-point transparent scoring engine
│   │
│   ├── schemas/                    # Pydantic v2 data schemas
│   │   ├── farmer.py               # Input models for farmer and land data
│   │   ├── nasa.py                 # Earth Observation schemas
│   │   ├── agriculture.py          # Processing pipeline schemas
│   │   └── recommendation.py       # Advisory output schemas
│   │
│   ├── utils/                      # Utilities & configuration
│   │   └── config.py               # App configuration & .env loader
│   │
│   └── __init__.py
│
├── docs/                           # Comprehensive Documentation Suite (See docs/README.md)
├── data/                           # Local cache and raw satellite payloads
├── tests/                          # Automated Pytest suite (92 tests, 100% pass)
├── .env.example                    # Environment variable template with placeholders
├── .gitignore                      # Git ignore configuration
├── requirements.txt                # Python package dependencies
└── README.md                       # Project overview and quickstart instructions
```

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Virtual environment support

### 2. Setup Virtual Environment
```bash
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to `.env` and fill in optional NASA Earthdata credentials:
```bash
copy .env.example .env
```

### 5. Run Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Verify Endpoints
- **Root Info:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
