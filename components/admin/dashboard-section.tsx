"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, QrCode, Building2, MousePointerClick } from "lucide-react"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = createClient()

    const [{ count: usersCount }, { count: qrCodesCount }, { count: scansCount }, { data: companies }] =
      await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("qr_codes").select("*", { count: "exact", head: true }),
        supabase.from("scans").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("company"),
      ])

    const uniqueCompanies = new Set(companies?.map((p) => p.company).filter(Boolean))

    setStats({
      totalUsers: usersCount || 0,
      totalQRCodes: qrCodesCount || 0,
      totalCompanies: uniqueCompanies.size,
      totalScans: scansCount || 0,
    })
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Platform overview and statistics</p>
      </div>

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
    </div>
  )
}
