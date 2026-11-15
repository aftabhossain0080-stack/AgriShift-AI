'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { searchLocations, GeocodingResult } from '@/lib/api/geocoding'
import { isInCoverage } from '@/lib/coverage'

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-border rounded-[6px] mt-4 bg-offWhite animate-pulse flex items-center justify-center text-ink text-sm">
      Loading interactive map...
    </div>
  ),
})

interface LocationStepProps {
  locationName: string
  latitude: number | undefined
  longitude: number | undefined
  onChange: (updates: {
    locationName?: string
    latitude?: number
    longitude?: number
  }) => void
  onNext: () => void
  errors?: {
    locationName?: string
    latitude?: string
    longitude?: string
  }
}

export default function LocationStep({
  locationName,
  latitude,
  longitude,
  onChange,
  onNext,
  errors,
}: LocationStepProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [isDismissedCoverage, setIsDismissedCoverage] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced geocoding search (300ms)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(query.trim())
        setSearchResults(results)
        setShowDropdown(true)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLocation = (result: GeocodingResult) => {
    const parts = [result.name]
    if (result.admin1) parts.push(result.admin1)
    if (result.country) parts.push(result.country)
    const formattedName = parts.join(', ')

    onChange({
      locationName: formattedName,
      latitude: parseFloat(result.latitude.toFixed(6)),
      longitude: parseFloat(result.longitude.toFixed(6)),
    })
    setQuery('')
    setShowDropdown(false)
    setIsDismissedCoverage(false)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lon = parseFloat(pos.coords.longitude.toFixed(6))
        onChange({
          locationName: `My location (${lat}, ${lon})`,
          latitude: lat,
          longitude: lon,
        })
        setIsLocating(false)
        setIsDismissedCoverage(false)
      },
      (err) => {
        setIsLocating(false)
        setGeoError(err.message || 'Unable to retrieve location.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleSetPresetSingur = () => {
    onChange({
      locationName: 'Singur, India',
      latitude: 22.9,
      longitude: 88.4,
    })
    setIsDismissedCoverage(false)
  }

  const hasValidCoordinates =
    typeof latitude === 'number' &&
    !isNaN(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    !isNaN(longitude) &&
    longitude >= -180 &&
    longitude <= 180

  const showCoverageAlert =
    !isDismissedCoverage &&
    hasValidCoordinates &&
    !isInCoverage(latitude!, longitude!)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-ink font-semibold">
          Step 1: Farm Location
        </h2>
        <p className="text-sm text-ink opacity-80 mt-1">
          Search for your village or city, use automatic device geolocation, or pick directly on the map.
        </p>
      </div>

      {/* Geocoding Search */}
      <div className="relative" ref={dropdownRef}>
        <label
          htmlFor="location-search"
          className="block text-sm font-semibold text-ink mb-1"
        >
          Search Location
        </label>
        <div className="relative">
          <input
            id="location-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!showDropdown) setShowDropdown(true)
            }}
            placeholder="Type city, village, or district (e.g. Singur)..."
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-deepGreen animate-spin"
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
            </div>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-offWhite border border-border rounded-[6px] max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectLocation(item)}
                  className="w-full min-h-[44px] px-4 py-2.5 text-left border-b border-border last:border-b-0 hover:bg-wheat/20 transition-colors flex flex-col justify-center"
                >
                  <span className="text-sm font-semibold text-ink">
                    {item.name}
                  </span>
                  <span className="text-xs text-ink opacity-70">
                    {[item.admin1, item.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              ))
            ) : !isSearching ? (
              <div className="p-3 text-sm text-ink opacity-70">
                No matching locations found.
              </div>
            ) : (
              <div className="p-3 bg-offWhite border border-border animate-pulse text-sm text-ink opacity-70">
                Searching locations...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions: Geolocation button & Preset */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="min-h-[44px] px-4 py-2 bg-offWhite border border-border text-ink rounded-[6px] hover:bg-wheat/20 transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-50"
        >
          {isLocating ? (
            <svg
              className="w-4 h-4 animate-spin text-deepGreen"
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
          ) : (
            <svg
              className="w-4 h-4 text-deepGreen"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.071-7.071l-1.414 1.414M8.343 15.657l-1.414 1.414m12.142 0l-1.414-1.414M8.343 8.343L6.929 6.929M12 17a5 5 0 100-10 5 5 0 000 10z"
              />
            </svg>
          )}
          <span>{isLocating ? 'Detecting location...' : 'Use my location'}</span>
        </button>

        <button
          type="button"
          onClick={handleSetPresetSingur}
          className="min-h-[44px] px-4 py-2 bg-offWhite border border-border text-ink rounded-[6px] hover:bg-wheat/20 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-soilBrown"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Example: Singur, India</span>
        </button>
      </div>

      {geoError && (
        <div className="text-sm text-alertRed font-medium">
          {geoError}
        </div>
      )}

      {/* Manual Lat/Lon and Location Name Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="location-name-input"
            className="block text-sm font-semibold text-ink mb-1"
          >
            Location Name
          </label>
          <input
            id="location-name-input"
            type="text"
            value={locationName}
            onChange={(e) => onChange({ locationName: e.target.value })}
            placeholder="e.g. Singur Village"
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen"
          />
          {errors?.locationName && (
            <p className="text-xs text-alertRed mt-1">{errors.locationName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="latitude-input"
            className="block text-sm font-semibold text-ink mb-1"
          >
            Latitude (-90 to 90)
          </label>
          <input
            id="latitude-input"
            type="number"
            step="any"
            value={latitude ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
              onChange({ latitude: val })
            }}
            placeholder="e.g. 22.90"
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen"
          />
          {errors?.latitude && (
            <p className="text-xs text-alertRed mt-1">{errors.latitude}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="longitude-input"
            className="block text-sm font-semibold text-ink mb-1"
          >
            Longitude (-180 to 180)
          </label>
          <input
            id="longitude-input"
            type="number"
            step="any"
            value={longitude ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
              onChange({ longitude: val })
            }}
            placeholder="e.g. 88.40"
            className="w-full min-h-[44px] px-3 py-2 bg-offWhite border border-border rounded-[6px] text-ink focus:outline-none focus:border-deepGreen"
          />
          {errors?.longitude && (
            <p className="text-xs text-alertRed mt-1">{errors.longitude}</p>
          )}
        </div>
      </div>

      {/* Selected Location Summary Card */}
      {locationName && hasValidCoordinates && (
        <div className="p-4 border border-border rounded-[6px] bg-offWhite space-y-1">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-deepGreen flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-semibold text-sm text-ink">Selected Location:</span>
            <span className="text-sm text-ink">{locationName}</span>
          </div>
          <div className="text-xs text-ink opacity-70 pl-6">
            Coordinates: {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
          </div>
        </div>
      )}

      {/* Coverage Notice */}
      {showCoverageAlert && (
        <div className="bg-[#FFF8E6] border border-[#D9B26A] text-ink p-4 rounded-[6px] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-wheat flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm">
              AgriShift AI was calibrated for South Asian farms. Results for other regions are experimental.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissedCoverage(true)}
            aria-label="Dismiss coverage alert"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink opacity-70 hover:opacity-100"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Interactive Leaflet Map */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1">
          Interactive Map Pin
        </label>
        <p className="text-xs text-ink opacity-70 mb-2">
          Drag the marker or click on the map to fine-tune your farm coordinates.
        </p>

        {hasValidCoordinates ? (
          <MapPicker
            lat={latitude!}
            lon={longitude!}
            onChange={(newLat, newLon) => {
              onChange({
                latitude: newLat,
                longitude: newLon,
                locationName: locationName || `Location (${newLat}, ${newLon})`,
              })
            }}
          />
        ) : (
          <div className="w-full h-40 border border-border rounded-[6px] bg-offWhite flex items-center justify-center text-sm text-ink opacity-60">
            Enter valid coordinates or search a location above to view map.
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="min-h-[44px] px-6 py-2.5 bg-deepGreen text-offWhite font-semibold rounded-[6px] hover:bg-deepGreen/90 transition-colors flex items-center gap-2"
        >
          <span>Continue to Field Details</span>
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
        </button>
      </div>
    </div>
  )
}
