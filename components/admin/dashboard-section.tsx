"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, QrCode, Building2, MousePointerClick } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Stats {
  totalUsers: number
  totalQRCodes: number
  totalCompanies: number
  totalScans: number
}

export function DashboardSection() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQRCodes: 0,
    totalCompanies: 0,
    totalScans: 0,
  })
  const [scansData, setScansData] = useState<{ date: string; count: number }[]>([])
  const [qrTypeData, setQrTypeData] = useState<{ type: string; count: number }[]>([])
  const [topQRCodes, setTopQRCodes] = useState<{ title: string; scans: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = createClient()

    const { data: qrCodesData, error: qrError } = await supabase.from("qr_codes").select("id, type, title")

    // Provide default empty array if qrCodesData is null/undefined
    const safeQrCodesData = qrCodesData || []

    const [{ count: usersCount }, { count: scansCount }, { data: companies }, { data: scansData }, { data: topCodes }] =
      await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("scans").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("id, name", { count: "exact", head: true }),
        supabase
          .from("scans")
          .select("scanned_at")
          .gte("scanned_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order("scanned_at", { ascending: true }),
        supabase.from("scans").select("qr_code_id").order("scanned_at", { ascending: false }),
      ])

    const companiesCount = companies?.length || 0

    const scansByDate: Record<string, number> = {}
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      scansByDate[dateStr] = 0
      last7Days.push(dateStr)
    }

    scansData?.forEach((scan: any) => {
      const date = new Date(scan.scanned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (scansByDate[date] !== undefined) {
        scansByDate[date]++
      }
    })

    const chartScansData = last7Days.map((date) => ({ date, count: scansByDate[date] }))

    const typeCount: Record<string, number> = { standard: 0, business_card: 0, wifi: 0 }
    safeQrCodesData.forEach((qr: any) => {
      const type = qr.type || "standard"
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    const chartQrTypeData = Object.entries(typeCount)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type === "business_card" ? "Business Card" : type === "wifi" ? "WiFi" : "Standard",
        count: count as number,
      }))

    const qrScanCounts: Record<string, number> = {}
    topCodes?.forEach((scan: any) => {
      qrScanCounts[scan.qr_code_id] = (qrScanCounts[scan.qr_code_id] || 0) + 1
    })

    const sortedQrIds = Object.entries(qrScanCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)

    const topCodesWithScans = sortedQrIds.map(([qrId, count]) => {
      const qr = safeQrCodesData.find((q: any) => q.id === qrId)
      return {
        title: qr?.title || "Untitled",
        scans: count as number,
      }
    })

    setStats({
      totalUsers: usersCount || 0,
      totalQRCodes: safeQrCodesData.length,
      totalCompanies: companiesCount,
      totalScans: scansCount || 0,
    })
    setScansData(chartScansData)
    setQrTypeData(chartQrTypeData)
    setTopQRCodes(topCodesWithScans)
    setLoading(false)
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Total QR Codes",
      value: stats.totalQRCodes,
      icon: QrCode,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: MousePointerClick,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ]

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"]

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Platform overview and statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:scale-105 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-4xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`rounded-full ${card.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scans Trend Chart */}
        {scansData.length > 0 && (
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Scans Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily scan activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scansData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                    cursor={{ stroke: "#3B82F6", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* QR Code Types Distribution */}
        {qrTypeData.length > 0 && (
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>QR Code Types</CardTitle>
              <CardDescription>Distribution of QR code types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={qrTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {qrTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top QR Codes */}
      {topQRCodes.length > 0 && (
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Top 5 Most Scanned QR Codes</CardTitle>
            <CardDescription>Your most popular QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topQRCodes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="title" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                />
                <Bar dataKey="scans" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
