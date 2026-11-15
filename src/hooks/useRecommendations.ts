"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { FarmerProfileInput, RecommendationResponse } from "../lib/types";
import { fetchRecommendations } from "../lib/api";

export function isFarmerProfileValid(input: FarmerProfileInput | null): boolean {
  if (!input) return false;
  const villageOk =
    typeof input.village === "string" && input.village.trim().length > 0;
  const latOk =
    typeof input.latitude === "number" &&
    !isNaN(input.latitude) &&
    input.latitude >= -90 &&
    input.latitude <= 90;
  const lonOk =
    typeof input.longitude === "number" &&
    !isNaN(input.longitude) &&
    input.longitude >= -180 &&
    input.longitude <= 180;
  const currentCropOk =
    typeof input.current_crop === "string" && input.current_crop.trim().length > 0;
  const prevCropOk =
    typeof input.previous_crop === "string" && input.previous_crop.trim().length > 0;
  const soilOk =
    typeof input.soil_type === "string" && input.soil_type.trim().length > 0;
  const areaOk =
    typeof input.land_area_acres === "number" &&
    !isNaN(input.land_area_acres) &&
    input.land_area_acres > 0;
  const seasonOk =
    typeof input.farming_season === "string" && input.farming_season.trim().length > 0;

  return (
    villageOk &&
    latOk &&
    lonOk &&
    currentCropOk &&
    prevCropOk &&
    soilOk &&
    areaOk &&
    seasonOk
  );
}

export function useRecommendations(
  input: FarmerProfileInput | null
): UseQueryResult<RecommendationResponse, Error> {
  const isEnabled = isFarmerProfileValid(input);

  return useQuery<RecommendationResponse, Error>({
    queryKey: ["recommendations", input],
    queryFn: () => {
      if (!input) {
        throw new Error("Farmer profile input is required to fetch recommendations.");
      }
      return fetchRecommendations(input);
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}
