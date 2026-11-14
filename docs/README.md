# AgriShift AI — Technical Documentation Index

**System Name:** AgriShift AI: NASA-Powered Smart Agriculture and Crop Planning Platform  
**Target Pilot Region:** Hooghly District, West Bengal, India (Lower Gangetic Plains, New Alluvial Zone WB-4)  
**System Architecture:** Stateless Python/FastAPI Microservice (Phase 1–6 Complete)  
**Latest Verification Status:** **100% Passed (92 of 92 Automated Tests)**  
**Interactive API Documentation:** [Swagger UI (http://127.0.0.1:8000/docs)](http://127.0.0.1:8000/docs) | [ReDoc (http://127.0.0.1:8000/redoc)](http://127.0.0.1:8000/redoc)

---

## 1. Documentation Map & Quick Links

This directory contains the complete technical, operational, and agronomic documentation for the AgriShift AI backend:

| Document | Primary Audience | Description |
|---|---|---|
| [API Documentation](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/API_DOCUMENTATION.md) | **Frontend Developers** | Complete API specification: all 10 endpoints, HTTP methods, Pydantic schemas, sample requests/responses, status codes, and error payloads. |
| [Backend Setup Guide](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/BACKEND_SETUP.md) | **Backend / DevOps Engineers** | Step-by-step local Windows installation, virtual environment setup (`.venv`), environment variable configuration (`.env`), Uvicorn execution, and test commands. |
| [Data Pipeline Architecture](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/DATA_PIPELINE.md) | **Data / ML Engineers** | In-depth breakdown of Phase 5: Earth observation retrieval, sentinel `-999` sanitization, temporal alignment, rainfall harmonization, and agricultural indicator formulas. |
| [Crop Rules Reference](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/CROP_RULES_REFERENCE.md) | **Agronomists & Developers** | Complete catalog of all 8 supported crops, 100-point scoring breakdown, rotational constraints, monoculture penalties, limitations, and ICAR/BCKV literature citations. |
| [Agronomic Validation Report](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/AGRONOMIC_VALIDATION.md) | **Agronomists & QA Engineers** | Scientific validation of crop biological requirements, thermal ceilings, water budgets, next-season inference, missing-data safeguards, and regulatory disclaimers. |
| [Final Backend Audit](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/FINAL_BACKEND_AUDIT.md) | **Technical Leads & Stakeholders** | Comprehensive 14-point audit scorecard (PASS / PARTIAL ratings), live execution latency benchmarks, test results, and known limitations. |
| [Architecture Overview](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/ARCHITECTURE.md) | **System Architects** | High-level system architecture, component interaction flow, directory structure, and technological stack. |
| [Product Requirements Document (PRD)](file:///c:/Users/Aftab%20Hossain/Desktop/Agrishhift%20AI/docs/PRD.md) | **Product Managers** | Business objectives, regional farmer pain points, user stories, acceptance criteria, and system requirements. |

---

## 2. Project Overview & System Philosophy

Smallholder farmers in Hooghly face rising climate volatility: shifting monsoon timings, terminal heat stress, groundwater depletion from summer boro paddy, and severe financial vulnerability to potato late blight epidemics.

AgriShift AI bridges the gap between spaceborne Earth observation data and local farm decision-making:
1. **Stateless & Scalable:** Zero database dependency; farm plots and satellite data are processed in-memory per request with sub-second computation times.
2. **Transparent 100-Point Deterministic Engine:** No unexplainable machine learning black boxes; every point in the 100-point score is traceable to physical soil, thermal, moisture, or rotational parameters.
3. **NASA Remote Sensing Synthesis:** Integrates daily agro-climatology (NASA POWER), satellite soil moisture (NASA SMAP assimilated Catchment L4), and high-resolution precipitation (NASA GPM IMERG).
4. **Resilient Data Integrity:** Enforces single-source rainfall attribution (strictly prohibiting double-counting), converts `-999` sentinels to `null` (never synthetic zeros), and falls back seamlessly to NASA POWER precipitation when Earthdata GPM authentication is unavailable.
5. **Ethical Agronomic Advisory:** Does not present suitability scores as probabilities, never guarantees yields or financial profits, and communicates missing environmental data transparently.

---

## 3. High-Level Data Flow

```
                      [ Farmer / Web Frontend UI ]
                                   │
              POST /api/v1/agriculture/recommendations
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │                   AGRISHIFT AI FASTAPI BACKEND                    │
 ├───────────────────────────────────────────────────────────────────┤
 │ 1. Farmer Profile Validation:                                     │
 │    - Validates village, coordinates, soil, standing crop, acreage │
 │    - Inters intended next season (e.g. Kharif -> Rabi)            │
 ├───────────────────────────────────────────────────────────────────┤
 │ 2. Phase 5 Multi-Source Earth Observation Pipeline:               │
 │    - NASA POWER: Air Temp (T2M), RH (RH2M), Solar (ALLSKY_SFC_SW) │
 │    - NASA SMAP: Surface (0-5cm) & Root-zone (0-100cm) wetness     │
 │    - NASA GPM IMERG: CMR granule indexing (with POWER fallback)   │
 │    - Sentinel sanitization, range checks, zero double-counting    │
 │    - Computes thermal trends, consecutive dry days, water stress  │
 ├───────────────────────────────────────────────────────────────────┤
 │ 3. Phase 6 Intelligent Crop Recommendation Engine:                │
 │    - Evaluates 8 crops against 100-point ICAR/BCKV rubric         │
 │    - Penalizes monoculture & disease carryover (e.g. Solanaceae)  │
 │    - Applies missing-data safeguards (caps at Conditionally Suitable│
 │    - Ranks Top 3 crops with reasons, risks, water advice & limits │
 └───────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
             Structured JSON Response with Top 3 Ranked Crops
```

---

## 4. Supported Crops (Hooghly District, West Bengal)

| Crop ID | Crop Name | Botanical Name | Optimal Season | Water Need | Mandatory Irrigation | Institutional Source |
|---|---|---|:---:|:---:|:---:|---|
| `potato` | **Potato** | *Solanum tuberosum* | Rabi | Medium (350–500 mm) | **Yes** | ICAR-CPRI Shimla |
| `mustard` | **Mustard / Rapeseed** | *Brassica juncea* | Rabi | Low (200–350 mm) | No | ICAR-DRMR Bharatpur |
| `paddy_aman`| **Paddy (Aman)** | *Oryza sativa* | Kharif | Very High (1100–1500 mm) | No (Rainfed) | ICAR-NRRI Cuttack |
| `boro_rice` | **Boro Rice (Summer)** | *Oryza sativa* | Boro | Very High (1200–1500 mm) | **Yes** | ICAR-NRRI Cuttack |
| `jute` | **Jute (Tossa)** | *Corchorus olitorius* | Zaid | Med-High (500–800 mm) | No | ICAR-CRIJAF Barrackpore |
| `sesame` | **Sesame / Til** | *Sesamum indicum* | Zaid | Low (150–250 mm) | No | ICAR-IIOR Hyderabad |
| `lentil` | **Lentil / Masoor** | *Lens culinaris* | Rabi | Low (150–250 mm) | No | ICAR-IIPR Kanpur |
| `maize` | **Maize (Corn)** | *Zea mays* | Rabi/Kharif | Medium (400–600 mm) | **Yes** (in Rabi) | ICAR-IIMR Ludhiana |

---

## 5. Development & Contribution Standards

- **Virtual Environment:** Always run commands using `.venv\Scripts\python` or `.venv\Scripts\pytest`.
- **Automated Testing:** Run `pytest tests/ -v` before committing any code; all 92 tests must pass.
- **Contract Stability:** Do not modify existing API route paths or response schemas without updating `docs/API_DOCUMENTATION.md` and consulting frontend developers.
- **Security:** Never place secrets, passwords, or machine-specific absolute paths in version-controlled documentation or code.
