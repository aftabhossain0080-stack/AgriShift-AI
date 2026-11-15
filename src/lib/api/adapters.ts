/**
 * Backend-to-frontend data adapters for AgriShift AI.
 *
 * All normalization of backend response shapes happens here.
 * If the backend changes a response field name or structure,
 * update the relevant adapter in this file and nowhere else.
 *
 * Components must import types from src/lib/types.ts, not from schema.d.ts.
 */

import type {
  BackendCropRecommendationResponse,
  BackendCropRecommendationItem,
  BackendEnvironmentalSummary,
} from "./schema";
import type {
  FarmerProfileInput,
  RecommendationResponse,
  CropRecommendation,
  CropViability,
  CropScoreBreakdown,
  EnvironmentalIndicators,
  SupportedCrop,
} from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapSuitabilityToViability(
  category: string | undefined,
  score: number | undefined
): CropViability {
  if (category) {
    const lower = category.toLowerCase();
    if (lower.includes("highly") || lower.includes("optimal")) return "Optimal";
    if (lower.includes("moderate")) return "Moderate";
    if (lower.includes("conditional")) return "Conditional";
    if (lower.includes("not recommended")) return "Poor";
  }
  if (typeof score === "number") {
    if (score >= 80) return "Optimal";
    if (score >= 65) return "Moderate";
    if (score >= 50) return "Conditional";
    return "Poor";
  }
  return "Moderate";
}

function adaptScoreBreakdown(
  raw: Record<string, number> | undefined
): CropScoreBreakdown {
  if (!raw) {
    return {
      temperature_score: 0,
      rainfall_score: 0,
      soil_moisture_score: 0,
      rotation_penalty_or_bonus: 0,
      total_score: 0,
    };
  }
  return {
    temperature_score: raw["temperature"] ?? 0,
    rainfall_score: raw["water_irrigation"] ?? 0,
    soil_moisture_score: raw["soil_moisture"] ?? 0,
    rotation_penalty_or_bonus: raw["rotation"] ?? 0,
    total_score: 0, // filled in by caller using suitability_score
    season_score: raw["season"],
    soil_score: raw["soil"],
    water_irrigation_score: raw["water_irrigation"],
  };
}

function adaptCropItem(item: BackendCropRecommendationItem): CropRecommendation {
  const viability = mapSuitabilityToViability(
    item.suitability_category,
    item.suitability_score
  );

  const breakdown = adaptScoreBreakdown(
    item.score_breakdown as Record<string, number> | undefined
  );
  breakdown.total_score = item.suitability_score;

  const reasons = Array.isArray(item.reasons) ? item.reasons : [];
  const rationale =
    reasons.length > 0
      ? reasons.join(". ")
      : item.water_and_irrigation_considerations ||
        "Recommended based on agro-climatic match with ICAR-BCKV criteria.";

  const irrigationMm =
    item.water_requirement === "Low"
      ? 15
      : item.water_requirement === "High" || item.water_requirement === "Very High"
      ? 35
      : 25;

  return {
    crop_name: item.crop_name,
    botanical_name: item.botanical_name,
    score: item.suitability_score,
    rank: item.rank,
    viability,
    suitability_category: item.suitability_category,
    crop_duration: item.crop_duration,
    water_requirement: item.water_requirement,
    rationale,
    irrigation_weekly_mm: irrigationMm,
    agronomic_notes: item.crop_rotation_notes,
    score_breakdown: breakdown,
    reasons: item.reasons,
    environmental_advantages: item.environmental_advantages,
    potential_risks: item.potential_risks,
    water_and_irrigation_considerations: item.water_and_irrigation_considerations,
    crop_rotation_notes: item.crop_rotation_notes,
    limitations: item.limitations,
    agricultural_sources: item.agricultural_sources,
  };
}

function adaptEnvironmentalSummary(
  env: BackendEnvironmentalSummary
): EnvironmentalIndicators {
  const temp = env.temperature ?? {};
  const rain = env.rainfall ?? {};
  const sm = env.soil_moisture ?? {};
  const atmos = env.atmospheric ?? {};

  return {
    temperature: {
      average_temperature_celsius: temp.average_celsius ?? 20,
      min_temperature_celsius: temp.min_celsius ?? 15,
      max_temperature_celsius: temp.max_celsius ?? 28,
      temperature_trend: temp.trend ?? "stable",
    },
    rainfall: {
      total_rainfall_mm: rain.total_mm ?? 0,
      consecutive_dry_days: rain.consecutive_dry_days ?? 0,
      rainfall_trend: rain.trend ?? "dry_spell",
    },
    soil_moisture: {
      average_surface_soil_moisture_percent:
        typeof sm.surface_fraction === "number"
          ? Math.round(sm.surface_fraction * 100)
          : 42,
      average_rootzone_soil_moisture_percent:
        typeof sm.rootzone_fraction === "number"
          ? Math.round(sm.rootzone_fraction * 100)
          : 54,
      water_stress_indicator:
        sm.water_stress_status ?? "Optimal (Favorable Root-Zone Moisture)",
    },
    relative_humidity_percent: atmos.relative_humidity_percent ?? 68,
    solar_radiation_kwh_m2_day: atmos.solar_radiation_kwh_m2_day ?? 4.2,
  };
}

// ---------------------------------------------------------------------------
// Public adapters
// ---------------------------------------------------------------------------

/**
 * Adapt a raw backend CropRecommendationResponse to the frontend RecommendationResponse.
 * If the backend changes the response shape, update this adapter here.
 */
export function adaptRecommendationResponse(
  raw: BackendCropRecommendationResponse,
  input: FarmerProfileInput
): RecommendationResponse {
  const topCrops: CropRecommendation[] = (raw.recommendations ?? []).map(
    adaptCropItem
  );

  const env = raw.environmental_summary;
  const indicators = env
    ? adaptEnvironmentalSummary(env)
    : {
        temperature: {
          average_temperature_celsius: 18,
          min_temperature_celsius: 12,
          max_temperature_celsius: 26,
          temperature_trend: "stable",
        },
        rainfall: {
          total_rainfall_mm: 0,
          consecutive_dry_days: 0,
          rainfall_trend: "dry_spell",
        },
        soil_moisture: {
          average_surface_soil_moisture_percent: 42,
          average_rootzone_soil_moisture_percent: 54,
          water_stress_indicator: "Optimal",
        },
      };

  const rainfallTrend = env?.rainfall?.trend ?? "dry_spell";
  const topCropName = topCrops[0]?.crop_name ?? "Mustard";

  return {
    farmer_profile: input,
    top_crops: topCrops,
    indicators,
    rainfall_trend: rainfallTrend,
    irrigation_summary: {
      weekly_plan: [],
      total_water_requirement_mm: "See agronomic notes",
      irrigation_method_recommended: "Controlled furrow or drip irrigation",
      guidance_notes: raw.disclaimer ?? "",
    },
    risks: [],
    rotation_advice: {
      current_crop: input.current_crop,
      recommended_next: topCropName,
      soil_impact: `Preserves residual nutrients after ${input.current_crop}.`,
      pest_disease_benefit: `Breaks pathogen cycles associated with ${input.current_crop}.`,
      notes: `Rotation from ${input.current_crop} to ${topCropName} follows ICAR-BCKV recommendations.`,
    },
    metadata: {
      analysis_timestamp: new Date().toISOString(),
      satellite_sources: [
        "NASA POWER (Agro-climatology and solar radiation)",
        "NASA SMAP L4 (Soil wetness fractions)",
        "NASA GPM IMERG (Satellite precipitation)",
      ],
      data_completeness_percentage:
        env?.data_completeness_percentage ??
        raw.data_quality_and_confidence?.overall_completeness_percentage ??
        95,
      region: `${input.village}, India`,
      disclaimer: raw.disclaimer,
    },
    is_mock: false,
  };
}

/**
 * Adapt a raw crop list from the backend to the frontend SupportedCrop array.
 * If the backend changes the crop list shape, update this adapter here.
 */
export function adaptCropList(raw: unknown[]): SupportedCrop[] {
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      id: String(item["id"] ?? item["crop_name"] ?? ""),
      name: String(item["name"] ?? item["crop_name"] ?? ""),
      botanical_name: String(item["botanical_name"] ?? ""),
      family: String(item["family"] ?? ""),
      suitable_seasons: Array.isArray(item["suitable_seasons"])
        ? (item["suitable_seasons"] as string[])
        : [],
      optimal_soils: Array.isArray(item["optimal_soils"])
        ? (item["optimal_soils"] as string[])
        : [],
      water_requirement_category: String(item["water_requirement_category"] ?? "Medium"),
      duration_days: String(item["duration_days"] ?? "90 to 120 days"),
    }));
}
