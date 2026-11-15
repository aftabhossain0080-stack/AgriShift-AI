"use client";

import React from "react";

export function SkeletonLoader() {
  return (
    <div className="w-full space-y-6" aria-busy="true" aria-live="polite">
      {/* Header skeleton */}
      <div className="p-6 bg-offWhite border border-border rounded">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-border animate-pulse rounded" />
            <div className="h-7 w-64 bg-border animate-pulse rounded" />
          </div>
          <div className="h-9 w-40 bg-border animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-border animate-pulse rounded" />
              <div className="h-5 w-28 bg-border animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 Crop Cards skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-border animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="p-5 bg-offWhite border border-border rounded flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-16 bg-border animate-pulse rounded" />
                  <div className="h-6 w-20 bg-border animate-pulse rounded" />
                </div>
                <div className="h-7 w-36 bg-border animate-pulse rounded" />
                <div className="h-4 w-28 bg-border animate-pulse rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-full bg-border animate-pulse rounded" />
                  <div className="h-3.5 w-5/6 bg-border animate-pulse rounded" />
                  <div className="h-3.5 w-4/6 bg-border animate-pulse rounded" />
                </div>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="h-4 w-24 bg-border animate-pulse rounded" />
                <div className="h-6 w-16 bg-border animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Score breakdown and Irrigation chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score breakdown skeleton */}
        <div className="p-6 bg-offWhite border border-border rounded space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-border animate-pulse rounded" />
            <div className="h-5 w-20 bg-border animate-pulse rounded" />
          </div>
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-36 bg-border animate-pulse rounded" />
                  <div className="h-4 w-12 bg-border animate-pulse rounded" />
                </div>
                <div className="h-3 w-full bg-border animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="h-5 w-32 bg-border animate-pulse rounded" />
            <div className="h-6 w-20 bg-border animate-pulse rounded" />
          </div>
        </div>

        {/* Irrigation chart skeleton */}
        <div className="p-6 bg-offWhite border border-border rounded space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-44 bg-border animate-pulse rounded" />
            <div className="h-5 w-24 bg-border animate-pulse rounded" />
          </div>
          <div className="h-56 w-full bg-border animate-pulse rounded flex items-end justify-around p-4">
            <div className="h-28 w-12 bg-[#D8D2C4] rounded" />
            <div className="h-36 w-12 bg-[#D8D2C4] rounded" />
            <div className="h-44 w-12 bg-[#D8D2C4] rounded" />
            <div className="h-32 w-12 bg-[#D8D2C4] rounded" />
          </div>
          <div className="h-4 w-3/4 bg-border animate-pulse rounded" />
        </div>
      </div>

      {/* Risk alerts skeleton */}
      <div className="p-6 bg-offWhite border border-border rounded space-y-4">
        <div className="h-6 w-40 bg-border animate-pulse rounded" />
        <div className="space-y-3">
          {[1, 2].map((alert) => (
            <div
              key={alert}
              className="p-4 bg-offWhite border border-border rounded space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-border animate-pulse rounded" />
                <div className="h-5 w-48 bg-border animate-pulse rounded" />
              </div>
              <div className="h-4 w-full bg-border animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-border animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
