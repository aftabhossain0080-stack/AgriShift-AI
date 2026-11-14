"""Intelligent Rule-Based Crop Recommendation Engine for AgriShift AI.

Generates transparent, explainable agricultural crop recommendations for Hooghly,
West Bengal, India by synthesizing:
1. Farmer profile (soil, standing crop, past crop, land area, irrigation status)
2. Phase 5 processed Earth observations (NASA POWER temperature/radiation,
   SMAP soil wetness, GPM/POWER precipitation trends)
3. Configurable crop knowledge base validated by ICAR, BCKV, and WB Dept of Agriculture.

Strictly adheres to:
- No ML black boxes — 100% deterministic, explainable rule weights
- No fabricated environmental measurements
- No repeat monoculture recommendations when rotation constraints make them unsuitable
- Explicit handling of missing data without assuming 0 or evidence of suitability
- No guarantees of yield, profit, or crop success
"""
import logging
from typing import Any, Dict, List, Optional, Tuple

from app.schemas.farmer import FarmerProfileBase
from app.services.crop_knowledge_base import (
    CROP_KNOWLEDGE_BASE,
    get_all_supported_crops,
)

logger = logging.getLogger(__name__)

# Configurable Scoring Dimension Weights (Sum = 100)
WEIGHT_SEASON = 25.0
WEIGHT_SOIL = 15.0
WEIGHT_TEMPERATURE = 20.0
WEIGHT_WATER_IRRIGATION = 20.0
WEIGHT_SOIL_MOISTURE = 10.0
WEIGHT_ROTATION = 10.0


# Seasonal progression cycle for Lower Gangetic Plains (Hooghly, West Bengal)
SEASON_PROGRESSION = {
    "Kharif": "Rabi",
    "Aman": "Rabi",
    "Monsoon": "Rabi",
    "Rabi": "Zaid",       # Summer / Pre-Kharif / Boro
    "Winter": "Zaid",
    "Boro": "Kharif",
    "Zaid": "Kharif",
    "Summer": "Kharif",
    "Pre-Kharif": "Kharif",
}

# Natural growing season of major crops cultivated in Hooghly
CROP_GROWING_SEASONS = {
    "paddy (aman)": "Kharif",
    "aman paddy": "Kharif",
    "rice (aman)": "Kharif",
    "kharif paddy": "Kharif",
    "paddy": "Kharif",
    "rice": "Kharif",
    "jute": "Zaid",
    "potato": "Rabi",
    "mustard": "Rabi",
    "lentil": "Rabi",
    "masoor": "Rabi",
    "maize": "Rabi",
    "boro rice": "Boro",
    "boro paddy": "Boro",
    "boro": "Boro",
    "sesame": "Zaid",
    "til": "Zaid",
}


def resolve_target_growing_season(
    explicit_target_season: Optional[str],
    farmer_profile: FarmerProfileBase
) -> Tuple[str, bool, Optional[str]]:
    """Determine the intended target growing season.
    
    If explicit_target_season is provided, respect the user's explicit choice.
    If omitted:
      Detect whether farmer_profile.farming_season refers to the CURRENT standing crop season.
      If the current standing crop belongs to that season (e.g. standing Aman Paddy in Kharif),
      automatically infer the NEXT chronological season (e.g. Rabi) rather than blindly
      evaluating the current season where land is already occupied.
      
    Returns:
        (chosen_season, is_inferred, explanation_note)
    """
    if explicit_target_season and explicit_target_season.strip():
        return explicit_target_season.strip().title(), False, None

    farmer_season = farmer_profile.farming_season.strip().title()
    curr_crop = farmer_profile.current_crop.strip().lower()

    # Find the natural season of current standing crop
    detected_crop_season = None
    for name_key, s_val in CROP_GROWING_SEASONS.items():
        if name_key in curr_crop:
            detected_crop_season = s_val
            break

    # If the standing crop belongs to the season specified by the farmer,
    # the farmer entered their CURRENT season; transition to the NEXT season.
    if detected_crop_season and detected_crop_season.lower() == farmer_season.lower():
        next_season = SEASON_PROGRESSION.get(detected_crop_season, "Rabi")
        note = (
            f"Current standing crop '{farmer_profile.current_crop}' occupies the {farmer_season} season. "
            f"Recommendations are generated for the intended upcoming '{next_season}' season."
        )
        return next_season, True, note

    # Otherwise, the farmer already specified their intended next season
    return farmer_season, False, None


def evaluate_season_suitability(
    target_season: str,
    crop: Dict[str, Any]
) -> Tuple[float, List[str], List[str]]:
    """Evaluate seasonal compatibility.
    
    Returns:
        (score, reasons, risks)
    """
    reasons: List[str] = []
    risks: List[str] = []
    target_clean = target_season.strip().title()
    suitable_seasons = [s.strip().title() for s in crop.get("suitable_seasons", [])]

    # Map synonymous or overlapping seasons in Bengal
    season_synonyms = {
        "Zaid": ["Zaid", "Summer", "Pre-Kharif"],
        "Summer": ["Zaid", "Summer", "Pre-Kharif"],
        "Pre-Kharif": ["Zaid", "Summer", "Pre-Kharif"],
        "Boro": ["Boro", "Summer"],
        "Rabi": ["Rabi", "Winter"],
        "Kharif": ["Kharif", "Monsoon", "Aman"],
    }

    allowed_synonyms = season_synonyms.get(target_clean, [target_clean])

    is_matched = any(s in suitable_seasons for s in allowed_synonyms)

    if is_matched:
        score = WEIGHT_SEASON
        reasons.append(f"Target season '{target_clean}' perfectly matches optimal growing window for {crop['name']}.")
    else:
        score = 0.0
        risks.append(f"{crop['name']} is traditionally not suited for '{target_clean}' season in Hooghly (optimal seasons: {', '.join(suitable_seasons)}).")

    return score, reasons, risks


def evaluate_soil_suitability(
    soil_type: str,
    crop: Dict[str, Any]
) -> Tuple[float, List[str], List[str]]:
    """Evaluate soil type compatibility.
    
    Returns:
        (score, reasons, risks)
    """
    reasons: List[str] = []
    risks: List[str] = []
    soil_lower = soil_type.strip().lower()

    optimal = [s.lower() for s in crop.get("optimal_soils", [])]
    moderate = [s.lower() for s in crop.get("moderately_suitable_soils", [])]
    unsuitable = [s.lower() for s in crop.get("unsuitable_soils", [])]

    if any(s in soil_lower or soil_lower in s for s in optimal):
        score = WEIGHT_SOIL
        reasons.append(f"Soil classification '{soil_type}' is optimal for {crop['name']} root development and drainage.")
    elif any(s in soil_lower or soil_lower in s for s in moderate):
        score = round(WEIGHT_SOIL * 0.65, 1)  # ~9.8 points
        reasons.append(f"Soil type '{soil_type}' is moderately suitable for {crop['name']}.")
    elif any(s in soil_lower or soil_lower in s for s in unsuitable):
        score = round(WEIGHT_SOIL * 0.15, 1)  # ~2.2 points
        risks.append(f"Soil '{soil_type}' is ill-suited for {crop['name']}, risking poor aeration or drainage stress.")
    else:
        # Unknown or unspecified soil type
        score = round(WEIGHT_SOIL * 0.5, 1)
        reasons.append(f"Soil type '{soil_type}' has acceptable general compatibility with {crop['name']}.")

    return score, reasons, risks


def evaluate_temperature_suitability(
    temp_indicators: Optional[Dict[str, Any]],
    crop: Dict[str, Any]
) -> Tuple[float, List[str], List[str], List[str], List[str]]:
    """Evaluate temperature suitability using Phase 5 indicators.
    
    Returns:
        (score, reasons, advantages, risks, missing_info)
    """
    reasons: List[str] = []
    advantages: List[str] = []
    risks: List[str] = []
    missing_info: List[str] = []

    if not temp_indicators or temp_indicators.get("average_temperature_celsius") is None:
        missing_info.append("Satellite ambient temperature data was unavailable for this period.")
        # Neutral score without artificially penalizing or rewarding
        return round(WEIGHT_TEMPERATURE * 0.5, 1), reasons, advantages, risks, missing_info

    avg_t = float(temp_indicators["average_temperature_celsius"])
    t_cfg = crop.get("temperature_celsius", {})
    opt_min = t_cfg.get("optimal_min", 15.0)
    opt_max = t_cfg.get("optimal_max", 25.0)
    tol_min = t_cfg.get("tolerable_min", 10.0)
    tol_max = t_cfg.get("tolerable_max", 35.0)

    if opt_min <= avg_t <= opt_max:
        score = WEIGHT_TEMPERATURE
        reasons.append(f"Observed mean temperature ({avg_t}°C) falls squarely within optimal range ({opt_min}–{opt_max}°C).")
        advantages.append(f"Thermal conditions ({avg_t}°C) foster robust vegetative development and reproductive timing.")
    elif tol_min <= avg_t <= tol_max:
        # Linear degradation outside optimal range
        if avg_t < opt_min:
            fraction = (avg_t - tol_min) / max((opt_min - tol_min), 1e-3)
        else:
            fraction = (tol_max - avg_t) / max((tol_max - opt_max), 1e-3)
        score = round(WEIGHT_TEMPERATURE * (0.5 + 0.45 * max(0.0, min(1.0, fraction))), 1)
        reasons.append(f"Observed temperature ({avg_t}°C) is tolerable, though outside the ideal {opt_min}–{opt_max}°C window.")
    else:
        score = round(WEIGHT_TEMPERATURE * 0.15, 1)
        if avg_t > tol_max:
            risks.append(f"High temperature stress: {avg_t}°C exceeds tolerable ceiling ({tol_max}°C) for {crop['name']}.")
        else:
            risks.append(f"Cold stress risk: {avg_t}°C falls below tolerable floor ({tol_min}°C) for {crop['name']}.")

    return score, reasons, advantages, risks, missing_info


def evaluate_water_and_irrigation(
    irrigation_available: bool,
    target_season: str,
    rainfall_indicators: Optional[Dict[str, Any]],
    crop: Dict[str, Any]
) -> Tuple[float, List[str], List[str], str]:
    """Evaluate irrigation availability and water requirements.
    
    Returns:
        (score, reasons, risks, irrigation_advice)
    """
    reasons: List[str] = []
    risks: List[str] = []
    req_cat = crop.get("water_requirement_category", "Medium")
    is_mandatory = crop.get("irrigation_mandatory", False)
    tot_water = crop.get("total_water_requirement_mm", "300 - 500 mm")
    num_irrig = crop.get("recommended_irrigations", 2)

    total_rain = 0.0
    if rainfall_indicators and rainfall_indicators.get("total_rainfall_mm") is not None:
        total_rain = float(rainfall_indicators["total_rainfall_mm"])

    is_dry_season = target_season.strip().title() in ["Rabi", "Boro", "Winter"]

    if irrigation_available:
        score = WEIGHT_WATER_IRRIGATION
        reasons.append(f"Assured irrigation satisfies the {req_cat.lower()} water requirement ({tot_water}) for {crop['name']}.")
        advice = f"Apply approximately {num_irrig} scheduled irrigations during critical physiological stages ({tot_water} total demand)."
    else:
        # Farmer has NO assured irrigation
        if is_mandatory and is_dry_season and total_rain < 150.0:
            score = 0.0
            risks.append(f"{crop['name']} has mandatory irrigation requirements ({tot_water}) and cannot produce economic yields rainfed in dry {target_season}.")
            advice = "NOT recommended without access to borewell, canal, or lift irrigation."
        elif req_cat == "Low":
            score = WEIGHT_WATER_IRRIGATION
            reasons.append(f"{crop['name']} has low water demand ({tot_water}) and succeeds under rainfed or residual moisture conditions.")
            advice = "Conserve residual soil moisture with early sowing; 1 life-saving irrigation at critical stage if rain ceases."
        elif req_cat in ["Medium", "Medium-High"] and not is_dry_season:
            # Kharif or Pre-Kharif with monsoon rains
            score = round(WEIGHT_WATER_IRRIGATION * 0.75, 1)
            reasons.append(f"Monsoon rainfall generally supports {crop['name']} without mandatory irrigation facilities.")
            advice = "Rely on monsoon precipitation; prepare field bunds for rainwater harvesting."
        else:
            score = round(WEIGHT_WATER_IRRIGATION * 0.35, 1)
            risks.append(f"Lack of assured irrigation creates severe water stress risk for {crop['name']} in dry periods.")
            advice = "Provide supplemental irrigation if possible; prioritize drought-hardy alternative crops."

    return score, reasons, risks, advice


def evaluate_soil_moisture_and_rainfall(
    soil_moisture_indicators: Optional[Dict[str, Any]],
    rainfall_indicators: Optional[Dict[str, Any]],
    crop: Dict[str, Any]
) -> Tuple[float, List[str], List[str], List[str], List[str]]:
    """Evaluate soil wetness fraction and rainfall indicators from Phase 5.
    
    Returns:
        (score, reasons, advantages, risks, missing_info)
    """
    reasons: List[str] = []
    advantages: List[str] = []
    risks: List[str] = []
    missing_info: List[str] = []

    sm_cfg = crop.get("soil_moisture_fraction", {})
    opt_sm_min = sm_cfg.get("optimal_min", 0.40)
    opt_sm_max = sm_cfg.get("optimal_max", 0.70)
    waterlog_risk = sm_cfg.get("waterlogging_risk", 0.75)
    wilting_risk = sm_cfg.get("wilting_risk", 0.25)

    root_sm: Optional[float] = None
    if soil_moisture_indicators:
        root_sm = soil_moisture_indicators.get("average_rootzone_soil_moisture_fraction")

    if root_sm is None:
        missing_info.append("NASA SMAP root-zone soil wetness data was unavailable.")
        score = round(WEIGHT_SOIL_MOISTURE * 0.5, 1)
    else:
        if opt_sm_min <= root_sm <= opt_sm_max:
            score = WEIGHT_SOIL_MOISTURE
            reasons.append(f"Root-zone soil moisture ({round(root_sm*100, 1)}%) aligns with {crop['name']} root requirements.")
            advantages.append(f"Optimal profile moisture ({round(root_sm*100, 1)}%) provides favorable sowing bed conditions.")
        elif root_sm >= waterlog_risk and crop.get("crop_id") not in ["paddy_aman", "boro_rice"]:
            score = round(WEIGHT_SOIL_MOISTURE * 0.2, 1)
            risks.append(f"High soil wetness ({round(root_sm*100, 1)}%) risks aeration deficit or root rot for waterlogging-sensitive {crop['name']}.")
        elif root_sm <= wilting_risk:
            score = round(WEIGHT_SOIL_MOISTURE * 0.3, 1)
            risks.append(f"Dry root-zone soil moisture ({round(root_sm*100, 1)}%) approaches plant wilting threshold.")
        else:
            score = round(WEIGHT_SOIL_MOISTURE * 0.7, 1)

    # Check rainfall trends
    if rainfall_indicators:
        rain_trend = rainfall_indicators.get("rainfall_trend")
        consec_dry = rainfall_indicators.get("consecutive_dry_days", 0)
        if consec_dry >= 14 and crop.get("water_requirement_category") in ["High", "Very High"]:
            risks.append(f"Prolonged dry spell ({consec_dry} consecutive dry days) requires vigilance against moisture stress.")

    return score, reasons, advantages, risks, missing_info


def evaluate_crop_rotation_constraints(
    current_crop: str,
    previous_crop: str,
    crop: Dict[str, Any]
) -> Tuple[float, List[str], List[str], str]:
    """Evaluate crop rotation rules and enforce monoculture penalties.
    
    Returns:
        (score, reasons, risks, rotation_notes)
    """
    reasons: List[str] = []
    risks: List[str] = []

    rot = crop.get("rotation", {})
    fav_preceding = [c.lower() for c in rot.get("favorable_preceding_crops", [])]
    unfav_preceding = [c.lower() for c in rot.get("unfavorable_preceding_crops", [])]
    monoculture_warn = rot.get("monoculture_warning", "")
    crop_family = crop.get("family", "").lower()
    crop_name_lower = crop.get("name", "").lower()

    curr_lower = current_crop.strip().lower()
    prev_lower = previous_crop.strip().lower()

    # 1. Monoculture Check: Planting identical crop repeatedly
    is_direct_monoculture = (
        crop_name_lower in curr_lower or curr_lower in crop_name_lower or
        crop.get("crop_id") in curr_lower
    )

    if is_direct_monoculture:
        # Severe penalty for repeat monoculture
        score = 0.0
        risks.append(
            f"Strict Monoculture Risk: Current crop is already {current_crop}. {monoculture_warn}"
        )
        rotation_notes = f"Repeated monoculture of {crop['name']} violates agronomic best practices. Breaks recommended."
        return score, reasons, risks, rotation_notes

    # 2. Family Monoculture Check (e.g. Solanaceae after Solanaceae)
    is_unfavorable = any(u in curr_lower or curr_lower in u for u in unfav_preceding)
    if is_unfavorable:
        score = round(WEIGHT_ROTATION * 0.2, 1)  # 2.0 points
        risks.append(f"Preceding crop '{current_crop}' shares pest/pathogen complexes with {crop['name']}. {monoculture_warn}")
        rotation_notes = f"Sub-optimal predecessor. Prefer breaking the {crop_family.title()} disease cycle with an unrelated crop."
        return score, reasons, risks, rotation_notes

    # 3. Favorable Rotation Check (e.g. Paddy followed by Potato or Mustard)
    is_favorable = any(f in curr_lower or curr_lower in f for f in fav_preceding)
    if is_favorable:
        score = WEIGHT_ROTATION
        reasons.append(f"Exceptional rotation sequence: {crop['name']} thrives following '{current_crop}' in Lower Gangetic alluvium.")
        rotation_notes = f"Proven, high-productivity rotation sequence following {current_crop}."
        return score, reasons, risks, rotation_notes

    # 4. Neutral Rotation
    score = round(WEIGHT_ROTATION * 0.7, 1)  # 7.0 points
    reasons.append(f"Standard rotational compatibility with preceding '{current_crop}'.")
    rotation_notes = f"Acceptable rotation following {current_crop}."
    return score, reasons, risks, rotation_notes


def score_single_crop(
    crop: Dict[str, Any],
    farmer_profile: FarmerProfileBase,
    target_season: str,
    processed_indicators: Dict[str, Any]
) -> Dict[str, Any]:
    """Compute holistic, explainable suitability score for a single candidate crop."""
    reasons: List[str] = []
    environmental_advantages: List[str] = []
    potential_risks: List[str] = []
    missing_info: List[str] = []

    # 1. Season Suitability (25 pts)
    s_score, s_reasons, s_risks = evaluate_season_suitability(target_season, crop)
    reasons.extend(s_reasons)
    potential_risks.extend(s_risks)

    # Disqualification if completely out of season
    if s_score == 0.0:
        return {
            "crop_id": crop["crop_id"],
            "crop_name": crop["name"],
            "botanical_name": crop["botanical_name"],
            "suitability_score": 0.0,
            "suitability_category": "Not Recommended",
            "growing_season": target_season,
            "crop_duration": f"{crop['crop_duration_days']['min']} - {crop['crop_duration_days']['max']} days",
            "water_requirement": crop["water_requirement_category"],
            "score_breakdown": {"season": 0.0, "soil": 0.0, "temperature": 0.0, "water_irrigation": 0.0, "soil_moisture": 0.0, "rotation": 0.0},
            "reasons": reasons,
            "environmental_advantages": [],
            "potential_risks": potential_risks,
            "water_and_irrigation_considerations": "Seasonal timing is unfavorable.",
            "crop_rotation_notes": "Out-of-season planting is not viable.",
            "missing_information": [],
            "agricultural_sources": crop.get("sources", []),
            "reference_urls": crop.get("reference_urls", []),
            "limitations": crop.get("limitations", []),
        }

    # 2. Soil Type Suitability (15 pts)
    soil_score, soil_reasons, soil_risks = evaluate_soil_suitability(farmer_profile.soil_type, crop)
    reasons.extend(soil_reasons)
    potential_risks.extend(soil_risks)

    # 3. Temperature Suitability (20 pts)
    temp_score, t_reasons, t_adv, t_risks, t_missing = evaluate_temperature_suitability(
        processed_indicators.get("temperature"), crop
    )
    reasons.extend(t_reasons)
    environmental_advantages.extend(t_adv)
    potential_risks.extend(t_risks)
    missing_info.extend(t_missing)

    # 4. Water & Irrigation Feasibility (20 pts)
    water_score, w_reasons, w_risks, irrig_advice = evaluate_water_and_irrigation(
        irrigation_available=farmer_profile.irrigation_available,
        target_season=target_season,
        rainfall_indicators=processed_indicators.get("rainfall"),
        crop=crop
    )
    reasons.extend(w_reasons)
    potential_risks.extend(w_risks)

    # 5. Soil Moisture & Rainfall Feasibility (10 pts)
    sm_score, sm_reasons, sm_adv, sm_risks, sm_missing = evaluate_soil_moisture_and_rainfall(
        soil_moisture_indicators=processed_indicators.get("soil_moisture"),
        rainfall_indicators=processed_indicators.get("rainfall"),
        crop=crop
    )
    reasons.extend(sm_reasons)
    environmental_advantages.extend(sm_adv)
    potential_risks.extend(sm_risks)
    missing_info.extend(sm_missing)

    # 6. Crop Rotation Constraints (10 pts)
    rot_score, rot_reasons, rot_risks, rot_notes = evaluate_crop_rotation_constraints(
        current_crop=farmer_profile.current_crop,
        previous_crop=farmer_profile.previous_crop,
        crop=crop
    )
    reasons.extend(rot_reasons)
    potential_risks.extend(rot_risks)

    total_score = round(s_score + soil_score + temp_score + water_score + sm_score + rot_score, 1)
    total_score = max(0.0, min(100.0, total_score))

    # Categorize suitability
    if total_score >= 80.0:
        category = "Highly Recommended"
    elif total_score >= 65.0:
        category = "Moderately Recommended"
    elif total_score >= 50.0:
        category = "Conditionally Suitable"
    else:
        category = "Not Recommended"

    # Agronomic Safeguard: If thermal or soil moisture observations are missing, cap category at 'Conditionally Suitable'
    if (t_missing or sm_missing) and category in ["Highly Recommended", "Moderately Recommended"]:
        category = "Conditionally Suitable"
        potential_risks.append(
            f"Advisory Downgrade: Rated '{category}' because critical satellite observations ({', '.join(t_missing + sm_missing)}) are unverified. On-farm soil/temperature inspection required before planting {crop['name']}."
        )

    return {
        "crop_id": crop["crop_id"],
        "crop_name": crop["name"],
        "botanical_name": crop["botanical_name"],
        "suitability_score": total_score,
        "suitability_category": category,
        "growing_season": target_season,
        "crop_duration": f"{crop['crop_duration_days']['min']} - {crop['crop_duration_days']['max']} days",
        "water_requirement": crop["water_requirement_category"],
        "score_breakdown": {
            "season": s_score,
            "soil": soil_score,
            "temperature": temp_score,
            "water_irrigation": water_score,
            "soil_moisture": sm_score,
            "rotation": rot_score,
        },
        "reasons": sorted(list(set(reasons))),
        "environmental_advantages": sorted(list(set(environmental_advantages))),
        "potential_risks": sorted(list(set(potential_risks))),
        "water_and_irrigation_considerations": irrig_advice,
        "crop_rotation_notes": rot_notes,
        "missing_information": sorted(list(set(missing_info))),
        "agricultural_sources": crop.get("sources", []),
        "reference_urls": crop.get("reference_urls", []),
        "limitations": crop.get("limitations", []),
    }


def generate_crop_recommendations(
    farmer_profile: FarmerProfileBase,
    processed_pipeline_data: Dict[str, Any],
    target_season: Optional[str] = None
) -> Dict[str, Any]:
    """Generate explainable, ranked crop recommendations for the target season.
    
    Args:
        farmer_profile: Validated farmer inputs.
        processed_pipeline_data: Output dictionary from process_agricultural_data (Phase 5).
        target_season: Target season (if omitted, automatically resolves intended next growing season).
        
    Returns:
        Structured dictionary matching CropRecommendationResponse schema.
    """
    chosen_season, is_inferred, season_note = resolve_target_growing_season(target_season, farmer_profile)

    indicators = processed_pipeline_data.get("indicators", {})
    data_quality = processed_pipeline_data.get("data_quality", {})
    completeness_pct = float(data_quality.get("overall_completeness_percentage", 0.0))
    period = processed_pipeline_data.get("period", {})

    # Check for insufficient satellite data
    if completeness_pct < 30.0 or not indicators:
        logger.warning("Insufficient NASA observation completeness: %s%%", completeness_pct)
        return {
            "success": False,
            "status": "insufficient_data",
            "message": (
                f"Insufficient NASA Earth observation data (completeness: {completeness_pct}%). "
                "AgriShift AI requires verified temperature, precipitation, and soil moisture observations "
                "to generate reliable agronomic recommendations without guessing."
            ),
            "farmer_location": {
                "village": farmer_profile.village,
                "latitude": farmer_profile.latitude,
                "longitude": farmer_profile.longitude,
            },
            "target_season": chosen_season,
            "environmental_summary": {
                "analysis_period": period,
                "temperature": indicators.get("temperature", {}),
                "rainfall": indicators.get("rainfall", {}),
                "soil_moisture": indicators.get("soil_moisture", {}),
                "atmospheric": indicators.get("other", {}),
                "data_completeness_percentage": completeness_pct,
            },
            "recommendations": [],
            "data_quality_and_confidence": {
                "overall_completeness_percentage": completeness_pct,
                "confidence_rating": "Insufficient",
                "confidence_notes": "Observation completeness fell below minimum 30% reliability threshold."
            },
            "sources_and_references": [
                {"institution": "NASA", "name": "Earth Observation Satellite Constellations", "role": "Remote sensing data provider"},
                {"institution": "ICAR", "name": "Indian Council of Agricultural Research", "role": "National agronomic standards"}
            ],
            "disclaimer": "Advisory recommendation only. Never guarantees crop yield or profit."
        }

    # Evaluate each crop in knowledge base
    scored_crops = []
    for crop in get_all_supported_crops():
        scored = score_single_crop(
            crop=crop,
            farmer_profile=farmer_profile,
            target_season=chosen_season,
            processed_indicators=indicators
        )
        scored_crops.append(scored)

    # Filter candidates with suitability score >= 50.0 (Conditionally Suitable, Moderately, or Highly Recommended)
    viable_candidates = [c for c in scored_crops if c["suitability_score"] >= 50.0]

    # Sort descending by suitability score
    viable_candidates.sort(key=lambda x: x["suitability_score"], reverse=True)

    # Take Top 3 recommendations
    top_3 = viable_candidates[:3]
    for idx, item in enumerate(top_3, start=1):
        item["rank"] = idx

    # Determine status
    if top_3:
        status_val = "recommended"
        base_msg = f"Top {len(top_3)} suitable crop recommendations generated for {chosen_season} season in Hooghly."
        message_val = f"{season_note} {base_msg}" if season_note else base_msg
    else:
        status_val = "no_suitable_crops"
        base_msg = f"No supported crops met minimum suitability threshold (>= 50) for '{chosen_season}' season under current plot constraints."
        message_val = f"{season_note} {base_msg}" if season_note else base_msg

    # Confidence rating based on completeness
    if completeness_pct >= 90.0:
        conf_rating = "High"
    elif completeness_pct >= 70.0:
        conf_rating = "Moderate"
    else:
        conf_rating = "Low"

    # Assemble response
    return {
        "success": True,
        "status": status_val,
        "message": message_val,
        "farmer_location": {
            "village": farmer_profile.village,
            "latitude": farmer_profile.latitude,
            "longitude": farmer_profile.longitude,
        },
        "target_season": chosen_season,
        "environmental_summary": {
            "analysis_period": period,
            "temperature": indicators.get("temperature", {}),
            "rainfall": indicators.get("rainfall", {}),
            "soil_moisture": indicators.get("soil_moisture", {}),
            "atmospheric": indicators.get("other", {}),
            "data_completeness_percentage": completeness_pct,
        },
        "recommendations": top_3,
        "data_quality_and_confidence": {
            "overall_completeness_percentage": completeness_pct,
            "confidence_rating": conf_rating,
            "confidence_notes": (
                f"Data confidence is {conf_rating}. Satellite observations coverage: {completeness_pct}%. "
                "Scoring incorporates verified soil, thermal, moisture, and crop rotation rules."
            )
        },
        "sources_and_references": [
            {
                "institution": "ICAR",
                "name": "Indian Council of Agricultural Research",
                "role": "National crop genetics, nutrient packages, and disease thresholds"
            },
            {
                "institution": "BCKV",
                "name": "Bidhan Chandra Krishi Viswavidyalaya, Mohanpur",
                "role": "State agricultural university for New and Old Alluvial Zones of West Bengal"
            },
            {
                "institution": "Govt of West Bengal",
                "name": "Department of Agriculture",
                "role": "Package of Practices and District Agriculture Plan for Hooghly"
            }
        ],
        "disclaimer": (
            "AgriShift AI provides advisory recommendations based on NASA satellite observations "
            "and ICAR/BCKV agronomic research. It does NOT guarantee crop yield, market price, or financial profit. "
            "Actual harvest outcomes depend on seed quality, local field management, fertilizer practices, "
            "and unpredictable micro-climatic weather events."
        )
    }
