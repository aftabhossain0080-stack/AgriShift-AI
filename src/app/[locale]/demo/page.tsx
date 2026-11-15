"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoForm } from "@/components/demo/DemoForm";
import { RecommendationCard } from "@/components/demo/RecommendationCard";
import { ScoreBreakdown } from "@/components/demo/ScoreBreakdown";
import { IrrigationChart } from "@/components/demo/IrrigationChart";
import { RiskAlerts } from "@/components/demo/RiskAlerts";
import { SkeletonLoader } from "@/components/demo/SkeletonLoader";
import { useRecommendations } from "@/hooks/useRecommendations";
import { FarmerProfileInput } from "@/lib/types";
import {
  MapPin,
  Thermometer,
  Drop,
  Plant,
  ArrowsClockwise,
  Warning,
  Broadcast,
  Calendar,
  CheckCircle
} from "@phosphor-icons/react";

export default function DemoPage() {
  const t = useTranslations("demo");
  const locale = useLocale();

  const [farmerInput, setFarmerInput] =
    useState<FarmerProfileInput | null>(null);
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);

  const {
    data: recommendationsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useRecommendations(farmerInput);

  const handleFormSubmit = (newProfile: FarmerProfileInput) => {
    setFarmerInput(newProfile);
    setSelectedCropIndex(0);
  };

  const topCrops = recommendationsData?.top_crops || [];
  const selectedCrop = topCrops[selectedCropIndex] || topCrops[0];

  return (
    <div className="min-h-screen flex flex-col bg-offWhite text-ink font-body">
      <Navbar />

      <main id="main-content" className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Page Header */}
          <div className="border-b border-border pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 bg-[#E9E4D9] text-deepGreen rounded border border-border">
              <Broadcast size={16} className="text-deepGreen shrink-0" />
              <span>Interactive Decision Support Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-deepGreen tracking-tight">
              {locale === "bn"
                ? "লাইভ ফসল সুপারিশ এবং কৃষি বিশ্লেষণ"
                : "Live Crop Recommendation and Agronomic Advisory"}
            </h1>
            <p className="text-base sm:text-lg text-soilBrown max-w-3xl">
              {locale === "bn"
                ? "নাসা আর্থ অবজারভেশন স্যাটেলাইট ডেটা (SMAP, POWER, GPM IMERG) এবং আইসিএআর/বিসিকেভি কৃষি নীতিমালার ভিত্তিতে যাচাইকৃত ফসল সিদ্ধান্ত।"
                : "Real-time crop ranking based on NASA SMAP soil moisture, NASA POWER agro-climatology, and GPM IMERG precipitation, calibrated for Hooghly smallholder farmers."}
            </p>
          </div>

          {/* Farmer Input Form */}
          <section aria-labelledby="form-section-title">
            <h2 id="form-section-title" className="sr-only">
              Farmer Profile Input
            </h2>
            <DemoForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading || isFetching}
            />
          </section>

          {/* Results Area */}
          <section aria-labelledby="results-section-title" className="space-y-8">
            <h2 id="results-section-title" className="sr-only">
              Recommendation Results
            </h2>

            {/* Loading Skeleton */}
            {(isLoading || isFetching) && <SkeletonLoader />}

            {/* Error State */}
            {!isLoading && !isFetching && isError && (
              <div className="p-6 bg-offWhite border border-border rounded space-y-4">
                <div className="flex items-start gap-3">
                  <Warning size={24} className="text-alertRed shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-heading font-bold text-ink">
                      {t("errorTitle")}
                    </h3>
                    <p className="text-sm text-soilBrown">
                      {error?.message ||
                        "Unable to connect to the recommendation pipeline. Please verify your connection or click retry."}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="min-h-[44px] px-5 py-2 bg-deepGreen text-offWhite font-semibold rounded hover:bg-soilBrown transition-colors flex items-center gap-2"
                  >
                    <ArrowsClockwise size={18} />
                    <span>{t("retry")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loaded Data Display */}
            {!isLoading && !isFetching && !isError && recommendationsData && (
              <div className="space-y-8">
                {/* is_mock Banner */}
                {recommendationsData.is_mock === true && (
                  <div
                    className="flex items-start gap-3 p-4 bg-offWhite border border-border rounded"
                    role="status"
                    aria-live="polite"
                  >
                    <Broadcast size={20} className="text-soilBrown shrink-0 mt-0.5" />
                    <p className="text-sm text-soilBrown">
                      Showing validated agronomic fallback data. Connect to backend for live satellite readings.
                    </p>
                  </div>
                )}

                {/* Status and Metadata Banner */}
                <div className="p-5 bg-offWhite border border-border rounded space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={20} className="text-deepGreen shrink-0" />
                        <h3 className="text-lg font-heading font-bold text-ink">
                          {recommendationsData.farmer_profile.village}
                        </h3>
                      </div>
                      <p className="text-xs text-soilBrown">
                        Coordinates: {recommendationsData.farmer_profile.latitude.toFixed(4)} N,{" "}
                        {recommendationsData.farmer_profile.longitude.toFixed(4)} E | Season:{" "}
                        <strong className="text-ink">{recommendationsData.farmer_profile.farming_season}</strong> |
                        Area: {recommendationsData.farmer_profile.land_area_acres} Acres
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded border border-border ${
                          recommendationsData.is_mock
                            ? "bg-[#F5EEDF] text-soilBrown"
                            : "bg-[#E5ECE7] text-deepGreen"
                        }`}
                      >
                        {recommendationsData.is_mock
                          ? "Validated Agronomic Fallback (Simulated Live Payload)"
                          : "Live NASA API Connected"}
                      </span>
                    </div>
                  </div>

                  {/* Satellite Environmental Indicators Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                        <Thermometer size={16} className="text-deepGreen shrink-0" />
                        <span>Mean Temp</span>
                      </div>
                      <p className="text-base font-bold text-ink">
                        {recommendationsData.indicators.temperature.average_temperature_celsius.toFixed(1)} C
                      </p>
                      <p className="text-[11px] text-soilBrown">
                        Range: {recommendationsData.indicators.temperature.min_temperature_celsius.toFixed(1)} to{" "}
                        {recommendationsData.indicators.temperature.max_temperature_celsius.toFixed(1)} C
                      </p>
                    </div>

                    <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                        <Drop size={16} className="text-deepGreen shrink-0" />
                        <span>Recent Rainfall</span>
                      </div>
                      <p className="text-base font-bold text-ink">
                        {recommendationsData.indicators.rainfall.total_rainfall_mm.toFixed(1)} mm
                      </p>
                      <p className="text-[11px] text-soilBrown">
                        {recommendationsData.indicators.rainfall.consecutive_dry_days} Dry Days Observed
                      </p>
                    </div>

                    <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                        <Plant size={16} className="text-deepGreen shrink-0" />
                        <span>Root-Zone SMAP</span>
                      </div>
                      <p className="text-base font-bold text-ink">
                        {recommendationsData.indicators.soil_moisture.average_rootzone_soil_moisture_percent.toFixed(0)}%
                      </p>
                      <p className="text-[11px] text-soilBrown truncate" title={recommendationsData.indicators.soil_moisture.water_stress_indicator}>
                        {recommendationsData.indicators.soil_moisture.water_stress_indicator}
                      </p>
                    </div>

                    <div className="p-3 bg-[#E9E4D9] rounded border border-border space-y-1">
                      <div className="flex items-center gap-1.5 text-soilBrown font-medium">
                        <Calendar size={16} className="text-deepGreen shrink-0" />
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

                {/* Top 3 Crop Recommendations Grid */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-deepGreen">
                        Top 3 Ranked Crop Candidates
                      </h3>
                      <p className="text-sm text-soilBrown">
                        Click any crop card to examine its detailed 100-point breakdown and water plan
                      </p>
                    </div>
                    <span className="text-xs text-soilBrown">
                      Sorted by ICAR-BCKV Suitability Index
                    </span>
                  </div>

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

                {/* Detailed Analysis of Selected Crop: Score Breakdown and Irrigation Schedule */}
                {selectedCrop && (
                  <div className="space-y-6">
                    {/* Selected Crop Banner */}
                    <div className="p-5 bg-offWhite border border-border rounded flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-soilBrown uppercase tracking-wider block">
                          Detailed Agronomic Package
                        </span>
                        <h3 className="text-2xl font-heading font-bold text-ink">
                          {selectedCrop.crop_name} (Rank #{selectedCrop.rank})
                        </h3>
                        {selectedCrop.botanical_name && (
                          <p className="text-xs italic text-soilBrown">
                            Botanical Classification: {selectedCrop.botanical_name}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-soilBrown block">Suitability Score</span>
                          <span className="text-2xl font-heading font-bold text-deepGreen">
                            {selectedCrop.score.toFixed(1)} / 100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Agronomic Rationale Box */}
                    <div className="p-5 bg-offWhite border border-border rounded space-y-2">
                      <h4 className="text-sm font-semibold text-deepGreen uppercase tracking-wider">
                        Field Rationale and Agronomic Guidance
                      </h4>
                      <p className="text-sm text-ink leading-relaxed">
                        {selectedCrop.rationale}
                      </p>
                      {selectedCrop.agronomic_notes && (
                        <p className="text-xs text-soilBrown pt-1 leading-relaxed">
                          <strong className="text-ink">Package of practices: </strong>
                          {selectedCrop.agronomic_notes}
                        </p>
                      )}
                    </div>

                    {/* Side-by-side Grid: Score Breakdown + Irrigation Chart */}
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
                  </div>
                )}

                {/* Risk Alerts */}
                <RiskAlerts alerts={recommendationsData.risks} />

                {/* Crop Rotation Synergy Section */}
                {recommendationsData.rotation_advice && (
                  <div className="p-6 bg-offWhite border border-border rounded space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <CheckCircle size={20} className="text-deepGreen shrink-0" />
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

                {/* Satellite Sources and Disclaimer */}
                <div className="p-4 bg-offWhite border border-border rounded text-xs text-soilBrown space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink">
                      Active Satellite Sources: NASA POWER (MERRA-2, CERES), NASA SMAP L4, NASA GPM IMERG
                    </span>
                    <span>
                      Completeness: {recommendationsData.metadata.data_completeness_percentage}%
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {recommendationsData.metadata.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
