'use client'

import React, { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lon: number
  onChange: (lat: number, lon: number) => void
}

export default function MapPicker({ lat, lon, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)

  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!containerRef.current) return
      const L = (await import('leaflet')).default
      // @ts-expect-error leaflet.css does not have types
      await import('leaflet/dist/leaflet.css')
      if (cancelled) return

      // Fix missing leaflet marker icons in Next.js bundler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapRef.current) {
        // Update marker position
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(markerRef.current as any)?.setLatLng([lat, lon])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapRef.current as any)?.setView([lat, lon], (mapRef.current as any)?.getZoom())
        return
      }

      const map = L.map(containerRef.current).setView([lat, lon], 10)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([lat, lon], { draggable: true }).addTo(map)
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng.toFixed(6)))
      })

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng)
        onChange(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)))
      })

      mapRef.current = map
      markerRef.current = marker
    }

    init()
    return () => {
      cancelled = true
    }
  }, [lat, lon, onChange])

  return (
    <div
      ref={containerRef}
      className="w-full h-64 border border-border rounded-[6px] mt-4"
      style={{ zIndex: 0 }}
    />
  )
}
