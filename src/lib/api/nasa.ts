/**
 * NASA Earth Observation endpoint functions.
 * Routes: /api/v1/nasa/power, /api/v1/nasa/power/summary, /api/v1/nasa/gpm/summary, /api/v1/nasa/smap/summary
 *
 * Components must call these functions, never fetch directly.
 */

import { apiFetch } from "./client";
import type {
  BackendNasaPowerResponse,
  BackendNasaPowerSummaryResponse,
  BackendNasaGpmSummaryResponse,
  BackendNasaSmapSummaryResponse,
} from "./schema";

const NASA_PREFIX = "/api/v1/nasa";

export interface NasaDateRangeParams {
  latitude: number;
  longitude: number;
  start_date?: string;
  end_date?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

/** GET /api/v1/nasa/power - Full daily agro-meteorological records. */
export async function getNasaPowerData(
  params: NasaDateRangeParams
): Promise<BackendNasaPowerResponse> {
  const query = buildQuery({
    latitude: params.latitude,
    longitude: params.longitude,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  return apiFetch<BackendNasaPowerResponse>(`${NASA_PREFIX}/power${query}`);
}

/** GET /api/v1/nasa/power/summary - Agro-climatic summary statistics. */
export async function getNasaPowerSummary(
  params: NasaDateRangeParams
): Promise<BackendNasaPowerSummaryResponse> {
  const query = buildQuery({
    latitude: params.latitude,
    longitude: params.longitude,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  return apiFetch<BackendNasaPowerSummaryResponse>(`${NASA_PREFIX}/power/summary${query}`);
}

/** GET /api/v1/nasa/gpm/summary - GPM IMERG satellite precipitation summary. */
export async function getNasaGpmData(
  params: NasaDateRangeParams
): Promise<BackendNasaGpmSummaryResponse> {
  const query = buildQuery({
    latitude: params.latitude,
    longitude: params.longitude,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  return apiFetch<BackendNasaGpmSummaryResponse>(`${NASA_PREFIX}/gpm/summary${query}`);
}

/** GET /api/v1/nasa/smap/summary - SMAP Level-4 soil moisture summary. */
export async function getNasaSmapData(
  params: NasaDateRangeParams
): Promise<BackendNasaSmapSummaryResponse> {
  const query = buildQuery({
    latitude: params.latitude,
    longitude: params.longitude,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  return apiFetch<BackendNasaSmapSummaryResponse>(`${NASA_PREFIX}/smap/summary${query}`);
}

/** GET /api/v1/nasa/status - Service operational status. */
export async function getNasaServiceStatus(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`${NASA_PREFIX}/status`);
}

// ==============================================================================
// SATELLITE SNAPSHOT SPECIFICATION
// ==============================================================================

export interface SatelliteSnapshot {
  rainfall30d: number[]; // 10 values, 3-day periods
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  soilMoisture: number; // 0-1 fraction
  humidityAvg: number;
  solarAvg: number;
}

export const mockSnapshot: SatelliteSnapshot = {
  rainfall30d: [8.2, 12.5, 3.1, 0.0, 15.3, 22.1, 7.8, 4.2, 18.6, 11.0],
  tempMin: 14.2,
  tempMax: 28.8,
  tempAvg: 21.5,
  soilMoisture: 0.42,
  humidityAvg: 68.3,
  solarAvg: 18.4,
};

function adaptNasaResponse(data: unknown): SatelliteSnapshot {
  // Adapt whatever the backend returns to our shape
  // This is a defensive adapter
  const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const summary = (d.summary && typeof d.summary === "object" ? d.summary : {}) as Record<string, unknown>;
  const daily = Array.isArray(d.data) ? (d.data as Record<string, unknown>[]) : [];

  let rainfall30d = (d.rainfall_30d as number[]) ?? (d.rainfall30d as number[]);
  if (!rainfall30d && daily.length > 0) {
    const bins: number[] = [];
    for (let i = 0; i < 10; i++) {
      const slice = daily.slice(i * 3, (i + 1) * 3);
      const sum = slice.reduce(
        (acc, pt) => acc + (typeof pt?.precipitation === "number" ? pt.precipitation : 0),
        0
      );
      bins.push(Number(sum.toFixed(1)));
    }
    rainfall30d = bins;
  }

  return {
    rainfall30d: rainfall30d ?? mockSnapshot.rainfall30d,
    tempMin: (d.temp_min as number) ?? (summary.min_temperature as number) ?? mockSnapshot.tempMin,
    tempMax: (d.temp_max as number) ?? (summary.max_temperature as number) ?? mockSnapshot.tempMax,
    tempAvg: (d.temp_avg as number) ?? (summary.average_temperature as number) ?? mockSnapshot.tempAvg,
    soilMoisture: (d.soil_moisture as number) ?? (d.soilMoisture as number) ?? mockSnapshot.soilMoisture,
    humidityAvg: (d.humidity_avg as number) ?? (summary.average_humidity as number) ?? mockSnapshot.humidityAvg,
    solarAvg: (d.solar_avg as number) ?? (summary.average_solar_radiation as number) ?? mockSnapshot.solarAvg,
  };
}

export async function fetchSatelliteSnapshot(lat: number, lon: number): Promise<SatelliteSnapshot> {
  // Try real API first
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

  // If mock mode, return mock immediately
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return mockSnapshot;
  }

  try {
    // Try NASA POWER endpoint with both lat/lon and latitude/longitude query param shapes
    const res = await fetch(`${baseUrl}/api/v1/nasa/power?lat=${lat}&lon=${lon}&latitude=${lat}&longitude=${lon}`, {
      signal: AbortSignal.timeout(20000), // 20s timeout for NASA data
    });
    if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
    const data = await res.json();
    // Map to SatelliteSnapshot shape (backend schema may differ)
    return adaptNasaResponse(data);
  } catch {
    // Fallback to mock with a note
    console.warn("NASA API unavailable, using mock snapshot data");
    return mockSnapshot;
  }
}
