"use client";

import React from "react";
import { CropRecommendation } from "@/lib/types";

interface RecommendationCardProps {
  crop: CropRecommendation;
  rank: number;
  isSelected?: boolean;
  onSelect?: () => void;
  isMock?: boolean;
}

const BENGALI_CROP_NAMES: Record<string, string> = {
  Mustard: "সর্ষে",
  "Mustard / Rapeseed": "সর্ষে",
  Lentil: "মসুর",
  "Lentil / Masoor": "মসুর",
  Maize: "ভুট্টা",
  "Maize (Corn)": "ভুট্টা",
  Potato: "আলু",
  "Paddy (Aman)": "ধান (আমন)",
  "Paddy (Boro)": "ধান (বোরো)",
  Jute: "পাট",
  Wheat: "গম"
};

export function RecommendationCard({
  crop,
  rank,
  isSelected = false,
  onSelect,
  isMock = false
}: RecommendationCardProps) {
  // Extract base crop name to lookup Bengali equivalent
  const cleanName = crop.crop_name.split("/")[0].trim();
  const bengaliName = BENGALI_CROP_NAMES[crop.crop_name] || BENGALI_CROP_NAMES[cleanName] || "";

  const getViabilityBadge = (viability: string) => {
    switch (viability.toLowerCase()) {
      case "optimal":
      case "highly recommended":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded border border-border bg-[#E5ECE7] text-deepGreen">
            Optimal Fit
          </span>
        );
      case "moderate":
      case "moderately recommended":
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded border border-border bg-[#F5EEDF] text-soilBrown">
            Moderate Fit
          </span>
        );
      case "conditional":
      default:
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded border border-border bg-[#E9E4D9] text-soilBrown">
            Conditional
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={`p-5 bg-offWhite rounded border text-left flex flex-col justify-between transition-colors min-h-[320px] cursor-pointer ${
        isSelected
          ? "border-deepGreen ring-1 ring-deepGreen"
          : "border-border hover:border-soilBrown"
      }`}
    >
      <div className="space-y-3">
        {/* Top meta row: Rank and Viability */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-border bg-[#E9E4D9] text-ink">
            Rank #{rank}
          </span>
          {getViabilityBadge(crop.viability)}
        </div>

        {/* Crop Name: English and Bengali */}
        <div>
          <h4 className="text-xl font-heading font-bold text-ink leading-tight">
            {crop.crop_name}
          </h4>
          {bengaliName && (
            <p className="text-sm font-bengali text-soilBrown font-medium">
              {bengaliName}
            </p>
          )}
          {crop.botanical_name && (
            <p className="text-xs italic text-soilBrown pt-0.5">
              {crop.botanical_name}
            </p>
          )}
        </div>

        {/* Total Score display */}
        <div className="p-2.5 bg-[#E9E4D9] rounded border border-border flex items-baseline justify-between">
          <span className="text-xs text-soilBrown font-medium">
            Overall Viability Score:
          </span>
          <span className="text-lg font-heading font-bold text-deepGreen">
            {crop.score.toFixed(1)}
            <span className="text-xs font-body font-normal text-ink"> / 100</span>
          </span>
        </div>

        {/* Rationale snippet */}
        <p className="text-xs text-ink line-clamp-3 leading-relaxed">
          {crop.rationale}
        </p>
      </div>

      {/* Card Footer: Metadata and selection status */}
      <div className="pt-3 border-t border-border mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-soilBrown">
          <span>Weekly water:</span>
          <strong className="text-ink">{crop.irrigation_weekly_mm} mm/wk</strong>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-soilBrown">
            {isMock ? "Validated Agronomic Fallback" : "Live NASA API"}
          </span>
          <span
            className={`text-xs font-semibold ${
              isSelected ? "text-deepGreen" : "text-soilBrown"
            }`}
          >
            {isSelected ? "Active Selection" : "View Breakdown"}
          </span>
        </div>
      </div>
    </div>
  );
}
