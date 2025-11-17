"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tv, Users, Calendar, BarChart3, Settings, Plus, TrendingUp, Clock, DollarSign, Target, User, FileText, HelpCircle, ChevronLeft } from 'lucide-react'
import { createTVAdClient } from "@/lib/supabase/tv-ad-client"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { PlatformTourModal } from "@/components/tv-admin/platform-tour-modal"

export default function TVAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(false)
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDeals: 0,
    activeSpots: 0,
    totalBrands: 0,
    monthlySpend: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    loadDashboardStats()
    loadRecentActivity()
    checkFirstVisit()
  }, [])

  const checkFirstVisit = () => {
    const hasVisited = localStorage.getItem('tv_admin_visited')
    if (!hasVisited) {
      setShowTour(true)
      localStorage.setItem('tv_admin_visited', 'true')
    }
  }

  const loadDashboardStats = async () => {
    try {
      const supabase = createTVAdClient()

      const { count: dealsCount } = await supabase.from("tv_deals").select("*", { count: "exact", head: true })
      const { count: spotsCount } = await supabase
        .from("tv_ad_spots")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
      const { count: brandsCount } = await supabase.from("tv_brands").select("*", { count: "exact", head: true })

      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: payments } = await supabase
        .from("tv_payments")
        .select("payment_amount")
        .gte("payment_date", `${currentMonth}-01`)
        .lt("payment_date", `${currentMonth}-32`)

      const monthlySpend = payments?.reduce((sum, payment) => sum + payment.payment_amount, 0) || 0

      setStats({
        totalDeals: dealsCount || 0,
        activeSpots: spotsCount || 0,
        totalBrands: brandsCount || 0,
        monthlySpend,
      })
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const supabase = createTVAdClient()

      const { data: recentDeals } = await supabase
        .from("tv_deals")
        .select("channel_name, created_at")
        .order("created_at", { ascending: false })
        .limit(2)

      const { data: recentSpots } = await supabase
        .from("tv_ad_spots")
        .select("ad_title, status, updated_at")
        .eq("status", "confirmed")
        .order("updated_at", { ascending: false })
        .limit(2)

      const { data: recentEvents } = await supabase
        .from("tv_special_events")
        .select("event_name, created_at")
        .order("created_at", { ascending: false })
        .limit(2)

      const activities = []

      recentDeals?.forEach((deal) => {
        activities.push({
          type: "deal",
          title: `New deal created with ${deal.channel_name}`,
          time: formatTimeAgo(deal.created_at),
          badge: "New",
          badgeVariant: "secondary",
        })
      })

      recentSpots?.forEach((spot) => {
        activities.push({
          type: "spot",
          title: `Ad spot confirmed: ${spot.ad_title}`,
          time: formatTimeAgo(spot.updated_at),
          badge: "Confirmed",
          badgeVariant: "outline",
        })
      })

      recentEvents?.forEach((event) => {
        activities.push({
          type: "event",
          title: `${event.event_name} special event added`,
          time: formatTimeAgo(event.created_at),
          badge: "Event",
          badgeVariant: "secondary",
        })
      })

      activities.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivity(activities.slice(0, 3))
    } catch (error) {
      console.error("Error loading recent activity:", error)
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TV Ad Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PlatformTourModal isOpen={showTour} onClose={() => setShowTour(false)} />

      <header className="border-b bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Tv className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TV Ad Scheduling</h1>
                <p className="text-gray-600 text-sm">Manage your TV advertising campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTour(true)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Tour
              </Button>
              <Button size="sm" className="bg-gray-900 hover:bg-black text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Deals</CardTitle>
              <Tv className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDeals}</div>
              <p className="text-xs text-gray-500">TV channel contracts</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Spots</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeSpots}</div>
              <p className="text-xs text-gray-500">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Brands</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBrands}</div>
              <p className="text-xs text-gray-500">Managed brands</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Monthly Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${stats.monthlySpend.toLocaleString()}</div>
              <p className="text-xs text-gray-500">This month's payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${
                              activity.type === "deal"
                                ? "bg-green-100"
                                : activity.type === "spot"
                                  ? "bg-blue-100"
                                  : "bg-orange-100"
                            }`}
                          >
                            {activity.type === "deal" && (
                              <Calendar className="h-4 w-4 text-green-600" />
                            )}
                            {activity.type === "spot" && <Tv className="h-4 w-4 text-blue-600" />}
                            {activity.type === "event" && (
                              <TrendingUp className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          <Badge variant={activity.badgeVariant}>{activity.badge}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No recent activity</p>
                        <p className="text-sm text-gray-400">Start by creating deals and scheduling ads</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/tv-admin/deals" className="contents">
                      <Button variant="outline" className="h-20 flex-col gap-2 bg-gray-50 border-gray-200 hover:bg-gray-100">
                        <Plus className="h-5 w-5" />
                        <span className="text-sm">New Deal</span>
                      </Button>
                    </Link>
                    <Link href="/tv-admin/planning" className="contents">
                      <Button variant="outline" className="h-20 flex-col gap-2 bg-gray-50 border-gray-200 hover:bg-gray-100">
                        <Calendar className="h-5 w-5" />
                        <span className="text-sm">Schedule Ad</span>
                      </Button>
                    </Link>
                    <Link href="/tv-admin/profile" className="contents">
                      <Button variant="outline" className="h-20 flex-col gap-2 bg-gray-50 border-gray-200 hover:bg-gray-100">
                        <Users className="h-5 w-5" />
                        <span className="text-sm">Manage Brands</span>
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-gray-50 border-gray-200 hover:bg-gray-100">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deals">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>TV Channel Deals & Contracts</CardTitle>
                <CardDescription>Manage your TV advertising contracts and deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Tv className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Deals Management</h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage TV channel deals, track payments, and handle special events.
                  </p>
                  <Link href="/tv-admin/deals">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Go to Deals Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Ad Planning & Scheduling</CardTitle>
                <CardDescription>Plan and schedule your TV ad spots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ad Scheduling</h3>
                  <p className="text-gray-600 mb-4">
                    Schedule ad spots for your brands with automatic validation and calculations.
                  </p>
                  <Link href="/tv-admin/planning">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Go to Ad Planning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confirmation">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Spot Confirmation & Editing</CardTitle>
                <CardDescription>Confirm aired spots and manage scheduling changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Spot Management</h3>
                  <p className="text-gray-600 mb-4">
                    Track which ads aired successfully and reschedule failed spots.
                  </p>
                  <Link href="/tv-admin/confirmation">
                    <Button>
                      <Clock className="h-4 w-4 mr-2" />
                      Go to Spot Confirmation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Dashboard & Analytics</CardTitle>
                <CardDescription>View performance insights and campaign analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 mb-4">
                    Visualize deal consumption, brand performance, and campaign trends.
                  </p>
                  <Link href="/tv-admin/analytics">
                    <Button>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
