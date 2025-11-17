"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PurchaseTypesPieChartProps {
  data: Record<string, any[]>
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function PurchaseTypesPieChart({ data }: PurchaseTypesPieChartProps) {
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return []

    // Aggregate purchase types across all brands
    const purchaseTypes: Record<string, number> = {}

    Object.values(data).forEach((items) => {
      items.forEach((item) => {
        if (item.TypeAchat) {
          purchaseTypes[item.TypeAchat] = (purchaseTypes[item.TypeAchat] || 0) + 1
        }
      })
    })

    return Object.entries(purchaseTypes).map(([type, count]) => ({
      name: type,
      value: count,
    }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No purchase type data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
