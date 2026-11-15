/**
 * Mock layer for AgriShift AI.
 * Controlled by NEXT_PUBLIC_USE_MOCKS environment variable.
 *
 * Usage:
 *   import { USE_MOCKS, getMockOrFetch } from "@/lib/api/mocks";
 *   const data = await getMockOrFetch(mockData, () => realApiCall());
 */

export {
  getMockRecommendations,
  MOCK_TOP_CROPS,
  MOCK_INDICATORS,
  MOCK_IRRIGATION_SUMMARY,
  MOCK_RISKS,
  MOCK_ROTATION_ADVICE,
  MOCK_METADATA,
  DEFAULT_MOCK_RECOMMENDATION,
  DEFAULT_FARMER_PROFILE,
  SUPPORTED_CROPS,
} from "../../mock-data";

/** True when NEXT_PUBLIC_USE_MOCKS is set to the string "true". */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

/**
 * Returns mockData immediately when USE_MOCKS is true.
 * Otherwise calls fetchFn and returns its result.
 *
 * Use this in api functions that should be bypassable in demo mode.
 */
export async function getMockOrFetch<T>(
  mockData: T,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (USE_MOCKS) {
    return Promise.resolve(mockData);
  }
  return fetchFn();
}
