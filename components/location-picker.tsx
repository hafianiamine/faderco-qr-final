"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationPickerProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [lat, setLat] = useState(latitude?.toString() || "")
  const [lng, setLng] = useState(longitude?.toString() || "")

  useEffect(() => {
    setLat(latitude?.toString() || "")
    setLng(longitude?.toString() || "")
  }, [latitude, longitude])

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude
          const newLng = position.coords.longitude
          setLat(newLat.toFixed(6))
          setLng(newLng.toFixed(6))
          onLocationChange(newLat, newLng)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enter coordinates manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const handleLatChange = (value: string) => {
    setLat(value)
    const latNum = Number.parseFloat(value)
    const lngNum = Number.parseFloat(lng)
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onLocationChange(latNum, lngNum)
    }
  }

  const handleLngChange = (value: string) => {
    setLng(value)
    const latNum = Number.parseFloat(lat)
    const lngNum = Number.parseFloat(value)
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onLocationChange(latNum, lngNum)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          className="bg-white/30 border-gray-200"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Use Current Location
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="latitude" className="text-xs text-gray-700">
            Latitude
          </Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="e.g., 40.712776"
            value={lat}
            onChange={(e) => handleLatChange(e.target.value)}
            className="bg-white/30 border-gray-200 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="longitude" className="text-xs text-gray-700">
            Longitude
          </Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="e.g., -74.005974"
            value={lng}
            onChange={(e) => handleLngChange(e.target.value)}
            className="bg-white/30 border-gray-200 text-sm"
          />
        </div>
      </div>

      {latitude && longitude && (
        <div className="rounded-lg border border-gray-200 bg-white/20 p-3">
          <p className="text-xs text-gray-600 mb-2">Preview Location:</p>
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View on Google Maps →
          </a>
        </div>
      )}
    </div>
  )
}
