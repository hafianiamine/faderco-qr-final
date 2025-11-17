"use client"

import { useMemo } from "react"

interface TimeBrandHeatmapProps {
  data: any[]
}

export default function TimeBrandHeatmap({ data }: TimeBrandHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Create a map of brand -> hour -> count
    const brandHourMap: Record<string, Record<string, number>> = {}

    data.forEach((item) => {
      if (item.MarquePrincipale && item.heure) {
        const brand = item.MarquePrincipale
        const hour = item.heure.split(":")[0]

        if (!brandHourMap[brand]) {
          brandHourMap[brand] = {}
        }

        brandHourMap[brand][hour] = (brandHourMap[brand][hour] || 0) + 1
      }
    })

    // Get top 10 brands by total appearances
    const brandTotals = Object.entries(brandHourMap).map(([brand, hours]) => ({
      brand,
      total: Object.values(hours).reduce((sum, count) => sum + count, 0),
    }))

    const topBrands = brandTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((item) => item.brand)

    // Create heatmap data
    const heatmapRows = []
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, "0")
      const row = { hour: `${hourStr}:00` }

      topBrands.forEach((brand) => {
        const count = brandHourMap[brand]?.[hourStr] || 0
        row[brand] = count
      })

      heatmapRows.push(row)
    }

    return { heatmapRows, topBrands }
  }, [data])

  if (!heatmapData.heatmapRows.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available for heatmap</p>
      </div>
    )
  }

  // Get max value for color scaling
  const maxValue = Math.max(
    ...heatmapData.heatmapRows.flatMap((row) => heatmapData.topBrands.map((brand) => row[brand] || 0)),
  )

  const getColor = (value: number) => {
    if (value === 0) return "#f3f4f6"
    const intensity = value / maxValue
    const opacity = Math.max(0.1, intensity)
    return `rgba(59, 130, 246, ${opacity})`
  }

  return (
    <div className="w-full h-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Heatmap Temporelle des Marques</h3>
        <p className="text-sm text-gray-500">Distribution des publicités par heure et par marque</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with brand names */}
          <div className="flex mb-2">
            <div className="w-16 text-xs font-medium text-right pr-2">Heure</div>
            {heatmapData.topBrands.map((brand) => (
              <div key={brand} className="flex-1 text-xs font-medium text-center px-1 truncate" title={brand}>
                {brand.length > 8 ? `${brand.substring(0, 8)}...` : brand}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {heatmapData.heatmapRows.map((row) => (
              <div key={row.hour} className="flex">
                <div className="w-16 text-xs text-right pr-2 py-1">{row.hour}</div>
                {heatmapData.topBrands.map((brand) => {
                  const value = row[brand] || 0
                  return (
                    <div
                      key={`${row.hour}-${brand}`}
                      className="flex-1 h-6 mx-0.5 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getColor(value) }}
                      title={`${brand} à ${row.hour}: ${value} publicités`}
                    >
                      {value > 0 ? value : ""}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <span className="text-xs text-gray-500">Moins</span>
            <div className="flex space-x-1">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                <div
                  key={intensity}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: intensity === 0 ? "#f3f4f6" : `rgba(59, 130, 246, ${intensity})` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">Plus</span>
          </div>
        </div>
      </div>
    </div>
  )
}
