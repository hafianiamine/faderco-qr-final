"use client"

import { useMemo } from "react"

interface ComparisonHourHeatmapProps {
  data: Record<string, any[]>
}

export default function ComparisonHourHeatmap({ data }: ComparisonHourHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return { brands: [], hours: [], matrix: [] }

    const brands = Object.keys(data)
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

    // Create matrix of brand x hour counts
    const matrix = brands.map((brand) => {
      const hourCounts: Record<string, number> = {}

      data[brand].forEach((item) => {
        if (item.heure) {
          const hour = item.heure.split(":")[0]
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        }
      })

      return hours.map((hour) => hourCounts[hour] || 0)
    })

    return { brands, hours, matrix }
  }, [data])

  if (heatmapData.brands.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available for hour comparison</p>
      </div>
    )
  }

  // Get max value for color scaling
  const maxValue = Math.max(...heatmapData.matrix.flat())

  const getColor = (value: number) => {
    if (value === 0) return "#f3f4f6"
    const intensity = value / maxValue
    const opacity = Math.max(0.1, intensity)
    return `rgba(59, 130, 246, ${opacity})`
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="min-w-[600px]">
        {/* Header with hours */}
        <div className="flex mb-2">
          <div className="w-24 text-xs font-medium text-right pr-2">Brand</div>
          {heatmapData.hours.map((hour) => (
            <div key={hour} className="w-8 text-xs font-medium text-center">
              {hour}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {heatmapData.brands.map((brand, brandIndex) => (
            <div key={brand} className="flex">
              <div className="w-24 text-xs text-right pr-2 py-1 truncate" title={brand}>
                {brand.length > 10 ? `${brand.substring(0, 10)}...` : brand}
              </div>
              {heatmapData.matrix[brandIndex].map((value, hourIndex) => (
                <div
                  key={`${brand}-${hourIndex}`}
                  className="w-8 h-6 mx-0.5 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${brand} à ${heatmapData.hours[hourIndex]}:00: ${value} publicités`}
                >
                  {value > 0 ? value : ""}
                </div>
              ))}
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
  )
}
