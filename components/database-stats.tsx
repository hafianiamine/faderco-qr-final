"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { Database, Table, BarChart3, FileSpreadsheet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DatabaseStats() {
  const [stats, setStats] = useState<{
    csvDataCount: number | null
    dataRecordsCount: number | null
    uniqueMedia: number | null
    uniqueAnnonceurs: number | null
  }>({
    csvDataCount: null,
    dataRecordsCount: null,
    uniqueMedia: null,
    uniqueAnnonceurs: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()

        // Get csv_data count
        const { count: csvDataCount, error: csvError } = await supabase
          .from("csv_data")
          .select("*", { count: "exact", head: true })

        // Get data_records count
        const { count: dataRecordsCount, error: recordsError } = await supabase
          .from("data_records")
          .select("*", { count: "exact", head: true })

        // Get unique media count
        const { data: mediaData, error: mediaError } = await supabase
          .from("csv_data")
          .select("Media")
          .not("Media", "is", null)

        const uniqueMedia = new Set(mediaData?.map((item) => item.Media).filter(Boolean)).size

        // Get unique annonceurs count
        const { data: annonceursData, error: annonceursError } = await supabase
          .from("csv_data")
          .select("Annonceur")
          .not("Annonceur", "is", null)

        const uniqueAnnonceurs = new Set(annonceursData?.map((item) => item.Annonceur).filter(Boolean)).size

        setStats({
          csvDataCount: csvDataCount || 0,
          dataRecordsCount: dataRecordsCount || 0,
          uniqueMedia,
          uniqueAnnonceurs,
        })
      } catch (error) {
        console.error("Error fetching database stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "CSV Data Records",
      value: stats.csvDataCount !== null ? stats.csvDataCount.toLocaleString() : "-",
      icon: <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "JSON Data Records",
      value: stats.dataRecordsCount !== null ? stats.dataRecordsCount.toLocaleString() : "-",
      icon: <Database className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Unique Media",
      value: stats.uniqueMedia !== null ? stats.uniqueMedia.toLocaleString() : "-",
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Unique Annonceurs",
      value: stats.uniqueAnnonceurs !== null ? stats.uniqueAnnonceurs.toLocaleString() : "-",
      icon: <Table className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  return (
    <>
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{card.value}</div>}
          </CardContent>
        </Card>
      ))}
    </>
  )
}
