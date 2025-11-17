"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ComparisonWeeklyTrendProps {
  data: Record<string, any[]>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function ComparisonWeeklyTrend({ data }: ComparisonWeeklyTrendProps) {
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return []

    // Get all dates and count ads per brand per date
    const dateCountsByBrand: Record<string, Record<string, number>> = {}

    Object.entries(data).forEach(([brand, items]) => {
      items.forEach((item) => {
        if (item.DateDebut && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(item.DateDebut)) {
          const date = item.DateDebut
          if (!dateCountsByBrand[date]) {
            dateCountsByBrand[date] = {}
          }
          dateCountsByBrand[date][brand] = (dateCountsByBrand[date][brand] || 0) + 1
        }
      })
    })

    // Convert to chart format and sort by date
    const chartData = Object.entries(dateCountsByBrand)
      .map(([date, brands]) => ({
        date,
        ...brands,
        // Create Date object for sorting
        dateObj: (() => {
          const [month, day, year] = date.split("/").map(Number)
          return new Date(year, month - 1, day)
        })(),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map(({ dateObj, ...rest }) => rest) // Remove dateObj from final data

    return chartData
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available for trend comparison</p>
      </div>
    )
  }

  const brands = Object.keys(data)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.ceil(chartData.length / 10)} />
        <YAxis />
        <Tooltip />
        <Legend />
        {brands.map((brand, index) => (
          <Line
            key={brand}
            type="monotone"
            dataKey={brand}
            stroke={COLORS[index % COLORS.length]}
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
