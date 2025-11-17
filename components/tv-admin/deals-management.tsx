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
import { Plus, Tv, Star, Package, Edit } from "lucide-react"
import {
  createTVAdClient,
  type TVDeal,
  type TVSpecialEvent,
  type TVExtraPackage,
  type TVPayment,
} from "@/lib/supabase/tv-ad-client"

interface DealWithDetails extends TVDeal {
  specialEvents: TVSpecialEvent[]
  extraPackages: TVExtraPackage[]
  payments: TVPayment[]
  totalExtraSpots: number
  totalPaid: number
}

export function DealsManagement() {
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<DealWithDetails[]>([])
  const [showDealDialog, setShowDealDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showPackageDialog, setShowPackageDialog] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<string>("")
  const [newDeal, setNewDeal] = useState({
    channel_name: "",
    start_date: "",
    end_date: "",
    total_spots: "",
    max_seconds_per_spot: "30",
    daily_cap: "",
    initial_payment: "",
    employee_created_by: "",
  })
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    start_date: "",
    end_date: "",
    extra_fee_amount: "",
  })
  const [newPackage, setNewPackage] = useState({
    additional_spots: "",
    amount_paid: "",
    package_date: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      const supabase = createTVAdClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get deals
      const { data: dealsData } = await supabase
        .from("tv_deals")
        .select("*")
        .eq("admin_id", user.id)
        .order("created_at", { ascending: false })

      if (!dealsData) return

      // Get related data for each deal
      const dealsWithDetails: DealWithDetails[] = []

      for (const deal of dealsData) {
        // Get special events
        const { data: events } = await supabase
          .from("tv_special_events")
          .select("*")
          .eq("deal_id", deal.id)
          .order("start_date")

        // Get extra packages
        const { data: packages } = await supabase
          .from("tv_extra_packages")
          .select("*")
          .eq("deal_id", deal.id)
          .order("package_date")

        // Get payments
        const { data: payments } = await supabase
          .from("tv_payments")
          .select("*")
          .eq("deal_id", deal.id)
          .order("payment_date")

        const totalExtraSpots = packages?.reduce((sum, pkg) => sum + pkg.additional_spots, 0) || 0
        const totalPaid = payments?.reduce((sum, payment) => sum + payment.payment_amount, 0) || 0

        dealsWithDetails.push({
          ...deal,
          specialEvents: events || [],
          extraPackages: packages || [],
          payments: payments || [],
          totalExtraSpots,
          totalPaid,
        })
      }

      setDeals(dealsWithDetails)
    } catch (error) {
      console.error("Error loading deals:", error)
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createDeal = async () => {
    if (!newDeal.channel_name || !newDeal.start_date || !newDeal.end_date || !newDeal.total_spots) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

      const dealData = {
        admin_id: user.id,
        channel_name: newDeal.channel_name,
        start_date: newDeal.start_date,
        end_date: newDeal.end_date,
        total_spots: Number.parseInt(newDeal.total_spots),
        max_seconds_per_spot: Number.parseInt(newDeal.max_seconds_per_spot),
        daily_cap: newDeal.daily_cap ? Number.parseInt(newDeal.daily_cap) : null,
        initial_payment: newDeal.initial_payment ? Number.parseFloat(newDeal.initial_payment) : null,
        employee_created_by: newDeal.employee_created_by || null,
      }

      const { data: deal, error } = await supabase.from("tv_deals").insert(dealData).select().single()

      if (error) throw error

      // Create initial payment record if amount provided
      if (newDeal.initial_payment) {
        await supabase.from("tv_payments").insert({
          deal_id: deal.id,
          payment_amount: Number.parseFloat(newDeal.initial_payment),
          payment_date: new Date().toISOString().split("T")[0],
          payment_type: "initial",
          notes: "Initial payment for deal",
        })
      }

      toast({
        title: "Success",
        description: "Deal created successfully",
      })

      setNewDeal({
        channel_name: "",
        start_date: "",
        end_date: "",
        total_spots: "",
        max_seconds_per_spot: "30",
        daily_cap: "",
        initial_payment: "",
        employee_created_by: "",
      })
      setShowDealDialog(false)
      loadDeals()
    } catch (error) {
      console.error("Error creating deal:", error)
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      })
    }
  }

  const createSpecialEvent = async () => {
    if (!selectedDeal || !newEvent.event_name || !newEvent.start_date || !newEvent.end_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createTVAdClient()

      const { error } = await supabase.from("tv_special_events").insert({
        deal_id: selectedDeal,
        event_name: newEvent.event_name,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        extra_fee_amount: newEvent.extra_fee_amount ? Number.parseFloat(newEvent.extra_fee_amount) : 0,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Special event created successfully",
      })

      setNewEvent({
        event_name: "",
        start_date: "",
        end_date: "",
        extra_fee_amount: "",
      })
      setSelectedDeal("")
      setShowEventDialog(false)
      loadDeals()
    } catch (error) {
      console.error("Error creating special event:", error)
      toast({
        title: "Error",
        description: "Failed to create special event",
        variant: "destructive",
      })
    }
  }

  const createExtraPackage = async () => {
    if (!selectedDeal || !newPackage.additional_spots || !newPackage.amount_paid || !newPackage.package_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createTVAdClient()

      const { data: extraPackage, error } = await supabase
        .from("tv_extra_packages")
        .insert({
          deal_id: selectedDeal,
          additional_spots: Number.parseInt(newPackage.additional_spots),
          amount_paid: Number.parseFloat(newPackage.amount_paid),
          package_date: newPackage.package_date,
        })
        .select()
        .single()

      if (error) throw error

      // Create payment record for extra package
      await supabase.from("tv_payments").insert({
        deal_id: selectedDeal,
        payment_amount: Number.parseFloat(newPackage.amount_paid),
        payment_date: newPackage.package_date,
        payment_type: "extra_package",
        extra_package_id: extraPackage.id,
        notes: `Extra package: ${newPackage.additional_spots} spots`,
      })

      toast({
        title: "Success",
        description: "Extra package created successfully",
      })

      setNewPackage({
        additional_spots: "",
        amount_paid: "",
        package_date: "",
      })
      setSelectedDeal("")
      setShowPackageDialog(false)
      loadDeals()
    } catch (error) {
      console.error("Error creating extra package:", error)
      toast({
        title: "Error",
        description: "Failed to create extra package",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDealStatus = (deal: DealWithDetails) => {
    const now = new Date()
    const startDate = new Date(deal.start_date)
    const endDate = new Date(deal.end_date)

    if (now < startDate) return { status: "upcoming", color: "secondary" }
    if (now > endDate) return { status: "expired", color: "destructive" }
    return { status: "active", color: "default" }
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
          <h2 className="text-2xl font-bold">TV Channel Deals & Contracts</h2>
          <p className="text-muted-foreground">Manage your TV advertising contracts and deals</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Add Special Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Special Event</DialogTitle>
                <DialogDescription>
                  Add special events like Ramadan, Eid, or holidays with extra fees.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Deal</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedDeal}
                    onChange={(e) => setSelectedDeal(e.target.value)}
                  >
                    <option value="">Choose a deal</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.channel_name} ({formatDate(deal.start_date)} - {formatDate(deal.end_date)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    placeholder="e.g., Ramadan 2025, Eid Al-Fitr"
                    value={newEvent.event_name}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, event_name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-start">Start Date</Label>
                    <Input
                      id="event-start"
                      type="date"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-end">End Date</Label>
                    <Input
                      id="event-end"
                      type="date"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-fee">Extra Fee Amount</Label>
                  <Input
                    id="event-fee"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newEvent.extra_fee_amount}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, extra_fee_amount: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createSpecialEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Add Extra Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Extra Package</DialogTitle>
                <DialogDescription>
                  Add additional spots to an existing deal when the initial package runs out.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Deal</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedDeal}
                    onChange={(e) => setSelectedDeal(e.target.value)}
                  >
                    <option value="">Choose a deal</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.channel_name} ({deal.total_spots + deal.totalExtraSpots} total spots)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-spots">Additional Spots</Label>
                  <Input
                    id="package-spots"
                    type="number"
                    placeholder="100"
                    value={newPackage.additional_spots}
                    onChange={(e) => setNewPackage((prev) => ({ ...prev, additional_spots: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-amount">Amount Paid</Label>
                  <Input
                    id="package-amount"
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    value={newPackage.amount_paid}
                    onChange={(e) => setNewPackage((prev) => ({ ...prev, amount_paid: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-date">Package Date</Label>
                  <Input
                    id="package-date"
                    type="date"
                    value={newPackage.package_date}
                    onChange={(e) => setNewPackage((prev) => ({ ...prev, package_date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createExtraPackage}>Create Package</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New TV Deal</DialogTitle>
                <DialogDescription>Create a new contract with a TV channel for advertising spots.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel">TV Channel Name *</Label>
                    <Input
                      id="channel"
                      placeholder="e.g., 2M TV, Al Aoula"
                      value={newDeal.channel_name}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, channel_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee">Created By</Label>
                    <Input
                      id="employee"
                      placeholder="Employee name"
                      value={newDeal.employee_created_by}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, employee_created_by: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newDeal.start_date}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newDeal.end_date}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total-spots">Total Spots *</Label>
                    <Input
                      id="total-spots"
                      type="number"
                      placeholder="1000"
                      value={newDeal.total_spots}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, total_spots: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-seconds">Max Seconds/Spot</Label>
                    <Input
                      id="max-seconds"
                      type="number"
                      placeholder="30"
                      value={newDeal.max_seconds_per_spot}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, max_seconds_per_spot: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily-cap">Daily Cap (optional)</Label>
                    <Input
                      id="daily-cap"
                      type="number"
                      placeholder="10"
                      value={newDeal.daily_cap}
                      onChange={(e) => setNewDeal((prev) => ({ ...prev, daily_cap: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-payment">Initial Payment (optional)</Label>
                  <Input
                    id="initial-payment"
                    type="number"
                    step="0.01"
                    placeholder="50000.00"
                    value={newDeal.initial_payment}
                    onChange={(e) => setNewDeal((prev) => ({ ...prev, initial_payment: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDealDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createDeal}>Create Deal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Deals List */}
      {deals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first TV channel deal to start managing your advertising campaigns.
            </p>
            <Button onClick={() => setShowDealDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Deal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const dealStatus = getDealStatus(deal)
            const totalSpots = deal.total_spots + deal.totalExtraSpots
            const totalSeconds = totalSpots * deal.max_seconds_per_spot

            return (
              <Card key={deal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Tv className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{deal.channel_name}</CardTitle>
                        <CardDescription>
                          {formatDate(deal.start_date)} - {formatDate(deal.end_date)}
                          {deal.employee_created_by && ` • Created by ${deal.employee_created_by}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={dealStatus.color as any}>{dealStatus.status}</Badge>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{totalSpots.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Spots</div>
                      {deal.totalExtraSpots > 0 && (
                        <div className="text-xs text-green-600">+{deal.totalExtraSpots} extra</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{deal.max_seconds_per_spot}s</div>
                      <div className="text-sm text-muted-foreground">Max per Spot</div>
                      {deal.daily_cap && <div className="text-xs text-muted-foreground">{deal.daily_cap}/day cap</div>}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(deal.totalPaid)}</div>
                      <div className="text-sm text-muted-foreground">Total Paid</div>
                      <div className="text-xs text-muted-foreground">{deal.payments.length} payments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(totalSeconds / 60).toFixed(1)}m</div>
                      <div className="text-sm text-muted-foreground">Total Minutes</div>
                      <div className="text-xs text-muted-foreground">{totalSeconds.toLocaleString()}s</div>
                    </div>
                  </div>

                  {/* Special Events */}
                  {deal.specialEvents.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Special Events
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {deal.specialEvents.map((event) => (
                          <Badge key={event.id} variant="secondary" className="flex items-center gap-1">
                            {event.event_name}
                            <span className="text-xs">
                              ({formatDate(event.start_date)} - {formatDate(event.end_date)})
                            </span>
                            {event.extra_fee_amount > 0 && (
                              <span className="text-xs text-orange-600">+{formatCurrency(event.extra_fee_amount)}</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extra Packages */}
                  {deal.extraPackages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Extra Packages
                      </h4>
                      <div className="space-y-2">
                        {deal.extraPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                          >
                            <span>
                              {pkg.additional_spots} spots • {formatDate(pkg.package_date)}
                            </span>
                            <span className="font-medium">{formatCurrency(pkg.amount_paid)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
