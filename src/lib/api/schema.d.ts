/**
 * TypeScript type definitions matching the AgriShift AI backend Pydantic schemas.
 * Source: AgriShift-AI/app/schemas/
 *
 * If the backend changes a schema, update this file and the adapter in adapters.ts.
 * Do not use these types directly in components. Import from src/lib/types.ts instead.
 */

// ---------------------------------------------------------------------------
// Farmer schemas (farmer.py)
// ---------------------------------------------------------------------------

export interface BackendFarmerProfile {
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

export interface BackendFarmerProfileResponse {
  success: boolean;
  message: string;
  data: BackendFarmerProfile;
}

// ---------------------------------------------------------------------------
// Recommendation schemas (recommendation.py)
// ---------------------------------------------------------------------------

export interface BackendCropRecommendationRequest {
  farmer_profile: BackendFarmerProfile;
  target_farming_season?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  preferred_rainfall_source?: string | null;
}

export interface BackendScoreBreakdown {
  season?: number;
  soil?: number;
  temperature?: number;
  water_irrigation?: number;
  soil_moisture?: number;
  rotation?: number;
}

export interface BackendCropRecommendationItem {
  rank: number;
  crop_name: string;
  botanical_name: string;
  suitability_score: number;
  suitability_category: string;
  growing_season: string;
  crop_duration: string;
  water_requirement: string;
  score_breakdown: BackendScoreBreakdown;
  reasons: string[];
  environmental_advantages: string[];
  potential_risks: string[];
  water_and_irrigation_considerations: string;
  crop_rotation_notes: string;
  missing_information: string[];
  limitations: string[];
  agricultural_sources: string[];
  reference_urls: string[];
}

export interface BackendAnalysisPeriod {
  start_date?: string;
  end_date?: string;
  total_days?: number;
}

export interface BackendTemperatureSummary {
  average_celsius?: number;
  min_celsius?: number;
  max_celsius?: number;
  trend?: string;
}

export interface BackendRainfallSummary {
  total_mm?: number;
  dry_days?: number;
  consecutive_dry_days?: number;
  trend?: string;
}

export interface BackendSoilMoistureSummary {
  rootzone_fraction?: number;
  surface_fraction?: number;
  water_stress_status?: string;
}

export interface BackendAtmosphericSummary {
  relative_humidity_percent?: number;
  solar_radiation_kwh_m2_day?: number;
}

export interface BackendEnvironmentalSummary {
  analysis_period: BackendAnalysisPeriod;
  temperature: BackendTemperatureSummary;
  rainfall: BackendRainfallSummary;
  soil_moisture: BackendSoilMoistureSummary;
  atmospheric: BackendAtmosphericSummary;
  data_completeness_percentage: number;
}

export interface BackendDataQuality {
  overall_completeness_percentage?: number;
  confidence_rating?: string;
  confidence_notes?: string;
}

export interface BackendSourceReference {
  institution: string;
  name: string;
  role: string;
}

export interface BackendCropRecommendationResponse {
  success: boolean;
  status: string;
  message: string;
  farmer_location: {
    village: string;
    latitude: number;
    longitude: number;
  };
  target_season: string;
  environmental_summary: BackendEnvironmentalSummary;
  recommendations: BackendCropRecommendationItem[];
  data_quality_and_confidence: BackendDataQuality;
  sources_and_references: BackendSourceReference[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// NASA schemas (nasa.py)
// ---------------------------------------------------------------------------

export interface BackendNasaPowerQuery {
  latitude: number;
  longitude: number;
  start_date?: string | null;
  end_date?: string | null;
}

export interface BackendNasaPowerDailyRecord {
  date: string;
  temperature_2m_c?: number | null;
  precipitation_mm?: number | null;
  relative_humidity_percent?: number | null;
  solar_radiation_kwh_m2_day?: number | null;
}

export interface BackendNasaPowerSummary {
  average_temperature: number;
  max_temperature: number;
  min_temperature: number;
  total_rainfall: number;
  average_humidity: number;
  average_solar_radiation: number;
  valid_observations_count: number;
  missing_observations_count: number;
}

export interface BackendNasaPowerResponse {
  success: boolean;
  source: string;
  location: { latitude: number; longitude: number };
  period: { start_date: string; end_date: string };
  units: Record<string, string>;
  summary: BackendNasaPowerSummary;
  data: BackendNasaPowerDailyRecord[];
}

export interface BackendNasaPowerSummaryResponse extends BackendNasaPowerSummary {
  success: boolean;
  source: string;
  location: { latitude: number; longitude: number };
  period: { start_date: string; end_date: string };
  units: Record<string, string>;
  summary: BackendNasaPowerSummary;
  daily_data: BackendNasaPowerDailyRecord[];
}

export interface BackendNasaGpmSummaryResponse {
  success: boolean;
  source: string;
  location: { latitude: number; longitude: number };
  period: { start_date: string; end_date: string };
  total_rainfall_mm: number;
  average_daily_rainfall_mm: number;
  max_daily_rainfall_mm: number;
  rainfall_trend: string;
  data: Array<{ date: string; precipitation_mm: number | null }>;
}

export interface BackendNasaSmapSummaryResponse {
  success: boolean;
  source: string;
  location: { latitude: number; longitude: number };
  period: { start_date: string; end_date: string };
  average_surface_soil_moisture?: number;
  average_rootzone_soil_moisture?: number;
  water_stress_indicator: string;
  data: Array<{
    date: string;
    surface_soil_moisture?: number | null;
    rootzone_soil_moisture?: number | null;
  }>;
}

// ---------------------------------------------------------------------------
// Agriculture schemas (agriculture.py)
// ---------------------------------------------------------------------------

export interface BackendAgricultureProcessRequest {
  farmer_profile: BackendFarmerProfile;
  start_date?: string | null;
  end_date?: string | null;
  preferred_rainfall_source?: string | null;
  include_daily_records?: boolean | null;
}

export interface BackendAgricultureProcessResponse {
  success: boolean;
  status: string;
  message: string;
  farmer_location?: {
    village: string;
    latitude: number;
    longitude: number;
  };
  environmental_summary?: BackendEnvironmentalSummary;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

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
