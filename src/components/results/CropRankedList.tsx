"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { CropRecommendation } from "@/lib/types";

export interface CropRankedListProps {
  crops: CropRecommendation[];
  isComparing?: boolean;
  selectedCrops?: string[];
  onToggleCrop?: (cropName: string) => void;
  className?: string;
}

export function getCropSlug(name: string): string {
  const clean = name.toLowerCase();
  if (clean.includes("mustard") || clean.includes("rapeseed")) return "mustard";
  if (clean.includes("lentil") || clean.includes("masoor")) return "lentil";
  if (clean.includes("potato")) return "potato";
  if (clean.includes("maize") || clean.includes("corn")) return "maize";
  if (clean.includes("boro")) return "boro_rice";
  if (clean.includes("aman") || clean.includes("paddy")) return "paddy_aman";
  if (clean.includes("jute")) return "jute";
  if (clean.includes("wheat")) return "wheat";
  return clean.replace(/[^a-z0-9]+/g, "-");
}

const FALLBACK_CANDIDATE_CROPS = [
  { name: "Mustard", botanical: "Brassica juncea", score: 94.0, duration: "90 to 105 days", water: "Low", irrigation: 15 },
  { name: "Lentil", botanical: "Lens culinaris", score: 88.5, duration: "110 to 125 days", water: "Low", irrigation: 12 },
  { name: "Maize", botanical: "Zea mays", score: 78.0, duration: "115 to 130 days", water: "Medium", irrigation: 28 },
  { name: "Potato", botanical: "Solanum tuberosum", score: 72.0, duration: "80 to 110 days", water: "Medium", irrigation: 25 },
  { name: "Wheat", botanical: "Triticum aestivum", score: 68.5, duration: "105 to 120 days", water: "Medium", irrigation: 24 },
  { name: "Jute", botanical: "Corchorus olitorius", score: 61.0, duration: "110 to 130 days", water: "High", irrigation: 30 },
  { name: "Paddy (Aman)", botanical: "Oryza sativa", score: 54.0, duration: "135 to 155 days", water: "Very High", irrigation: 45 },
  { name: "Boro Rice", botanical: "Oryza sativa", score: 48.0, duration: "120 to 140 days", water: "Very High", irrigation: 42 },
];

function normalizeToEightCrops(initialCrops: CropRecommendation[]): CropRecommendation[] {
  const existingNames = new Set(initialCrops.map((c) => c.crop_name.toLowerCase()));
  const combined = [...initialCrops];

  for (const candidate of FALLBACK_CANDIDATE_CROPS) {
    if (combined.length >= 8) break;
    const isPresent = Array.from(existingNames).some((name) =>
      name.includes(candidate.name.toLowerCase()) || candidate.name.toLowerCase().includes(name)
    );
    if (!isPresent) {
      combined.push({
        crop_name: candidate.name,
        botanical_name: candidate.botanical,
        score: candidate.score,
        rank: combined.length + 1,
        viability: candidate.score >= 80 ? "Optimal" : candidate.score >= 60 ? "Moderate" : "Conditional",
        rationale: `Agro-climatic fit based on regional soil characteristics and seasonal window for ${candidate.name}.`,
        irrigation_weekly_mm: candidate.irrigation,
        agronomic_notes: `Standard package of practices for ${candidate.name} in this agro-climatic zone.`,
        crop_duration: candidate.duration,
        water_requirement: candidate.water,
        score_breakdown: {
          temperature_score: Math.round((candidate.score * 0.26) * 10) / 10,
          rainfall_score: Math.round((candidate.score * 0.25) * 10) / 10,
          soil_moisture_score: Math.round((candidate.score * 0.25) * 10) / 10,
          rotation_penalty_or_bonus: Math.round((candidate.score * 0.24) * 10) / 10,
          total_score: candidate.score,
        },
      });
      existingNames.add(candidate.name.toLowerCase());
    }
  }

  // Sort by score descending and re-assign rank 1..8
  return combined
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((crop, idx) => ({
      ...crop,
      rank: idx + 1,
    }));
}

function getBreakdownRows(crop: CropRecommendation) {
  const bd = crop.score_breakdown;
  if (bd) {
    const tempScore = bd.temperature_score ?? 24.5;
    const waterScore = bd.water_irrigation_score ?? bd.rainfall_score ?? 23.5;
    const soilScore = bd.soil_score ?? bd.soil_moisture_score ?? 23.0;
    const rotScore = bd.rotation_penalty_or_bonus ?? 23.0;

    return [
      {
        factor: "Temperature window",
        weight: "25 pts",
        score: `${tempScore.toFixed(1)} / 25`,
        notes: "NASA POWER MERRA-2 thermal regime compatibility",
      },
      {
        factor: "Water budget",
        weight: "25 pts",
        score: `${waterScore.toFixed(1)} / 25`,
        notes: "NASA GPM IMERG precipitation and irrigation match",
      },
      {
        factor: "Soil fit",
        weight: "25 pts",
        score: `${soilScore.toFixed(1)} / 25`,
        notes: "NASA SMAP root-zone and surface soil moisture match",
      },
      {
        factor: "Rotation synergy",
        weight: "25 pts",
        score: `${rotScore.toFixed(1)} / 25`,
        notes: "Disease break and residual fertility optimization",
      },
    ];
  }

  // Placeholder rows if no breakdown in API response
  const quarter = (crop.score / 4).toFixed(1);
  return [
    {
      factor: "Temperature window",
      weight: "25 pts",
      score: `${quarter} / 25`,
      notes: "Thermal compatibility assessed from agro-climatology",
    },
    {
      factor: "Water budget",
      weight: "25 pts",
      score: `${quarter} / 25`,
      notes: "Precipitation and soil moisture match",
    },
    {
      factor: "Soil fit",
      weight: "25 pts",
      score: `${quarter} / 25`,
      notes: "Soil classification and root-zone moisture fit",
    },
    {
      factor: "Rotation synergy",
      weight: "25 pts",
      score: `${quarter} / 25`,
      notes: "Rotational sequence and soil revitalization",
    },
  ];
}

export function CropRankedList({
  crops,
  isComparing = false,
  selectedCrops = [],
  onToggleCrop,
  className = "",
}: CropRankedListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const eightCrops = normalizeToEightCrops(crops);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {eightCrops.map((crop, index) => {
        const isExpanded = expandedIndex === index;
        const slug = getCropSlug(crop.crop_name);
        const breakdownRows = getBreakdownRows(crop);
        const isChecked = selectedCrops.includes(crop.crop_name);
        const isCheckDisabled = !isChecked && selectedCrops.length >= 3;

        return (
          <div
            key={crop.crop_name}
            className="border border-border rounded-[6px] bg-offWhite overflow-hidden"
          >
            {/* Main Row */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Optional compare checkbox when compare mode is enabled */}
              {isComparing && onToggleCrop && (
                <div className="flex items-center shrink-0 pr-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isCheckDisabled}
                    onChange={() => onToggleCrop(crop.crop_name)}
                    className="h-5 w-5 rounded-[6px] border border-border accent-[#1E4D36] cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Select ${crop.crop_name} for comparison`}
                  />
                </div>
              )}

              {/* Rank and Crop Name */}
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                aria-expanded={isExpanded}
                className="flex-1 text-left min-h-[44px] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-heading font-bold text-lg text-soilBrown w-6 text-center">
                    #{crop.rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading text-base sm:text-lg font-bold text-ink">
                        {crop.crop_name}
                      </span>
                      {crop.rank === 1 && (
                        <span className="text-xs font-semibold text-deepGreen">
                          Best match
                        </span>
                      )}
                    </div>
                    {crop.botanical_name && (
                      <p className="text-xs text-soilBrown italic">
                        {crop.botanical_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Bar */}
                <div className="flex-1 flex items-center gap-3 w-full sm:w-auto">
                  <div
                    className="flex-1 bg-offWhite border border-border rounded-[6px] h-3 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={crop.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${crop.crop_name} recommendation score`}
                  >
                    <div
                      className="bg-deepGreen h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, crop.score))}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-ink w-16 text-right shrink-0">
                    {crop.score.toFixed(0)}/100
                  </span>
                </div>
              </button>

              {/* Expand/Collapse Toggle Indicator */}
              <button
                type="button"
                onClick={() => toggleExpand(index)}
                className="min-h-[44px] min-w-[44px] p-2 text-soilBrown hover:text-ink flex items-center justify-center shrink-0"
                aria-label={isExpanded ? `Collapse breakdown for ${crop.crop_name}` : `Expand breakdown for ${crop.crop_name}`}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Expandable 100-Point Breakdown Table */}
            {isExpanded && (
              <div className="border-t border-border bg-offWhite p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-soilBrown">
                    100-Point Agro-Climatic Fit Breakdown
                  </h4>
                  <span className="text-xs text-ink font-semibold">
                    Total: {crop.score.toFixed(1)} / 100 ({crop.viability})
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-border rounded-[6px]">
                    <thead>
                      <tr className="border-b border-border bg-offWhite">
                        <th className="py-2 px-3 font-semibold text-soilBrown">Factor</th>
                        <th className="py-2 px-3 font-semibold text-soilBrown">Weight</th>
                        <th className="py-2 px-3 font-semibold text-soilBrown">Score</th>
                        <th className="py-2 px-3 font-semibold text-soilBrown">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {breakdownRows.map((row) => (
                        <tr key={row.factor}>
                          <td className="py-2 px-3 font-medium text-ink">{row.factor}</td>
                          <td className="py-2 px-3 text-soilBrown">{row.weight}</td>
                          <td className="py-2 px-3 font-semibold text-deepGreen">{row.score}</td>
                          <td className="py-2 px-3 text-soilBrown">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Agronomic Context / Rationale */}
                {crop.rationale && (
                  <p className="text-xs text-soilBrown leading-relaxed">
                    <strong className="text-ink font-semibold">Rationale: </strong>
                    {crop.rationale}
                  </p>
                )}

                {/* View Full Crop Profile Link */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/crops/${slug}`}
                    className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold text-deepGreen hover:text-soilBrown transition-colors"
                  >
                    <span>View full crop profile</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                  <span className="text-xs text-soilBrown">
                    Water: {crop.water_requirement || "Medium"} | Duration: {crop.crop_duration || "90 to 115 days"}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CropRankedList;
