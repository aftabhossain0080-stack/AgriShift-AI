'use client'

import React, { useState, useEffect } from 'react'
import * as z from 'zod'
import { useRouter } from '@/i18n/routing'
import { Navbar, Footer } from '@/components/layout'
import WizardProgress from '@/components/advice/WizardProgress'
import LocationStep from '@/components/advice/LocationStep'
import FieldDetailsStep, { FieldDetailsData } from '@/components/advice/FieldDetailsStep'

const adviceSchema = z.object({
  locationName: z.string().min(1, 'Location required'),
  latitude: z.number({ message: 'Latitude required' }).min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number({ message: 'Longitude required' }).min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  landSize: z.number().positive('Land size must be greater than zero'),
  landUnit: z.enum(['ha', 'acre', 'bigha']),
  soilType: z.enum(['alluvial', 'clay', 'sandy', 'loamy', 'black_cotton', 'red_laterite']),
  waterSource: z.enum(['rainfed', 'borewell', 'canal', 'lift', 'pond']),
  previousCrop: z.enum(['rice', 'wheat', 'mustard', 'lentil', 'jute', 'maize', 'potato', 'fallow']),
  season: z.enum(['rabi', 'kharif', 'zaid']),
  farmingGoal: z.enum(['yield', 'income', 'soil', 'water']),
})

export type AdviceForm = z.infer<typeof adviceSchema>

const STORAGE_DRAFT_KEY = 'agrishift_advice_draft'

const DEFAULT_FORM: AdviceForm = {
  locationName: 'Singur, India',
  latitude: 22.9,
  longitude: 88.4,
  landSize: 2.5,
  landUnit: 'acre',
  soilType: 'alluvial',
  waterSource: 'borewell',
  previousCrop: 'rice',
  season: 'rabi',
  farmingGoal: 'yield',
}

export default function AdvicePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [formData, setFormData] = useState<AdviceForm>(DEFAULT_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({ ...prev, ...parsed }))
        }
      }
    } catch {
      // Ignore storage read error
    }
  }, [])

  const handleLocationChange = (updates: {
    locationName?: string
    latitude?: number
    longitude?: number
  }) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear relevant errors
    if (errors.locationName && updates.locationName) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.locationName
        return next
      })
    }
    if (errors.latitude && updates.latitude !== undefined) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.latitude
        return next
      })
    }
    if (errors.longitude && updates.longitude !== undefined) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.longitude
        return next
      })
    }
  }

  const handleFieldDetailsChange = (updates: Partial<FieldDetailsData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear field-specific errors
    Object.keys(updates).forEach((key) => {
      if (errors[key]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    })
  }

  const handleStep1Advance = () => {
    // Validate Step 1 fields
    const step1Schema = adviceSchema.pick({
      locationName: true,
      latitude: true,
      longitude: true,
    })

    const result = step1Schema.safeParse({
      locationName: formData.locationName,
      latitude: formData.latitude,
      longitude: formData.longitude,
    })

    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[String(err.path[0])] = err.message
        }
      })
      setErrors(newErrors)
      return
    }

    setErrors({})
    try {
      sessionStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData))
    } catch {
      // Ignore storage write error
    }
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2Submit = () => {
    const result = adviceSchema.safeParse(formData)

    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[String(err.path[0])] = err.message
        }
      })
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      // 1. Save draft to sessionStorage
      sessionStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData))

      // 2. Prepare profile for results page
      const acres =
        formData.landUnit === 'acre'
          ? formData.landSize
          : formData.landUnit === 'ha'
          ? parseFloat((formData.landSize * 2.471).toFixed(2))
          : parseFloat((formData.landSize / 1.6).toFixed(2))

      const formattedSoil =
        formData.soilType.charAt(0).toUpperCase() + formData.soilType.slice(1)
      const formattedSeason =
        formData.season.charAt(0).toUpperCase() + formData.season.slice(1)

      const farmerProfile = {
        village: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        soil_type: formattedSoil,
        land_area_acres: acres,
        irrigation_available: formData.waterSource !== 'rainfed',
        current_crop: formData.previousCrop,
        previous_crop: formData.previousCrop,
        farming_season: formattedSeason,
      }

      sessionStorage.setItem(
        'agrishift_farmer_profile',
        JSON.stringify(farmerProfile)
      )

      // 3. Construct query parameters and navigate to /results
      const queryParams = new URLSearchParams({
        village: formData.locationName,
        lat: formData.latitude.toString(),
        lon: formData.longitude.toString(),
        soil: formattedSoil,
        area: acres.toString(),
        irrigation: String(formData.waterSource !== 'rainfed'),
        currentCrop: formData.previousCrop,
        prevCrop: formData.previousCrop,
        season: formattedSeason,
      })

      router.push(`/results?${queryParams.toString()}`)
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-offWhite text-ink font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink tracking-tight">
            Crop Advisory Wizard
          </h1>
          <p className="text-base text-ink opacity-80 mt-2">
            Configure your farm location and field profile to receive satellite-calibrated agronomic guidance.
          </p>
        </header>

        {/* Wizard Progress Indicator */}
        <div className="mb-8 border-b border-border pb-6">
          <WizardProgress
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step <= currentStep) {
                setCurrentStep(step)
              }
            }}
          />
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 md:p-8 border border-border rounded-[6px] bg-offWhite">
          {currentStep === 1 && (
            <LocationStep
              locationName={formData.locationName}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleLocationChange}
              onNext={handleStep1Advance}
              errors={{
                locationName: errors.locationName,
                latitude: errors.latitude,
                longitude: errors.longitude,
              }}
            />
          )}

          {currentStep === 2 && (
            <FieldDetailsStep
              data={{
                landSize: formData.landSize,
                landUnit: formData.landUnit,
                soilType: formData.soilType,
                waterSource: formData.waterSource,
                previousCrop: formData.previousCrop,
                season: formData.season,
                farmingGoal: formData.farmingGoal,
              }}
              onChange={handleFieldDetailsChange}
              onBack={() => {
                setCurrentStep(1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onSubmit={handleStep2Submit}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          )}

          {currentStep > 2 && (
            <div className="p-8 text-center space-y-4">
              <h3 className="text-xl font-serif text-ink font-semibold">
                Step {currentStep}: Satellite Calibration
              </h3>
              <p className="text-sm text-ink opacity-80">
                Satellite data fetching and final crop score generation is in progress.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] px-5 py-2 bg-offWhite border border-border text-ink rounded-[6px] hover:bg-wheat/20"
                >
                  Back to Field Details
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
