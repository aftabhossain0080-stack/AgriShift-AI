/**
 * Agriculture data processing endpoint functions.
 * Route: POST /api/v1/agriculture/process
 *
 * Components must call these functions, never fetch directly.
 */

import { apiFetch } from "./client";
import type {
  BackendAgricultureProcessRequest,
  BackendAgricultureProcessResponse,
} from "./schema";

const AGRICULTURE_PREFIX = "/api/v1";

/**
 * POST /api/v1/agriculture/process
 * Executes Phase 5 pipeline: clean, integrate, and process Earth observation data.
 * Returns combined indicators from NASA POWER, SMAP, and GPM IMERG.
 *
 * If the backend changes the /agriculture/process request or response shape,
 * update the type imports from schema.d.ts here.
 */
export async function processAgricultureData(
  request: BackendAgricultureProcessRequest
): Promise<BackendAgricultureProcessResponse> {
  return apiFetch<BackendAgricultureProcessResponse>(
    `${AGRICULTURE_PREFIX}/agriculture/process`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}
