"""Configurable Crop Knowledge Base for Hooghly, West Bengal, India.

All agronomic parameters (temperature, rainfall, soil suitability, water needs, and crop rotation)
are backed by reliable research institutions:
- ICAR: Indian Council of Agricultural Research (CPRI, CRIJAF, NRRI, DRMR, IIPR)
- BCKV: Bidhan Chandra Krishi Viswavidyalaya, Mohanpur, West Bengal
- Department of Agriculture, Government of West Bengal (Package of Practices)
"""
from typing import Any, Dict, List, Optional


CROP_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "potato": {
        "crop_id": "potato",
        "name": "Potato",
        "botanical_name": "Solanum tuberosum",
        "family": "Solanaceae",
        "popular_varieties": ["Kufri Jyoti", "Kufri Chandramukhi", "Kufri Pukhraj", "Kufri Pokhraj"],
        "suitable_seasons": ["Rabi"],
        "optimal_soils": ["Alluvial", "Sandy Loam", "Loamy"],
        "moderately_suitable_soils": ["Clay Loam", "Silt Loam"],
        "unsuitable_soils": ["Heavy Clay", "Saline", "Waterlogged Clay"],
        "temperature_celsius": {
            "optimal_min": 14.0,
            "optimal_max": 22.0,
            "tolerable_min": 8.0,
            "tolerable_max": 28.0,
            "tuberization_critical_max": 28.0,  # Tuber bulking ceases above 28°C
        },
        "rainfall_mm": {
            "optimal_min": 50.0,
            "optimal_max": 200.0,
            "excess_threshold": 300.0,  # Excess rain promotes Late Blight / rotting
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.45,
            "optimal_max": 0.65,
            "waterlogging_risk": 0.75,
            "wilting_risk": 0.30,
        },
        "relative_humidity_percent": {
            "optimal_min": 60.0,
            "optimal_max": 80.0,
            "disease_alert_threshold": 85.0,  # High RH + cool nights = Late Blight alert
        },
        "water_requirement_category": "Medium",
        "total_water_requirement_mm": "350 - 500 mm",
        "irrigation_mandatory": True,  # Cannot be grown rainfed in dry Rabi season
        "recommended_irrigations": 4,  # 4 to 6 light irrigations (stolonization, tuberization, bulking)
        "crop_duration_days": {
            "min": 80,
            "max": 110,
        },
        "rotation": {
            "favorable_preceding_crops": ["Paddy (Aman)", "Rice", "Jute", "Maize"],
            "unfavorable_preceding_crops": ["Potato", "Tomato", "Brinjal", "Eggplant", "Chilli"],  # Same family solanaceae
            "recommended_next_crops": ["Sesame", "Til", "Boro Rice", "Summer Vegetables", "Jute"],
            "monoculture_warning": "Continuous potato cultivation significantly increases risk of Late Blight (Phytophthora infestans) and bacterial wilt.",
        },
        "sources": [
            "ICAR-Central Potato Research Institute (CPRI), Shimla - Potato Production Manual",
            "Bidhan Chandra Krishi Viswavidyalaya (BCKV) Directorate of Research - Hooghly Agri Guide",
            "Department of Agriculture, Govt of West Bengal - Package of Practices for Rabi Crops"
        ],
        "reference_urls": [
            "https://cpri.icar.gov.in",
            "https://bckv.edu.in",
            "https://matirkatha.gov.in"
        ],
        "limitations": [
            "High seed tuber investment required (~40-50% of total input cost).",
            "Mandatory access to cold storage facility within 24-48 hours post-harvest.",
            "Zero tolerance to waterlogging; excessive winter rain induces bacterial soft rot and Late Blight.",
            "Tuber bulking ceases when ambient temperatures exceed 28°C."
        ],
        "notes": "Hooghly is the potato bowl of West Bengal. Light well-drained alluvial soil and cool winter nights provide ideal tuberization conditions."
    },

    "mustard": {
        "crop_id": "mustard",
        "name": "Mustard / Rapeseed",
        "botanical_name": "Brassica juncea",
        "family": "Brassicaceae",
        "popular_varieties": ["B-9 (Binoy)", "Sarama", "Pusa Bold", "Sita"],
        "suitable_seasons": ["Rabi"],
        "optimal_soils": ["Alluvial", "Sandy Loam", "Loamy"],
        "moderately_suitable_soils": ["Clayey", "Clay Loam", "Silt Loam"],
        "unsuitable_soils": ["Waterlogged Clay", "Highly Saline"],
        "temperature_celsius": {
            "optimal_min": 15.0,
            "optimal_max": 25.0,
            "tolerable_min": 8.0,
            "tolerable_max": 30.0,
            "flowering_critical_max": 32.0,
        },
        "rainfall_mm": {
            "optimal_min": 20.0,
            "optimal_max": 150.0,
            "excess_threshold": 250.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.35,
            "optimal_max": 0.55,
            "waterlogging_risk": 0.70,  # Very sensitive to standing water
            "wilting_risk": 0.20,
        },
        "relative_humidity_percent": {
            "optimal_min": 50.0,
            "optimal_max": 75.0,
            "disease_alert_threshold": 80.0,  # High RH encourages aphid attack (Lipaphis erysimi)
        },
        "water_requirement_category": "Low",
        "total_water_requirement_mm": "200 - 350 mm",
        "irrigation_mandatory": False,  # Can survive on residual moisture, though 1-2 irrigations boost yield
        "recommended_irrigations": 2,  # Rosette and siliqua development
        "crop_duration_days": {
            "min": 90,
            "max": 105,
        },
        "rotation": {
            "favorable_preceding_crops": ["Paddy (Aman)", "Rice", "Jute", "Maize"],
            "unfavorable_preceding_crops": ["Mustard", "Cabbage", "Cauliflower", "Radish"],
            "recommended_next_crops": ["Sesame", "Boro Rice", "Summer Pulses", "Jute"],
            "monoculture_warning": "Avoid continuous Brassicaceae to break aphid and Alternaria blight carryover.",
        },
        "sources": [
            "ICAR-Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur",
            "BCKV All India Coordinated Research Project on Oilseeds (Rapeseed-Mustard)",
            "Department of Agriculture, Govt of West Bengal - Oilseeds Mission Guidelines"
        ],
        "reference_urls": [
            "https://www.drmr.res.in",
            "https://bckv.edu.in",
            "https://matirkatha.gov.in"
        ],
        "limitations": [
            "High vulnerability to mustard aphid (Lipaphis erysimi) during cloudy/foggy spells in January.",
            "Extreme sensitivity to water stagnation; standing water (>24 hrs) causes rapid root asphyxiation.",
            "High temperatures (>32°C) during flowering/siliqua filling induce flower abortion."
        ],
        "notes": "Low water footprint oilseed ideal for farmers with limited or no assured irrigation post-Aman paddy."
    },

    "paddy_aman": {
        "crop_id": "paddy_aman",
        "name": "Paddy (Aman / Kharif)",
        "botanical_name": "Oryza sativa",
        "family": "Poaceae",
        "popular_varieties": ["Swarna (MTU-7029)", "Swarna Sub-1", "Pooja", "Pratikhya", "Gobindobhog"],
        "suitable_seasons": ["Kharif"],
        "optimal_soils": ["Clayey", "Clay Loam", "Alluvial"],
        "moderately_suitable_soils": ["Loamy", "Silt Loam"],
        "unsuitable_soils": ["Pure Sand", "Excessively Leached Gravelly"],
        "temperature_celsius": {
            "optimal_min": 22.0,
            "optimal_max": 32.0,
            "tolerable_min": 18.0,
            "tolerable_max": 38.0,
            "flowering_critical_max": 38.0,
        },
        "rainfall_mm": {
            "optimal_min": 800.0,
            "optimal_max": 1600.0,
            "excess_threshold": 2500.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.60,
            "optimal_max": 0.95,
            "waterlogging_risk": 1.0,  # Tolerates saturated/submerged conditions
            "wilting_risk": 0.40,
        },
        "relative_humidity_percent": {
            "optimal_min": 70.0,
            "optimal_max": 95.0,
            "disease_alert_threshold": 92.0,
        },
        "water_requirement_category": "Very High",
        "total_water_requirement_mm": "1100 - 1500 mm",
        "irrigation_mandatory": False,  # Primary Kharif crop grown rainfed with supplemental canal irrigation
        "recommended_irrigations": 0,  # Rainfed monsoon dependent with supplemental canal/well if dry spell > 10 days
        "crop_duration_days": {
            "min": 120,
            "max": 145,
        },
        "rotation": {
            "favorable_preceding_crops": ["Jute", "Sesame", "Summer Moong", "Green Manure (Dhaincha)"],
            "unfavorable_preceding_crops": ["Boro Rice"],  # Continuous rice-rice leads to sub-soil hardpan & micro-nutrient deficiency
            "recommended_next_crops": ["Potato", "Mustard", "Lentil", "Wheat"],
            "monoculture_warning": "Consecutive Rice-Rice monoculture exhausts soil zinc and builds sheath blight inoculum.",
        },
        "sources": [
            "ICAR-National Rice Research Institute (NRRI), Cuttack",
            "BCKV Department of Agronomy - Wet Season Rice Practices",
            "West Bengal Comprehensive District Agriculture Plan (Hooghly)"
        ],
        "reference_urls": [
            "https://icar-nrri.gov.in",
            "https://bckv.edu.in",
            "https://matirkatha.gov.in"
        ],
        "limitations": [
            "Heavy dependence on timely onset and spatial distribution of South-West Monsoon.",
            "Prolonged dry spells (>10 days) at panicle initiation cause significant spikelet sterility without supplemental irrigation.",
            "Excessive continuous rice-rice rotation creates sub-soil plough pan and zinc/boron deficiencies."
        ],
        "notes": "Principal food grain crop of Hooghly grown during South-West Monsoon. Dhaincha green manuring prior to puddling is recommended."
    },

    "boro_rice": {
        "crop_id": "boro_rice",
        "name": "Boro Rice (Summer Paddy)",
        "botanical_name": "Oryza sativa",
        "family": "Poaceae",
        "popular_varieties": ["Shatabdi (IET-4786)", "IR-36", "Lalat", "Gotra Bidhan-1"],
        "suitable_seasons": ["Boro"],
        "optimal_soils": ["Clayey", "Clay Loam", "Alluvial"],
        "moderately_suitable_soils": ["Loamy", "Silt Loam"],
        "unsuitable_soils": ["Sandy Loam", "Porous Sand"],
        "temperature_celsius": {
            "optimal_min": 20.0,
            "optimal_max": 33.0,
            "tolerable_min": 14.0,  # Cold injury at nursery stage if < 12°C
            "tolerable_max": 38.0,
            "cold_injury_min": 12.0,
        },
        "rainfall_mm": {
            "optimal_min": 50.0,
            "optimal_max": 250.0,  # Dry season, natural rainfall is scarce
            "excess_threshold": 400.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.65,
            "optimal_max": 0.95,
            "waterlogging_risk": 1.0,
            "wilting_risk": 0.45,
        },
        "relative_humidity_percent": {
            "optimal_min": 55.0,
            "optimal_max": 85.0,
            "disease_alert_threshold": 90.0,
        },
        "water_requirement_category": "Very High",
        "total_water_requirement_mm": "1200 - 1500 mm",
        "irrigation_mandatory": True,  # Assured groundwater/canal irrigation strictly mandatory
        "recommended_irrigations": 14,  # Frequent shallow irrigation through panicle initiation and grain filling
        "crop_duration_days": {
            "min": 120,
            "max": 135,
        },
        "rotation": {
            "favorable_preceding_crops": ["Short-duration Potato", "Early Mustard", "Kharif Vegetables"],
            "unfavorable_preceding_crops": ["Late Aman Paddy"],  # Causes late transplanting and heat exposure during anthesis
            "recommended_next_crops": ["Short-duration Pulses", "Kharif Paddy", "Green Manure"],
            "monoculture_warning": "Extremely groundwater intensive; where water is scarce, BCKV advises shifting to Maize or Sesame.",
        },
        "sources": [
            "BCKV Krishi Vigyan Kendra (KVK) Hooghly - Boro Rice Production Bulletin",
            "ICAR-NRRI Boro Rice Cultivation Guidelines for Eastern India",
            "Central Ground Water Board (CGWB) & WB State Agricultural Water Policy"
        ],
        "reference_urls": [
            "https://icar-nrri.gov.in",
            "https://bckv.edu.in",
            "https://cgwb.gov.in"
        ],
        "limitations": [
            "Extremely high groundwater extraction (1200-1500 mm); prohibited in groundwater critical/semi-critical blocks.",
            "Seedlings prone to severe cold injury and chlorosis if winter temperatures drop below 12°C.",
            "Mature crop faces high risk from pre-monsoon squalls (Kalbaishakhi) and hailstorms during April/May harvest."
        ],
        "notes": "High yielding winter-spring rice grown with assured tubewell or river lift irrigation. Only recommended when irrigation is guaranteed."
    },

    "jute": {
        "crop_id": "jute",
        "name": "Jute (Tossa)",
        "botanical_name": "Corchorus olitorius",
        "family": "Malvaceae",
        "popular_varieties": ["JRO-524 (Naveen)", "JRO-204 (Suren)", "JBO-2003H (Ira)", "Tarun"],
        "suitable_seasons": ["Zaid", "Pre-Kharif"],
        "optimal_soils": ["Alluvial", "Loamy", "Silt Loam"],
        "moderately_suitable_soils": ["Clay Loam", "Sandy Loam"],
        "unsuitable_soils": ["Heavy Saline", "Gravelly Sand", "Stagnant Waterlogged Basin during germination"],
        "temperature_celsius": {
            "optimal_min": 24.0,
            "optimal_max": 35.0,
            "tolerable_min": 18.0,
            "tolerable_max": 40.0,
            "germination_min": 20.0,
        },
        "rainfall_mm": {
            "optimal_min": 800.0,
            "optimal_max": 1400.0,
            "excess_threshold": 2000.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.50,
            "optimal_max": 0.75,
            "waterlogging_risk": 0.85,  # Young seedlings (< 45 days) cannot tolerate standing water
            "wilting_risk": 0.35,
        },
        "relative_humidity_percent": {
            "optimal_min": 65.0,
            "optimal_max": 90.0,
            "disease_alert_threshold": 92.0,
        },
        "water_requirement_category": "Medium-High",
        "total_water_requirement_mm": "500 - 800 mm",
        "irrigation_mandatory": False,  # 1-2 pre-sowing irrigations if pre-monsoon showers fail; then rainfed
        "recommended_irrigations": 2,
        "crop_duration_days": {
            "min": 100,
            "max": 120,
        },
        "rotation": {
            "favorable_preceding_crops": ["Potato", "Mustard", "Winter Vegetables"],
            "unfavorable_preceding_crops": ["Jute", "Kenaf", "Mesta"],
            "recommended_next_crops": ["Paddy (Aman)", "Rice"],
            "monoculture_warning": "Traditional Potato-Jute-Paddy rotation in Hooghly enriches soil through heavy leaf fall (~1 t/acre). Avoid back-to-back jute to avoid stem rot.",
        },
        "sources": [
            "ICAR-Central Research Institute for Jute and Allied Fibres (CRIJAF), Barrackpore - Tossa Jute Production Technology",
            "BCKV Department of Agronomy - Fiber Crops Guide",
            "Jute Corporation of India (JCI) Agronomic Manual"
        ],
        "reference_urls": [
            "https://crijaf.icar.gov.in",
            "https://bckv.edu.in",
            "https://www.jutecorp.in"
        ],
        "limitations": [
            "Requires access to clean freshwater retting ponds/canals within manageable transport distance.",
            "Young seedlings (<45 days) cannot tolerate waterlogging or prolonged sub-surface saturation.",
            "Pre-monsoon showers (March/April) or early irrigation essential for uniform seed emergence."
        ],
        "notes": "Renowned cash fiber crop of Hooghly and Nadia. Early sowing (mid-March to April) requires light initial soil moisture."
    },

    "sesame": {
        "crop_id": "sesame",
        "name": "Sesame / Til",
        "botanical_name": "Sesamum indicum",
        "family": "Pedaliaceae",
        "popular_varieties": ["Rama (Til-1)", "Krishna", "Savitri", "Prachi"],
        "suitable_seasons": ["Zaid", "Summer"],
        "optimal_soils": ["Alluvial", "Sandy Loam", "Loamy"],
        "moderately_suitable_soils": ["Clay Loam", "Silt Loam"],
        "unsuitable_soils": ["Heavy Waterlogged Clay", "Saline Soil"],
        "temperature_celsius": {
            "optimal_min": 25.0,
            "optimal_max": 35.0,
            "tolerable_min": 20.0,
            "tolerable_max": 40.0,
            "germination_min": 20.0,
        },
        "rainfall_mm": {
            "optimal_min": 50.0,
            "optimal_max": 250.0,
            "excess_threshold": 350.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.30,
            "optimal_max": 0.50,
            "waterlogging_risk": 0.65,  # Sesame dies quickly if water accumulates even for 24-48 hours
            "wilting_risk": 0.15,
        },
        "relative_humidity_percent": {
            "optimal_min": 45.0,
            "optimal_max": 70.0,
            "disease_alert_threshold": 80.0,  # High humidity triggers Phytophthora blight and phyllody
        },
        "water_requirement_category": "Low",
        "total_water_requirement_mm": "150 - 250 mm",
        "irrigation_mandatory": False,  # Highly drought-tolerant; 1-2 irrigations suffice
        "recommended_irrigations": 1,
        "crop_duration_days": {
            "min": 80,
            "max": 90,
        },
        "rotation": {
            "favorable_preceding_crops": ["Potato", "Mustard", "Winter Vegetables"],
            "unfavorable_preceding_crops": ["Sesame"],
            "recommended_next_crops": ["Paddy (Aman)", "Rice"],
            "monoculture_warning": "Thrives on residual fertilizer remaining in soil after heavily fertilized potato harvests.",
        },
        "sources": [
            "ICAR-Indian Institute of Oilseeds Research (IIOR), Hyderabad",
            "BCKV Oilseeds Research Unit - Summer Sesame in New Alluvial Zone",
            "Department of Agriculture, Govt of West Bengal - Til Cultivation Guide"
        ],
        "reference_urls": [
            "https://icar-iior.org.in",
            "https://bckv.edu.in",
            "https://matirkatha.gov.in"
        ],
        "limitations": [
            "Extreme sensitivity to water stagnation; field must have positive surface drainage.",
            "High relative humidity (>80%) triggers severe Phytophthora blight and vector-borne phyllody.",
            "Heavy soils that form surface crusts significantly impede seedling emergence."
        ],
        "notes": "Excellent low-cost summer catch crop for Hooghly farmers following potato digging. Requires well-drained soil."
    },

    "lentil": {
        "crop_id": "lentil",
        "name": "Lentil / Masoor",
        "botanical_name": "Lens culinaris",
        "family": "Fabaceae",
        "popular_varieties": ["Maitree (WBL-77)", "Subrata (WBL-58)", "Moitree", "KLS-218"],
        "suitable_seasons": ["Rabi"],
        "optimal_soils": ["Alluvial", "Clay Loam", "Loamy"],
        "moderately_suitable_soils": ["Sandy Loam", "Clayey"],
        "unsuitable_soils": ["Poorly Drained Marshy Soil", "Highly Acidic Soil"],
        "temperature_celsius": {
            "optimal_min": 14.0,
            "optimal_max": 24.0,
            "tolerable_min": 8.0,
            "tolerable_max": 28.0,
            "flowering_critical_max": 30.0,
        },
        "rainfall_mm": {
            "optimal_min": 30.0,
            "optimal_max": 150.0,
            "excess_threshold": 250.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.35,
            "optimal_max": 0.55,
            "waterlogging_risk": 0.65,  # Highly vulnerable to root rot in waterlogged conditions
            "wilting_risk": 0.20,
        },
        "relative_humidity_percent": {
            "optimal_min": 50.0,
            "optimal_max": 75.0,
            "disease_alert_threshold": 80.0,
        },
        "water_requirement_category": "Low",
        "total_water_requirement_mm": "150 - 250 mm",
        "irrigation_mandatory": False,  # Commonly broadcast in standing Aman rice (paira / utera crop)
        "recommended_irrigations": 1,  # 0 to 1 light irrigation at pod filling if soil is severely dry
        "crop_duration_days": {
            "min": 100,
            "max": 115,
        },
        "rotation": {
            "favorable_preceding_crops": ["Paddy (Aman)", "Rice", "Jute"],
            "unfavorable_preceding_crops": ["Lentil", "Chickpea", "Pea"],
            "recommended_next_crops": ["Jute", "Sesame", "Boro Rice", "Summer Maize"],
            "monoculture_warning": "Leguminous crop fixing biological nitrogen (~30-40 kg N/ha); superb soil replenisher. Avoid repeating legumes back-to-back to prevent Fusarium wilt.",
        },
        "sources": [
            "ICAR-Indian Institute of Pulses Research (IIPR), Kanpur",
            "BCKV Pulse Research Station, Kalyani - Lentil Production Practices in Bengal",
            "National Food Security Mission (NFSM) Pulses Division, Ministry of Agriculture"
        ],
        "reference_urls": [
            "https://iipr.icar.gov.in",
            "https://bckv.edu.in",
            "https://nfsm.gov.in"
        ],
        "limitations": [
            "Weak initial crop canopy allows aggressive weed competition without early hand weeding or pre-emergence herbicide.",
            "Excessive soil moisture or water stagnation promotes fatal collar rot and root rot complexes.",
            "Terminal heat stress (>28-30°C) during February pod filling shortens reproductive duration."
        ],
        "notes": "Key nutritional pulse crop. Highly economical for rice fallows with limited irrigation access."
    },

    "maize": {
        "crop_id": "maize",
        "name": "Maize (Corn)",
        "botanical_name": "Zea mays",
        "family": "Poaceae",
        "popular_varieties": ["HQPM-1", "PAC-740", "Pusa HM-4", "DeKalb 900M"],
        "suitable_seasons": ["Rabi", "Kharif"],
        "optimal_soils": ["Alluvial", "Sandy Loam", "Loamy"],
        "moderately_suitable_soils": ["Clay Loam", "Silt Loam"],
        "unsuitable_soils": ["Waterlogged Ill-Drained Clay", "Saline Alkali"],
        "temperature_celsius": {
            "optimal_min": 18.0,
            "optimal_max": 30.0,
            "tolerable_min": 12.0,
            "tolerable_max": 38.0,
            "flowering_critical_max": 38.0,
        },
        "rainfall_mm": {
            "optimal_min": 300.0,
            "optimal_max": 600.0,
            "excess_threshold": 900.0,
        },
        "soil_moisture_fraction": {
            "optimal_min": 0.45,
            "optimal_max": 0.65,
            "waterlogging_risk": 0.75,
            "wilting_risk": 0.25,
        },
        "relative_humidity_percent": {
            "optimal_min": 50.0,
            "optimal_max": 80.0,
            "disease_alert_threshold": 85.0,
        },
        "water_requirement_category": "Medium",
        "total_water_requirement_mm": "400 - 600 mm",
        "irrigation_mandatory": True,  # In Rabi season, 3-5 irrigations required
        "recommended_irrigations": 4,  # Knee-high, tasseling, silking, and grain filling
        "crop_duration_days": {
            "min": 105,
            "max": 125,
        },
        "rotation": {
            "favorable_preceding_crops": ["Paddy (Aman)", "Rice", "Jute", "Summer Pulses"],
            "unfavorable_preceding_crops": ["Maize", "Sorghum"],
            "recommended_next_crops": ["Sesame", "Summer Moong", "Kharif Paddy"],
            "monoculture_warning": "Heavy feeder of nitrogen and potash; avoid consecutive maize-maize cropping.",
        },
        "sources": [
            "ICAR-Indian Institute of Maize Research (IIMR), Ludhiana",
            "BCKV Department of Agronomy - High Yielding Rabi Maize Guide",
            "Cereal Systems Initiative for South Asia (CSISA) - Bengal Hub"
        ],
        "reference_urls": [
            "https://iimr.icar.gov.in",
            "https://bckv.edu.in",
            "https://csisa.org"
        ],
        "limitations": [
            "Vulnerable to invasive pest Fall Armyworm (Spodoptera frugiperda); requires pheromone traps and early whorl scouting.",
            "Sensitive to soil waterlogging during first 30 days after sowing; requires elevated ridge-and-furrow planting.",
            "Heavy nutrient drain on soil potash and nitrogen; post-harvest soil replenishment required."
        ],
        "notes": "Increasingly adopted by Hooghly farmers in Rabi season as a more water-efficient and profitable alternative to Boro paddy."
    }
}


def get_all_supported_crops() -> List[Dict[str, Any]]:
    """Return all crops supported in the knowledge base."""
    return list(CROP_KNOWLEDGE_BASE.values())


def get_crop_by_id(crop_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve agronomic profile for a specific crop ID."""
    return CROP_KNOWLEDGE_BASE.get(crop_id.lower().strip())
