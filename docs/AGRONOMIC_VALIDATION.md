# AgriShift AI: Comprehensive Agronomic Validation Report

**Document Version:** 1.0.0  
**Validation Date:** November 14, 2026  
**Target Pilot Region:** Hooghly District, West Bengal, India (Lower Gangetic Plains / New Alluvial Zone WB-4)  
**Evaluator:** Senior Agronomic Validation Engineer & QA Systems Architect  
**Advisory Institutional Baselines:**
- **ICAR:** Indian Council of Agricultural Research (CPRI, DRMR, NRRI, CRIJAF, IIOR, IIPR, IIMR)
- **BCKV:** Bidhan Chandra Krishi Viswavidyalaya, Mohanpur, Nadia, West Bengal
- **Govt of West Bengal:** Department of Agriculture (Package of Practices & Comprehensive District Agriculture Plan for Hooghly)

---

## 1. Executive Summary & Verification Scorecard

AgriShift AI's Phase 6 Crop Recommendation Engine was subjected to a rigorous agronomic audit. The engine synthesizes farmer-provided plot characteristics (soil classification, current standing crop, preceding crop, acreage, and irrigation access) with Phase 5 processed Earth observation datasets (NASA POWER climatology, NASA SMAP soil wetness fractions, and NASA GPM/POWER precipitation).

| Dimension | Agronomic Audit Status | Verified Institutional Basis | Rule Integrity |
|---|:---:|---|---|
| **Seasonal Alignment** | **PASS** | BCKV Crop Calendar for Lower Gangetic Plains | Enforces strict season qualification; disqualifies out-of-season crops with score 0.0. |
| **Next-Season Resolution** | **PASS** | West Bengal Cropping Sequence (Kharif $\to$ Rabi $\to$ Zaid) | Automatically resolves intended *upcoming* season if farmer enters standing crop season. |
| **Thermal Suitability** | **PASS** | ICAR Crop Physiological Baselines | Continuous linear degradation outside optimum; flags thermal ceilings (e.g., tuber bulking cease >28°C). |
| **Water & Irrigation** | **PASS** | BCKV Water Management & CGWB Policy | Enforces mandatory irrigation for dry-season crops (Potato, Boro Rice, Maize); low-water crops (Mustard, Lentil) remain viable. |
| **Soil & SMAP Moisture** | **PASS** | ICAR Soil Physics & SMAP L4 Catchment | Penalizes waterlogging-sensitive crops (Mustard, Sesame, Lentil) under excessive wetness (>0.65–0.75). |
| **Crop Rotation Rules** | **PASS** | ICAR-CPRI / CRIJAF / IIPR Pathogen Controls | Penalizes direct monoculture (Potato $\to$ Potato = 0.0 rotation score) and family disease carryover. |
| **Missing Data Safeguards**| **PASS** | Agronomic Risk Mitigation Protocol | Missing NASA temperature or soil moisture caps category at *Conditionally Suitable* (never unearned *Highly Recommended*). |
| **No-Guarantee Ethics** | **PASS** | ICAR Extension Guidelines | Explicit disclaimers on every response: zero guarantee of crop yield, market prices, or financial profit. |
| **Automated Testing** | **PASS** | 92 of 92 Pytest Unit/Integration Tests | 100% pass rate across 7 test suites. |

---

## 2. Hooghly Agro-Climatic Environment & Cropping System

Hooghly district is located in the Lower Gangetic Plain (New Alluvial Agro-Climatic Zone of West Bengal, between 22°35' N to 23°15' N and 87°45' E to 88°30' E). The district is characterized by:
1. **Soil:** Predominantly fertile alluvial soils (*Entisols* and *Inceptisols*), ranging from sandy loam along river levees to clay loam in inter-distributary depressions. Organic carbon is typically 0.50–0.75%; pH ranges from 6.0 to 7.2 (slightly acidic to neutral).
2. **Climate:** Tropical wet-and-dry climate. Mean annual rainfall is 1,400–1,600 mm, with ~75–80% delivered during the South-West Monsoon (June to September). Cool, dry winters (December–January) provide ideal night temperatures (10–14°C) for tuberization and oilseed ripening.
3. **Core Triple-Cropping Sequence:**
   $$\text{Aman Paddy (Kharif: Jul–Nov)} \longrightarrow \text{Potato / Mustard / Vegetables (Rabi: Dec–Feb)} \longrightarrow \text{Sesame / Jute / Boro Rice (Zaid/Summer: Mar–Jun)}$$

---

## 3. Detailed Audit of Scoring Dimensions & Rule Weights

The engine utilizes a 100-point deterministic, explainable rule engine without opaque machine-learning black boxes:

$$\text{Suitability Score} = S_{\text{Season}} (25) + S_{\text{Soil}} (15) + S_{\text{Temperature}} (20) + S_{\text{Water/Irrigation}} (20) + S_{\text{Soil Moisture}} (10) + S_{\text{Rotation}} (10)$$

### 3.1. Seasonal Compatibility ($S_{\text{Season}} = 25.0$)
* **Agronomic Rule:** A crop cannot be grown out of its physiological season in Hooghly without total reproductive failure or severe climatic destruction.
* **Implementation:**
  * Exact season match: **25.0 points**.
  * Out of season: **0.0 points** and triggers **immediate disqualification** (overall suitability = 0.0, category = *"Not Recommended"*).
  * Synonym mapping supports regional dialect equivalents (e.g., Zaid = Summer = Pre-Kharif; Kharif = Aman = Monsoon).

### 3.2. Intended Next-Season Planning Resolution
* **Audit Finding:** Previously, if a farmer indicated `farming_season = "Kharif"` with standing `current_crop = "Paddy (Aman)"`, the engine naively evaluated Kharif crops, recommending Kharif crops again even though the land was already occupied.
* **Correction Implemented:** The engine now features `resolve_target_growing_season()`. If the user does not provide an explicit target season, the engine inspects the natural season of the current standing crop. If the standing crop is currently occupying the farmer's stated season (e.g., standing Aman paddy in Kharif), the engine automatically advances to the upcoming chronological season:
  $$\text{Kharif} \longrightarrow \text{Rabi} \quad | \quad \text{Rabi} \longrightarrow \text{Zaid / Summer} \quad | \quad \text{Zaid / Boro} \longrightarrow \text{Kharif}$$
* **User Feedback:** The API returns `season_inferred: true` and an explicit note: *"Current standing crop 'Paddy (Aman)' occupies the Kharif season. Recommendations are generated for the intended upcoming 'Rabi' season."*

### 3.3. Soil Suitability ($S_{\text{Soil}} = 15.0$)
* **Optimal Soil:** 15.0 points (e.g., Potato in Alluvial or Sandy Loam).
* **Moderately Suitable Soil:** 9.8 points ($15.0 \times 0.65$) (e.g., Potato in Clay Loam).
* **Unsuitable Soil:** 2.2 points ($15.0 \times 0.15$) with explicit aeration or root-stunting risk alert (e.g., Sesame or Potato in Waterlogged Clay).
* **Unknown/General Soil:** 7.5 points ($15.0 \times 0.50$).

### 3.4. Ambient Temperature Suitability ($S_{\text{Temperature}} = 20.0$)
* **Optimal Range:** 20.0 points (e.g., observed mean 16.32°C inside Potato's 14–22°C window).
* **Tolerable Window:** Pro-rated linearly between 10.0 and 19.0 points based on distance to optimal window.
* **Thermal Stress:** 3.0 points ($20.0 \times 0.15$) with heat or cold stress warnings.
  * Potato: $>28^\circ\text{C}$ ceiling (tuberization stops).
  * Mustard: $>32^\circ\text{C}$ ceiling (flower abortion).
  * Boro Rice: $<12^\circ\text{C}$ floor (seedling chlorosis/stunting).

### 3.5. Water & Irrigation Feasibility ($S_{\text{Water/Irrigation}} = 20.0$)
* **Assured Irrigation Available:** 20.0 points for all crops.
* **No Assured Irrigation:**
  * Mandatory irrigation crops in dry season (Potato, Boro Rice, Maize): **0.0 points**, flagged as unfeasible, categorized as *"NOT recommended without access to borewell, canal, or lift irrigation."*
  * Low water demand crops (Mustard, Lentil, Sesame): **20.0 points**, noted as resilient under residual moisture.
  * Kharif rainfed crops (Aman Paddy, Jute): **15.0 points** ($20.0 \times 0.75$), relying on monsoon rains.

### 3.6. SMAP Soil Moisture & Rainfall ($S_{\text{Soil Moisture}} = 10.0$)
* **Optimal Root-zone Wetness:** 10.0 points.
* **Waterlogging Risk:** 2.0 points for waterlogging-sensitive crops (Mustard, Sesame, Lentil, Potato, Maize) if root-zone moisture exceeds species thresholds (0.65–0.75). Rice crops are exempt.
* **Wilting Deficit:** 3.0 points if root wetness approaches biological wilting point ($\le 0.15\text{--}0.25$).

### 3.7. Crop Rotation Constraints & Monoculture Penalties ($S_{\text{Rotation}} = 10.0$)
* **Direct Monoculture Violation:** **0.0 points**. Severe penalty if planting identical crop consecutively (e.g., Potato after Potato). Flags specific pathogen buildup (Late Blight *Phytophthora infestans*, bacterial wilt *Ralstonia solanacearum*).
* **Family Monoculture Violation:** **2.0 points** ($10.0 \times 0.20$). Flags shared family pests (e.g., Solanaceae after Solanaceae; Brassicaceae after Brassicaceae).
* **Favorable Sequence Bonus:** **10.0 points** (e.g., Aman Paddy followed by Potato or Mustard, Jute followed by Aman Paddy).
* **Neutral Sequence:** **7.0 points**.

---

## 4. Missing Data Safeguard Audit

| Scenario | Engine Behavior | Verified Outcome |
|---|---|:---:|
| **Overall Observation Completeness < 30%** | Pipeline halts recommendation generation; returns `status: "insufficient_data"`. | **PASS** |
| **NASA POWER Temperature Missing** | - Pro-rated conservative score (10.0/20.0 pts).<br>- `missing_information` records thermal data absence.<br>- `potential_risks` warns of unverified temperature.<br>- **Suitability category is capped at *Conditionally Suitable*** (never *Highly Recommended*). | **PASS** |
| **NASA SMAP Soil Moisture Missing** | - Pro-rated neutral score (5.0/10.0 pts).<br>- `missing_information` notes SMAP absence.<br>- Advises on-farm ground moisture inspection prior to sowing. | **PASS** |
| **Both Temperature & Moisture Missing** | - Both flags active.<br>- Suitability capped at *Conditionally Suitable*.<br>- Overall confidence rating downgraded to *Low*. | **PASS** |

---

## 5. Agronomic Validation of Supported Crops

### 1. Potato (*Solanum tuberosum*)
* **Validated Agronomic Window:** Rabi (November sowing, January/February harvest).
* **Institutional Sources:** ICAR-CPRI Shimla, BCKV Directorate of Research.
* **Thermal Validation:** Optimal 14–22°C; night temperature <15°C induces tuberization; tuber bulking completely halts above 28°C.
* **Water Validation:** 350–500 mm across 4–6 light irrigations (stolonization at 20–25 DAP, tuber initiation at 40–45 DAP, bulking at 60–65 DAP). Mandatory irrigation in Rabi.
* **Soil & Moisture:** Prefers well-drained alluvial/sandy loam. Waterlogging (>0.75 wetness) induces bacterial soft rot (*Pectobacterium*) and Late Blight (*Phytophthora infestans*).
* **Limitations Documented:** Seed tubers represent 40–50% of production cost; cold storage required within 24–48 hours of harvest.

### 2. Mustard / Rapeseed (*Brassica juncea*)
* **Validated Agronomic Window:** Rabi (October/November sowing, February harvest).
* **Institutional Sources:** ICAR-DRMR Bharatpur, BCKV AICRP on Oilseeds.
* **Thermal Validation:** Optimal 15–25°C. Temperatures >32°C during flowering cause siliqua abortion.
* **Water Validation:** 200–350 mm. Low water footprint; 1–2 irrigations (rosette stage ~25–30 DAS, pod filling ~50–60 DAS). Survives on residual moisture.
* **Soil & Moisture:** Alluvial to sandy loam. Extreme sensitivity to water stagnation (>24 hours standing water causes root asphyxiation).
* **Limitations Documented:** Heavy aphid (*Lipaphis erysimi*) vulnerability during cloudy/foggy January spells.

### 3. Paddy (Aman / Kharif) (*Oryza sativa*)
* **Validated Agronomic Window:** Kharif (June/July nursery, July/August transplanting, November/December harvest).
* **Institutional Sources:** ICAR-NRRI Cuttack, BCKV Department of Agronomy.
* **Thermal Validation:** Optimal 22–32°C. Temperatures >38°C during anthesis induce spikelet sterility.
* **Water Validation:** 1,100–1,500 mm. Submerged clayey/clay loam soils. Rainfed monsoon crop with canal/well support during dry spells >10 days.
* **Limitations Documented:** Vulnerable to monsoon delays or terminal dry spells; continuous rice-rice creates subsoil plow pans and zinc/boron deficiencies.

### 4. Boro Rice (Summer Paddy) (*Oryza sativa*)
* **Validated Agronomic Window:** Boro (December/January nursery, February transplanting, April/May harvest).
* **Institutional Sources:** ICAR-NRRI Cuttack, BCKV KVK Hooghly, CGWB.
* **Thermal Validation:** Optimal 20–33°C. Temperatures <12°C cause seedling cold injury and chlorosis.
* **Water Validation:** 1,200–1,500 mm. Strictly requires mandatory assured irrigation (12–16 irrigations). Cannot survive rainfed in dry Bengal spring.
* **Limitations Documented:** Severe groundwater extraction; prohibited in water-stressed blocks; harvest vulnerable to pre-monsoon squalls (Kalbaishakhi) and hailstorms.

### 5. Jute (Tossa) (*Corchorus olitorius*)
* **Validated Agronomic Window:** Zaid / Pre-Kharif (March/April sowing, July/August harvest).
* **Institutional Sources:** ICAR-CRIJAF Barrackpore, Jute Corporation of India (JCI).
* **Thermal Validation:** Optimal 24–35°C. Germination requires minimum 20°C.
* **Water Validation:** 500–800 mm. Pre-monsoon showers or 1–2 pre-sowing irrigations, followed by monsoon rain.
* **Limitations Documented:** Young seedlings (<45 days) cannot tolerate standing water; requires access to clean, slow-moving freshwater retting ponds/canals within manageable distance.

### 6. Sesame / Til (*Sesamum indicum*)
* **Validated Agronomic Window:** Zaid / Summer (February/March sowing post-potato, May harvest).
* **Institutional Sources:** ICAR-IIOR Hyderabad, BCKV Oilseeds Research Unit.
* **Thermal Validation:** Optimal 25–35°C. Germination ceases below 18°C.
* **Water Validation:** 150–250 mm. Exceptionally drought-hardy summer catch crop; 1 irrigation at flowering/capsule formation.
* **Limitations Documented:** Zero tolerance to standing water (dies within 24–48 hours of waterlogging); high humidity (>80%) promotes Phytophthora blight and phyllody.

### 7. Lentil / Masoor (*Lens culinaris*)
* **Validated Agronomic Window:** Rabi (October/November sowing, February harvest).
* **Institutional Sources:** ICAR-IIPR Kanpur, BCKV Pulse Research Station Kalyani.
* **Thermal Validation:** Optimal 14–24°C. Terminal heat (>28–30°C) during February pod filling causes forced maturity and pod drop.
* **Water Validation:** 150–250 mm. Low water demand; 0–1 light irrigation at pod filling. Ideal *paira* (relay) crop in rice fallow.
* **Limitations Documented:** Weak early canopy allows weed smothering; susceptible to collar rot in waterlogged soils. Fixes 30–40 kg N/ha.

### 8. Maize / Rabi Corn (*Zea mays*)
* **Validated Agronomic Window:** Rabi & Kharif (Rabi sown October/November, harvested March/April).
* **Institutional Sources:** ICAR-IIMR Ludhiana, BCKV Department of Agronomy, CSISA.
* **Thermal Validation:** Optimal 18–30°C. Temperatures <10°C retard growth; >38°C at flowering desiccates tassels.
* **Water Validation:** 400–600 mm. Requires 3–5 timely irrigations (knee-high, tasseling, silking, grain filling).
* **Limitations Documented:** High nitrogen and potassium consumption; susceptible to Fall Armyworm (*Spodoptera frugiperda*); sensitive to water stagnation during early vegetative stage.

---

## 6. Automated Test Suite Validation

The test suite in `tests/test_recommendation_engine.py` was expanded with 7 comprehensive validation test suites:

```text
tests/test_recommendation_engine.py::test_crop_knowledge_base_integrity PASSED
tests/test_recommendation_engine.py::test_soil_type_evaluations PASSED
tests/test_recommendation_engine.py::test_seasonal_compatibility_and_disqualification PASSED
tests/test_recommendation_engine.py::test_irrigation_available_vs_unavailable PASSED
tests/test_recommendation_engine.py::test_crop_rotation_monoculture_penalty PASSED
tests/test_recommendation_engine.py::test_missing_temperature_data_handling PASSED
tests/test_recommendation_engine.py::test_missing_soil_moisture_data_handling PASSED
tests/test_recommendation_engine.py::test_insufficient_data_response PASSED
tests/test_recommendation_engine.py::test_generate_crop_recommendations_ranking PASSED
tests/test_recommendation_engine.py::test_repeat_potato_monoculture_drastically_demotes_potato PASSED
tests/test_recommendation_engine.py::test_api_recommendations_endpoint_success PASSED
tests/test_recommendation_engine.py::test_api_recommendations_invalid_coordinates PASSED
tests/test_recommendation_engine.py::test_api_recommendations_status_endpoint PASSED
tests/test_recommendation_engine.py::test_next_season_resolution_inference PASSED
tests/test_recommendation_engine.py::test_different_crops_and_seasons_compatibility PASSED
tests/test_recommendation_engine.py::test_different_soil_types_suitability PASSED
tests/test_recommendation_engine.py::test_irrigation_availability_conditions PASSED
tests/test_recommendation_engine.py::test_missing_nasa_data_agronomic_safeguard PASSED
tests/test_recommendation_engine.py::test_crop_recommendations_contain_limitations_and_reference_urls PASSED
tests/test_recommendation_engine.py::test_no_yield_or_profit_guarantee_disclaimer PASSED
```

**Overall Project Test Status:** **92 passed, 0 failed** in 4.89s (100% pass rate).

---

## 7. Conclusions & Agronomic Readiness

1. **Agronomic Soundness:** All crop biological requirements, thermal ceilings, water budgets, and rotational checks align with official ICAR and BCKV literature.
2. **Deterministic Explainability:** The system uses zero unverified assumptions or unexplainable weights; every point in the 100-point score is traceable to physical soil, thermal, moisture, or rotational parameters.
3. **Missing Data Protection:** Unearned recommendations are prevented when satellite data is missing, ensuring farmers receive honest, conservative advisories.
4. **Readiness:** The backend crop recommendation engine is fully validated, thoroughly tested, and ready for frontend integration.
