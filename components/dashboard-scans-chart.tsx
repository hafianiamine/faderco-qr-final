"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

interface DashboardScansChartProps {
  data: { date: string; scans: number }[]
}

export function DashboardScansChart({ data }: DashboardScansChartProps) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Scans Over Time
        </CardTitle>
        <CardDescription>Your QR code scan activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            scans: {
              label: "Scans",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="scans" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
