"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, TrendingUp, MousePointerClick, QrCode } from "lucide-react"

export function AnalyticsSection() {
  const [stats, setStats] = useState({
    totalQR: 0,
    totalScans: 0,
    avgScansPerQR: 0,
    recentScans: 0,
  })

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      const { count: totalQR } = await supabase.from("qr_codes").select("*", { count: "exact", head: true })

      const { count: totalScans } = await supabase.from("scans").select("*", { count: "exact", head: true })

      const avgScansPerQR = totalQR && totalScans ? Math.round(totalScans / totalQR) : 0

      setStats({
        totalQR: totalQR || 0,
        totalScans: totalScans || 0,
        avgScansPerQR,
        recentScans: 0,
      })
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600">Platform-wide statistics</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <QrCode className="mb-4 h-8 w-8 text-blue-500" />
          <div className="text-3xl font-bold text-gray-900">{stats.totalQR}</div>
          <div className="text-sm text-gray-600">Total QR Codes</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <MousePointerClick className="mb-4 h-8 w-8 text-green-500" />
          <div className="text-3xl font-bold text-gray-900">{stats.totalScans}</div>
          <div className="text-sm text-gray-600">Total Scans</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <TrendingUp className="mb-4 h-8 w-8 text-purple-500" />
          <div className="text-3xl font-bold text-gray-900">{stats.avgScansPerQR}</div>
          <div className="text-sm text-gray-600">Avg Scans/QR</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <BarChart3 className="mb-4 h-8 w-8 text-orange-500" />
          <div className="text-3xl font-bold text-gray-900">{stats.recentScans}</div>
          <div className="text-sm text-gray-600">Recent Scans (7d)</div>
        </div>
      </div>
    </div>
  )
}
