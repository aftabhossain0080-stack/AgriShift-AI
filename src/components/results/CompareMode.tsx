"use client";

import React, { useState } from "react";
import { CropRecommendation } from "@/lib/types";

export interface CompareModeProps {
  crops: CropRecommendation[];
  isComparing?: boolean;
  onToggleCompare?: () => void;
  selectedCrops?: string[];
  onToggleCrop?: (cropName: string) => void;
  className?: string;
}

export function CompareMode({
  crops,
  isComparing: controlledIsComparing,
  onToggleCompare: controlledOnToggleCompare,
  selectedCrops: controlledSelectedCrops,
  onToggleCrop: controlledOnToggleCrop,
  className = "",
}: CompareModeProps) {
  // Support both controlled and uncontrolled states
  const [internalIsComparing, setInternalIsComparing] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string[]>([]);

  const isComparing =
    controlledIsComparing !== undefined
      ? controlledIsComparing
      : internalIsComparing;

  const selectedCrops =
    controlledSelectedCrops !== undefined
      ? controlledSelectedCrops
      : internalSelected;

  const handleToggleCompare = () => {
    if (controlledOnToggleCompare) {
      controlledOnToggleCompare();
    } else {
      setInternalIsComparing((prev) => !prev);
    }
  };

  const handleToggleCrop = (cropName: string) => {
    if (controlledOnToggleCrop) {
      controlledOnToggleCrop(cropName);
    } else {
      setInternalSelected((prev) => {
        if (prev.includes(cropName)) {
          return prev.filter((name) => name !== cropName);
        }
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, cropName];
      });
    }
  };

  const selectedCropObjects = crops.filter((crop) =>
    selectedCrops.includes(crop.crop_name)
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toggle Button Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!isComparing ? (
          <button
            type="button"
            onClick={handleToggleCompare}
            className="min-h-[44px] px-4 py-2 border border-border rounded-[6px] bg-offWhite text-ink hover:border-deepGreen hover:text-deepGreen font-semibold text-xs transition-colors inline-flex items-center gap-2"
            aria-label="Toggle compare crops mode"
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>Compare crops</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-between w-full gap-3 p-3 bg-offWhite border border-border rounded-[6px]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-ink">
                Compare Mode Active
              </p>
              <p className="text-xs text-soilBrown">
                Select 2 to 3 crops below ({selectedCrops.length}/3 selected)
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleCompare}
              className="min-h-[44px] px-4 py-2 bg-deepGreen text-offWhite rounded-[6px] border border-deepGreen hover:bg-soilBrown hover:border-soilBrown font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Done comparing</span>
            </button>
          </div>
        )}
      </div>

      {/* When Compare Mode is Active: Crop Selection Checkboxes */}
      {isComparing && (
        <div className="p-4 bg-offWhite border border-border rounded-[6px] space-y-3">
          <p className="text-xs font-semibold text-ink uppercase tracking-wider">
            Choose crops to compare:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {crops.slice(0, 8).map((crop) => {
              const isChecked = selectedCrops.includes(crop.crop_name);
              const isDisabled = !isChecked && selectedCrops.length >= 3;

              return (
                <label
                  key={crop.crop_name}
                  className={`min-h-[44px] px-3 py-2 border rounded-[6px] flex items-center gap-2.5 text-xs font-medium cursor-pointer transition-colors ${
                    isChecked
                      ? "border-deepGreen bg-offWhite text-deepGreen font-semibold"
                      : isDisabled
                      ? "border-border text-ink/40 cursor-not-allowed bg-offWhite"
                      : "border-border text-ink bg-offWhite hover:border-soilBrown"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleToggleCrop(crop.crop_name)}
                    className="h-4 w-4 rounded-[6px] border border-border accent-[#1E4D36] cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Select ${crop.crop_name} for comparison`}
                  />
                  <span className="truncate">{crop.crop_name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Table (shown when 2 to 3 crops selected) */}
      {isComparing && selectedCropObjects.length >= 2 && (
        <div className="p-4 bg-offWhite border border-border rounded-[6px] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-heading text-sm font-bold text-ink">
              Side-by-Side Crop Comparison
            </h3>
            <span className="text-xs text-soilBrown">
              {selectedCropObjects.length} crops compared
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2.5 px-3 font-semibold text-soilBrown uppercase tracking-wider w-36">
                    Attribute
                  </th>
                  {selectedCropObjects.map((crop) => (
                    <th
                      key={crop.crop_name}
                      className="py-2.5 px-3 font-heading font-bold text-ink text-sm"
                    >
                      {crop.crop_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Score */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-soilBrown">
                    Score
                  </td>
                  {selectedCropObjects.map((crop) => (
                    <td key={crop.crop_name} className="py-2.5 px-3 text-ink">
                      <strong className="text-deepGreen font-bold">
                        {crop.score.toFixed(1)}/100
                      </strong>{" "}
                      <span className="text-soilBrown font-normal">
                        ({crop.viability})
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Temperature fit */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-soilBrown">
                    Temperature fit
                  </td>
                  {selectedCropObjects.map((crop) => {
                    const tempNote =
                      crop.score_breakdown?.temperature_score !== undefined
                        ? `${crop.score_breakdown.temperature_score} pts (NASA POWER fit)`
                        : "Optimal winter temperature window";
                    return (
                      <td key={crop.crop_name} className="py-2.5 px-3 text-ink">
                        {tempNote}
                      </td>
                    );
                  })}
                </tr>

                {/* Water need */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-soilBrown">
                    Water need
                  </td>
                  {selectedCropObjects.map((crop) => (
                    <td key={crop.crop_name} className="py-2.5 px-3 text-ink">
                      {crop.water_requirement || "Medium"} ({crop.irrigation_weekly_mm} mm/wk)
                    </td>
                  ))}
                </tr>

                {/* Soil preference */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-soilBrown">
                    Soil preference
                  </td>
                  {selectedCropObjects.map((crop) => {
                    const soilNote =
                      crop.agronomic_notes?.split(".")[0] ||
                      "Well-drained alluvial / loamy soil";
                    return (
                      <td key={crop.crop_name} className="py-2.5 px-3 text-soilBrown">
                        {soilNote}
                      </td>
                    );
                  })}
                </tr>

                {/* Duration */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-soilBrown">
                    Duration
                  </td>
                  {selectedCropObjects.map((crop) => (
                    <td key={crop.crop_name} className="py-2.5 px-3 text-ink">
                      {crop.crop_duration || "90 to 115 days"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareMode;
