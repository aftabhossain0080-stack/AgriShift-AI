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
│   │   └── recommendations.py      # Recommendation endpoints
│   │
│   ├── services/                   # Business logic and external connectors
│   │   ├── nasa_power.py           # NASA POWER API client
│   │   ├── nasa_gpm.py             # NASA GPM IMERG client
│   │   ├── nasa_smap.py            # NASA SMAP client
│   │   ├── data_processor.py       # Pandas/NumPy analytics pipeline
│   │   └── recommendation_engine.py# Transparent agronomic recommendation rules
│   │
│   ├── schemas/                    # Pydantic data schemas
│   │   ├── farmer.py               # Input models for farmer and land data
│   │   └── recommendation.py       # Output models for advisory responses
│   │
│   ├── utils/                      # Utilities & configuration
│   │   └── config.py               # App configuration & .env loader
│   │
│   └── __init__.py
│
├── data/                           # Local cache and raw satellite payloads
├── tests/                          # Automated unit and integration tests
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore configuration
├── requirements.txt                # Python package dependencies
└── README.md                       # Project documentation
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
