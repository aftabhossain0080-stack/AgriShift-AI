# AgriShift AI: Crop Knowledge Base & Agronomic Rules Reference

**Target Agro-Climatic Zone:** Lower Gangetic Plain (New Alluvial Zone WB-4), Hooghly District, West Bengal, India  
**Cooperating Research Institutions:**
- ICAR-Central Potato Research Institute (CPRI), Shimla
- ICAR-Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur
- ICAR-National Rice Research Institute (NRRI), Cuttack
- ICAR-Central Research Institute for Jute and Allied Fibres (CRIJAF), Barrackpore
- ICAR-Indian Institute of Oilseeds Research (IIOR), Hyderabad
- ICAR-Indian Institute of Pulses Research (IIPR), Kanpur
- ICAR-Indian Institute of Maize Research (IIMR), Ludhiana
- Bidhan Chandra Krishi Viswavidyalaya (BCKV), Mohanpur, West Bengal
- Department of Agriculture, Government of West Bengal

---

## 1. 100-Point Agronomic Scoring Framework

The recommendation engine scores every candidate crop out of a deterministic 100-point rubric:

$$\text{Suitability Score} = S_{\text{Season}} + S_{\text{Soil}} + S_{\text{Temperature}} + S_{\text{Water/Irrigation}} + S_{\text{Soil Moisture}} + S_{\text{Rotation}}$$

| Dimension | Max Points | Evaluation Basis & Formulas |
|---|:---:|---|
| **Season ($S_{\text{Season}}$)** | **25.0** | Matching growing window = 25.0 pts. Out-of-season = 0.0 pts (immediate disqualification). |
| **Soil Type ($S_{\text{Soil}}$)** | **15.0** | Optimal soil = 15.0 pts; Moderate soil = 9.8 pts ($15 \times 0.65$); Unsuitable soil = 2.2 pts ($15 \times 0.15$); Unknown = 7.5 pts. |
| **Temperature ($S_{\text{Temperature}}$)** | **20.0** | Observed mean inside $[T_{\text{opt\_min}}, T_{\text{opt\_max}}] = 20.0$ pts. Linear degradation between tolerable and optimal boundaries. Exceeding tolerable ceiling/floor = 3.0 pts ($20 \times 0.15$). Missing = 10.0 pts (category capped at Conditionally Suitable). |
| **Water & Irrigation ($S_{\text{Water/Irrigation}}$)** | **20.0** | Assured irrigation = 20.0 pts. No irrigation: Mandatory crops in dry season = 0.0 pts (disqualified); Low-demand crops = 20.0 pts; Monsoon rainfed crops = 15.0 pts; Moderate demand in dry season = 7.0 pts. |
| **Soil Moisture ($S_{\text{Soil Moisture}}$)** | **10.0** | SMAP root-zone wetness inside $[SM_{\text{opt\_min}}, SM_{\text{opt\_max}}] = 10.0$ pts. Exceeding waterlogging threshold in sensitive crops = 2.0 pts. Sub-wilting point = 3.0 pts. Missing = 5.0 pts (advisory note added). |
| **Crop Rotation ($S_{\text{Rotation}}$)** | **10.0** | Favorable sequence = 10.0 pts; Neutral sequence = 7.0 pts; Family monoculture = 2.0 pts; Direct monoculture = 0.0 pts (severe pathogen build-up alert). |

### Suitability Categorization
- **$\ge 80.0$ pts:** Highly Recommended
- **$65.0 - 79.9$ pts:** Moderately Recommended
- **$50.0 - 64.9$ pts:** Conditionally Suitable
- **$< 50.0$ pts:** Not Recommended

> [!IMPORTANT]
> **Missing Data Safeguard:** If satellite temperature data or SMAP soil moisture data is absent, the suitability category is automatically **capped at *Conditionally Suitable*** (even if the numerical score exceeds 80), preventing unearned recommendations.

---

## 2. Crop Knowledge Profiles

### 1. Potato (*Solanum tuberosum*)
* **Family:** Solanaceae
* **Bengali Name:** আলু (Alu)
* **Popular Varieties:** Kufri Jyoti, Kufri Chandramukhi, Kufri Pukhraj, Kufri Pokhraj, Kufri Himalini
* **Suitable Seasons:** Rabi (Winter)
* **Optimal Soils:** Alluvial, Sandy Loam, Well-drained Loamy (pH 5.5–6.5)
* **Moderately Suitable Soils:** Clay Loam, Silt Loam
* **Unsuitable Soils:** Heavy Waterlogged Clay, Highly Saline
* **Thermal Thresholds:**
  * Optimal: $14.0^\circ\text{C} - 22.0^\circ\text{C}$
  * Tolerable: $8.0^\circ\text{C} - 28.0^\circ\text{C}$
  * **Critical Physiological Ceiling:** $>28.0^\circ\text{C}$ (Tuber bulking completely ceases; excessive haulm elongation)
* **Water & Irrigation:**
  * Category: Medium ($350 - 500\text{ mm}$)
  * Mandatory Irrigation: **True** (Cannot be grown rainfed in dry Rabi)
  * Recommended Irrigations: 4–6 light irrigations (stolonization at 20–25 DAP, tuber initiation at 40–45 DAP, bulking at 60–65 DAP)
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.45 - 0.65$
  * Waterlogging Risk: $\ge 0.75$ (Induces bacterial soft rot and blackleg)
  * Wilting Threshold: $\le 0.30$
* **Relative Humidity:**
  * Optimal: $60 - 80\%$
  * Disease Alert: $>85\%$ RH combined with cool nights ($10-20^\circ\text{C}$) triggers Late Blight (*Phytophthora infestans*) alert
* **Rotation Dynamics:**
  * Favorable Preceding: Paddy (Aman), Rice, Jute, Maize
  * Unfavorable Preceding: Potato, Tomato, Brinjal, Chilli (Solanaceous carryover)
  * Recommended Follow-up: Sesame (Til), Boro Rice, Summer Moong, Jute
* **Operational Limitations:**
  * High seed tuber investment (~40–50% of total cash outlay).
  * Cold storage accommodation required within 24–48 hours post-harvest.
* **Institutional Citations & Reference URLs:**
  * ICAR-Central Potato Research Institute (CPRI): [https://cpri.icar.gov.in](https://cpri.icar.gov.in)
  * BCKV Directorate of Research: [https://bckv.edu.in](https://bckv.edu.in)
  * Department of Agriculture, Govt of West Bengal: [https://matirkatha.gov.in](https://matirkatha.gov.in)

---

### 2. Mustard / Rapeseed (*Brassica juncea*)
* **Family:** Brassicaceae
* **Bengali Name:** সরিষা (Sarisha)
* **Popular Varieties:** B-9 (Binoy), Sarama, Pusa Bold, Sita, Sanjukta
* **Suitable Seasons:** Rabi (Winter)
* **Optimal Soils:** Alluvial, Sandy Loam, Loamy
* **Moderately Suitable Soils:** Clay Loam, Silt Loam
* **Unsuitable Soils:** Waterlogged Clay, Highly Saline
* **Thermal Thresholds:**
  * Optimal: $15.0^\circ\text{C} - 25.0^\circ\text{C}$
  * Tolerable: $8.0^\circ\text{C} - 30.0^\circ\text{C}$
  * **Critical Physiological Ceiling:** $>32.0^\circ\text{C}$ (Flowering desiccation and pod abortion)
* **Water & Irrigation:**
  * Category: Low ($200 - 350\text{ mm}$)
  * Mandatory Irrigation: **False** (Can survive on residual soil moisture post-Aman rice)
  * Recommended Irrigations: 1–2 irrigations (rosette stage at 25–30 DAS, pod filling at 50–60 DAS)
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.35 - 0.55$
  * Waterlogging Risk: $\ge 0.70$ (Standing water $>24$ hrs causes irreversible root chlorosis)
  * Wilting Threshold: $\le 0.20$
* **Relative Humidity:**
  * Optimal: $50 - 75\%$
  * Disease Alert: $>80\%$ RH promotes mustard aphid (*Lipaphis erysimi*) infestation and Alternaria leaf blight
* **Rotation Dynamics:**
  * Favorable Preceding: Paddy (Aman), Rice, Jute, Maize
  * Unfavorable Preceding: Mustard, Cabbage, Cauliflower, Radish (Brassicaceae carryover)
  * Recommended Follow-up: Sesame, Boro Rice, Summer Pulses, Jute
* **Operational Limitations:**
  * Aphid epidemics during cloudy spells in January require prompt scouting.
  * Zero tolerance to soil water stagnation; requires positive surface drainage.
* **Institutional Citations & Reference URLs:**
  * ICAR-Directorate of Rapeseed-Mustard Research (DRMR): [https://www.drmr.res.in](https://www.drmr.res.in)
  * BCKV AICRP on Oilseeds: [https://bckv.edu.in](https://bckv.edu.in)
  * Department of Agriculture, Govt of West Bengal: [https://matirkatha.gov.in](https://matirkatha.gov.in)

---

### 3. Paddy (Aman / Kharif) (*Oryza sativa*)
* **Family:** Poaceae
* **Bengali Name:** আমন ধান (Aman Dhan)
* **Popular Varieties:** Swarna (MTU-7029), Swarna Sub-1, Pooja, Pratikhya, Gobindobhog
* **Suitable Seasons:** Kharif (Monsoon)
* **Optimal Soils:** Clayey, Clay Loam, Deep Alluvial
* **Moderately Suitable Soils:** Loamy, Silt Loam
* **Unsuitable Soils:** Porous Coarse Sand, Highly Leached Gravelly
* **Thermal Thresholds:**
  * Optimal: $22.0^\circ\text{C} - 32.0^\circ\text{C}$
  * Tolerable: $18.0^\circ\text{C} - 38.0^\circ\text{C}$
  * **Critical Physiological Ceiling:** $>38.0^\circ\text{C}$ (Spikelet sterility during anthesis)
* **Water & Irrigation:**
  * Category: Very High ($1100 - 1500\text{ mm}$)
  * Mandatory Irrigation: **False** (Primary monsoon rainfed crop; supplemental canal/lift if dry spell $>10$ days)
  * Recommended Irrigations: 0 (monsoon dependent) + life-saving support at panicle initiation
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.60 - 0.95$ (Tolerates anaerobic submerged root profile)
  * Waterlogging Risk: $1.0$ (Flood-tolerant, particularly Swarna Sub-1)
  * Wilting Threshold: $\le 0.40$
* **Relative Humidity:**
  * Optimal: $70 - 95\%$
  * Disease Alert: $>92\%$ RH favors bacterial leaf blight and sheath blight
* **Rotation Dynamics:**
  * Favorable Preceding: Jute, Sesame, Summer Moong, Green Manure (*Sesbania aculeata* / Dhaincha)
  * Unfavorable Preceding: Continuous Boro Rice (rice-rice sequence exhausts micronutrients)
  * Recommended Follow-up: Potato, Mustard, Lentil, Wheat
* **Operational Limitations:**
  * Highly susceptible to delays in South-West Monsoon onset.
  * Dry spells exceeding 10 days at flowering cause unfilled grains without lift irrigation.
* **Institutional Citations & Reference URLs:**
  * ICAR-National Rice Research Institute (NRRI): [https://icar-nrri.gov.in](https://icar-nrri.gov.in)
  * BCKV Department of Agronomy: [https://bckv.edu.in](https://bckv.edu.in)
  * West Bengal State Agriculture Portal: [https://wb.gov.in](https://wb.gov.in)

---

### 4. Boro Rice (Summer Paddy) (*Oryza sativa*)
* **Family:** Poaceae
* **Bengali Name:** বোরো ধান (Boro Dhan)
* **Popular Varieties:** Shatabdi (IET-4786), IR-36, Lalat, Gotra Bidhan-1
* **Suitable Seasons:** Boro (Winter-Spring)
* **Optimal Soils:** Clayey, Clay Loam, Low-lying Alluvial Basins
* **Moderately Suitable Soils:** Loamy, Silt Loam
* **Unsuitable Soils:** Sandy Loam, Coarse Porous Soils (excessive percolation loss)
* **Thermal Thresholds:**
  * Optimal: $20.0^\circ\text{C} - 33.0^\circ\text{C}$
  * Tolerable: $14.0^\circ\text{C} - 38.0^\circ\text{C}$
  * **Critical Cold Floor:** $<12.0^\circ\text{C}$ (Severe nursery cold injury, stunting, and seedling mortality)
* **Water & Irrigation:**
  * Category: Very High ($1200 - 1500\text{ mm}$)
  * Mandatory Irrigation: **True** (Strictly requires assured tubewell or river-lift irrigation)
  * Recommended Irrigations: 12–16 irrigations (continuous shallow ponding of 2–5 cm)
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.65 - 0.95$
  * Wilting Threshold: $\le 0.45$
* **Rotation Dynamics:**
  * Favorable Preceding: Early Harvested Potato, Early Mustard, Short Vegetables
  * Unfavorable Preceding: Late Harvested Aman Paddy
  * Recommended Follow-up: Short-duration Pulses, Kharif Paddy, Dhaincha Green Manure
* **Operational Limitations & Environmental Policy:**
  * Extremely groundwater-intensive. Disapproved in blocks classified by CGWB as critical/semi-critical.
  * Pre-monsoon hailstorms and squalls (Kalbaishakhi) pose severe lodging risk in late April/May.
* **Institutional Citations & Reference URLs:**
  * ICAR-National Rice Research Institute (NRRI): [https://icar-nrri.gov.in](https://icar-nrri.gov.in)
  * BCKV Krishi Vigyan Kendra (KVK) Hooghly: [https://bckv.edu.in](https://bckv.edu.in)
  * Central Ground Water Board (CGWB): [https://cgwb.gov.in](https://cgwb.gov.in)

---

### 5. Jute (Tossa) (*Corchorus olitorius*)
* **Family:** Malvaceae
* **Bengali Name:** তোষা পাট (Tosha Pat)
* **Popular Varieties:** JRO-524 (Naveen), JRO-204 (Suren), JBO-2003H (Ira), Tarun
* **Suitable Seasons:** Zaid, Pre-Kharif
* **Optimal Soils:** Deep Alluvial, Loamy, Silt Loam
* **Moderately Suitable Soils:** Clay Loam, Sandy Loam
* **Unsuitable Soils:** Heavy Saline, Gravelly Sand, Stagnant Basins during germination
* **Thermal Thresholds:**
  * Optimal: $24.0^\circ\text{C} - 35.0^\circ\text{C}$
  * Tolerable: $18.0^\circ\text{C} - 40.0^\circ\text{C}$
  * **Germination Minimum:** $20.0^\circ\text{C}$
* **Water & Irrigation:**
  * Category: Medium-High ($500 - 800\text{ mm}$)
  * Mandatory Irrigation: **False** (Pre-monsoon showers or 1–2 pre-sowing irrigations; then monsoon rain)
  * Recommended Irrigations: 1–2 irrigations prior to regular monsoon
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.50 - 0.75$
  * Waterlogging Risk: $\ge 0.85$ (Young seedlings $<45$ days cannot tolerate standing water)
  * Wilting Threshold: $\le 0.35$
* **Rotation Dynamics:**
  * Favorable Preceding: Potato, Mustard, Winter Vegetables
  * Unfavorable Preceding: Jute, Kenaf, Mesta
  * Recommended Follow-up: Paddy (Aman), Rice
* **Operational Limitations:**
  * Retting requires accessible, slow-moving, clean freshwater ponds or canals.
  * Labor-intensive harvesting and fiber extraction.
* **Institutional Citations & Reference URLs:**
  * ICAR-Central Research Institute for Jute and Allied Fibres (CRIJAF): [https://crijaf.icar.gov.in](https://crijaf.icar.gov.in)
  * Jute Corporation of India (JCI): [https://www.jutecorp.in](https://www.jutecorp.in)

---

### 6. Sesame / Til (*Sesamum indicum*)
* **Family:** Pedaliaceae
* **Bengali Name:** তিল (Til)
* **Popular Varieties:** Rama (Til-1), Krishna, Savitri, Prachi
* **Suitable Seasons:** Zaid, Summer
* **Optimal Soils:** Well-drained Alluvial, Sandy Loam, Loamy
* **Moderately Suitable Soils:** Clay Loam, Silt Loam
* **Unsuitable Soils:** Waterlogged Heavy Clay, Saline Soils
* **Thermal Thresholds:**
  * Optimal: $25.0^\circ\text{C} - 35.0^\circ\text{C}$
  * Tolerable: $20.0^\circ\text{C} - 40.0^\circ\text{C}$
  * **Germination Floor:** $18.0^\circ\text{C}$
* **Water & Irrigation:**
  * Category: Low ($150 - 250\text{ mm}$)
  * Mandatory Irrigation: **False** (Highly drought-tolerant summer crop)
  * Recommended Irrigations: 1 irrigation (at flowering/capsule formation if severe dry spell occurs)
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.30 - 0.50$
  * **Waterlogging Vulnerability:** $\ge 0.65$ (**Fatal:** Standing water for 24–48 hours causes total crop mortality due to root hypoxia)
  * Wilting Threshold: $\le 0.15$
* **Rotation Dynamics:**
  * Favorable Preceding: Potato, Mustard, Winter Vegetables (Utilizes residual fertilizer post-potato)
  * Unfavorable Preceding: Sesame
  * Recommended Follow-up: Paddy (Aman)
* **Operational Limitations:**
  * Extreme vulnerability to water stagnation. Surface crusting in clay soils prevents seedling emergence.
* **Institutional Citations & Reference URLs:**
  * ICAR-Indian Institute of Oilseeds Research (IIOR): [https://icar-iior.org.in](https://icar-iior.org.in)
  * BCKV Oilseeds Research Unit: [https://bckv.edu.in](https://bckv.edu.in)

---

### 7. Lentil / Masoor (*Lens culinaris*)
* **Family:** Fabaceae
* **Bengali Name:** মসুর (Masoor)
* **Popular Varieties:** Maitree (WBL-77), Subrata (WBL-58), Moitree, KLS-218
* **Suitable Seasons:** Rabi (Winter)
* **Optimal Soils:** Alluvial, Clay Loam, Loamy (pH 6.0–7.5)
* **Moderately Suitable Soils:** Sandy Loam, Clayey
* **Unsuitable Soils:** Marshy Ill-Drained Soils, Acid Soils (pH $<5.5$)
* **Thermal Thresholds:**
  * Optimal: $14.0^\circ\text{C} - 24.0^\circ\text{C}$
  * Tolerable: $8.0^\circ\text{C} - 28.0^\circ\text{C}$
  * **Terminal Heat Ceiling:** $>28.0^\circ\text{C}$ (Forced maturity and pod drop during late February)
* **Water & Irrigation:**
  * Category: Low ($150 - 250\text{ mm}$)
  * Mandatory Irrigation: **False** (Commonly broadcast as relay/*paira* crop in standing Aman rice)
  * Recommended Irrigations: 0–1 light irrigation at pod filling
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.35 - 0.55$
  * Waterlogging Risk: $\ge 0.65$ (Vulnerable to Fusarium wilt and collar rot)
  * Wilting Threshold: $\le 0.20$
* **Rotation Dynamics:**
  * Favorable Preceding: Paddy (Aman), Rice, Jute
  * Unfavorable Preceding: Lentil, Chickpea, Pea (Legume root disease buildup)
  * Recommended Follow-up: Jute, Sesame, Boro Rice, Summer Maize
* **Soil Health Benefit:** Fixes $30 - 40\text{ kg N/ha}$ of biological nitrogen in the soil profile.
* **Operational Limitations:**
  * Slow initial growth makes it poor competitor against broadleaf winter weeds.
* **Institutional Citations & Reference URLs:**
  * ICAR-Indian Institute of Pulses Research (IIPR): [https://iipr.icar.gov.in](https://iipr.icar.gov.in)
  * BCKV Pulse Research Station, Kalyani: [https://bckv.edu.in](https://bckv.edu.in)
  * National Food Security Mission (NFSM) Pulses: [https://nfsm.gov.in](https://nfsm.gov.in)

---

### 8. Maize / Rabi Corn (*Zea mays*)
* **Family:** Poaceae
* **Bengali Name:** ভুট্টা (Bhutta)
* **Popular Varieties:** HQPM-1, PAC-740, Pusa HM-4, DeKalb 900M
* **Suitable Seasons:** Rabi & Kharif
* **Optimal Soils:** Fertile Alluvial, Sandy Loam, Well-drained Loamy
* **Moderately Suitable Soils:** Clay Loam, Silt Loam
* **Unsuitable Soils:** Ill-Drained Clay Basins, Saline Alkali Soils
* **Thermal Thresholds:**
  * Optimal: $18.0^\circ\text{C} - 30.0^\circ\text{C}$
  * Tolerable: $12.0^\circ\text{C} - 38.0^\circ\text{C}$
  * **Critical Heat Ceiling:** $>38.0^\circ\text{C}$ (Pollen desiccation during tasseling/silking)
* **Water & Irrigation:**
  * Category: Medium ($400 - 600\text{ mm}$)
  * Mandatory Irrigation: **True** in Rabi (Requires 3–5 timely irrigations)
  * Recommended Irrigations: 4 (knee-high at 30–35 DAS, tasseling at 55–60 DAS, silking at 65–70 DAS, grain filling at 80–85 DAS)
* **Soil Wetness (SMAP Fraction):**
  * Optimal: $0.45 - 0.65$
  * Waterlogging Risk: $\ge 0.75$ (Sensitive during first 30 days after sowing)
  * Wilting Threshold: $\le 0.25$
* **Rotation Dynamics:**
  * Favorable Preceding: Paddy (Aman), Rice, Jute, Summer Pulses
  * Unfavorable Preceding: Maize, Sorghum
  * Recommended Follow-up: Sesame, Summer Moong, Kharif Paddy
* **Operational Limitations:**
  * High fertilizer consumption (NPK: 120:60:60 kg/ha).
  * High vulnerability to Fall Armyworm (*Spodoptera frugiperda*); pheromone monitoring required.
* **Institutional Citations & Reference URLs:**
  * ICAR-Indian Institute of Maize Research (IIMR): [https://iimr.icar.gov.in](https://iimr.icar.gov.in)
  * BCKV Department of Agronomy: [https://bckv.edu.in](https://bckv.edu.in)
  * CSISA South Asia Hub: [https://csisa.org](https://csisa.org)

---

## 3. Disclaimers & Regulatory Transparency

1. **Advisory Scope:** AgriShift AI is an agro-climatic decision support tool. It uses remote sensing data from NASA Earth observations and agronomic rules established by ICAR and BCKV to assist next-season crop planning.
2. **No Yield or Profit Guarantees:** AgriShift AI **does NOT guarantee crop yield, financial profitability, or market sale prices**. Actual agricultural outcomes are determined by seed germination rates, fertilizer timing, localized pest outbreaks, and unpredicted micro-climatic weather events.
3. **On-Farm Ground Verification:** Farmers are strongly advised to inspect local soil moisture conditions, confirm seed availability, and consult local Krishi Prajukti Sahayaks (KPS) or Block Agricultural Officers (BAO) prior to making capital-intensive agricultural investments.
