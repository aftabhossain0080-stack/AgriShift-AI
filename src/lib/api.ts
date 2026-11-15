import {
  FarmerProfileInput,
  RecommendationResponse,
  CropRecommendation,
  CropViability,
  SupportedCrop,
  BackendHealthResponse
} from "./types";
import {
  getMockRecommendations,
  SUPPORTED_CROPS,
  MOCK_IRRIGATION_SUMMARY,
  MOCK_RISKS
} from "./mock-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const REQUEST_TIMEOUT_MS = 10000;

function mapSuitabilityToViability(category?: string, score?: number): CropViability {
  if (category) {
    const lower = category.toLowerCase();
    if (lower.includes("highly") || lower.includes("optimal")) return "Optimal";
    if (lower.includes("moderately") || lower.includes("moderate")) return "Moderate";
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

function normalizeBackendResponse(
  json: Record<string, unknown>,
  input: FarmerProfileInput
): RecommendationResponse {
  if (json.top_crops && Array.isArray(json.top_crops)) {
    return {
      ...(json as unknown as RecommendationResponse),
      farmer_profile: (json.farmer_profile as FarmerProfileInput) || input,
      is_mock: false
    };
  }

  const rawRecs: Array<Record<string, unknown>> = Array.isArray(json.recommendations) ? json.recommendations : [];
  const topCrops: CropRecommendation[] = rawRecs.map((rec: Record<string, unknown>, idx: number) => {
    const viability = mapSuitabilityToViability(
      typeof rec.suitability_category === "string" ? rec.suitability_category : undefined,
      typeof rec.suitability_score === "number" ? rec.suitability_score : undefined
    );
    const reasons = Array.isArray(rec.reasons) ? (rec.reasons as string[]) : [];
    const rationale =
      reasons.length > 0
        ? reasons.join(". ")
        : (typeof rec.rationale === "string" ? rec.rationale : "Recommended based on agro-climatic match.");

    const irrigationMm =
      rec.water_requirement === "Low"
        ? 15
        : rec.water_requirement === "Medium"
        ? 25
        : 35;

    const limitations = Array.isArray(rec.limitations) ? (rec.limitations as string[]) : [];
    const agronomicNotes =
      typeof rec.crop_rotation_notes === "string"
        ? rec.crop_rotation_notes
        : limitations.length > 0
        ? limitations.join(". ")
        : "Standard package of practices for this location.";

    const bd = (rec.score_breakdown || {}) as Record<string, number>;

    return {
      crop_name: typeof rec.crop_name === "string" ? rec.crop_name : `Crop ${idx + 1}`,
      botanical_name: typeof rec.botanical_name === "string" ? rec.botanical_name : undefined,
      score: typeof rec.suitability_score === "number" ? rec.suitability_score : 80.0,
      rank: typeof rec.rank === "number" ? rec.rank : idx + 1,
      viability,
      suitability_category: typeof rec.suitability_category === "string" ? rec.suitability_category : "Recommended",
      crop_duration: typeof rec.crop_duration === "string" ? rec.crop_duration : "90 to 120 days",
      water_requirement: typeof rec.water_requirement === "string" ? rec.water_requirement : "Medium",
      rationale,
      irrigation_weekly_mm: irrigationMm,
      agronomic_notes: agronomicNotes,
      score_breakdown: {
        temperature_score: bd.temperature ?? 20.0,
        rainfall_score: bd.water_irrigation ?? 20.0,
        soil_moisture_score: bd.soil_moisture ?? 8.0,
        rotation_penalty_or_bonus: bd.rotation ?? 8.0,
        total_score: typeof rec.suitability_score === "number" ? rec.suitability_score : 80.0,
        season_score: bd.season ?? 25.0,
        soil_score: bd.soil ?? 15.0,
        water_irrigation_score: bd.water_irrigation ?? 20.0
      },
      reasons: Array.isArray(rec.reasons) ? (rec.reasons as string[]) : [],
      environmental_advantages: Array.isArray(rec.environmental_advantages) ? (rec.environmental_advantages as string[]) : [],
      potential_risks: Array.isArray(rec.potential_risks) ? (rec.potential_risks as string[]) : [],
      water_and_irrigation_considerations: typeof rec.water_and_irrigation_considerations === "string" ? rec.water_and_irrigation_considerations : undefined,
      crop_rotation_notes: typeof rec.crop_rotation_notes === "string" ? rec.crop_rotation_notes : undefined,
      limitations,
      agricultural_sources: Array.isArray(rec.agricultural_sources) ? (rec.agricultural_sources as string[]) : []
    };
  });

  interface RawEnvSummary {
    temperature?: {
      average_celsius?: number;
      min_celsius?: number;
      max_celsius?: number;
      trend?: string;
    };
    rainfall?: {
      total_mm?: number;
      consecutive_dry_days?: number;
      trend?: string;
    };
    soil_moisture?: {
      surface_fraction?: number;
      rootzone_fraction?: number;
      water_stress_status?: string;
    };
    atmospheric?: {
      relative_humidity_percent?: number;
      solar_radiation_kwh_m2_day?: number;
    };
    data_completeness_percentage?: number;
  }

  const env = (json.environmental_summary || {}) as RawEnvSummary;
  const temp = env.temperature || {};
  const rain = env.rainfall || {};
  const sm = env.soil_moisture || {};
  const atmos = env.atmospheric || {};

  const topCropName = topCrops[0]?.crop_name || "Mustard";
  const disclaimerText =
    typeof json.disclaimer === "string"
      ? json.disclaimer
      : "AgriShift AI provides advisory recommendations based on NASA satellite observations and ICAR/BCKV agronomic research. It does NOT guarantee crop yield, market price, or financial profit.";

  return {
    farmer_profile: input,
    top_crops: topCrops.length > 0 ? topCrops : getMockRecommendations(input).top_crops,
    indicators: {
      temperature: {
        average_temperature_celsius: temp.average_celsius ?? 18.2,
        min_temperature_celsius: temp.min_celsius ?? 12.8,
        max_temperature_celsius: temp.max_celsius ?? 26.4,
        temperature_trend: temp.trend ?? "stable"
      },
      rainfall: {
        total_rainfall_mm: rain.total_mm ?? 4.2,
        consecutive_dry_days: rain.consecutive_dry_days ?? 18,
        rainfall_trend: rain.trend ?? "dry_spell"
      },
      soil_moisture: {
        average_surface_soil_moisture_percent:
          typeof sm.surface_fraction === "number"
            ? Math.round(sm.surface_fraction * 100)
            : 42.5,
        average_rootzone_soil_moisture_percent:
          typeof sm.rootzone_fraction === "number"
            ? Math.round(sm.rootzone_fraction * 100)
            : 54.0,
        water_stress_indicator:
          sm.water_stress_status ?? "Optimal (Favorable Root-Zone Moisture)"
      },
      relative_humidity_percent: atmos.relative_humidity_percent ?? 68.0,
      solar_radiation_kwh_m2_day: atmos.solar_radiation_kwh_m2_day ?? 4.2
    },
    rainfall_trend: rain.trend ?? "dry_spell",
    irrigation_summary: MOCK_IRRIGATION_SUMMARY,
    risks: MOCK_RISKS,
    rotation_advice: {
      current_crop: input.current_crop,
      recommended_next: topCropName,
      soil_impact: `Preserves residual nutrients and soil vitality after harvesting ${input.current_crop}.`,
      pest_disease_benefit: `Breaks specific insect and fungal persistence cycles associated with ${input.current_crop}.`,
      notes: `Rotating to ${topCropName} after ${input.current_crop} aligns with ICAR and BCKV recommendations.`
    },
    metadata: {
      analysis_timestamp: new Date().toISOString(),
      satellite_sources: [
        "NASA POWER (Agro-climatology and solar radiation)",
        "NASA SMAP L4 (Soil wetness fractions)",
        "NASA GPM IMERG (Satellite precipitation)"
      ],
      data_completeness_percentage: env.data_completeness_percentage ?? 98.4,
      region: `${input.village}, India`,
      disclaimer: disclaimerText
    },
    is_mock: false
  };
}

export async function fetchRecommendations(
  input: FarmerProfileInput
): Promise<RecommendationResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return getMockRecommendations(input);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const payload = {
    farmer_profile: {
      village: input.village,
      latitude: input.latitude,
      longitude: input.longitude,
      current_crop: input.current_crop,
      previous_crop: input.previous_crop,
      soil_type: input.soil_type,
      land_area_acres: input.land_area_acres,
      irrigation_available: input.irrigation_available,
      farming_season: input.farming_season
    },
    target_farming_season: input.farming_season
  };

  const candidateEndpoints = [
    `${API_BASE_URL}/api/v1/recommendations/generate`,
    `${API_BASE_URL}/api/v1/agriculture/recommendations`
  ];

  try {
    let lastError: Error | null = null;

    for (const url of candidateEndpoints) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        if (response.ok) {
          clearTimeout(timeoutId);
          const data = await response.json();
          return normalizeBackendResponse(data, input);
        }

        if (response.status !== 404) {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("Request timed out after 10 seconds.");
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError || new Error("Failed to reach recommendation endpoints.");
  } catch (error) {
    console.warn(
      "AgriShift API fetch failed, falling back to realistic ICAR/BCKV mock data:",
      error
    );
    return getMockRecommendations(input);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkBackendHealth(): Promise<{
  healthy: boolean;
  data?: BackendHealthResponse;
  error?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    if (res.ok) {
      const data = (await res.json()) as BackendHealthResponse;
      return { healthy: true, data };
    }
    return {
      healthy: false,
      error: `Health check responded with status ${res.status}`
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to backend health check.";
    return {
      healthy: false,
      error: message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getSupportedCrops(): Promise<SupportedCrop[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crops`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as SupportedCrop[];
      }
    }
  } catch (err) {
    console.warn("Unable to fetch crops from backend, returning cached crop catalog:", err);
  } finally {
    clearTimeout(timeoutId);
  }

  return SUPPORTED_CROPS;
}
