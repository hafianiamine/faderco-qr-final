"use client"

import { useState, useEffect } from "react"
import { getCardAnalytics } from "@/app/actions/analytics-actions"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { Eye, Smartphone, Globe, MapPin, Calendar, TrendingUp } from "lucide-react"

interface Analytics {
  id: string
  event_type: string
  device_type: string
  browser: string
  country: string
  city: string
  latitude: number
  longitude: number
  created_at: string
}

interface CardAnalyticsDashboardProps {
  cardId: string
}

export function CardAnalyticsDashboard({ cardId }: CardAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await getCardAnalytics(cardId)
      if (data) {
        setAnalytics(data)
      }
      setLoading(false)
    }
    fetchAnalytics()
  }, [cardId])

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  // Calculate metrics
  const totalViews = analytics.length
  const uniqueCountries = [...new Set(analytics.map(a => a.country).filter(Boolean))].length
  const uniqueCities = [...new Set(analytics.map(a => a.city).filter(Boolean))].length

  // Device breakdown
  const deviceData = Object.entries(
    analytics.reduce((acc, a) => {
      const device = a.device_type || "unknown"
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  // Browser breakdown
  const browserData = Object.entries(
    analytics.reduce((acc, a) => {
      const browser = a.browser || "unknown"
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Views by day
  const viewsByDay = analytics.reduce((acc, a) => {
    const date = new Date(a.created_at).toLocaleDateString()
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.views++
    } else {
      acc.push({ date, views: 1 })
    }
    return acc
  }, [] as Array<{ date: string; views: number }>)

  // Top locations
  const locationCounts = Object.entries(
    analytics.reduce((acc, a) => {
      const location = `${a.city || "Unknown"}, ${a.country || "Unknown"}`
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Map data (latitude/longitude scatter)
  const mapData = analytics
    .filter(a => a.latitude && a.longitude)
    .map((a, i) => ({
      x: a.longitude,
      y: a.latitude,
      name: `${a.city || "Unknown"}, ${a.country || "Unknown"}`,
    }))

  const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e", "#f97316"]

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold">Card Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Views</p>
              <p className="text-3xl font-bold">{totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-indigo-500" />
          </div>
        </Card>

        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Countries</p>
              <p className="text-3xl font-bold">{uniqueCountries}</p>
            </div>
            <Globe className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cities</p>
              <p className="text-3xl font-bold">{uniqueCities}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Daily</p>
              <p className="text-3xl font-bold">{(totalViews / (viewsByDay.length || 1)).toFixed(1)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Views Over Time */}
      {viewsByDay.length > 0 && (
        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <h3 className="font-semibold mb-4">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deviceData.length > 0 && (
          <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Device Type
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {browserData.length > 0 && (
          <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
            <h3 className="font-semibold mb-4">Browsers</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={browserData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Top Locations */}
      {locationCounts.length > 0 && (
        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Top Locations
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationCounts} layout="vertical" margin={{ left: 200 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="location" type="category" width={190} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Geographic Map (Scatter) */}
      {mapData.length > 0 && (
        <Card className="p-6 bg-white/10 border-gray-200 backdrop-blur">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global View Distribution
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Longitude" type="number" />
              <YAxis dataKey="y" name="Latitude" type="number" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Views" data={mapData} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      )}

      {totalViews === 0 && (
        <Card className="p-12 bg-white/10 border-gray-200 backdrop-blur text-center">
          <p className="text-gray-600">No analytics data yet. Share your card to get started!</p>
        </Card>
      )}
    </div>
  )
}
