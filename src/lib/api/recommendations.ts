/**
 * Recommendation endpoint functions.
 * Routes: POST /api/v1/agriculture/recommendations, GET /api/v1/recommendations/status
 *
 * Components must call these functions, never fetch directly.
 */

import { apiFetch } from "./client";
import { adaptRecommendationResponse } from "./adapters";
import { getMockRecommendations } from "../mock-data";
import type { BackendCropRecommendationRequest, BackendCropRecommendationResponse } from "./schema";
import type { FarmerProfileInput, RecommendationResponse } from "../types";

const RECO_PREFIX = "/api/v1";

/**
 * POST /api/v1/agriculture/recommendations
 * Generates ranked crop recommendations with full 100-point score breakdown.
 * Falls back to validated agronomic mock data on network failure.
 *
 * If the backend changes the endpoint path, update the CANDIDATE_PATHS array here.
 */
export async function generateRecommendations(
  input: FarmerProfileInput
): Promise<RecommendationResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return getMockRecommendations(input);
  }

  const payload: BackendCropRecommendationRequest = {
    farmer_profile: {
      village: input.village,
      latitude: input.latitude,
      longitude: input.longitude,
      current_crop: input.current_crop,
      previous_crop: input.previous_crop,
      soil_type: input.soil_type,
      land_area_acres: input.land_area_acres,
      irrigation_available: input.irrigation_available,
      farming_season: input.farming_season,
    },
    target_farming_season: input.farming_season,
  };

  // Try primary endpoint first, then legacy path
  const CANDIDATE_PATHS = [
    `${RECO_PREFIX}/agriculture/recommendations`,
    `${RECO_PREFIX}/recommendations/generate`,
  ];

  let lastError: unknown = null;

  for (const path of CANDIDATE_PATHS) {
    try {
      const raw = await apiFetch<BackendCropRecommendationResponse>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return adaptRecommendationResponse(raw, input);
    } catch (err) {
      lastError = err;
      // If 404, try next candidate path
      const isNotFound =
        err instanceof Error && err.message.includes("404");
      if (!isNotFound) break;
    }
  }

  console.warn(
    "AgriShift API unavailable, returning validated agronomic fallback data:",
    lastError
  );
  return getMockRecommendations(input);
}

/** GET /api/v1/recommendations/status - Recommendation engine operational status. */
export async function getRecommendationsStatus(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`${RECO_PREFIX}/recommendations/status`);
}
