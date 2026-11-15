"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { DemoForm } from "@/components/demo/DemoForm";
import { RecommendationCard } from "@/components/demo/RecommendationCard";
import { ScoreBreakdown } from "@/components/demo/ScoreBreakdown";
import { IrrigationChart } from "@/components/demo/IrrigationChart";
import { RiskAlerts } from "@/components/demo/RiskAlerts";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { useRecommendations } from "@/hooks/useRecommendations";
import { FarmerProfileInput } from "@/lib/types";
import {
  Broadcast,
  Warning,
  ArrowsClockwise,
  Thermometer,
  Drop,
  Plant,
  Calendar,
  CheckCircle,
} from "@phosphor-icons/react";

export function LiveDemoSection() {
  const t = useTranslations("demo");

  const [farmerInput, setFarmerInput] = useState<FarmerProfileInput | null>(null);
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);

  const {
    data: recommendationsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useRecommendations(farmerInput);

  const handleFormSubmit = (newProfile: FarmerProfileInput) => {
    setFarmerInput(newProfile);
    setSelectedCropIndex(0);
  };

  const topCrops = recommendationsData?.top_crops || [];
  const selectedCrop = topCrops[selectedCropIndex] || topCrops[0];

  return (
    <section id="demo" className="w-full border-b border-border bg-offWhite py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded border border-border bg-offWhite px-3 py-1 text-xs font-semibold uppercase tracking-wider text-soilBrown">
            <Broadcast size={14} weight="regular" className="text-deepGreen" />
            <span>Interactive Live Engine</span>
          </div>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 font-body text-base sm:text-lg text-ink/80 leading-relaxed">
            Test the live advisory model using verified Singur, Polba, or Haripal test coordinates, or provide your custom plot parameters.
          </p>
        </div>

        {/* Embedded Real Form */}
        <div>
          <DemoForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading || isFetching}
          />
        </div>

        {/* Loading Skeleton */}
        {(isLoading || isFetching) && <SkeletonLoader />}

        {/* Error State */}
        {!isLoading && !isFetching && isError && (
          <div className="p-6 bg-offWhite border border-alertRed rounded space-y-4" role="alert">
            <div className="flex items-start gap-3">
              <Warning size={24} weight="regular" className="text-alertRed shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-lg font-heading font-bold text-ink">
                  {t("errorTitle")}
                </h3>
                <p className="text-sm text-soilBrown">
                  {error?.message || "Unable to connect to the recommendation pipeline. Please click retry."}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="min-h-[44px] px-5 py-2 bg-deepGreen text-offWhite font-semibold rounded hover:bg-soilBrown transition-colors flex items-center gap-2"
              >
                <ArrowsClockwise size={18} weight="regular" />
                <span>{t("retry")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loaded Data Results */}
        {!isLoading && !isFetching && !isError && recommendationsData && (
          <div className="space-y-8">
            {/* Fallback Notice if running mock */}
            {recommendationsData.is_mock && (
              <div className="p-4 bg-offWhite border border-border rounded flex items-center gap-3">
                <Broadcast size={20} weight="regular" className="text-soilBrown shrink-0" />
                <p className="text-sm text-soilBrown">
                  Showing validated agronomic fallback data. Connect to the FastAPI backend for live satellite readings.
                </p>
              </div>
            )}

            {/* Environmental Summary Strip */}
            <div className="p-5 bg-offWhite border border-border rounded space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-heading font-bold text-ink">
                    {recommendationsData.farmer_profile.village}
                  </h3>
                  <p className="text-xs text-soilBrown mt-0.5">
                    Coordinates: {recommendationsData.farmer_profile.latitude.toFixed(4)} N,{" "}
                    {recommendationsData.farmer_profile.longitude.toFixed(4)} E | Season:{" "}
                    <strong className="text-ink">{recommendationsData.farmer_profile.farming_season}</strong> |
                    Area: {recommendationsData.farmer_profile.land_area_acres} Acres
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded border border-border bg-[#E5ECE7] text-deepGreen">
                  Validated ICAR-BCKV Rules
                </span>
              </div>

              {/* Environmental Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                    <Thermometer size={16} weight="regular" className="text-deepGreen shrink-0" />
                    <span>Mean Temp</span>
                  </div>
                  <p className="text-base font-bold text-ink">
                    {recommendationsData.indicators.temperature.average_temperature_celsius.toFixed(1)} C
                  </p>
                  <p className="text-[11px] text-soilBrown">
                    NASA POWER Thermal Feed
                  </p>
                </div>

                <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                    <Drop size={16} weight="regular" className="text-deepGreen shrink-0" />
                    <span>Recent Rainfall</span>
                  </div>
                  <p className="text-base font-bold text-ink">
                    {recommendationsData.indicators.rainfall.total_rainfall_mm.toFixed(1)} mm
                  </p>
                  <p className="text-[11px] text-soilBrown">
                    {recommendationsData.indicators.rainfall.consecutive_dry_days} Dry Days (GPM)
                  </p>
                </div>

                <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                    <Plant size={16} weight="regular" className="text-deepGreen shrink-0" />
                    <span>Root-Zone SMAP</span>
                  </div>
                  <p className="text-base font-bold text-ink">
                    {recommendationsData.indicators.soil_moisture.average_rootzone_soil_moisture_percent.toFixed(0)}%
                  </p>
                  <p className="text-[11px] text-soilBrown truncate">
                    {recommendationsData.indicators.soil_moisture.water_stress_indicator}
                  </p>
                </div>

                <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                  <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                    <Calendar size={16} weight="regular" className="text-deepGreen shrink-0" />
                    <span>Previous Crop</span>
                  </div>
                  <p className="text-base font-bold text-ink truncate">
                    {recommendationsData.farmer_profile.previous_crop}
                  </p>
                  <p className="text-[11px] text-soilBrown">
                    Soil: {recommendationsData.farmer_profile.soil_type}
                  </p>
                </div>
              </div>
            </div>

            {/* Top 3 Crop Cards */}
            <div className="space-y-4">
              <h3 className="text-2xl font-heading font-bold text-deepGreen">
                Top 3 Ranked Crop Candidates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {topCrops.map((crop, index) => (
                  <RecommendationCard
                    key={crop.crop_name}
                    crop={crop}
                    rank={index + 1}
                    isSelected={selectedCropIndex === index}
                    onSelect={() => setSelectedCropIndex(index)}
                    isMock={recommendationsData.is_mock}
                  />
                ))}
              </div>
            </div>

            {/* Score Breakdown and Irrigation Schedule */}
            {selectedCrop && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ScoreBreakdown
                  breakdown={selectedCrop.score_breakdown}
                  cropName={selectedCrop.crop_name}
                  totalScore={selectedCrop.score}
                />
                <IrrigationChart
                  weeklyPlan={recommendationsData.irrigation_summary?.weekly_plan}
                  cropName={selectedCrop.crop_name}
                  totalRequirement={recommendationsData.irrigation_summary?.total_water_requirement_mm}
                  method={recommendationsData.irrigation_summary?.irrigation_method_recommended}
                />
              </div>
            )}

            {/* Risk Alerts */}
            <RiskAlerts alerts={recommendationsData.risks} />

            {/* Crop Rotation Block */}
            {recommendationsData.rotation_advice && (
              <div className="p-6 bg-offWhite border border-border rounded space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <CheckCircle size={20} weight="regular" className="text-deepGreen shrink-0" />
                  <h3 className="text-xl font-heading font-semibold text-ink">
                    Crop Rotation and Soil Fertility Impact
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-[#E9E4D9] rounded border border-border space-y-1">
                    <h4 className="font-semibold text-ink text-xs uppercase tracking-wider">
                      Soil Nutrient Impact
                    </h4>
                    <p className="text-soilBrown text-xs leading-relaxed">
                      {recommendationsData.rotation_advice.soil_impact}
                    </p>
                  </div>
                  <div className="p-4 bg-[#E9E4D9] rounded border border-border space-y-1">
                    <h4 className="font-semibold text-ink text-xs uppercase tracking-wider">
                      Pathogen and Pest Reduction
                    </h4>
                    <p className="text-soilBrown text-xs leading-relaxed">
                      {recommendationsData.rotation_advice.pest_disease_benefit}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-soilBrown">
                  {recommendationsData.rotation_advice.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
