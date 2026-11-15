import {
  FarmerProfileInput,
  CropRecommendation,
  RecommendationResponse,
  SupportedCrop,
  EnvironmentalIndicators,
  IrrigationSummary,
  RiskAlert,
  RotationAdvice,
  RecommendationMetadata
} from "./types";

export const DEFAULT_FARMER_PROFILE: FarmerProfileInput = {
  village: "Singur",
  latitude: 22.81,
  longitude: 88.23,
  current_crop: "Potato",
  previous_crop: "Paddy (Aman)",
  soil_type: "Alluvial",
  land_area_acres: 2.5,
  irrigation_available: true,
  farming_season: "Rabi"
};

export const MOCK_TOP_CROPS: CropRecommendation[] = [
  {
    crop_name: "Mustard",
    botanical_name: "Brassica juncea",
    score: 94.0,
    rank: 1,
    viability: "Optimal",
    suitability_category: "Highly Recommended",
    crop_duration: "90 to 105 days",
    water_requirement: "Low",
    score_breakdown: {
      temperature_score: 24.5,
      rainfall_score: 23.5,
      soil_moisture_score: 23.0,
      rotation_penalty_or_bonus: 23.0,
      total_score: 94.0,
      season_score: 25.0,
      soil_score: 15.0,
      water_irrigation_score: 20.0
    },
    rationale:
      "Exceptional thermal alignment (16.3 C observed versus 15.0 to 25.0 C optimal) and well drained alluvial soil in Singur. Rotation following Potato breaks fungal wilt and nematode cycles while leveraging residual phosphate fertilizer.",
    irrigation_weekly_mm: 15,
    agronomic_notes:
      "Sow in lines at 30 cm spacing. Apply 2 scheduled irrigations at rosette stage (25 to 30 DAS) and siliqua filling stage (55 to 60 DAS). Monitor for mustard aphid during foggy spells in January.",
    reasons: [
      "Assured irrigation satisfies the low water requirement (200 to 350 mm) for Mustard.",
      "Observed mean temperature (16.3 C) falls squarely within the optimal window (15.0 to 25.0 C).",
      "Singur alluvial soil is ideal for root development and quick drainage.",
      "Target Rabi season perfectly matches the optimal sowing window."
    ],
    environmental_advantages: [
      "NASA POWER thermal records confirm stable winter temperatures conducive to vigorous siliqua set.",
      "SMAP root zone moisture (0.54) provides excellent initial seedbed conditions."
    ],
    potential_risks: [
      "Watch for mustard aphid (Lipaphis erysimi) if persistent morning fog occurs in mid January.",
      "Avoid water stagnation exceeding 24 hours, which causes root asphyxiation."
    ],
    water_and_irrigation_considerations:
      "Low total water footprint (200 to 300 mm). Apply light irrigation at pre-flowering and pod formation stages.",
    crop_rotation_notes:
      "Following Potato with Mustard breaks solanaceous pathogen cycles and preserves residual phosphorus applied to the potato crop.",
    limitations: [
      "Sensitive to cloudy weather during flowering, which slows bee pollination.",
      "Temperatures above 32 C during grain filling can reduce oil content."
    ],
    agricultural_sources: [
      "ICAR: Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur",
      "BCKV: All India Coordinated Research Project on Oilseeds, Kalyani",
      "Department of Agriculture, Government of West Bengal: Oilseeds Mission Guidelines"
    ]
  },
  {
    crop_name: "Lentil",
    botanical_name: "Lens culinaris",
    score: 88.5,
    rank: 2,
    viability: "Optimal",
    suitability_category: "Highly Recommended",
    crop_duration: "110 to 125 days",
    water_requirement: "Low",
    score_breakdown: {
      temperature_score: 23.0,
      rainfall_score: 22.0,
      soil_moisture_score: 21.5,
      rotation_penalty_or_bonus: 22.0,
      total_score: 88.5,
      season_score: 25.0,
      soil_score: 14.5,
      water_irrigation_score: 18.0
    },
    rationale:
      "Leguminous pulse restores atmospheric nitrogen (up to 35 to 40 kg N per hectare) into post-potato fields. Minimal irrigation footprint makes it resilient against winter dry spells.",
    irrigation_weekly_mm: 12,
    agronomic_notes:
      "Inoculate seeds with Rhizobium culture and Phosphate Solubilizing Bacteria before drilling. Single protective irrigation at flower initiation (35 to 40 DAS) is sufficient if residual root-zone moisture remains above 0.40.",
    reasons: [
      "Biological nitrogen fixation restores natural soil fertility after exhaustive crops.",
      "Tolerates cooler night temperatures observed in NASA POWER records.",
      "Minimal supplementary water needed due to high water-use efficiency.",
      "Strong local market demand across Hooghly and neighboring districts."
    ],
    environmental_advantages: [
      "Deep taproot utilizes residual subsoil moisture detected by SMAP sensors.",
      "Cool daytime conditions support prolonged pod development."
    ],
    potential_risks: [
      "Susceptible to vascular wilt (Fusarium oxysporum) in poorly drained patches.",
      "Pod borer infestation during early pod development requires biological pest monitoring."
    ],
    water_and_irrigation_considerations:
      "Requires only 150 to 200 mm total water. One light irrigation at branching and one at pod filling.",
    crop_rotation_notes:
      "Superb pulse rotation that replenishes soil organic matter and breaks continuous tuber/cereal cropping.",
    limitations: [
      "Extremely sensitive to waterlogging. Elevated beds recommended in low-lying plots.",
      "Requires seed treatment with bio-fungicide to prevent collar rot."
    ],
    agricultural_sources: [
      "ICAR: Indian Institute of Pulses Research (IIPR), Kanpur",
      "BCKV Directorate of Research: Pulses Advisory Bulletin",
      "National Food Security Mission (NFSM): Pulses Development Guidelines"
    ]
  },
  {
    crop_name: "Maize",
    botanical_name: "Zea mays",
    score: 78.0,
    rank: 3,
    viability: "Moderate",
    suitability_category: "Moderately Recommended",
    crop_duration: "115 to 130 days",
    water_requirement: "Medium",
    score_breakdown: {
      temperature_score: 20.0,
      rainfall_score: 18.0,
      soil_moisture_score: 19.0,
      rotation_penalty_or_bonus: 21.0,
      total_score: 78.0,
      season_score: 22.0,
      soil_score: 14.0,
      water_irrigation_score: 16.0
    },
    rationale:
      "High grain yield potential in alluvial soils, but higher water consumption (400 to 500 mm) requires reliable tube-well irrigation during tassel emergence and grain filling.",
    irrigation_weekly_mm: 28,
    agronomic_notes:
      "Heavy feeder crop requiring split nitrogen applications at basal, knee-high, and silking stages. Ensure ridging to prevent standing water contact around stems.",
    reasons: [
      "High biomass and grain yield under assured irrigation management.",
      "Alluvial loam provides favorable root anchoring and nutrient availability.",
      "Favorable rotation alternative to diversify away from solanaceous pests."
    ],
    environmental_advantages: [
      "Abundant solar irradiance recorded by NASA CERES (4.2 kWh per m2 per day) powers efficient C4 photosynthesis.",
      "Tolerates moderate temperature shifts during vegetative growth."
    ],
    potential_risks: [
      "Fall armyworm (Spodoptera frugiperda) surveillance required at knee-high stage.",
      "Moisture stress during tasseling and silking causes significant yield reduction."
    ],
    water_and_irrigation_considerations:
      "Higher water requirement (400 to 500 mm). Needs 4 to 5 scheduled irrigations at critical growth checkpoints.",
    crop_rotation_notes:
      "Breaks fungal wilt cycles after potato, but soil requires nutrient replenishment post-harvest.",
    limitations: [
      "Requires higher initial investment in hybrid seed and balanced fertilizer.",
      "Water deficit during silking leads to barren ears."
    ],
    agricultural_sources: [
      "ICAR: Indian Institute of Maize Research (IIMR), Ludhiana",
      "BCKV Department of Agronomy: Kharif and Rabi Maize Studies",
      "Department of Agriculture, Government of West Bengal: Maize Promotion Scheme"
    ]
  }
];

export const MOCK_INDICATORS: EnvironmentalIndicators = {
  temperature: {
    average_temperature_celsius: 18.2,
    min_temperature_celsius: 12.8,
    max_temperature_celsius: 26.4,
    temperature_trend: "stable"
  },
  rainfall: {
    total_rainfall_mm: 4.2,
    consecutive_dry_days: 18,
    rainfall_trend: "dry_spell"
  },
  soil_moisture: {
    average_surface_soil_moisture_percent: 42.5,
    average_rootzone_soil_moisture_percent: 54.0,
    water_stress_indicator: "Optimal (Favorable Root-Zone Moisture)"
  },
  relative_humidity_percent: 68.0,
  solar_radiation_kwh_m2_day: 4.2
};

export const MOCK_IRRIGATION_SUMMARY: IrrigationSummary = {
  weekly_plan: [
    {
      week: 1,
      stage: "Crop establishment and germination",
      water_mm: 15,
      guidance: "Light surface irrigation to support uniform seed germination in dry topsoil."
    },
    {
      week: 2,
      stage: "Active rosette and root branching",
      water_mm: 18,
      guidance: "Maintain root zone moisture at 50 to 55 percent. Avoid soil surface crusting."
    },
    {
      week: 3,
      stage: "Branching and pre-flowering",
      water_mm: 20,
      guidance: "Critical irrigation window. Ensure adequate soil wetness before flower bud formation."
    },
    {
      week: 4,
      stage: "Flowering and early pod initiation",
      water_mm: 15,
      guidance: "Apply light furrow irrigation. Avoid standing water to prevent collar rot."
    }
  ],
  total_water_requirement_mm: "68 mm for month 1 (250 to 300 mm full season)",
  irrigation_method_recommended: "Controlled furrow or drip irrigation",
  guidance_notes:
    "GPM IMERG and POWER records confirm an extended dry spell (18 dry days). Farmers should rely on tube-well irrigation rather than awaiting precipitation."
};

export const MOCK_RISKS: RiskAlert[] = [
  {
    id: "risk-moisture-1",
    severity: "medium",
    category: "moisture",
    title: "Low Residual Surface Moisture Alert",
    description:
      "Top 0 to 5 cm soil moisture dropped to 42.5 percent following 18 consecutive dry days in Hooghly.",
    mitigation:
      "Administer light pre-sowing irrigation before seed drilling to ensure rapid and uniform seed emergence."
  },
  {
    id: "risk-temp-2",
    severity: "low",
    category: "temperature",
    title: "Temperature Fluctuation Alert",
    description:
      "Night minimums at 12.8 C with daytime peaks at 26.4 C. Diurnal temperature difference is currently 13.6 C.",
    mitigation:
      "Favorable thermal regime for mustard and lentil vegetative growth. Low disease incidence under current conditions."
  },
  {
    id: "risk-pest-3",
    severity: "medium",
    category: "pest",
    title: "Aphid and Humidity Advisory",
    description:
      "Morning relative humidity averaging 68 percent. Foggy periods could trigger mustard aphid activity.",
    mitigation:
      "Install yellow sticky traps (10 per acre) and inspect crop leaf undersides twice weekly starting in mid January."
  }
];

export const MOCK_ROTATION_ADVICE: RotationAdvice = {
  current_crop: "Potato",
  recommended_next: "Mustard",
  soil_impact:
    "Preserves residual phosphorus and potassium applied generously to previous potato crop while minimizing further nitrogen depletion.",
  pest_disease_benefit:
    "Breaks solanaceous bacterial wilt (Ralstonia solanacearum) and late blight (Phytophthora infestans) inoculum cycles in Singur alluvial soils.",
  notes:
    "Following Potato with Mustard or Lentil avoids the pathogen accumulation common in continuous potato monoculture."
};

export const MOCK_METADATA: RecommendationMetadata = {
  analysis_timestamp: "2026-11-14T19:30:00.000Z",
  satellite_sources: [
    "NASA POWER (CERES solar, MERRA-2 agro-climatology)",
    "NASA SMAP L4 (GEOS Catchment 9km soil wetness)",
    "NASA GPM IMERG (GPM_3IMERGDF daily final precipitation)"
  ],
  data_completeness_percentage: 98.4,
  region: "Singur, Hooghly District, West Bengal (ICAR-BCKV Agro-Climatic Zone III)",
  disclaimer:
    "AgriShift AI provides advisory recommendations based on NASA satellite observations and ICAR/BCKV agronomic research. It does NOT guarantee crop yield, market price, or financial profit."
};

export const DEFAULT_MOCK_RECOMMENDATION: RecommendationResponse = {
  farmer_profile: DEFAULT_FARMER_PROFILE,
  top_crops: MOCK_TOP_CROPS,
  indicators: MOCK_INDICATORS,
  rainfall_trend: "dry_spell",
  irrigation_summary: MOCK_IRRIGATION_SUMMARY,
  risks: MOCK_RISKS,
  rotation_advice: MOCK_ROTATION_ADVICE,
  metadata: MOCK_METADATA,
  is_mock: true
};

export const SUPPORTED_CROPS: SupportedCrop[] = [
  {
    id: "mustard",
    name: "Mustard / Rapeseed",
    botanical_name: "Brassica juncea",
    family: "Brassicaceae",
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Sandy Loam", "Loamy"],
    water_requirement_category: "Low",
    duration_days: "90 to 105 days"
  },
  {
    id: "lentil",
    name: "Lentil / Masoor",
    botanical_name: "Lens culinaris",
    family: "Fabaceae",
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Loamy", "Clay Loam"],
    water_requirement_category: "Low",
    duration_days: "110 to 125 days"
  },
  {
    id: "maize",
    name: "Maize (Corn)",
    botanical_name: "Zea mays",
    family: "Poaceae",
    suitable_seasons: ["Rabi", "Kharif", "Zaid"],
    optimal_soils: ["Alluvial", "Sandy Loam", "Loamy"],
    water_requirement_category: "Medium",
    duration_days: "115 to 130 days"
  },
  {
    id: "potato",
    name: "Potato",
    botanical_name: "Solanum tuberosum",
    family: "Solanaceae",
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Sandy Loam", "Loamy"],
    water_requirement_category: "Medium",
    duration_days: "80 to 110 days"
  },
  {
    id: "paddy_aman",
    name: "Paddy (Aman / Kharif)",
    botanical_name: "Oryza sativa",
    family: "Poaceae",
    suitable_seasons: ["Kharif"],
    optimal_soils: ["Clayey", "Clay Loam", "Alluvial"],
    water_requirement_category: "Very High",
    duration_days: "135 to 155 days"
  },
  {
    id: "boro_rice",
    name: "Boro Rice (Summer Paddy)",
    botanical_name: "Oryza sativa",
    family: "Poaceae",
    suitable_seasons: ["Boro", "Rabi"],
    optimal_soils: ["Clayey", "Alluvial", "Clay Loam"],
    water_requirement_category: "Very High",
    duration_days: "120 to 140 days"
  },
  {
    id: "jute",
    name: "Jute (Tossa)",
    botanical_name: "Corchorus olitorius",
    family: "Malvaceae",
    suitable_seasons: ["Zaid", "Kharif"],
    optimal_soils: ["Alluvial", "Loamy", "Clay Loam"],
    water_requirement_category: "High",
    duration_days: "110 to 130 days"
  },
  {
    id: "wheat",
    name: "Wheat",
    botanical_name: "Triticum aestivum",
    family: "Poaceae",
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Loamy", "Clay Loam"],
    water_requirement_category: "Medium",
    duration_days: "105 to 120 days"
  }
];

export function getMockRecommendations(customProfile?: Partial<FarmerProfileInput>): RecommendationResponse {
  const farmer_profile: FarmerProfileInput = {
    ...DEFAULT_FARMER_PROFILE,
    ...(customProfile || {})
  };

  const rotationAdvice: RotationAdvice = {
    current_crop: farmer_profile.current_crop,
    recommended_next: "Mustard",
    soil_impact: `Preserves residual nutrients from ${farmer_profile.current_crop} while maintaining soil organic structure.`,
    pest_disease_benefit: `Breaks pathogen cycles associated with continuous ${farmer_profile.current_crop} cultivation in Hooghly alluvial soils.`,
    notes: `Following ${farmer_profile.current_crop} with Mustard or Lentil provides optimal crop diversification.`
  };

  return {
    ...DEFAULT_MOCK_RECOMMENDATION,
    farmer_profile,
    rotation_advice: rotationAdvice,
    metadata: {
      ...MOCK_METADATA,
      analysis_timestamp: new Date().toISOString()
    },
    is_mock: true
  };
}
