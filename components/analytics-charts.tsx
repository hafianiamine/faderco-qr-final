"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Scan {
  id: string
  qr_code_id: string
  scanned_at: string
  country: string | null
  city: string | null
  device_type: string | null
  browser: string | null
}

interface QRCode {
  id: string
  title: string
}

export function AnalyticsCharts({ scans, qrCodes }: { scans: Scan[]; qrCodes: QRCode[] }) {
  // Scans over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  const scansByDate = last30Days.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    scans: scans.filter((s) => s.scanned_at.startsWith(date)).length,
  }))

  // Scans by QR code
  const scansByQRCode = qrCodes
    .map((qr) => ({
      name: qr.title.length > 20 ? qr.title.substring(0, 20) + "..." : qr.title,
      scans: scans.filter((s) => s.qr_code_id === qr.id).length,
    }))
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 10)

  // Top countries
  const countryCounts = scans.reduce(
    (acc, scan) => {
      const country = scan.country || "Unknown"
      acc[country] = (acc[country] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({
      name: country,
      value: count,
    }))

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <>
      {/* Scans Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Scans Over Time</CardTitle>
          <CardDescription>Daily scan activity for the last 30 days</CardDescription>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scansByDate}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="scans" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scans by QR Code */}
        <Card>
          <CardHeader>
            <CardTitle>Top QR Codes</CardTitle>
            <CardDescription>Most scanned QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                scans: {
                  label: "Scans",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scansByQRCode} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="scans" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Geographic distribution of scans</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Scans",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topCountries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {topCountries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
