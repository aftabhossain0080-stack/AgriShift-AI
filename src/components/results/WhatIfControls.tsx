"use client";

import React, { useState } from "react";

export interface WhatIfControlsProps {
  currentWaterSource?: string;
  currentSeason?: string;
  onRecalculate: (params: { waterSource: string; season: string }) => Promise<void> | void;
  isRecalculating?: boolean;
  className?: string;
}

export function WhatIfControls({
  currentWaterSource = "borewell",
  currentSeason = "rabi",
  onRecalculate,
  isRecalculating = false,
  className = "",
}: WhatIfControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [waterSource, setWaterSource] = useState(currentWaterSource.toLowerCase());
  const [season, setSeason] = useState(currentSeason.toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecalculate({ waterSource, season });
  };

  return (
    <div className={`border border-border rounded-[6px] bg-offWhite overflow-hidden ${className}`}>
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between text-left hover:bg-offWhite/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <svg
            className="w-4 h-4 text-deepGreen shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span className="font-heading text-sm font-bold text-ink">
            What if I change...
          </span>
          <span className="text-xs text-soilBrown hidden sm:inline">
            (Simulate seasonal or irrigation water adjustments)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-soilBrown font-medium">
            {isOpen ? "Hide simulation" : "Adjust parameters"}
          </span>
          <svg
            className={`w-4 h-4 text-soilBrown transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-border p-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Water Source Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor="whatif-water"
                  className="block text-xs font-semibold uppercase tracking-wider text-soilBrown"
                >
                  Water Source
                </label>
                <select
                  id="whatif-water"
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  disabled={isRecalculating}
                  className="w-full min-h-[44px] px-3 py-2 border border-border rounded-[6px] bg-offWhite text-xs font-medium text-ink focus:outline-none focus:border-deepGreen"
                >
                  <option value="borewell">Borewell / Tube-well (Assured)</option>
                  <option value="canal">Canal / Surface irrigation</option>
                  <option value="rainfed">Rainfed (Precipitation only)</option>
                </select>
                <p className="text-[11px] text-soilBrown">
                  Changes water availability penalty in suitability model.
                </p>
              </div>

              {/* Season Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor="whatif-season"
                  className="block text-xs font-semibold uppercase tracking-wider text-soilBrown"
                >
                  Farming Season
                </label>
                <select
                  id="whatif-season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  disabled={isRecalculating}
                  className="w-full min-h-[44px] px-3 py-2 border border-border rounded-[6px] bg-offWhite text-xs font-medium text-ink focus:outline-none focus:border-deepGreen"
                >
                  <option value="rabi">Rabi (Winter: Oct - Mar)</option>
                  <option value="kharif">Kharif (Monsoon: Jun - Oct)</option>
                  <option value="zaid">Zaid (Summer: Mar - Jun)</option>
                </select>
                <p className="text-[11px] text-soilBrown">
                  Recalibrates temperature & solar radiation benchmarks.
                </p>
              </div>
            </div>

            {/* Recalculate Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isRecalculating}
                className="min-h-[44px] px-6 py-2.5 bg-deepGreen text-offWhite rounded-[6px] border border-deepGreen hover:bg-soilBrown hover:border-soilBrown font-semibold text-xs transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRecalculating ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Recalculating...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Recalculate</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Skeleton loader during recalculation */}
          {isRecalculating && (
            <div
              className="p-4 border border-border rounded-[6px] bg-offWhite space-y-3 animate-pulse"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-[6px] bg-border" />
                <p className="text-xs font-semibold text-soilBrown">
                  Recalculating recommendations with updated parameters...
                </p>
              </div>
              <div className="h-4 bg-border/50 rounded-[6px] w-4/5" />
              <div className="h-4 bg-border/40 rounded-[6px] w-2/3" />
              <div className="h-4 bg-border/30 rounded-[6px] w-1/2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WhatIfControls;
