"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Calendar, AlertTriangle, CheckCircle, Target, Tv } from "lucide-react"
import {
  createTVAdClient,
  type TVAdSpot,
  type TVDeal,
  type TVBrandCategory,
  type TVBrand,
  type TVSubBrand,
  type TVSpecialEvent,
  calculateSpotsUsed,
  calculateSecondsConsumed,
  calculateRemainingSpots,
  calculateRemainingSeconds,
} from "@/lib/supabase/tv-ad-client"

interface BrandHierarchy {
  category: TVBrandCategory & {
    brands: (TVBrand & {
      subBrands: TVSubBrand[]
    })[]
  }
}

interface DealWithUsage extends TVDeal {
  usedSpots: number
  usedSeconds: number
  remainingSpots: number
  remainingSeconds: number
  specialEvents: TVSpecialEvent[]
  totalExtraSpots: number
}

interface AdSpotWithDetails extends TVAdSpot {
  category_name: string
  brand_name: string
  sub_brand_name?: string
  deal_channel: string
}

export function AdPlanning() {
  const [loading, setLoading] = useState(true)
  const [brandHierarchy, setBrandHierarchy] = useState<BrandHierarchy[]>([])
  const [deals, setDeals] = useState<DealWithUsage[]>([])
  const [adSpots, setAdSpots] = useState<AdSpotWithDetails[]>([])
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedSubBrand, setSelectedSubBrand] = useState("")
  const [selectedDeal, setSelectedDeal] = useState("")
  const [newAdSpot, setNewAdSpot] = useState({
    ad_title: "",
    scheduled_date: "",
    duration_seconds: "30",
    airing_count: "1",
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [calculatedValues, setCalculatedValues] = useState({
    spotsUsed: 0,
    secondsConsumed: 0,
    specialEventFee: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Calculate values when form changes
    if (newAdSpot.duration_seconds && newAdSpot.airing_count && selectedDeal) {
      const deal = deals.find((d) => d.id === selectedDeal)
      if (deal) {
        const duration = Number.parseInt(newAdSpot.duration_seconds)
        const count = Number.parseInt(newAdSpot.airing_count)
        const spotsUsed = calculateSpotsUsed(duration, deal.max_seconds_per_spot, count)
        const secondsConsumed = calculateSecondsConsumed(duration, count)

        // Check for special event fees
        let specialEventFee = 0
        if (newAdSpot.scheduled_date) {
          const scheduledDate = new Date(newAdSpot.scheduled_date)
          const applicableEvent = deal.specialEvents.find((event) => {
            const eventStart = new Date(event.start_date)
            const eventEnd = new Date(event.end_date)
            return scheduledDate >= eventStart && scheduledDate <= eventEnd
          })
          if (applicableEvent) {
            specialEventFee = applicableEvent.extra_fee_amount * count
          }
        }

        setCalculatedValues({
          spotsUsed,
          secondsConsumed,
          specialEventFee,
        })

        // Validate
        const errors: string[] = []
        if (duration > deal.max_seconds_per_spot) {
          errors.push(`Duration exceeds max ${deal.max_seconds_per_spot}s per spot`)
        }
        if (spotsUsed > deal.remainingSpots) {
          errors.push(`Not enough spots remaining (${deal.remainingSpots} available)`)
        }
        if (secondsConsumed > deal.remainingSeconds) {
          errors.push(`Not enough seconds remaining (${deal.remainingSeconds} available)`)
        }

        // Check daily cap
        if (deal.daily_cap && newAdSpot.scheduled_date) {
          checkDailyCap(deal, newAdSpot.scheduled_date, count).then((dailyCapError) => {
            if (dailyCapError) {
              errors.push(dailyCapError)
            }
            setValidationErrors(errors)
          })
        } else {
          setValidationErrors(errors)
        }
      }
    }
  }, [newAdSpot, selectedDeal, deals])

  const loadData = async () => {
    try {
      const supabase = createTVAdClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Load brand hierarchy
      const { data: categories } = await supabase
        .from("tv_brand_categories")
        .select("*")
        .eq("admin_id", user.id)
        .order("name")

      if (categories) {
        const hierarchy: BrandHierarchy[] = []
        for (const category of categories) {
          const { data: brands } = await supabase
            .from("tv_brands")
            .select("*")
            .eq("category_id", category.id)
            .order("name")

          const brandsWithSubBrands = []
          if (brands) {
            for (const brand of brands) {
              const { data: subBrands } = await supabase
                .from("tv_sub_brands")
                .select("*")
                .eq("brand_id", brand.id)
                .order("name")

              brandsWithSubBrands.push({
                ...brand,
                subBrands: subBrands || [],
              })
            }
          }

          hierarchy.push({
            category: {
              ...category,
              brands: brandsWithSubBrands,
            },
          })
        }
        setBrandHierarchy(hierarchy)
      }

      // Load deals with usage calculations
      const { data: dealsData } = await supabase
        .from("tv_deals")
        .select("*")
        .eq("admin_id", user.id)
        .order("channel_name")

      if (dealsData) {
        const dealsWithUsage: DealWithUsage[] = []
        for (const deal of dealsData) {
          // Get special events
          const { data: events } = await supabase.from("tv_special_events").select("*").eq("deal_id", deal.id)

          // Get extra packages
          const { data: packages } = await supabase
            .from("tv_extra_packages")
            .select("additional_spots")
            .eq("deal_id", deal.id)

          const totalExtraSpots = packages?.reduce((sum, pkg) => sum + pkg.additional_spots, 0) || 0

          // Calculate usage from existing ad spots
          const { data: existingSpots } = await supabase
            .from("tv_ad_spots")
            .select("duration_seconds, airing_count")
            .eq("deal_id", deal.id)
            .neq("status", "failed")

          let usedSpots = 0
          let usedSeconds = 0
          if (existingSpots) {
            for (const spot of existingSpots) {
              const spotsForThisAd = calculateSpotsUsed(
                spot.duration_seconds,
                deal.max_seconds_per_spot,
                spot.airing_count,
              )
              const secondsForThisAd = calculateSecondsConsumed(spot.duration_seconds, spot.airing_count)
              usedSpots += spotsForThisAd
              usedSeconds += secondsForThisAd
            }
          }

          const remainingSpots = calculateRemainingSpots(deal.total_spots, usedSpots, totalExtraSpots)
          const remainingSeconds = calculateRemainingSeconds(
            deal.total_spots,
            deal.max_seconds_per_spot,
            usedSeconds,
            totalExtraSpots,
          )

          dealsWithUsage.push({
            ...deal,
            usedSpots,
            usedSeconds,
            remainingSpots,
            remainingSeconds,
            specialEvents: events || [],
            totalExtraSpots,
          })
        }
        setDeals(dealsWithUsage)
      }

      // Load existing ad spots
      const { data: spotsData } = await supabase
        .from("tv_ad_spots")
        .select(
          `
          *,
          tv_brand_categories!inner(name),
          tv_brands!inner(name),
          tv_sub_brands(name),
          tv_deals!inner(channel_name)
        `,
        )
        .eq("admin_id", user.id)
        .order("scheduled_date", { ascending: false })

      if (spotsData) {
        const spotsWithDetails: AdSpotWithDetails[] = spotsData.map((spot: any) => ({
          ...spot,
          category_name: spot.tv_brand_categories.name,
          brand_name: spot.tv_brands.name,
          sub_brand_name: spot.tv_sub_brands?.name,
          deal_channel: spot.tv_deals.channel_name,
        }))
        setAdSpots(spotsWithDetails)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkDailyCap = async (deal: DealWithUsage, date: string, newCount: number): Promise<string | null> => {
    if (!deal.daily_cap) return null

    try {
      const supabase = createTVAdClient()
      const { data: existingSpots } = await supabase
        .from("tv_ad_spots")
        .select("airing_count")
        .eq("deal_id", deal.id)
        .eq("scheduled_date", date)
        .neq("status", "failed")

      const currentDaySpots = existingSpots?.reduce((sum, spot) => sum + spot.airing_count, 0) || 0
      const totalForDay = currentDaySpots + newCount

      if (totalForDay > deal.daily_cap) {
        return `Daily cap exceeded (${deal.daily_cap} max, ${totalForDay} total for this day)`
      }
    } catch (error) {
      console.error("Error checking daily cap:", error)
    }

    return null
  }

  const createAdSpot = async () => {
    if (
      !selectedCategory ||
      !selectedBrand ||
      !selectedDeal ||
      !newAdSpot.ad_title ||
      !newAdSpot.scheduled_date ||
      validationErrors.length > 0
    ) {
      toast({
        title: "Error",
        description: "Please fix validation errors before creating the ad spot",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createTVAdClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const adSpotData = {
        admin_id: user.id,
        deal_id: selectedDeal,
        category_id: selectedCategory,
        brand_id: selectedBrand,
        sub_brand_id: selectedSubBrand || null,
        ad_title: newAdSpot.ad_title,
        scheduled_date: newAdSpot.scheduled_date,
        duration_seconds: Number.parseInt(newAdSpot.duration_seconds),
        airing_count: Number.parseInt(newAdSpot.airing_count),
        special_event_fee: calculatedValues.specialEventFee,
        status: "pending",
      }

      const { error } = await supabase.from("tv_ad_spots").insert(adSpotData)

      if (error) throw error

      toast({
        title: "Success",
        description: "Ad spot scheduled successfully",
      })

      // Reset form
      setNewAdSpot({
        ad_title: "",
        scheduled_date: "",
        duration_seconds: "30",
        airing_count: "1",
      })
      setSelectedCategory("")
      setSelectedBrand("")
      setSelectedSubBrand("")
      setSelectedDeal("")
      setShowPlanDialog(false)
      loadData()
    } catch (error) {
      console.error("Error creating ad spot:", error)
      toast({
        title: "Error",
        description: "Failed to create ad spot",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ad Planning & Scheduling</h2>
          <p className="text-muted-foreground">Plan and schedule your TV ad spots with automatic validation</p>
        </div>
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Ad Spot</DialogTitle>
              <DialogDescription>
                Plan an ad spot for your brand with automatic validation against deal limits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Brand Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandHierarchy.map((item) => (
                        <SelectItem key={item.category.id} value={item.category.id}>
                          {item.category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand} disabled={!selectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandHierarchy
                        .find((item) => item.category.id === selectedCategory)
                        ?.category.brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub-brand</Label>
                  <Select value={selectedSubBrand} onValueChange={setSelectedSubBrand} disabled={!selectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandHierarchy
                        .find((item) => item.category.id === selectedCategory)
                        ?.category.brands.find((brand) => brand.id === selectedBrand)
                        ?.subBrands.map((subBrand) => (
                          <SelectItem key={subBrand.id} value={subBrand.id}>
                            {subBrand.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deal Selection */}
              <div className="space-y-2">
                <Label>TV Channel / Deal *</Label>
                <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select TV channel deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.channel_name} ({deal.remainingSpots.toFixed(1)} spots remaining)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ad Details */}
              <div className="space-y-2">
                <Label htmlFor="ad-title">Ad Title *</Label>
                <Input
                  id="ad-title"
                  placeholder="e.g., Summer Campaign 2025"
                  value={newAdSpot.ad_title}
                  onChange={(e) => setNewAdSpot((prev) => ({ ...prev, ad_title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled-date">Scheduled Date *</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={newAdSpot.scheduled_date}
                    onChange={(e) => setNewAdSpot((prev) => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={newAdSpot.duration_seconds}
                    onChange={(e) => setNewAdSpot((prev) => ({ ...prev, duration_seconds: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airing-count">Airing Count *</Label>
                  <Input
                    id="airing-count"
                    type="number"
                    placeholder="1"
                    value={newAdSpot.airing_count}
                    onChange={(e) => setNewAdSpot((prev) => ({ ...prev, airing_count: e.target.value }))}
                  />
                </div>
              </div>

              {/* Calculations Display */}
              {selectedDeal && newAdSpot.duration_seconds && newAdSpot.airing_count && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Calculated Values:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Spots Used:</span>
                      <div className="font-medium">{calculatedValues.spotsUsed.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Seconds Consumed:</span>
                      <div className="font-medium">{calculatedValues.secondsConsumed}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Special Event Fee:</span>
                      <div className="font-medium">
                        {calculatedValues.specialEventFee > 0
                          ? formatCurrency(calculatedValues.specialEventFee)
                          : "None"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createAdSpot} disabled={validationErrors.length > 0}>
                Schedule Ad Spot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scheduled Ad Spots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Ad Spots
          </CardTitle>
          <CardDescription>All your planned and confirmed ad spots</CardDescription>
        </CardHeader>
        <CardContent>
          {adSpots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ad spots scheduled</h3>
              <p className="text-muted-foreground mb-4">Start by scheduling your first ad spot.</p>
              <Button onClick={() => setShowPlanDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Ad
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {adSpots.map((spot) => (
                <div key={spot.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Tv className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{spot.ad_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {spot.category_name} → {spot.brand_name}
                          {spot.sub_brand_name && ` → ${spot.sub_brand_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(spot.status)}>{spot.status}</Badge>
                      {spot.status === "confirmed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Channel:</span>
                      <div className="font-medium">{spot.deal_channel}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <div className="font-medium">{formatDate(spot.scheduled_date)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{spot.duration_seconds}s</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Airings:</span>
                      <div className="font-medium">{spot.airing_count}x</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Special Fee:</span>
                      <div className="font-medium">
                        {spot.special_event_fee > 0 ? formatCurrency(spot.special_event_fee) : "None"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal Usage Summary */}
      {deals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Deal Usage Summary
            </CardTitle>
            <CardDescription>Current usage of your TV channel deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deals.map((deal) => {
                const usagePercentage = (deal.usedSpots / (deal.total_spots + deal.totalExtraSpots)) * 100

                return (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{deal.channel_name}</h4>
                      <Badge
                        variant={usagePercentage > 90 ? "destructive" : usagePercentage > 70 ? "secondary" : "default"}
                      >
                        {usagePercentage.toFixed(1)}% used
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Used Spots:</span>
                        <div className="font-medium">
                          {deal.usedSpots.toFixed(1)} / {(deal.total_spots + deal.totalExtraSpots).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining Spots:</span>
                        <div className="font-medium">{deal.remainingSpots.toFixed(1)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Used Seconds:</span>
                        <div className="font-medium">{deal.usedSeconds.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining Seconds:</span>
                        <div className="font-medium">{deal.remainingSeconds.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usagePercentage > 90
                              ? "bg-destructive"
                              : usagePercentage > 70
                                ? "bg-yellow-500"
                                : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
