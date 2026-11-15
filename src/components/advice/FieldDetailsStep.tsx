'use client'

import React from 'react'

export interface FieldDetailsData {
  landSize: number
  landUnit: 'ha' | 'acre' | 'bigha'
  soilType: 'alluvial' | 'clay' | 'sandy' | 'loamy' | 'black_cotton' | 'red_laterite'
  waterSource: 'rainfed' | 'borewell' | 'canal' | 'lift' | 'pond'
  previousCrop: 'rice' | 'wheat' | 'mustard' | 'lentil' | 'jute' | 'maize' | 'potato' | 'fallow'
  season: 'rabi' | 'kharif' | 'zaid'
  farmingGoal: 'yield' | 'income' | 'soil' | 'water'
}

interface FieldDetailsStepProps {
  data: FieldDetailsData
  onChange: (updates: Partial<FieldDetailsData>) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting?: boolean
  errors?: Partial<Record<keyof FieldDetailsData, string>>
}

const SOIL_OPTIONS = [
  { value: 'alluvial', label: 'Alluvial' },
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'loamy', label: 'Loamy' },
  { value: 'black_cotton', label: 'Black Cotton' },
  { value: 'red_laterite', label: 'Red Laterite' },
] as const

const WATER_OPTIONS = [
  { value: 'rainfed', label: 'Rainfed' },
  { value: 'borewell', label: 'Borewell' },
  { value: 'canal', label: 'Canal' },
  { value: 'lift', label: 'Lift Irrigation' },
  { value: 'pond', label: 'Pond' },
] as const

const PREVIOUS_CROPS = [
  { value: 'rice', label: 'Rice' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'mustard', label: 'Mustard' },
  { value: 'lentil', label: 'Lentil' },
  { value: 'jute', label: 'Jute' },
  { value: 'maize', label: 'Maize' },
  { value: 'potato', label: 'Potato' },
  { value: 'fallow', label: 'Fallow' },
] as const

const SEASONS = [
  { value: 'rabi', label: 'Rabi (Nov-Mar)', desc: 'Winter cropping season' },
  { value: 'kharif', label: 'Kharif (Jun-Oct)', desc: 'Monsoon cropping season' },
  { value: 'zaid', label: 'Zaid (Mar-Jun)', desc: 'Summer cropping season' },
] as const

const GOALS = [
  { value: 'yield', label: 'Maximum yield', desc: 'Optimize for highest total output' },
  { value: 'income', label: 'Income stability', desc: 'Prioritize reliable market pricing' },
  { value: 'soil', label: 'Soil health', desc: 'Enhance organic matter and soil nutrients' },
  { value: 'water', label: 'Water saving', desc: 'Conserve irrigation and rainfall reserves' },
] as const

export default function FieldDetailsStep({
  data,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  errors,
}: FieldDetailsStepProps) {
  // Conversion helper: 1 ha = 2.471 acres = 3.954 bigha
  const handleUnitChange = (newUnit: 'ha' | 'acre' | 'bigha') => {
    if (newUnit === data.landUnit) return

    const currentVal = data.landSize || 0
    let sizeInHa = currentVal

    if (data.landUnit === 'acre') {
      sizeInHa = currentVal / 2.471
    } else if (data.landUnit === 'bigha') {
      sizeInHa = currentVal / 3.954
    }

    let converted = sizeInHa
    if (newUnit === 'acre') {
      converted = sizeInHa * 2.471
    } else if (newUnit === 'bigha') {
      converted = sizeInHa * 3.954
    }

    onChange({
      landUnit: newUnit,
      landSize: parseFloat(converted.toFixed(2)),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-ink font-semibold">
          Step 2: Field Details
        </h2>
        <p className="text-sm text-ink opacity-80 mt-1">
          Specify your cultivated land size, soil characteristics, water sources, and agricultural goals.
        </p>
      </div>

      {/* Land Size and Unit Tabs */}
      <div>
        <label
          htmlFor="land-size-input"
          className="block text-sm font-semibold text-ink mb-1"
        >
          Cultivated Land Area
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1">
            <input
              id="land-size-input"
              type="number"
              step="any"
              min="0.01"
              value={data.landSize || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                onChange({ landSize: isNaN(val) ? 0 : val })
              }}
              placeholder="e.g. 2.5"
              className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen"
            />
          </div>

          <div
            role="tablist"
            aria-label="Land measurement unit"
            className="flex items-center gap-1 border border-border rounded-[6px] p-1 bg-offWhite"
          >
            {(['ha', 'acre', 'bigha'] as const).map((unit) => {
              const isSelected = data.landUnit === unit
              return (
                <button
                  key={unit}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleUnitChange(unit)}
                  className={`min-h-[44px] px-4 text-sm font-medium rounded-[6px] transition-colors ${
                    isSelected
                      ? 'bg-deepGreen text-offWhite font-semibold'
                      : 'bg-offWhite text-ink hover:bg-wheat/20'
                  }`}
                >
                  {unit}
                </button>
              )
            })}
          </div>
        </div>
        {errors?.landSize && (
          <p className="text-xs text-alertRed mt-1">{errors.landSize}</p>
        )}
      </div>

      {/* Soil Type, Water Source, Previous Crop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Soil Type */}
        <div>
          <label
            htmlFor="soil-type-select"
            className="block text-sm font-semibold text-ink mb-1"
          >
            Soil Type
          </label>
          <select
            id="soil-type-select"
            value={data.soilType}
            onChange={(e) =>
              onChange({
                soilType: e.target.value as FieldDetailsData['soilType'],
              })
            }
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen cursor-pointer"
          >
            {SOIL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors?.soilType && (
            <p className="text-xs text-alertRed mt-1">{errors.soilType}</p>
          )}
        </div>

        {/* Water Source */}
        <div>
          <label
            htmlFor="water-source-select"
            className="block text-sm font-semibold text-ink mb-1"
          >
            Water Source
          </label>
          <select
            id="water-source-select"
            value={data.waterSource}
            onChange={(e) =>
              onChange({
                waterSource: e.target.value as FieldDetailsData['waterSource'],
              })
            }
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen cursor-pointer"
          >
            {WATER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors?.waterSource && (
            <p className="text-xs text-alertRed mt-1">{errors.waterSource}</p>
          )}
        </div>

        {/* Previous Crop */}
        <div>
          <label
            htmlFor="previous-crop-select"
            className="block text-sm font-semibold text-ink mb-1"
          >
            Previous Crop
          </label>
          <select
            id="previous-crop-select"
            value={data.previousCrop}
            onChange={(e) =>
              onChange({
                previousCrop: e.target.value as FieldDetailsData['previousCrop'],
              })
            }
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen cursor-pointer"
          >
            {PREVIOUS_CROPS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors?.previousCrop && (
            <p className="text-xs text-alertRed mt-1">{errors.previousCrop}</p>
          )}
        </div>
      </div>

      {/* Farming Season (3 Radio Buttons) */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink mb-1">
          Farming Season
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SEASONS.map((season) => {
            const isSelected = data.season === season.value
            return (
              <label
                key={season.value}
                className={`min-h-[44px] p-3 border rounded-[6px] cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-deepGreen bg-deepGreen/5 text-deepGreen font-semibold'
                    : 'border-border bg-offWhite text-ink hover:bg-wheat/10'
                }`}
              >
                <div className="flex flex-col pr-2">
                  <span className="text-sm">{season.label}</span>
                  <span className="text-xs opacity-75">{season.desc}</span>
                </div>
                <input
                  type="radio"
                  name="farming_season"
                  value={season.value}
                  checked={isSelected}
                  onChange={() => onChange({ season: season.value })}
                  className="sr-only"
                />
                <div
                  aria-hidden="true"
                  className={`w-5 h-5 min-w-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-deepGreen bg-deepGreen text-offWhite'
                      : 'border-border bg-offWhite'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </label>
            )
          })}
        </div>
        {errors?.season && (
          <p className="text-xs text-alertRed mt-1">{errors.season}</p>
        )}
      </fieldset>

      {/* Farming Goal (4 Radio Buttons) */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink mb-1">
          Farming Goal
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GOALS.map((goal) => {
            const isSelected = data.farmingGoal === goal.value
            return (
              <label
                key={goal.value}
                className={`min-h-[44px] p-3 border rounded-[6px] cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'border-deepGreen bg-deepGreen/5 text-deepGreen font-semibold'
                    : 'border-border bg-offWhite text-ink hover:bg-wheat/10'
                }`}
              >
                <div className="flex flex-col pr-2">
                  <span className="text-sm">{goal.label}</span>
                  <span className="text-xs opacity-75">{goal.desc}</span>
                </div>
                <input
                  type="radio"
                  name="farming_goal"
                  value={goal.value}
                  checked={isSelected}
                  onChange={() => onChange({ farmingGoal: goal.value })}
                  className="sr-only"
                />
                <div
                  aria-hidden="true"
                  className={`w-5 h-5 min-w-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-deepGreen bg-deepGreen text-offWhite'
                      : 'border-border bg-offWhite'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </label>
            )
          })}
        </div>
        {errors?.farmingGoal && (
          <p className="text-xs text-alertRed mt-1">{errors.farmingGoal}</p>
        )}
      </fieldset>

      {/* Navigation Buttons: Back and Submit */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-5 py-2.5 bg-offWhite border border-border text-ink rounded-[6px] hover:bg-wheat/20 font-medium transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Location</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="min-h-[44px] px-6 py-2.5 bg-deepGreen text-offWhite font-semibold rounded-[6px] hover:bg-deepGreen/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin text-offWhite"
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
              <span>Generating Recommendations...</span>
            </>
          ) : (
            <>
              <span>Get Recommendations</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
