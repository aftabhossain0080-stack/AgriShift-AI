"use client";

import React from "react";

export interface ConfidenceLabelProps {
  sources?: string[];
  latitude?: number;
  longitude?: number;
  isMock?: boolean;
}

export function ConfidenceLabel({
  sources = [],
  latitude,
  longitude,
  isMock = false,
}: ConfidenceLabelProps) {
  // India bounding box: lat 6.0 to 38.0, lon 68.0 to 98.0
  const isInIndia =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= 6.0 &&
    latitude <= 38.0 &&
    longitude >= 68.0 &&
    longitude <= 98.0;

  const sourceCount = sources.length;

  let level: "High" | "Medium" | "Low";
  if (isMock || sourceCount <= 1) {
    level = "Low";
  } else if (sourceCount >= 3 && isInIndia) {
    level = "High";
  } else {
    // 2 sources available or location outside India
    level = "Medium";
  }

  // Border styling:
  // High: green border (border-deepGreen)
  // Medium: amber/wheat border (border-wheat)
  // Low: red border (border-alertRed)
  // Flat colors only, rounded-[6px], no shadow, data confidence only
  const borderClass =
    level === "High"
      ? "border-deepGreen text-deepGreen"
      : level === "Medium"
      ? "border-wheat text-soilBrown"
      : "border-alertRed text-alertRed";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-[6px] bg-offWhite text-xs font-semibold ${borderClass}`}
      role="status"
      aria-label={`Data confidence: ${level}`}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <span>Data confidence: {level}</span>
    </div>
  );
}

export default ConfidenceLabel;
