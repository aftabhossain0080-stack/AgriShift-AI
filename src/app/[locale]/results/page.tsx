"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Navbar, Footer } from "@/components/layout";
import { useRecommendations } from "@/hooks/useRecommendations";
import { FarmerProfileInput } from "@/lib/types";
import { DEFAULT_FARMER_PROFILE } from "@/lib/mock-data";
import { ConfidenceLabel } from "@/components/results/ConfidenceLabel";
import { ResultsTabs } from "@/components/results/ResultsTabs";
import { WhatIfControls } from "@/components/results/WhatIfControls";
import { PrintButton } from "@/components/results/PrintButton";

function ResultsContent() {
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<FarmerProfileInput | null>(null);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Initialize farmer profile from sessionStorage and URL query params
  useEffect(() => {
    let village = searchParams.get("village") || "";
    let lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : NaN;
    let lon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : NaN;
    let soil = searchParams.get("soil") || "";
    let area = searchParams.get("area") ? parseFloat(searchParams.get("area")!) : NaN;
    let waterParam = searchParams.get("water") || searchParams.get("irrigation") || "";
    let currentCrop = searchParams.get("currentCrop") || "";
    let prevCrop = searchParams.get("previousCrop") || searchParams.get("prevCrop") || "";
    let season = searchParams.get("season") || "";

    // 1. Check sessionStorage "agrishift_advice_draft"
    try {
      const draftRaw = sessionStorage.getItem("agrishift_advice_draft");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (!village && draft.village) village = draft.village;
        if (isNaN(lat) && draft.latitude) lat = Number(draft.latitude);
        if (isNaN(lon) && draft.longitude) lon = Number(draft.longitude);
        if (!soil && draft.soil_type) soil = draft.soil_type;
        if (isNaN(area) && draft.land_area_acres) area = Number(draft.land_area_acres);
        if (!waterParam && draft.irrigation_available !== undefined) waterParam = String(draft.irrigation_available);
        if (!currentCrop && draft.current_crop) currentCrop = draft.current_crop;
        if (!prevCrop && draft.previous_crop) prevCrop = draft.previous_crop;
        if (!season && draft.farming_season) season = draft.farming_season;
      }
    } catch {
      // Ignore
    }

    // 2. Check sessionStorage "agrishift_farmer_profile" as fallback
    try {
      const savedRaw = sessionStorage.getItem("agrishift_farmer_profile");
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (!village && saved.village) village = saved.village;
        if (isNaN(lat) && saved.latitude) lat = Number(saved.latitude);
        if (isNaN(lon) && saved.longitude) lon = Number(saved.longitude);
        if (!soil && saved.soil_type) soil = saved.soil_type;
        if (isNaN(area) && saved.land_area_acres) area = Number(saved.land_area_acres);
        if (!waterParam && saved.irrigation_available !== undefined) waterParam = String(saved.irrigation_available);
        if (!currentCrop && saved.current_crop) currentCrop = saved.current_crop;
        if (!prevCrop && saved.previous_crop) prevCrop = saved.previous_crop;
        if (!season && saved.farming_season) season = saved.farming_season;
      }
    } catch {
      // Ignore
    }

    const finalProfile: FarmerProfileInput = {
      village: village || DEFAULT_FARMER_PROFILE.village,
      latitude: !isNaN(lat) ? lat : DEFAULT_FARMER_PROFILE.latitude,
      longitude: !isNaN(lon) ? lon : DEFAULT_FARMER_PROFILE.longitude,
      soil_type: soil || DEFAULT_FARMER_PROFILE.soil_type,
      land_area_acres: !isNaN(area) ? area : DEFAULT_FARMER_PROFILE.land_area_acres,
      irrigation_available: waterParam === "false" || waterParam === "rainfed" ? false : true,
      current_crop: currentCrop || DEFAULT_FARMER_PROFILE.current_crop,
      previous_crop: prevCrop || DEFAULT_FARMER_PROFILE.previous_crop,
      farming_season: season || DEFAULT_FARMER_PROFILE.farming_season,
    };

    setProfile(finalProfile);
  }, [searchParams]);

  // Query recommendations
  const {
    data: recs,
    isLoading,
    isError,
    error,
    refetch,
  } = useRecommendations(profile);

  // 20s timeout detection for satellite data
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 20000);
    } else {
      setShowTimeoutMessage(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Share handler: copies URL with query parameters
  const handleShare = async () => {
    if (typeof window === "undefined" || !profile) return;
    try {
      const shareUrl = new URL(window.location.origin + window.location.pathname);
      shareUrl.searchParams.set("village", profile.village);
      shareUrl.searchParams.set("lat", String(profile.latitude));
      shareUrl.searchParams.set("lon", String(profile.longitude));
      shareUrl.searchParams.set("soil", profile.soil_type);
      shareUrl.searchParams.set("area", String(profile.land_area_acres));
      shareUrl.searchParams.set("irrigation", String(profile.irrigation_available));
      shareUrl.searchParams.set("currentCrop", profile.current_crop);
      shareUrl.searchParams.set("prevCrop", profile.previous_crop);
      shareUrl.searchParams.set("season", profile.farming_season);

      await navigator.clipboard.writeText(shareUrl.toString());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Save plan handler: saves to localStorage key "agrishift_saved_plans"
  const handleSavePlan = () => {
    if (typeof window === "undefined" || !recs || !profile) return;
    try {
      const key = "agrishift_saved_plans";
      const existingRaw = localStorage.getItem(key);
      const existingPlans = existingRaw ? JSON.parse(existingRaw) : [];

      const newPlan = {
        id: `plan-${Date.now()}`,
        date: new Date().toISOString(),
        village: profile.village,
        season: profile.farming_season,
        topCrop: recs.top_crops?.[0]?.crop_name || "Mustard",
        score: recs.top_crops?.[0]?.score || 94,
        cropsCount: recs.top_crops?.length || 0,
      };

      const updated = [newPlan, ...existingPlans.slice(0, 19)];
      localStorage.setItem(key, JSON.stringify(updated));

      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch {
      // Handle error
    }
  };

  // What-If recalculation handler
  const handleRecalculate = async ({
    waterSource,
    season,
  }: {
    waterSource: string;
    season: string;
  }) => {
    if (!profile) return;
    setIsRecalculating(true);
    const capitalizedSeason =
      season.charAt(0).toUpperCase() + season.slice(1);

    const updatedProfile: FarmerProfileInput = {
      ...profile,
      farming_season: capitalizedSeason,
      irrigation_available: waterSource !== "rainfed",
    };

    setProfile(updatedProfile);
    // Allow React Query to refetch with updated profile
    setTimeout(() => {
      setIsRecalculating(false);
    }, 600);
  };

  // Loading state with skeleton loaders
  if (isLoading || !profile) {
    return (
      <div className="space-y-6 py-6" role="status" aria-live="polite">
        {/* 20s timeout notification */}
        {showTimeoutMessage && (
          <div className="p-4 border border-wheat rounded-[6px] bg-offWhite flex items-center gap-3">
            <svg
              className="w-5 h-5 text-soilBrown shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-xs font-semibold text-soilBrown">
              NASA satellite data is taking longer than usual. Please wait...
            </p>
          </div>
        )}

        {/* Skeleton Header */}
        <div className="p-6 bg-offWhite border border-border rounded-[6px] space-y-4 animate-pulse">
          <div className="h-4 w-36 bg-border rounded-[6px]" />
          <div className="h-8 w-72 bg-border rounded-[6px]" />
          <div className="h-4 w-96 bg-border/60 rounded-[6px]" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-28 bg-border/50 rounded-[6px]" />
            <div className="h-6 w-28 bg-border/50 rounded-[6px]" />
            <div className="h-6 w-28 bg-border/50 rounded-[6px]" />
          </div>
        </div>

        {/* Skeleton Crop Rows */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-offWhite border border-border rounded-[6px] flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-6 w-6 bg-border rounded-[6px]" />
                <div className="h-5 w-32 bg-border rounded-[6px]" />
                <div className="h-3 flex-1 bg-border/50 rounded-[6px]" />
              </div>
              <div className="h-5 w-16 bg-border rounded-[6px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (isError) {
    return (
      <div className="py-8">
        <div
          className="p-6 bg-offWhite border border-alertRed rounded-[6px] space-y-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-alertRed shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="space-y-1">
              <h2 className="text-lg font-heading font-bold text-ink">
                Failed to load recommendation plan
              </h2>
              <p className="text-xs text-soilBrown">
                {error?.message ||
                  "Unable to reach the recommendation service. Please verify your connection or click retry below."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] px-5 py-2.5 bg-deepGreen text-offWhite font-semibold text-xs rounded-[6px] border border-deepGreen hover:bg-soilBrown hover:border-soilBrown transition-colors inline-flex items-center gap-2"
          >
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
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  const analysisDate = recs?.metadata?.analysis_timestamp
    ? new Date(recs.metadata.analysis_timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const sources = recs?.metadata?.satellite_sources || [
    "NASA POWER",
    "GPM IMERG",
    "SMAP",
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="p-6 bg-offWhite border border-border rounded-[6px] space-y-4">
        {/* Top Badges & Actions Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-soilBrown">
              Telemetric Ingestion Complete
            </span>
            <span className="text-soilBrown">|</span>
            <span className="text-xs text-soilBrown">
              Fetch Date: <strong className="text-ink">{analysisDate}</strong>
            </span>
          </div>

          {/* Action Buttons: Print, Share, Save */}
          <div className="flex flex-wrap items-center gap-2">
            <PrintButton />

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-4 py-2 border border-border rounded-[6px] bg-offWhite text-ink hover:border-deepGreen hover:text-deepGreen font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
              aria-label="Share recommendation link"
            >
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span>{isCopied ? "Link copied" : "Share"}</span>
            </button>

            {/* Save plan button */}
            <button
              type="button"
              onClick={handleSavePlan}
              className="min-h-[44px] px-4 py-2 border border-border rounded-[6px] bg-offWhite text-ink hover:border-deepGreen hover:text-deepGreen font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
              aria-label="Save plan to local storage"
            >
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span>Save plan</span>
            </button>
          </div>
        </div>

        {/* Title & Location details */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
              Crop Recommendations
            </h1>
            <p className="text-xs text-soilBrown mt-1">
              Location: <strong className="text-ink">{profile.village}</strong> (Lat: {profile.latitude.toFixed(2)} N, Lon: {profile.longitude.toFixed(2)} E) | Season: <strong className="text-ink">{profile.farming_season}</strong> | Soil: <strong className="text-ink">{profile.soil_type}</strong> | Area: {profile.land_area_acres} Acres
            </p>
          </div>

          {/* 2. Confidence Label */}
          <div className="shrink-0">
            <ConfidenceLabel
              sources={sources}
              latitude={profile.latitude}
              longitude={profile.longitude}
              isMock={recs?.is_mock || false}
            />
          </div>
        </div>

        {/* Satellite Data Source Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-semibold text-soilBrown uppercase tracking-wider">
            Data Sources:
          </span>
          <span className="border border-border rounded-[6px] bg-offWhite px-2.5 py-1 text-xs text-soilBrown font-medium inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-[2px] bg-deepGreen" />
            NASA POWER
          </span>
          <span className="border border-border rounded-[6px] bg-offWhite px-2.5 py-1 text-xs text-soilBrown font-medium inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-[2px] bg-deepGreen" />
            GPM IMERG
          </span>
          <span className="border border-border rounded-[6px] bg-offWhite px-2.5 py-1 text-xs text-soilBrown font-medium inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-[2px] bg-deepGreen" />
            SMAP
          </span>

          <Link
            href="/advice"
            className="ml-auto min-h-[44px] px-3 py-1.5 text-xs font-semibold text-deepGreen hover:text-soilBrown transition-colors inline-flex items-center gap-1"
          >
            <span>New assessment</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* What-If Controls (collapsible simulation panel) */}
      <WhatIfControls
        currentWaterSource={profile.irrigation_available ? "borewell" : "rainfed"}
        currentSeason={profile.farming_season}
        onRecalculate={handleRecalculate}
        isRecalculating={isRecalculating}
      />

      {/* 3. Results Tabs (Crops, Irrigation, Rotation, Risks) */}
      {recs && <ResultsTabs recommendation={recs} />}

      {/* Toast Notification for Save Plan */}
      {showSaveToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-4 border border-deepGreen bg-offWhite rounded-[6px] text-xs font-semibold text-deepGreen flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 shrink-0 text-deepGreen"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Saved to My plans</span>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-offWhite text-ink font-body">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      >
        <Suspense
          fallback={
            <div className="p-6 bg-offWhite border border-border rounded-[6px] animate-pulse">
              <div className="h-6 w-48 bg-border rounded-[6px] mb-4" />
              <div className="h-4 w-96 bg-border/60 rounded-[6px]" />
            </div>
          }
        >
          <ResultsContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
