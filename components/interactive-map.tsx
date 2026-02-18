"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"

interface Scan {
  id: string
  qr_code_id: string
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  scanned_at: string
  qr_code?: {
    title: string
  }
}

interface InteractiveMapProps {
  scans: Scan[]
}

// Custom marker icon to fix default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Component to fit map bounds to all markers
function MapBounds({ scans }: { scans: Scan[] }) {
  const map = useMap()

  useEffect(() => {
    if (scans.length > 0 && map) {
      // Use setTimeout to ensure the map is fully initialized
      const timer = setTimeout(() => {
        try {
          const validScans = scans.filter((scan) => scan.latitude && scan.longitude)
          if (validScans.length > 0) {
            const bounds = L.latLngBounds(
              validScans.map((scan) => [scan.latitude as number, scan.longitude as number])
            )
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
          }
        } catch (error) {
          console.error("[v0] Error fitting map bounds:", error)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [scans, map])

  return null
}

export default function InteractiveMap({ scans }: InteractiveMapProps) {
  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  if (scans.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-600">No scans to display on map</p>
      </div>
    )
  }

  return (
    <MapContainer center={[20, 0]} zoom={2} className="h-96 rounded-lg border border-gray-200" style={{ width: "100%", height: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {scans.map((scan) =>
        scan.latitude && scan.longitude ? (
          <Marker key={scan.id} position={[scan.latitude, scan.longitude]} icon={customIcon}>
            <Popup>
              <div className="space-y-2">
                <p className="font-semibold">{scan.qr_code?.title || "QR Code"}</p>
                <p className="text-sm text-gray-600">
                  {scan.city}, {scan.country}
                </p>
                <p className="text-xs text-gray-500">{new Date(scan.scanned_at).toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
      <MapBounds scans={scans} />
    </MapContainer>
  )
}
