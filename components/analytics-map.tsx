"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface Scan {
  id: string
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  scanned_at: string
}

export function AnalyticsMap({ scans }: { scans: Scan[] }) {
  // Group scans by location
  const locationCounts = scans.reduce(
    (acc, scan) => {
      if (scan.city && scan.country) {
        const key = `${scan.city}, ${scan.country}`
        if (!acc[key]) {
          acc[key] = {
            location: key,
            count: 0,
            latitude: scan.latitude,
            longitude: scan.longitude,
          }
        }
        acc[key].count++
      }
      return acc
    },
    {} as Record<string, { location: string; count: number; latitude: number | null; longitude: number | null }>,
  )

  const locations = Object.values(locationCounts).sort((a, b) => b.count - a.count)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scan Locations</CardTitle>
          <CardDescription>Geographic distribution of QR code scans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.length > 0 ? (
              locations.map((loc) => (
                <div
                  key={loc.location}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{loc.location}</p>
                      {loc.latitude && loc.longitude && (
                        <p className="text-xs text-muted-foreground">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{loc.count}</p>
                    <p className="text-xs text-muted-foreground">scans</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">No location data available yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Activity</CardTitle>
          <CardDescription>Latest scans with location information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scans.slice(0, 10).map((scan) => (
              <div key={scan.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {scan.city && scan.country ? `${scan.city}, ${scan.country}` : "Unknown Location"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(scan.scanned_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
