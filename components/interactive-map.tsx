"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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
    if (scans.length > 0) {
      const bounds = L.latLngBounds(scans.map((scan) => [scan.latitude as number, scan.longitude as number]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [scans, map])

  return null
}

export default function InteractiveMap({ scans }: InteractiveMapProps) {
  // Calculate center point (average of all coordinates)
  const center: [number, number] =
    scans.length > 0
      ? [
          scans.reduce((sum, scan) => sum + (scan.latitude || 0), 0) / scans.length,
          scans.reduce((sum, scan) => sum + (scan.longitude || 0), 0) / scans.length,
        ]
      : [20, 0] // Default center if no scans

  return (
    <MapContainer center={center} zoom={2} style={{ height: "100%", width: "100%" }} className="z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds scans={scans} />
      {scans.map((scan) => (
        <Marker key={scan.id} position={[scan.latitude as number, scan.longitude as number]} icon={customIcon}>
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-gray-900 mb-1">{scan.qr_code?.title || "Unknown QR"}</h3>
              <p className="text-sm text-gray-600 mb-1">
                {scan.city && scan.country ? `${scan.city}, ${scan.country}` : scan.country || "Unknown Location"}
              </p>
              <p className="text-xs text-gray-500 mb-1">{new Date(scan.scanned_at).toLocaleString()}</p>
              <p className="text-xs text-gray-400">
                {scan.latitude?.toFixed(4)}, {scan.longitude?.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
