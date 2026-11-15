"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FarmerProfileInput } from "@/lib/types";
import { MapPin, ArrowsClockwise, Check } from "@phosphor-icons/react";

const formSchema = z.object({
  village: z.string().min(2, "Village name must be at least 2 characters."),
  latitude: z
    .number()
    .min(21.0, "Latitude must be within Bengal agro-climatic zone (21.0 to 24.0).")
    .max(24.0, "Latitude must be within Bengal agro-climatic zone (21.0 to 24.0)."),
  longitude: z
    .number()
    .min(86.0, "Longitude must be within Bengal agro-climatic zone (86.0 to 90.0).")
    .max(90.0, "Longitude must be within Bengal agro-climatic zone (86.0 to 90.0)."),
  current_crop: z.string().min(1, "Please select or enter current standing crop."),
  previous_crop: z.string().min(1, "Please select or enter previously harvested crop."),
  soil_type: z.enum(["Alluvial", "Clay", "Sandy", "Loamy"]),
  land_area_acres: z
    .number()
    .min(0.1, "Minimum land area is 0.1 acres.")
    .max(100, "Maximum land area is 100 acres."),
  irrigation_available: z.boolean(),
  farming_season: z.enum(["Rabi", "Kharif", "Zaid"])
});

type FormValues = z.infer<typeof formSchema>;

interface DemoFormProps {
  onSubmit: (data: FarmerProfileInput) => void;
  isLoading?: boolean;
}

interface PresetLocation {
  name: string;
  description: string;
  values: FormValues;
}

const PRESETS: PresetLocation[] = [
  {
    name: "Singur",
    description: "Potato-Paddy tract",
    values: {
      village: "Singur",
      latitude: 22.81,
      longitude: 88.23,
      current_crop: "Potato",
      previous_crop: "Paddy (Aman)",
      soil_type: "Alluvial",
      land_area_acres: 2.5,
      irrigation_available: true,
      farming_season: "Rabi"
    }
  },
  {
    name: "Polba-Dadpur",
    description: "Vegetable tract",
    values: {
      village: "Polba-Dadpur",
      latitude: 22.92,
      longitude: 88.31,
      current_crop: "Vegetables",
      previous_crop: "Jute",
      soil_type: "Loamy",
      land_area_acres: 1.8,
      irrigation_available: true,
      farming_season: "Rabi"
    }
  },
  {
    name: "Haripal",
    description: "Intensive Rabi",
    values: {
      village: "Haripal",
      latitude: 22.83,
      longitude: 88.11,
      current_crop: "Paddy (Aman)",
      previous_crop: "Sesame",
      soil_type: "Clay",
      land_area_acres: 3.2,
      irrigation_available: true,
      farming_season: "Rabi"
    }
  }
];

export function DemoForm({ onSubmit, isLoading = false }: DemoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: PRESETS[0].values
  });

  const handlePresetSelect = (preset: PresetLocation) => {
    reset(preset.values);
  };

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      village: data.village,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      current_crop: data.current_crop,
      previous_crop: data.previous_crop,
      soil_type: data.soil_type,
      land_area_acres: Number(data.land_area_acres),
      irrigation_available: data.irrigation_available,
      farming_season: data.farming_season
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="p-6 bg-offWhite border border-border rounded space-y-6"
      noValidate
    >
      {/* Form Header with Presets */}
      <div className="space-y-3 pb-4 border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-heading font-semibold text-ink">
              Farmer Profile and Field Parameters
            </h2>
            <p className="text-sm text-soilBrown">
              Select an example location or enter custom coordinates
            </p>
          </div>
          <span className="text-xs text-soilBrown">
            1-Click Pre-configured Presets:
          </span>
        </div>

        {/* Preset Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="min-h-[44px] px-3 py-2 border border-border rounded bg-[#E9E4D9] hover:border-soilBrown text-left transition-colors flex items-center justify-between gap-2"
            >
              <div>
                <span className="text-sm font-semibold text-ink block">
                  {preset.name}
                </span>
                <span className="text-xs text-soilBrown block">
                  {preset.description}
                </span>
              </div>
              <MapPin size={18} className="text-deepGreen shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {/* Village Name */}
        <div className="space-y-1.5">
          <label htmlFor="village" className="block text-sm font-medium text-ink">
            Village Name
          </label>
          <input
            id="village"
            type="text"
            {...register("village")}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
            placeholder="e.g. Singur"
          />
          {errors.village && (
            <p className="text-xs text-alertRed font-medium">
              {errors.village.message}
            </p>
          )}
        </div>

        {/* Latitude */}
        <div className="space-y-1.5">
          <label htmlFor="latitude" className="block text-sm font-medium text-ink">
            Latitude (Bengal: 21.0 to 24.0)
          </label>
          <input
            id="latitude"
            type="number"
            step="0.0001"
            {...register("latitude", { valueAsNumber: true })}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
            placeholder="22.81"
          />
          {errors.latitude && (
            <p className="text-xs text-alertRed font-medium">
              {errors.latitude.message}
            </p>
          )}
        </div>

        {/* Longitude */}
        <div className="space-y-1.5">
          <label htmlFor="longitude" className="block text-sm font-medium text-ink">
            Longitude (Bengal: 86.0 to 90.0)
          </label>
          <input
            id="longitude"
            type="number"
            step="0.0001"
            {...register("longitude", { valueAsNumber: true })}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
            placeholder="88.23"
          />
          {errors.longitude && (
            <p className="text-xs text-alertRed font-medium">
              {errors.longitude.message}
            </p>
          )}
        </div>

        {/* Current Crop */}
        <div className="space-y-1.5">
          <label
            htmlFor="current_crop"
            className="block text-sm font-medium text-ink"
          >
            Current Standing Crop
          </label>
          <select
            id="current_crop"
            {...register("current_crop")}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
          >
            <option value="Potato">Potato</option>
            <option value="Paddy (Aman)">Paddy (Aman)</option>
            <option value="Mustard">Mustard</option>
            <option value="Lentil">Lentil</option>
            <option value="Maize">Maize</option>
            <option value="Jute">Jute</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fallow">Fallow / None</option>
          </select>
          {errors.current_crop && (
            <p className="text-xs text-alertRed font-medium">
              {errors.current_crop.message}
            </p>
          )}
        </div>

        {/* Previous Crop */}
        <div className="space-y-1.5">
          <label
            htmlFor="previous_crop"
            className="block text-sm font-medium text-ink"
          >
            Previous Harvested Crop
          </label>
          <select
            id="previous_crop"
            {...register("previous_crop")}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
          >
            <option value="Paddy (Aman)">Paddy (Aman)</option>
            <option value="Jute">Jute</option>
            <option value="Potato">Potato</option>
            <option value="Mustard">Mustard</option>
            <option value="Sesame">Sesame</option>
            <option value="Vegetables">Vegetables</option>
            <option value="None">None</option>
          </select>
          {errors.previous_crop && (
            <p className="text-xs text-alertRed font-medium">
              {errors.previous_crop.message}
            </p>
          )}
        </div>

        {/* Soil Type */}
        <div className="space-y-1.5">
          <label htmlFor="soil_type" className="block text-sm font-medium text-ink">
            Dominant Soil Type
          </label>
          <select
            id="soil_type"
            {...register("soil_type")}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
          >
            <option value="Alluvial">Alluvial</option>
            <option value="Clay">Clay</option>
            <option value="Sandy">Sandy</option>
            <option value="Loamy">Loamy</option>
          </select>
          {errors.soil_type && (
            <p className="text-xs text-alertRed font-medium">
              {errors.soil_type.message}
            </p>
          )}
        </div>

        {/* Land Area */}
        <div className="space-y-1.5">
          <label
            htmlFor="land_area_acres"
            className="block text-sm font-medium text-ink"
          >
            Land Area (Acres)
          </label>
          <input
            id="land_area_acres"
            type="number"
            step="0.1"
            {...register("land_area_acres", { valueAsNumber: true })}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
            placeholder="2.5"
          />
          {errors.land_area_acres && (
            <p className="text-xs text-alertRed font-medium">
              {errors.land_area_acres.message}
            </p>
          )}
        </div>

        {/* Farming Season */}
        <div className="space-y-1.5">
          <label
            htmlFor="farming_season"
            className="block text-sm font-medium text-ink"
          >
            Target Farming Season
          </label>
          <select
            id="farming_season"
            {...register("farming_season")}
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded text-ink focus:outline-none focus:ring-1 focus:ring-deepGreen focus:border-deepGreen"
          >
            <option value="Rabi">Rabi (Winter season: Oct to Mar)</option>
            <option value="Kharif">Kharif (Monsoon season: Jun to Oct)</option>
            <option value="Zaid">Zaid (Pre-monsoon summer: Mar to Jun)</option>
          </select>
          {errors.farming_season && (
            <p className="text-xs text-alertRed font-medium">
              {errors.farming_season.message}
            </p>
          )}
        </div>

        {/* Irrigation Available Checkbox */}
        <div className="flex items-center min-h-[44px] pt-6">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-ink select-none">
            <input
              type="checkbox"
              {...register("irrigation_available")}
              className="h-5 w-5 rounded border-border text-deepGreen focus:ring-deepGreen accent-[#1E4D36]"
            />
            <span>Reliable Irrigation Available</span>
          </label>
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-soilBrown">
          Connects to NASA POWER, SMAP, and GPM IMERG Earth observation data
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[44px] px-6 py-2.5 bg-deepGreen text-offWhite font-semibold rounded hover:bg-soilBrown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deepGreen disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <ArrowsClockwise size={18} className="animate-spin shrink-0" />
              <span>Fetching Satellite Data...</span>
            </>
          ) : (
            <>
              <Check size={18} className="shrink-0" />
              <span>Generate Recommendations</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
