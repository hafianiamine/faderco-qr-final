"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

interface SpendEfficiencyChartProps {
  data: Record<string, any[]>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function SpendEfficiencyChart({ data }: SpendEfficiencyChartProps) {
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return []

    return Object.entries(data)
      .map(([brand, items]) => {
        const totalCost = items.reduce((sum, item) => {
          const cost = Number.parseFloat(item.Tarif_30s_1pci) || 0
          return sum + cost
        }, 0)

        const totalDuration = items.reduce((sum, item) => {
          const duration = Number.parseFloat(item.Duree) || 0
          return sum + duration
        }, 0)

        return {
          brand,
          costPerSecond: totalDuration > 0 ? totalCost / totalDuration : 0,
          totalCost: Math.round(totalCost),
          totalDuration: Math.round(totalDuration),
          count: items.length,
        }
      })
      .sort((a, b) => b.costPerSecond - a.costPerSecond)
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available for spend efficiency</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="brand" type="category" width={100} />
        <Tooltip
          formatter={(value, name) => [
            name === "costPerSecond" ? `${Number(value).toFixed(2)} per second` : value,
            name === "costPerSecond" ? "Cost per Second" : name,
          ]}
        />
        <Legend />
        <Bar dataKey="costPerSecond" name="Cost per Second" fill="#8884d8">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
