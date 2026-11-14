import json
import os
import sys
import time

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

results = []

def run_test(name, method, url, **kwargs):
    t0 = time.time()
    try:
        if method == "GET":
            resp = client.get(url, **kwargs)
        else:
            resp = client.post(url, **kwargs)
        dur = round(time.time() - t0, 3)
        status = "PASS" if resp.status_code in (200, 201) else "FAIL"
        results.append({
            "name": name,
            "method": method,
            "url": url,
            "status_code": resp.status_code,
            "status": status,
            "latency": dur,
            "data": resp.json() if resp.headers.get("content-type", "").startswith("application/json") else resp.text[:200]
        })
        print(f"[{status}] {method} {url} -> {resp.status_code} ({dur}s)")
    except Exception as e:
        results.append({
            "name": name,
            "method": method,
            "url": url,
            "status": "ERROR",
            "error": str(e)
        })
        print(f"[ERROR] {method} {url} -> {e}")

print("=== STARTING FULL BACKEND INTEGRATION TEST SUITE ===")

# 1. Health & Root
run_test("Root Endpoint", "GET", "/")
run_test("Health Endpoint", "GET", "/health")

# 2. Farmer Profile
farmer_payload = {
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
run_test("Farmer Profile Valid", "POST", "/api/v1/farmer/profile", json=farmer_payload)

# Farmer Profile Invalid
inv_farmer = dict(farmer_payload, latitude=150.0)
r_inv = client.post("/api/v1/farmer/profile", json=inv_farmer)
assert r_inv.status_code == 422
print("[PASS] Farmer Profile Invalid Lat -> 422 Unprocessable Entity")

# 3. NASA POWER (Live call)
run_test("NASA POWER Live", "GET", "/api/v1/nasa/power", params={
    "latitude": 22.90, "longitude": 88.40, "start_date": "2024-01-01", "end_date": "2024-01-03"
})

# 4. NASA SMAP (Live call)
run_test("NASA SMAP Live", "GET", "/api/v1/nasa/smap/summary", params={
    "latitude": 22.90, "longitude": 88.40, "start_date": "2024-01-01", "end_date": "2024-01-03"
})

# 5. NASA GPM (Live CMR call)
run_test("NASA GPM CMR Summary", "GET", "/api/v1/nasa/gpm/summary", params={
    "latitude": 22.90, "longitude": 88.40, "start_date": "2024-01-01", "end_date": "2024-01-02"
})

# 6. Agriculture Process (Phase 5 Live integration)
agri_payload = {
    "farmer_profile": farmer_payload,
    "start_date": "2024-01-01",
    "end_date": "2024-01-03",
    "preferred_rainfall_source": "NASA POWER",
    "include_daily_records": True
}
run_test("Agriculture Process Live", "POST", "/api/v1/agriculture/process", json=agri_payload)

# 7. Crop Recommendations (Phase 6 Live synthesis)
rec_payload = {
    "farmer_profile": farmer_payload,
    "target_farming_season": "Rabi",
    "start_date": "2024-01-01",
    "end_date": "2024-01-03",
    "preferred_rainfall_source": "NASA POWER"
}
run_test("Crop Recommendations Live", "POST", "/api/v1/agriculture/recommendations", json=rec_payload)

# 8. Recommendations Status
run_test("Recommendations Status", "GET", "/api/v1/recommendations/status")

# 9. OpenAPI Docs
run_test("OpenAPI Schema", "GET", "/openapi.json")

print("\n=== SUMMARY OF LIVE VERIFICATION ===")
for r in results:
    lat = f"in {r.get('latency')}s" if 'latency' in r else ""
    print(f"- {r['name']}: {r['status']} ({r.get('status_code', 'N/A')}) {lat}")

with open("scratch/live_verification_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, default=str)
print("Saved full verification results to scratch/live_verification_results.json")
