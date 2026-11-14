# AgriShift AI: Phase 5 Data Processing & Agricultural Indicator Pipeline

**Pipeline Module:** `app/services/data_processor.py`, `data_cleaner.py`, `data_integrator.py`, `indicator_calculator.py`  
**Purpose:** Cleans, standardizes, harmonizes, and synthesizes multi-source NASA Earth observation data with farmer profile characteristics to compute scientifically sound agricultural indicators.

---

## 1. Architectural Overview of Phase 5 Pipeline

```
  [ Farmer Profile ]         [ NASA POWER ]          [ NASA SMAP ]         [ NASA GPM IMERG ]
 (Singur: Lat/Lon/Soil)   (Temp, RH, Solar, Rain)   (0-5cm & 0-100cm)      (CMR / OPeNDAP)
           │                         │                      │                      │
           ▼                         ▼                      ▼                      ▼
    ┌──────────────────────────────────────────────────────────────────────────────────┐
    │                        STAGE 1: DATA CLEANING & VALIDATION                       │
    │  - Sentinel Sanitization: -999.0 / -9999.0 fill values replaced with null        │
    │  - Range Sanity Checks: Physical bounds filtering (Temp: -50..60°C, RH: 0..100%)│
    │  - Duplicate Date Deduplication & Calendar Validation                            │
    └──────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
    ┌──────────────────────────────────────────────────────────────────────────────────┐
    │                      STAGE 2: TEMPORAL & SPATIAL INTEGRATION                     │
    │  - Calendar Date Harmonization: Continuous ISO YYYY-MM-DD time series alignment   │
    │  - Rainfall Harmonization: STRICT single-source attribution; zero double-counting│
    │  - Provenance Tracking: Tracks exact data source for every environmental record   │
    └──────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
    ┌──────────────────────────────────────────────────────────────────────────────────┐
    │                    STAGE 3: AGRICULTURAL INDICATOR CALCULATIONS                  │
    │  - Thermal Metrics: Mean, Min, Max, and Warming/Cooling trends                   │
    │  - Hydrological Metrics: Total rain, consecutive dry days, dry spell diagnosis   │
    │  - Soil Wetness & Water Stress: Root-zone fraction & ICAR water-stress category   │
    │  - Data Quality Audit: Completeness percentage across all 6 physical dimensions  │
    └──────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
                   [ Synthesized Environmental Output for Recommendation Engine ]
```

---

## 2. Stage 1: Data Cleaning & Sanitization (`data_cleaner.py`)

Raw spaceborne datasets and climate models frequently contain sentinel fill values indicating sensor outages, orbital gaps, or clouds.

### 2.1 Sentinel Detection & Null Preservation
* **Rule:** NASA standard missing indicators (`-999.0`, `-999`, `-9999.0`, and values $\le -900.0$) are converted to `None` (`null`).
* **Critical Principle:** Missing values are **never replaced with artificial `0.0`**. Fabricating zero values would mislead agricultural algorithms into diagnosing freezing temperatures ($0.0^\circ\text{C}$) or severe drought ($0.0\text{ mm}$ rain).

### 2.2 Physical Range Sanity Checks
Every parameter is strictly bounded against physical and meteorological limits:

| Parameter | Unit | Valid Minimum | Valid Maximum | Out-of-Bounds Action |
|---|:---:|:---:|:---:|---|
| **Ambient Temperature (`T2M`)** | °C | $-50.0$ | $+60.0$ | Flagged; converted to `null` |
| **Precipitation (`PRECTOTCORR`)** | mm/day | $0.0$ | $500.0$ | Extreme values ($>250\text{ mm}$) flagged with deluge alert |
| **Relative Humidity (`RH2M`)** | % | $0.0$ | $100.0$ | Clamped to $0.0 - 100.0$ |
| **Solar Radiation (`ALLSKY_SFC_SW_DWN`)** | $\text{kWh/m}^2/\text{day}$ | $0.0$ | $15.0$ | Out-of-bounds flagged |
| **Surface Soil Wetness (`GWETTOP`)** | fraction | $0.0$ | $1.0$ | Clamped to $0.0 - 1.0$ |
| **Root-zone Soil Wetness (`GWETROOT`)** | fraction | $0.0$ | $1.0$ | Clamped to $0.0 - 1.0$ |

---

## 3. Stage 2: Temporal Integration & Rainfall Harmonization (`data_integrator.py`)

### 3.1 Continuous Date Grid Alignment
The integrator constructs a continuous date grid from `start_date` to `end_date` using standard ISO `YYYY-MM-DD` formatting. Observations from NASA POWER, SMAP, and GPM are mapped into unified daily record slots.

### 3.2 Strict Prevention of Rainfall Double-Counting
Both NASA POWER and NASA GPM IMERG provide precipitation estimates. Summing both values would artificially double the apparent rainfall, misleading soil moisture and crop water balances.

* **Harmonization Strategy:**
  1. If `preferred_source == "NASA GPM IMERG"`:
     * If GPM observation is present and valid ($\ge 0.0$ mm), use GPM (`source: "NASA GPM IMERG"`).
     * If GPM observation is `None` (e.g. OPeNDAP auth failure or latency), fall back to NASA POWER (`source: "NASA POWER (Fallback)"`).
  2. If `preferred_source == "NASA POWER"` (Default):
     * Use NASA POWER (`source: "NASA POWER"`).
     * If POWER observation is `None`, fall back to GPM (`source: "NASA GPM IMERG (Fallback)"`).
  3. If both sources are `None`, record as `None` (`source: "None (Missing)"`).

---

## 4. Stage 3: Agricultural Indicator Calculations (`indicator_calculator.py`)

### 4.1 Temperature Indicators
- **Mean Temperature:** $\mu_T = \frac{1}{N}\sum T_i$
- **Extremes:** $T_{\min} = \min(T_i)$, $T_{\max} = \max(T_i)$
- **Thermal Trend Direction:** Compares the mean of the first half of the window ($\mu_1$) with the second half ($\mu_2$):
  * If $\mu_2 > \mu_1 + 1.0^\circ\text{C}$: `"warming"`
  * If $\mu_2 < \mu_1 - 1.0^\circ\text{C}$: `"cooling"`
  * Otherwise: `"stable"`

### 4.2 Rainfall & Dry-Spell Indicators
- **Rainy Day Threshold:** Any calendar day with precipitation $\ge 1.0\text{ mm}$.
- **Dry Day Threshold:** Any calendar day with precipitation $< 1.0\text{ mm}$.
- **Heavy Rain Day:** Any calendar day with precipitation $\ge 35.0\text{ mm}$.
- **Consecutive Dry Days:** Maximum continuous sequence of dry days ($<1.0\text{ mm}$) terminating at the end of the analysis period.
- **Rainfall Trend:**
  * If total rainfall is $0.0\text{ mm}$ across the period: `"dry_spell"`.
  * If second half rainfall $> 1.25 \times$ first half: `"increasing"`.
  * If second half rainfall $< 0.75 \times$ first half: `"decreasing"`.
  * Otherwise: `"steady"`.

### 4.3 Soil Wetness & Agronomic Water Stress Classification
Root-zone soil wetness fraction ($GWETROOT$, $0.0 - 1.0$) from the NASA GMAO Catchment model is classified into agronomic categories:

| Wetness Fraction ($GWETROOT$) | Percentage | Agronomic Classification | Management Guidance |
|---|:---:|---|---|
| $\ge 0.85$ | $\ge 85\%$ | **Excess Moisture / Waterlogged** | Aeration stress; root rot risk for sensitive crops; surface drainage required. |
| $0.70 - 0.84$ | $70 - 84\%$ | **High Moisture / Near Saturation** | Favorable for wet paddy; avoid sowing potato or sesame until moisture recedes. |
| $0.40 - 0.69$ | $40 - 69\%$ | **Optimal / Adequate Moisture** | Ideal profile moisture; favorable for sowing, root development, and nutrient uptake. |
| $0.25 - 0.39$ | $25 - 39\%$ | **Mild to Moderate Moisture Deficit** | Soil moisture is depleting; schedule irrigation for high-water-demand crops. |
| $< 0.25$ | $< 25\%$ | **Severe Water Stress / Drought** | Approaches permanent wilting point; immediate life-saving irrigation required. |

---

## 5. Stage 4: Data Quality & Completeness Audit

Every pipeline response includes an audited data quality section:
```json
{
  "total_days_evaluated": 30,
  "complete_observation_days": 29,
  "overall_completeness_percentage": 96.7,
  "parameter_completeness": {
    "temperature_days": 30,
    "precipitation_days": 30,
    "humidity_days": 30,
    "solar_radiation_days": 30,
    "smap_surface_moisture_days": 29,
    "smap_rootzone_moisture_days": 29
  },
  "quality_flags_detected": [],
  "duplicate_dates_resolved": 0
}
```

* **Reliability Gating:** If `overall_completeness_percentage < 30.0%`, the pipeline halts subsequent crop recommendation synthesis to prevent speculative or unverified advisory generation.
