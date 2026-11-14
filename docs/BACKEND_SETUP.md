# AgriShift AI: Backend Setup & Developer Environment Guide

**Operating System:** Windows 10 / 11 (PowerShell or Command Prompt)  
**Python Runtime:** Python 3.10 - 3.14  
**Framework:** FastAPI + Uvicorn + Pydantic v2  

---

## 1. Quick Start Guide (Windows)

### Step 1: Clone or Navigate to Project Directory
Open PowerShell and change directory into the project root:
```powershell
cd "c:\Users\Aftab Hossain\Desktop\Agrishhift AI"
```

### Step 2: Create & Activate Virtual Environment
If `.venv` is not already created:
```powershell
python -m venv .venv
```
Activate the virtual environment:
```powershell
.venv\Scripts\Activate.ps1
```
*(If script execution is disabled in PowerShell, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once).*

### Step 3: Install Required Dependencies
```powershell
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to create your root `.env` file:
```powershell
Copy-Item .env.example .env
```
Edit `.env` to configure your settings:
```ini
# AgriShift AI Application Configuration
APP_NAME=AgriShift AI
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=True
CORS_ORIGINS=*

# NASA Earthdata Authentication (optional for GPM OPeNDAP; NASA POWER and SMAP work without credentials)
EARTHDATA_USERNAME=your_earthdata_username
EARTHDATA_PASSWORD=your_earthdata_password

# Default Pilot Region (Hooghly, West Bengal, India)
DEFAULT_LATITUDE=22.90
DEFAULT_LONGITUDE=88.40
```

> [!NOTE]
> `.env` is registered in `.gitignore` and must **never** be committed to public version control.

---

## 2. Running the Backend Server

### Development Mode (with Live Reload)
To start Uvicorn with auto-reload whenever code changes:
```powershell
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Once started, the backend is accessible at:
* **API Root:** `http://127.0.0.1:8000/`
* **Health Check:** `http://127.0.0.1:8000/health`
* **Swagger UI (Interactive API Explorer):** `http://127.0.0.1:8000/docs`
* **ReDoc Reference:** `http://127.0.0.1:8000/redoc`
* **OpenAPI Specification:** `http://127.0.0.1:8000/openapi.json`

### Production Mode
For production or high-concurrency environments:
```powershell
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
Ensure `DEBUG=False` and `APP_ENV=production` are set in `.env` for production deployments.

---

## 3. Running Automated Tests

Run the complete automated test suite (92 tests) with Pytest:
```powershell
.venv\Scripts\pytest tests/ -v
```

To run a specific test suite:
```powershell
# Test Recommendation Engine
.venv\Scripts\pytest tests/test_recommendation_engine.py -v

# Test Data Processor & Cleaning Pipeline
.venv\Scripts\pytest tests/test_data_processor.py -v

# Test NASA Data Connectors
.venv\Scripts\pytest tests/test_nasa_power.py tests/test_nasa_smap.py tests/test_nasa_gpm.py -v
```

---

## 4. Frontend Integration & CORS Configuration

If your frontend is running on a development server (e.g., Vite on `http://localhost:5173` or Next.js on `http://localhost:3000`), the backend allows all origins by default (`*`).

For production environments, restrict CORS in `.env`:
```ini
CORS_ORIGINS=https://my-agrishift-app.vercel.app,http://localhost:3000
```

---

## 5. Troubleshooting & FAQ

### Issue: `401 Access Denied` on GPM OPeNDAP
* **Explanation:** NASA GES DISC requires Earthdata Login credentials with the *"NASA GESDISC DATA ARCHIVE"* application authorized under the user profile.
* **Backend Behavior:** The backend handles this gracefully and transparently: it sets `auth_status = "earthdata_auth_failed"`, preserves `precipitation: null` (never synthetic zeros), and automatically falls back to live NASA POWER precipitation (`PRECTOTCORR`).
* **Resolution:** Register at [https://urs.earthdata.nasa.gov](https://urs.earthdata.nasa.gov), authorize GES DISC under Authorized Apps, and update `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD` in `.env`.

### Issue: Port 8000 Already in Use
* Kill any hanging Python processes:
```powershell
Get-Process python | Stop-Process -Force
```
* Or start on a different port:
```powershell
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```
