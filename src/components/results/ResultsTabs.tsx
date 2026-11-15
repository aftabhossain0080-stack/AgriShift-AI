"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  RecommendationResponse,
  CropRecommendation,
  RiskAlert,
  WeeklyIrrigationPlan,
} from "@/lib/types";
import { CropRankedList } from "./CropRankedList";
import { CompareMode } from "./CompareMode";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ResultsTabsProps {
  recommendation: RecommendationResponse;
  className?: string;
}

type TabKey = "crops" | "irrigation" | "rotation" | "risks";

export function ResultsTabs({ recommendation, className = "" }: ResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("crops");
  const [isComparing, setIsComparing] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [irrigationView, setIrrigationView] = useState<"chart" | "table">("chart");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const crops: CropRecommendation[] = recommendation.top_crops || [];
  const topCrop = crops[0] || {
    crop_name: "Mustard",
    irrigation_weekly_mm: 15,
    crop_duration: "90 to 105 days",
    water_requirement: "Low",
  };
  const profile = recommendation.farmer_profile;

  const handleToggleCrop = (cropName: string) => {
    setSelectedCrops((prev) => {
      if (prev.includes(cropName)) {
        return prev.filter((name) => name !== cropName);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, cropName];
    });
  };

  // 4-week irrigation plan data
  const fallbackSchedule: WeeklyIrrigationPlan[] = [
    {
      week: 1,
      stage: "Crop establishment & seed germination",
      water_mm: 15,
      guidance: "Light surface irrigation to support uniform seed germination in dry topsoil.",
    },
    {
      week: 2,
      stage: "Active vegetative rosette & root branching",
      water_mm: 18,
      guidance: "Maintain root zone moisture at 50 to 55 percent. Avoid soil crusting.",
    },
    {
      week: 3,
      stage: "Branching & pre-flowering critical window",
      water_mm: 20,
      guidance: "Critical irrigation window. Ensure adequate soil moisture before flower bud set.",
    },
    {
      week: 4,
      stage: "Flowering & early pod/grain formation",
      water_mm: 15,
      guidance: "Apply light furrow irrigation. Avoid standing water to prevent collar rot.",
    },
  ];

  const irrigationSchedule =
    recommendation.irrigation_summary?.weekly_plan &&
    recommendation.irrigation_summary.weekly_plan.length > 0
      ? recommendation.irrigation_summary.weekly_plan
      : fallbackSchedule;

  const chartData = irrigationSchedule.map((item) => ({
    week: `Week ${item.week}`,
    water_mm: item.water_mm,
    stage: item.stage,
  }));

  // Risk severity border color styling:
  // High severity: red border (border-alertRed)
  // Medium severity: wheat border (border-wheat)
  // Low severity: deepGreen border (border-deepGreen)
  // NO red background fill, only colored border!
  const getRiskBorderClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
      case "critical":
        return "border-alertRed";
      case "medium":
        return "border-wheat";
      case "low":
      default:
        return "border-deepGreen";
    }
  };

  const getRiskBadgeColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
      case "critical":
        return "text-alertRed";
      case "medium":
        return "text-soilBrown";
      case "low":
      default:
        return "text-deepGreen";
    }
  };

  const risks: RiskAlert[] = recommendation.risks || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 4 Tabs Bar */}
      <div
        className="flex flex-wrap items-center gap-2 border-b border-border pb-3"
        role="tablist"
        aria-label="Recommendation sections"
      >
        <button
          type="button"
          role="tab"
          id="tab-crops"
          aria-selected={activeTab === "crops"}
          aria-controls="panel-crops"
          onClick={() => setActiveTab("crops")}
          className={`min-h-[44px] px-5 py-2.5 rounded-[6px] border text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
            activeTab === "crops"
              ? "bg-deepGreen border-deepGreen text-offWhite"
              : "bg-offWhite border-border text-soilBrown hover:text-ink hover:border-soilBrown"
          }`}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span>Crops ({crops.length || 8})</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-irrigation"
          aria-selected={activeTab === "irrigation"}
          aria-controls="panel-irrigation"
          onClick={() => setActiveTab("irrigation")}
          className={`min-h-[44px] px-5 py-2.5 rounded-[6px] border text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
            activeTab === "irrigation"
              ? "bg-deepGreen border-deepGreen text-offWhite"
              : "bg-offWhite border-border text-soilBrown hover:text-ink hover:border-soilBrown"
          }`}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <span>Irrigation</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-rotation"
          aria-selected={activeTab === "rotation"}
          aria-controls="panel-rotation"
          onClick={() => setActiveTab("rotation")}
          className={`min-h-[44px] px-5 py-2.5 rounded-[6px] border text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
            activeTab === "rotation"
              ? "bg-deepGreen border-deepGreen text-offWhite"
              : "bg-offWhite border-border text-soilBrown hover:text-ink hover:border-soilBrown"
          }`}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Rotation</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-risks"
          aria-selected={activeTab === "risks"}
          aria-controls="panel-risks"
          onClick={() => setActiveTab("risks")}
          className={`min-h-[44px] px-5 py-2.5 rounded-[6px] border text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
            activeTab === "risks"
              ? "bg-deepGreen border-deepGreen text-offWhite"
              : "bg-offWhite border-border text-soilBrown hover:text-ink hover:border-soilBrown"
          }`}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Risks ({risks.length})</span>
        </button>
      </div>

      {/* Tab 1: Crops Panel */}
      {activeTab === "crops" && (
        <div
          role="tabpanel"
          id="panel-crops"
          aria-labelledby="tab-crops"
          className="space-y-4"
        >
          {/* Compare Mode controls & Side-by-side table */}
          <CompareMode
            crops={crops}
            isComparing={isComparing}
            onToggleCompare={() => setIsComparing((prev) => !prev)}
            selectedCrops={selectedCrops}
            onToggleCrop={handleToggleCrop}
          />

          {/* 8 Crops Ranked List */}
          <CropRankedList
            crops={crops}
            isComparing={isComparing}
            selectedCrops={selectedCrops}
            onToggleCrop={handleToggleCrop}
          />
        </div>
      )}

      {/* Tab 2: Irrigation Panel */}
      {activeTab === "irrigation" && (
        <div
          role="tabpanel"
          id="panel-irrigation"
          aria-labelledby="tab-irrigation"
          className="space-y-6"
        >
          {/* Irrigation Header & View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-offWhite border border-border rounded-[6px]">
            <div>
              <h3 className="font-heading text-lg font-bold text-ink">
                4-Week Irrigation Plan: {topCrop.crop_name}
              </h3>
              <p className="text-xs text-soilBrown mt-0.5">
                Target water need: {topCrop.water_requirement || "Low to Medium"} ({topCrop.irrigation_weekly_mm} mm weekly baseline)
              </p>
            </div>

            {/* Toggle between Chart and Table */}
            <div className="flex items-center gap-1 border border-border rounded-[6px] p-1 bg-offWhite">
              <button
                type="button"
                onClick={() => setIrrigationView("chart")}
                aria-pressed={irrigationView === "chart"}
                className={`min-h-[44px] px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  irrigationView === "chart"
                    ? "bg-deepGreen text-offWhite"
                    : "text-soilBrown hover:text-ink"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Chart view</span>
              </button>

              <button
                type="button"
                onClick={() => setIrrigationView("table")}
                aria-pressed={irrigationView === "table"}
                className={`min-h-[44px] px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  irrigationView === "table"
                    ? "bg-deepGreen text-offWhite"
                    : "text-soilBrown hover:text-ink"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Table view</span>
              </button>
            </div>
          </div>

          {/* Chart View */}
          {irrigationView === "chart" && (
            <div className="p-4 bg-offWhite border border-border rounded-[6px] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-sm font-bold text-ink">
                  Weekly Water Requirement (mm)
                </h4>
                <span className="text-xs text-soilBrown">
                  Fill: Deep Green (#1E4D36)
                </span>
              </div>

              {isMounted ? (
                <div
                  className="h-64 w-full"
                  aria-label="4-week irrigation water requirement in millimeters"
                  role="img"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid stroke="#D8D2C4" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="week"
                        stroke="#6B4A2F"
                        tick={{ fill: "#1B1F1C", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#6B4A2F"
                        tick={{ fill: "#1B1F1C", fontSize: 12 }}
                        unit=" mm"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#F6F3EC",
                          borderColor: "#D8D2C4",
                          borderRadius: "6px",
                          color: "#1B1F1C",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="water_mm"
                        fill="#1E4D36"
                        radius={[4, 4, 0, 0]}
                        name="Water Need (mm)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 w-full bg-offWhite flex items-center justify-center text-xs text-soilBrown">
                  Loading chart...
                </div>
              )}
            </div>
          )}

          {/* Table Alternative (Always present or shown directly when table view selected) */}
          <div className="p-4 bg-offWhite border border-border rounded-[6px] space-y-3">
            <h4 className="font-heading text-sm font-bold text-ink">
              4-Week Irrigation Schedule Table
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-border rounded-[6px]">
                <thead>
                  <tr className="border-b border-border bg-offWhite">
                    <th className="py-2.5 px-3 font-semibold text-soilBrown uppercase tracking-wider w-24">
                      Week
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-soilBrown uppercase tracking-wider">
                      Growth Stage
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-soilBrown uppercase tracking-wider w-32">
                      Water Need (mm)
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-soilBrown uppercase tracking-wider">
                      Field Guidance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {irrigationSchedule.map((item) => (
                    <tr key={item.week}>
                      <td className="py-2.5 px-3 font-semibold text-ink">
                        Week {item.week}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-ink">
                        {item.stage}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-deepGreen">
                        {item.water_mm} mm
                      </td>
                      <td className="py-2.5 px-3 text-soilBrown">
                        {item.guidance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total requirement and method notes */}
            {recommendation.irrigation_summary && (
              <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-soilBrown">
                <p>
                  <strong className="text-ink">Total water requirement: </strong>
                  {recommendation.irrigation_summary.total_water_requirement_mm}
                </p>
                <p>
                  <strong className="text-ink">Recommended method: </strong>
                  {recommendation.irrigation_summary.irrigation_method_recommended}
                </p>
                {recommendation.irrigation_summary.guidance_notes && (
                  <p className="sm:col-span-2 text-ink">
                    <strong className="text-soilBrown">Field notes: </strong>
                    {recommendation.irrigation_summary.guidance_notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Rotation Panel */}
      {activeTab === "rotation" && (
        <div
          role="tabpanel"
          id="panel-rotation"
          aria-labelledby="tab-rotation"
          className="p-6 bg-offWhite border border-border rounded-[6px] space-y-6"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Image using harvest-machinery.png */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-2">
              <div className="relative w-full h-[220px] rounded-[6px] overflow-hidden border border-border bg-offWhite">
                <Image
                  src="/images/harvest-machinery.png"
                  alt="Harvest machinery operating in agricultural field"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ objectFit: "cover", objectPosition: "50% 70%" }}
                  priority={false}
                />
              </div>
              <p className="text-[11px] text-soilBrown text-center">
                Mechanized harvesting and rotational crop sequencing
              </p>
            </div>

            {/* Editorial Layout: Plant after note & Next season suggestion */}
            <div className="flex-1 space-y-5">
              <div>
                <span className="text-xs font-semibold text-deepGreen uppercase tracking-wider">
                  Crop Rotation Advisory
                </span>
                <h3 className="font-heading text-xl font-bold text-ink mt-1">
                  Sequential Rotational Strategy for {topCrop.crop_name}
                </h3>
              </div>

              {/* Plant after [previous crop] note */}
              <div className="p-4 border border-border rounded-[6px] bg-offWhite space-y-2">
                <h4 className="font-heading text-sm font-bold text-ink">
                  Plant after {profile.previous_crop} note
                </h4>
                <p className="text-xs text-soilBrown leading-relaxed">
                  {recommendation.rotation_advice?.soil_impact ||
                    `Rotating ${topCrop.crop_name} after ${profile.previous_crop} preserves residual phosphate and potassium nutrients while preventing soil exhaustion.`}
                </p>
                <p className="text-xs text-soilBrown leading-relaxed">
                  <strong className="text-ink">Pathogen & Pest Defense: </strong>
                  {recommendation.rotation_advice?.pest_disease_benefit ||
                    `Breaks continuous soil-borne pathogen and nematode reproduction cycles common to repetitive ${profile.previous_crop} monoculture in regional alluvial soils.`}
                </p>
              </div>

              {/* Next season suggestion */}
              <div className="p-4 border border-border rounded-[6px] bg-offWhite space-y-2">
                <h4 className="font-heading text-sm font-bold text-ink">
                  Next season suggestion
                </h4>
                <p className="text-xs text-soilBrown leading-relaxed">
                  Following the harvest of {topCrop.crop_name} in early spring, cultivate a short-duration green manure or leguminous pulse like Mung Bean (Green Gram) during the Zaid season. This natural cycle fixes 30 to 40 kg atmospheric nitrogen per hectare before the subsequent monsoon planting.
                </p>
                {recommendation.rotation_advice?.notes && (
                  <p className="text-xs text-soilBrown italic">
                    Note: {recommendation.rotation_advice.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Risks Panel */}
      {activeTab === "risks" && (
        <div
          role="tabpanel"
          id="panel-risks"
          aria-labelledby="tab-risks"
          className="space-y-4"
        >
          <div className="p-4 bg-offWhite border border-border rounded-[6px]">
            <h3 className="font-heading text-sm font-bold text-ink">
              Satellite-Derived Agro-Climatic Risk Advisories
            </h3>
            <p className="text-xs text-soilBrown mt-0.5">
              Evaluated from NASA POWER, GPM IMERG, and SMAP telemetry feeds for {profile.village}.
            </p>
          </div>

          <div className="space-y-3">
            {risks.map((alert) => {
              const borderClass = getRiskBorderClass(alert.severity);
              const badgeClass = getRiskBadgeColor(alert.severity);

              return (
                <div
                  key={alert.id || alert.title}
                  className={`p-4 bg-offWhite border rounded-[6px] space-y-2 ${borderClass}`}
                  role="alert"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading text-sm font-bold text-ink">
                      {alert.title}
                    </h4>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider shrink-0 ${badgeClass}`}
                    >
                      {alert.severity} risk
                    </span>
                  </div>

                  <p className="text-xs text-ink leading-relaxed">
                    {alert.description}
                  </p>

                  {alert.mitigation && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-soilBrown">
                        <strong className="text-ink font-semibold">
                          Mitigation guidance:{" "}
                        </strong>
                        {alert.mitigation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsTabs;
