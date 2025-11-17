"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function ImportHistory() {
  const [stats, setStats] = useState<{
    totalRecords: number
    lastImport: string | null
    uniqueMedia: number
    uniqueAnnonceur: number
  }>({
    totalRecords: 0,
    lastImport: null,
    uniqueMedia: 0,
    uniqueAnnonceur: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      // Get total count
      const { count, error: countError } = await supabase.from("csv_data").select("*", { count: "exact", head: true })

      if (countError) throw countError

      // Get last import date
      const { data: lastImportData, error: lastImportError } = await supabase
        .from("csv_data")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)

      if (lastImportError) throw lastImportError

      // Get unique media count - use a more efficient approach
      const { data: mediaData, error: mediaError } = await supabase.from("csv_data").select("Media").limit(1000)

      if (mediaError) throw mediaError

      // Use a Set to count unique values efficiently
      const uniqueMediaValues = new Set<string>()
      mediaData?.forEach((item) => {
        if (item.Media) uniqueMediaValues.add(item.Media)
      })

      // Get unique annonceur count - use a more efficient approach
      const { data: annonceurData, error: annonceurError } = await supabase
        .from("csv_data")
        .select("Annonceur")
        .limit(1000)

      if (annonceurError) throw annonceurError

      // Use a Set to count unique values efficiently
      const uniqueAnnonceurValues = new Set<string>()
      annonceurData?.forEach((item) => {
        if (item.Annonceur) uniqueAnnonceurValues.add(item.Annonceur)
      })

      setStats({
        totalRecords: count || 0,
        lastImport: lastImportData && lastImportData.length > 0 ? lastImportData[0].created_at : null,
        uniqueMedia: uniqueMediaValues.size,
        uniqueAnnonceur: uniqueAnnonceurValues.size,
      })
    } catch (error) {
      console.error("Error loading import stats:", error)
      setError(error instanceof Error ? error.message : "Unknown error loading stats")

      // Set default values on error
      setStats({
        totalRecords: 0,
        lastImport: null,
        uniqueMedia: 0,
        uniqueAnnonceur: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Import Statistics</h3>
        <Button variant="outline" size="sm" onClick={loadStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="text-sm text-red-500 mb-2">Error loading statistics: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {stats.lastImport
                ? new Date(stats.lastImport).toLocaleDateString() +
                  " " +
                  new Date(stats.lastImport).toLocaleTimeString()
                : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">Last Import</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.uniqueMedia.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Unique Media</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.uniqueAnnonceur.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Unique Annonceurs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
