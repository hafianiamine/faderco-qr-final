"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, XCircle, Clock, Edit, RotateCcw } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@supabase/ssr"

interface AdSpot {
  id: string
  brand_name: string
  sub_brand_name: string
  channel_name: string
  scheduled_date: string
  scheduled_time: string
  duration_seconds: number
  status: "scheduled" | "aired" | "failed" | "rescheduled"
  confirmation_date?: string
  failure_reason?: string
  rescheduled_from?: string
  special_event_name?: string
}

interface SpotConfirmationProps {
  onFiltersChange?: (filters: Record<string, any>) => void
}

export default function SpotConfirmation({ onFiltersChange }: SpotConfirmationProps) {
  const [spots, setSpots] = useState<AdSpot[]>([])
  const [filteredSpots, setFilteredSpots] = useState<AdSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedChannel, setSelectedChannel] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("today")
  const [editingSpot, setEditingSpot] = useState<AdSpot | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState<Date>()
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [failureReason, setFailureReason] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchSpots()
  }, [])

  useEffect(() => {
    filterSpots()
    if (onFiltersChange) {
      onFiltersChange({
        status: selectedStatus,
        channel: selectedChannel,
        dateRange: dateRange,
      })
    }
  }, [spots, selectedStatus, selectedChannel, dateRange])

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from("ad_spots")
        .select(`
          *,
          brands!inner(name, sub_brands!inner(name)),
          deals!inner(tv_channels!inner(name), special_events(name))
        `)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: true })

      if (error) throw error

      const formattedSpots: AdSpot[] = data.map((spot) => ({
        id: spot.id,
        brand_name: spot.brands.name,
        sub_brand_name: spot.brands.sub_brands.name,
        channel_name: spot.deals.tv_channels.name,
        scheduled_date: spot.scheduled_date,
        scheduled_time: spot.scheduled_time,
        duration_seconds: spot.duration_seconds,
        status: spot.status,
        confirmation_date: spot.confirmation_date,
        failure_reason: spot.failure_reason,
        rescheduled_from: spot.rescheduled_from,
        special_event_name: spot.deals.special_events?.name,
      }))

      setSpots(formattedSpots)
    } catch (error) {
      console.error("Error fetching spots:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterSpots = () => {
    let filtered = [...spots]

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((spot) => spot.status === selectedStatus)
    }

    // Filter by channel
    if (selectedChannel !== "all") {
      filtered = filtered.filter((spot) => spot.channel_name === selectedChannel)
    }

    // Filter by date range
    const today = new Date()
    const todayStr = format(today, "yyyy-MM-dd")

    switch (dateRange) {
      case "today":
        filtered = filtered.filter((spot) => spot.scheduled_date === todayStr)
        break
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((spot) => new Date(spot.scheduled_date) >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter((spot) => new Date(spot.scheduled_date) >= monthAgo)
        break
    }

    setFilteredSpots(filtered)
  }

  const updateSpotStatus = async (spotId: string, status: "aired" | "failed", reason?: string) => {
    try {
      const updateData: any = {
        status,
        confirmation_date: new Date().toISOString(),
      }

      if (status === "failed" && reason) {
        updateData.failure_reason = reason
      }

      const { error } = await supabase.from("ad_spots").update(updateData).eq("id", spotId)

      if (error) throw error

      await fetchSpots()
    } catch (error) {
      console.error("Error updating spot status:", error)
    }
  }

  const rescheduleSpot = async (originalSpotId: string) => {
    if (!rescheduleDate || !rescheduleTime) return

    try {
      // Create new rescheduled spot
      const originalSpot = spots.find((s) => s.id === originalSpotId)
      if (!originalSpot) return

      const { error: insertError } = await supabase.from("ad_spots").insert({
        deal_id: originalSpot.id, // This would need proper deal_id lookup
        brand_id: originalSpot.id, // This would need proper brand_id lookup
        scheduled_date: format(rescheduleDate, "yyyy-MM-dd"),
        scheduled_time: rescheduleTime,
        duration_seconds: originalSpot.duration_seconds,
        status: "scheduled",
        rescheduled_from: originalSpotId,
      })

      if (insertError) throw insertError

      // Update original spot status
      const { error: updateError } = await supabase
        .from("ad_spots")
        .update({ status: "rescheduled" })
        .eq("id", originalSpotId)

      if (updateError) throw updateError

      await fetchSpots()
      setEditingSpot(null)
      setRescheduleDate(undefined)
      setRescheduleTime("")
    } catch (error) {
      console.error("Error rescheduling spot:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aired":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "rescheduled":
        return <RotateCcw className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aired":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const uniqueChannels = [...new Set(spots.map((spot) => spot.channel_name))]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading spots...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="aired">Aired</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="channel-filter">Filter by Channel</Label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger>
              <SelectValue placeholder="All channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {uniqueChannels.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="date-filter">Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSpots.map((spot) => (
          <Card key={spot.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(spot.status)}
                  <CardTitle className="text-lg">
                    {spot.brand_name} - {spot.sub_brand_name}
                  </CardTitle>
                  <Badge className={getStatusColor(spot.status)}>{spot.status}</Badge>
                </div>
                <div className="flex gap-2">
                  {spot.status === "scheduled" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSpotStatus(spot.id, "aired")}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Aired
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Mark Failed
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mark Spot as Failed</DialogTitle>
                            <DialogDescription>Please provide a reason for the failure.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="failure-reason">Failure Reason</Label>
                              <Textarea
                                id="failure-reason"
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                placeholder="e.g., Technical issues, Content rejected, etc."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                updateSpotStatus(spot.id, "failed", failureReason)
                                setFailureReason("")
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Mark as Failed
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  {(spot.status === "failed" || spot.status === "scheduled") && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setEditingSpot(spot)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reschedule Ad Spot</DialogTitle>
                          <DialogDescription>Select a new date and time for this ad spot.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>New Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !rescheduleDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {rescheduleDate ? format(rescheduleDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={rescheduleDate}
                                  onSelect={setRescheduleDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label htmlFor="reschedule-time">New Time</Label>
                            <Input
                              id="reschedule-time"
                              type="time"
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => rescheduleSpot(spot.id)}>Reschedule Spot</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Channel:</span>
                  <p>{spot.channel_name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Date & Time:</span>
                  <p>
                    {format(new Date(spot.scheduled_date), "MMM dd, yyyy")} at {spot.scheduled_time}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Duration:</span>
                  <p>{spot.duration_seconds}s</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Special Event:</span>
                  <p>{spot.special_event_name || "None"}</p>
                </div>
              </div>

              {spot.failure_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <span className="font-medium text-red-800">Failure Reason:</span>
                  <p className="text-red-700 mt-1">{spot.failure_reason}</p>
                </div>
              )}

              {spot.rescheduled_from && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="font-medium text-blue-800">Rescheduled from previous spot</span>
                </div>
              )}

              {spot.confirmation_date && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Status confirmed on {format(new Date(spot.confirmation_date), "MMM dd, yyyy HH:mm")}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No spots found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
