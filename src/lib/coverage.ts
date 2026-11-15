export const INDIA_BOUNDS = { minLat: 6.4, maxLat: 35.6, minLon: 68.1, maxLon: 97.4 }
export function isInCoverage(lat: number, lon: number): boolean {
  return lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
    lon >= INDIA_BOUNDS.minLon && lon <= INDIA_BOUNDS.maxLon
}
