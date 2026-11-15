export interface FarmerProfileInput {
  village: string;
  latitude: number;
  longitude: number;
  current_crop: string;
  previous_crop: string;
  soil_type: string;
  land_area_acres: number;
  irrigation_available: boolean;
  farming_season: string;
}

export interface CropScoreBreakdown {
  temperature_score: number;
  rainfall_score: number;
  soil_moisture_score: number;
  rotation_penalty_or_bonus: number;
  total_score: number;
  season_score?: number;
  soil_score?: number;
  water_irrigation_score?: number;
}

export type CropViability = "Optimal" | "Moderate" | "Conditional" | "Poor";

export interface CropRecommendation {
  crop_name: string;
  score: number;
  rank: number;
  viability: CropViability;
  rationale: string;
  irrigation_weekly_mm: number;
  agronomic_notes: string;
  botanical_name?: string;
  score_breakdown?: CropScoreBreakdown;
  suitability_category?: string;
  crop_duration?: string;
  water_requirement?: string;
  reasons?: string[];
  environmental_advantages?: string[];
  potential_risks?: string[];
  water_and_irrigation_considerations?: string;
  crop_rotation_notes?: string;
  limitations?: string[];
  agricultural_sources?: string[];
}

export interface TemperatureIndicator {
  average_temperature_celsius: number;
  min_temperature_celsius: number;
  max_temperature_celsius: number;
  temperature_trend: string;
}

export interface RainfallIndicator {
  total_rainfall_mm: number;
  consecutive_dry_days: number;
  rainfall_trend: string;
}

export interface SoilMoistureIndicator {
  average_surface_soil_moisture_percent: number;
  average_rootzone_soil_moisture_percent: number;
  water_stress_indicator: string;
}

export interface EnvironmentalIndicators {
  temperature: TemperatureIndicator;
  rainfall: RainfallIndicator;
  soil_moisture: SoilMoistureIndicator;
  relative_humidity_percent?: number;
  solar_radiation_kwh_m2_day?: number;
}

export interface WeeklyIrrigationPlan {
  week: number;
  stage: string;
  water_mm: number;
  guidance: string;
}

export interface IrrigationSummary {
  weekly_plan: WeeklyIrrigationPlan[];
  total_water_requirement_mm: string | number;
  irrigation_method_recommended: string;
  guidance_notes: string;
}

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface RiskAlert {
  id: string;
  severity: RiskSeverity;
  category: "temperature" | "moisture" | "pest" | "rainfall" | "general";
  title: string;
  description: string;
  mitigation: string;
}

export interface RotationAdvice {
  current_crop: string;
  recommended_next: string;
  soil_impact: string;
  pest_disease_benefit: string;
  notes: string;
}

export interface RecommendationMetadata {
  analysis_timestamp: string;
  satellite_sources: string[];
  data_completeness_percentage: number;
  region: string;
  disclaimer: string;
}

export interface RecommendationResponse {
  farmer_profile: FarmerProfileInput;
  top_crops: CropRecommendation[];
  indicators: EnvironmentalIndicators;
  rainfall_trend: string;
  irrigation_summary: IrrigationSummary;
  risks: RiskAlert[];
  rotation_advice?: RotationAdvice;
  metadata: RecommendationMetadata;
  is_mock: boolean;
}

export interface SupportedCrop {
  id: string;
  name: string;
  botanical_name: string;
  family: string;
  suitable_seasons: string[];
  optimal_soils: string[];
  water_requirement_category: string;
  duration_days: string;
}

export interface BackendHealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  debug: boolean;
  target_region?: {
    name: string;
    default_latitude: number;
    default_longitude: number;
  };
  services?: Record<string, string>;
}
