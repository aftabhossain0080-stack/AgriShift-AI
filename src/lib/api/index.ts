/**
 * Barrel export for the AgriShift AI API layer.
 * Import all API functions, types, and utilities from this file.
 *
 * Usage: import { generateRecommendations, ApiError, USE_MOCKS } from "@/lib/api";
 */

// Client and error type
export { apiFetch, ApiError } from "./client";
export type { ApiFetchOptions } from "./client";

// Adapters (backend-to-frontend normalization)
export { adaptRecommendationResponse, adaptCropList } from "./adapters";

// Endpoint groups
export {
  getNasaPowerData,
  getNasaPowerSummary,
  getNasaGpmData,
  getNasaSmapData,
  getNasaServiceStatus,
  fetchSatelliteSnapshot,
  mockSnapshot,
} from "./nasa";
export type { SatelliteSnapshot, NasaDateRangeParams } from "./nasa";

export {
  submitFarmerProfile,
  getSupportedCrops,
  getFarmerServiceStatus,
} from "./farmer";

export { processAgricultureData } from "./agriculture";

export {
  generateRecommendations,
  getRecommendationsStatus,
} from "./recommendations";

// Mock layer
export {
  USE_MOCKS,
  getMockOrFetch,
  getMockRecommendations,
  SUPPORTED_CROPS,
  DEFAULT_FARMER_PROFILE,
  DEFAULT_MOCK_RECOMMENDATION,
} from "./mocks";
