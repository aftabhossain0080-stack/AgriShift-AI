/**
 * Farmer endpoint functions.
 * Routes: /api/v1/farmer/profile, /api/v1/farmer/status
 *
 * Components must call these functions, never fetch directly.
 */

import { apiFetch } from "./client";
import type { BackendFarmerProfile, BackendFarmerProfileResponse } from "./schema";
import { adaptCropList } from "./adapters";
import type { SupportedCrop } from "../types";
import { SUPPORTED_CROPS } from "../mock-data";

const FARMER_PREFIX = "/api/v1/farmer";

/** POST /api/v1/farmer/profile - Submit and validate a farmer profile. */
export async function submitFarmerProfile(
  profile: BackendFarmerProfile
): Promise<BackendFarmerProfileResponse> {
  return apiFetch<BackendFarmerProfileResponse>(`${FARMER_PREFIX}/profile`, {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

/** GET /api/v1/farmer/crops - Fetch supported crop catalog. Falls back to local catalog on error. */
export async function getSupportedCrops(): Promise<SupportedCrop[]> {
  try {
    const data = await apiFetch<unknown[]>(`${FARMER_PREFIX}/crops`, {
      timeout: 3000,
      retries: 1,
    });
    if (Array.isArray(data) && data.length > 0) {
      return adaptCropList(data);
    }
  } catch {
    // Fall back to local catalog when backend is unreachable
  }
  return SUPPORTED_CROPS;
}

/** GET /api/v1/farmer/status - Operational status of farmer service. */
export async function getFarmerServiceStatus(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`${FARMER_PREFIX}/status`);
}
