"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MapPin, Filter, List, MapIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

const InteractiveMap = dynamic(() => import("@/components/interactive-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center bg-gray-100 rounded-lg">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  ),
})

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

export function LiveScanMap() {
  const [scans, setScans] = useState<Scan[]>([])
  const [qrCodes, setQrCodes] = useState<{ id: string; title: string }[]>([])
  const [selectedQR, setSelectedQR] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  useEffect(() => {
    loadData()

    const supabase = createClient()
    const channel = supabase
      .channel("scan-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "scans",
        },
        () => {
          loadData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadData() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: userQrCodes } = await supabase
      .from("qr_codes")
      .select("id, title")
      .eq("user_id", user.id)
      .neq("status", "deleted")

    setQrCodes(userQrCodes || [])

    const qrCodeIds = userQrCodes?.map((qr) => qr.id) || []

    if (qrCodeIds.length === 0) {
      setScans([])
      setLoading(false)
      return
    }

    const { data: scansData } = await supabase
      .from("scans")
      .select("id, qr_code_id, city, country, latitude, longitude, scanned_at")
      .in("qr_code_id", qrCodeIds)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("scanned_at", { ascending: false })
      .limit(100)

    const enrichedScans = scansData?.map((scan) => ({
      ...scan,
      qr_code: userQrCodes?.find((qr) => qr.id === scan.qr_code_id),
    }))

    setScans(enrichedScans || [])
    setLoading(false)
  }

  const filteredScans = selectedQR === "all" ? scans : scans.filter((scan) => scan.qr_code_id === selectedQR)

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Live Scan Locations</h2>
              <p className="text-sm text-gray-600">Real-time map of all scan locations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white/20 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("map")}
                className={`h-8 px-3 ${
                  viewMode === "map"
                    ? "bg-white/40 text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-white/20 hover:text-gray-900"
                }`}
              >
                <MapIcon className="h-4 w-4 mr-1" />
                Map
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-8 px-3 ${
                  viewMode === "list"
                    ? "bg-white/40 text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-white/20 hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
            <Filter className="h-4 w-4 text-gray-600" />
            <Select value={selectedQR} onValueChange={setSelectedQR}>
              <SelectTrigger className="w-48 bg-white/20 border-gray-200 text-gray-900">
                <SelectValue placeholder="Filter by QR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All QR Codes</SelectItem>
                {qrCodes.map((qr) => (
                  <SelectItem key={qr.id} value={qr.id}>
                    {qr.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredScans.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-gray-600">
            <MapPin className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No scan locations yet</p>
            <p className="text-sm">Scans with location data will appear here</p>
          </div>
        ) : (
          <>
            {viewMode === "map" ? (
              <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                <InteractiveMap scans={filteredScans} />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white/20 p-4 hover:bg-white/30 transition-all"
                  >
                    <div className="rounded-full bg-blue-500/20 p-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 truncate">{scan.qr_code?.title || "Unknown QR"}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(scan.scanned_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {scan.city && scan.country
                          ? `${scan.city}, ${scan.country}`
                          : scan.country || "Unknown Location"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinates: {scan.latitude?.toFixed(4)}, {scan.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
