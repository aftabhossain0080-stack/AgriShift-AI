"use client";

import React, { useState, useEffect, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { fetchSatelliteSnapshot, SatelliteSnapshot } from "@/lib/api/nasa";

export interface SatelliteSnapshotStepProps {
  lat: number;
  lon: number;
  onContinue: () => void;
  onBack: () => void;
}

interface RainfallTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { period: string; label: string; rainfall: number } }>;
}

function RainfallTooltip({ active, payload }: RainfallTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-offWhite p-2.5 border border-border rounded-[6px] text-xs">
        <p className="font-semibold text-ink">{item.label}</p>
        <p className="text-deepGreen font-bold mt-0.5">
          Rainfall: {item.rainfall.toFixed(1)} mm
        </p>
      </div>
    );
  }
  return null;
}

function getSoilMoistureStatus(pct: number): { label: string; textClass: string; barClass: string } {
  if (pct < 20) {
    return { label: "Very dry", textClass: "text-alertRed", barClass: "bg-alertRed" };
  }
  if (pct < 40) {
    return { label: "Dry", textClass: "text-soilBrown", barClass: "bg-soilBrown" };
  }
  if (pct <= 60) {
    return { label: "Adequate", textClass: "text-deepGreen", barClass: "bg-deepGreen" };
  }
  if (pct <= 80) {
    return { label: "Moist", textClass: "text-deepGreen", barClass: "bg-deepGreen" };
  }
  return { label: "Saturated", textClass: "text-deepGreen", barClass: "bg-deepGreen" };
}

export function SatelliteSnapshotStep({
  lat,
  lon,
  onContinue,
  onBack,
}: SatelliteSnapshotStepProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [isMounted, setIsMounted] = useState(false);
  const chartId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data,
    isLoading,
    isError,
    refetch,
    dataUpdatedAt,
  } = useQuery<SatelliteSnapshot>({
    queryKey: ["satellite-snapshot", lat, lon],
    queryFn: () => fetchSatelliteSnapshot(lat, lon),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });

  const formattedDate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const rainfallData = (data?.rainfall30d ?? []).map((val, idx) => ({
    period: `P${idx + 1}`,
    label: `Days ${idx * 3 + 1}-${(idx + 1) * 3}`,
    rainfall: val,
  }));

  const moisturePct = data
    ? Math.min(100, Math.max(0, Math.round(data.soilMoisture * 100)))
    : 0;
  const soilStatus = getSoilMoistureStatus(moisturePct);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 bg-offWhite text-ink font-body">
      {/* Header Info */}
      <div className="border border-border rounded-[6px] p-5 bg-offWhite space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-heading text-xl text-deepGreen font-semibold">
              Step 3: Live Satellite Earth Observations
            </h2>
            <p className="text-sm text-soilBrown mt-1">
              Real-time agro-meteorological telemetry from NASA GPM IMERG, NASA POWER, and SMAP
              for location ({lat.toFixed(2)} N, {lon.toFixed(2)} E).
            </p>
          </div>
          <div className="text-xs px-2.5 py-1 rounded-[6px] border border-border bg-offWhite text-soilBrown">
            Telemetry Active
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6" aria-busy="true" aria-live="polite">
          {/* Large Card Skeleton */}
          <div className="border border-border rounded-[6px] p-6 bg-offWhite space-y-4">
            <div className="h-5 w-56 bg-border animate-pulse rounded-[6px]" />
            <div className="h-64 w-full bg-border/60 animate-pulse rounded-[6px]" />
          </div>

          {/* Side by Side Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-[6px] p-5 bg-offWhite space-y-3">
              <div className="h-4 w-36 bg-border animate-pulse rounded-[6px]" />
              <div className="h-8 w-44 bg-border/60 animate-pulse rounded-[6px]" />
              <div className="h-3 w-28 bg-border/50 animate-pulse rounded-[6px]" />
            </div>
            <div className="border border-border rounded-[6px] p-5 bg-offWhite space-y-3">
              <div className="h-4 w-36 bg-border animate-pulse rounded-[6px]" />
              <div className="h-4 w-full bg-border/60 animate-pulse rounded-[6px]" />
              <div className="h-3 w-28 bg-border/50 animate-pulse rounded-[6px]" />
            </div>
          </div>

          {/* Small Stats Row Skeleton */}
          <div className="border border-border rounded-[6px] p-4 bg-offWhite flex gap-6">
            <div className="h-4 w-40 bg-border animate-pulse rounded-[6px]" />
            <div className="h-4 w-40 bg-border animate-pulse rounded-[6px]" />
          </div>
        </div>
      ) : isError || !data ? (
        <div className="border border-alertRed/40 bg-offWhite rounded-[6px] p-6 text-center space-y-4">
          <p className="text-alertRed font-semibold">
            Unable to load satellite observation telemetry for this location.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] min-w-[44px] px-6 py-2.5 bg-deepGreen text-offWhite font-semibold rounded-[6px] border border-deepGreen hover:bg-deepGreen/90 transition-colors"
          >
            Retry Satellite Fetch
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card 1: Large Card (Full Width) - 30-day Rainfall from GPM IMERG */}
          <div className="border border-border rounded-[6px] p-5 bg-offWhite space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-soilBrown">
                  NASA GPM IMERG Satellite
                </span>
                <h3 className="font-heading text-lg font-semibold text-deepGreen mt-0.5">
                  Rainfall last 30 days (mm)
                </h3>
              </div>
              <div className="flex items-center gap-1 border border-border rounded-[6px] p-1 bg-offWhite">
                <button
                  type="button"
                  onClick={() => setViewMode("chart")}
                  aria-pressed={viewMode === "chart"}
                  className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-[6px] transition-colors ${
                    viewMode === "chart"
                      ? "bg-deepGreen text-offWhite"
                      : "text-ink hover:bg-border/30"
                  }`}
                >
                  Bar Chart
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  aria-pressed={viewMode === "table"}
                  className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-[6px] transition-colors ${
                    viewMode === "table"
                      ? "bg-deepGreen text-offWhite"
                      : "text-ink hover:bg-border/30"
                  }`}
                >
                  Data Table
                </button>
              </div>
            </div>

            {viewMode === "chart" ? (
              <div className="h-64 w-full pt-2">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%" id={chartId}>
                    <BarChart
                      data={rainfallData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#D8D2C4" vertical={false} />
                      <XAxis
                        dataKey="period"
                        stroke="#1B1F1C"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#D8D2C4" }}
                        label={{
                          value: "3-Day Periods (Last 30 Days)",
                          position: "insideBottom",
                          offset: -12,
                          fontSize: 11,
                          fill: "#6B4A2F",
                        }}
                      />
                      <YAxis
                        stroke="#1B1F1C"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#D8D2C4" }}
                        unit=" mm"
                      />
                      <Tooltip content={<RainfallTooltip />} />
                      <Bar
                        dataKey="rainfall"
                        fill="#1E4D36"
                        radius={[4, 4, 0, 0]}
                        name="Precipitation"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full bg-border/20 rounded-[6px]" />
                )}
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-[6px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-border/20">
                      <th className="py-2.5 px-3 font-semibold text-soilBrown">Period</th>
                      <th className="py-2.5 px-3 font-semibold text-soilBrown">Window</th>
                      <th className="py-2.5 px-3 font-semibold text-soilBrown text-right">
                        Rainfall (mm)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rainfallData.map((row, idx) => (
                      <tr
                        key={row.period}
                        className={`border-b border-border last:border-b-0 ${
                          idx % 2 === 0 ? "bg-offWhite" : "bg-border/10"
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-ink">{row.period}</td>
                        <td className="py-2 px-3 text-soilBrown">{row.label}</td>
                        <td className="py-2 px-3 font-semibold text-deepGreen text-right">
                          {row.rainfall.toFixed(1)} mm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cards 2 & 3: Two Smaller Cards Side by Side (Editorial Asymmetric Row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temperature Range Card (NASA POWER) */}
            <div className="border border-border rounded-[6px] p-5 bg-offWhite space-y-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-soilBrown">
                NASA POWER Meteorological
              </span>
              <h3 className="font-heading text-lg font-semibold text-deepGreen">
                Temperature Range (30 Days)
              </h3>
              <div className="pt-1">
                {/* Simple range display: two numbers with a dash between (not em dash) */}
                <div className="text-2xl font-bold text-ink">
                  {data.tempMin.toFixed(1)}°C - {data.tempMax.toFixed(1)}°C
                </div>
                <p className="text-sm text-soilBrown mt-1">
                  30-Day Average: <span className="font-semibold text-deepGreen">{data.tempAvg.toFixed(1)}°C</span>
                </p>
              </div>
              <div className="text-xs text-soilBrown pt-2 border-t border-border">
                Surface 2m ambient air temperature telemetry
              </div>
            </div>

            {/* Soil Moisture Card (NASA SMAP) */}
            <div className="border border-border rounded-[6px] p-5 bg-offWhite space-y-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-soilBrown">
                NASA SMAP Level-4
              </span>
              <h3 className="font-heading text-lg font-semibold text-deepGreen">
                Soil Moisture Status
              </h3>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink font-semibold">
                    Current Level: {moisturePct}%
                  </span>
                  <span className={`font-semibold ${soilStatus.textClass}`}>
                    {soilStatus.label}
                  </span>
                </div>
                {/* Percentage progress bar */}
                <div className="w-full h-3 bg-border/40 rounded-[6px] overflow-hidden border border-border">
                  <div
                    className={`h-full ${soilStatus.barClass} transition-all duration-300`}
                    style={{ width: `${moisturePct}%` }}
                    role="progressbar"
                    aria-valuenow={moisturePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
              <div className="text-xs text-soilBrown pt-2 border-t border-border flex justify-between">
                <span>0-20% Very dry</span>
                <span>40-60% Adequate</span>
                <span>80-100% Saturated</span>
              </div>
            </div>
          </div>

          {/* Card 4: Small Row for Atmospheric Stats */}
          <div className="border border-border rounded-[6px] p-4 bg-offWhite flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-soilBrown font-medium">Relative Humidity Average:</span>
              <span className="font-semibold text-ink">{data.humidityAvg.toFixed(1)}%</span>
            </div>
            <div className="hidden sm:block text-border">|</div>
            <div className="flex items-center gap-2">
              <span className="text-soilBrown font-medium">Solar Radiation Average:</span>
              <span className="font-semibold text-ink">
                {data.solarAvg.toFixed(1)} MJ/m²/day
              </span>
            </div>
          </div>

          {/* Timestamp and Metadata */}
          <div className="text-xs text-soilBrown text-right">
            Data fetched: {formattedDate}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] px-5 py-2.5 border border-border rounded-[6px] bg-offWhite text-ink font-semibold hover:bg-border/20 transition-colors inline-flex items-center gap-2 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] min-w-[44px] px-6 py-2.5 bg-deepGreen text-offWhite font-semibold rounded-[6px] border border-deepGreen hover:bg-deepGreen/90 transition-colors inline-flex items-center gap-2 text-sm"
        >
          Continue to Plot Details
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
