"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { QrCode, MousePointerClick, BarChart3, TrendingUp } from "lucide-react"
import { LiveScanMap } from "@/components/live-scan-map"

interface Stats {
  totalQRCodes: number
  totalScans: number
  avgScansPerQR: number
  recentScans: number
}

export function UserDashboardSection() {
  const [stats, setStats] = useState<Stats>({
    totalQRCodes: 0,
    totalScans: 0,
    avgScansPerQR: 0,
    recentScans: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: userQrCodes, count: qrCodesCount } = await supabase
      .from("qr_codes")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)

    const qrCodeIds = userQrCodes?.map((qr) => qr.id) || []

    const { count: scansCount } = await supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .in("qr_code_id", qrCodeIds.length > 0 ? qrCodeIds : ["00000000-0000-0000-0000-000000000000"])

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentScansCount } = await supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .in("qr_code_id", qrCodeIds.length > 0 ? qrCodeIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("scanned_at", sevenDaysAgo.toISOString())

    const avgScans = qrCodesCount && scansCount ? Math.round(scansCount / qrCodesCount) : 0

    setStats({
      totalQRCodes: qrCodesCount || 0,
      totalScans: scansCount || 0,
      avgScansPerQR: avgScans,
      recentScans: recentScansCount || 0,
    })
    setLoading(false)
  }

  const statCards = [
    {
      title: "My QR Codes",
      value: stats.totalQRCodes,
      icon: QrCode,
      color: "text-blue-600",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: MousePointerClick,
      color: "text-green-600",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Avg Scans/QR",
      value: stats.avgScansPerQR,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Recent Scans (7d)",
      value: stats.recentScans,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-500/20",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your QR codes and analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl transition-all hover:scale-105 hover:border-gray-300 hover:bg-white/20"
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

      <LiveScanMap />
    </div>
  )
}
