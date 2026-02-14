"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { VirtualCardCreator } from "@/components/virtual-card-creator"
import { CardAnalyticsDashboard } from "@/components/card-analytics-dashboard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Copy, Download, Plus, Loader2, X, Edit2, BarChart2, Send } from "lucide-react"
import { generateQRCode } from "@/lib/utils/qr-generator"
import { useToast } from "@/hooks/use-toast"
import { deleteVirtualCard } from "@/app/actions/virtual-card-actions"
import { createNFCRequest } from "@/app/actions/nfc-request-actions"

interface VirtualCard { 
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  job_title: string | null
  website: string | null
  cover_image_url: string | null
  theme_color: string
  short_code: string
  created_at: string
}

export function UserNFSSection() {
  const supabase = createClient()
  const { toast } = useToast()
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [cardRequests, setCardRequests] = useState<Record<string, any>>({}) // Map of card IDs to their request status
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [editingCard, setEditingCard] = useState<VirtualCard | null>(null)
  const [showQRModal, setShowQRModal] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState<string | null>(null) // Card ID with open modal
  const [requestReason, setRequestReason] = useState("")
  const [requestType, setRequestType] = useState<'new_card' | 'replacement' | 'additional'>('replacement')
  const [qrUrl, setQrUrl] = useState<string>("")

  useEffect(() => {
    loadCards()
  }, [])

  async function loadCards() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({ title: "Error", description: "User not authenticated" })
        return
      }

      const { data, error } = await supabase
        .from("virtual_business_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCards(data || [])

      // Load requests for each card - store by card ID for easy lookup
      const { data: requests, error: requestsError } = await supabase
        .from("nfc_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!requestsError && requests) {
        const requestMap: Record<string, any> = {}
        // Store the most recent request for each user (since they can have multiple)
        if (requests.length > 0) {
          requests.forEach(req => {
            // Store latest request by user ID for now
            requestMap["latest"] = req
          })
        }
        setCardRequests(requestMap)
      }
    } catch (error) {
      console.error("[v0] NFS: Error loading cards:", error)
      toast({ title: "Error", description: "Failed to load virtual cards" })
    } finally {
      setLoading(false)
    }
  }

  async function handleShowQR(card: VirtualCard) {
    try {
      const appUrl = typeof window !== "undefined" ? window.location.origin : "https://fadercoqr.com"
      const cardUrl = `${appUrl}/api/redirect/${card.short_code}`
      const qr = await generateQRCode(cardUrl)
      setQrUrl(qr)
      setShowQRModal(card.id)
    } catch (error) {
      console.error("Error generating QR:", error)
      toast({ title: "Error", description: "Failed to generate QR code" })
    }
  }

  async function handleDeleteCard(id: string) {
    if (!confirm("Are you sure you want to delete this virtual card?")) return

    try {
      const result = await deleteVirtualCard(id)
      if (result.error) {
        toast({ title: "Error", description: result.error })
        return
      }
      toast({ title: "Success", description: "Virtual card deleted" })
      loadCards()
    } catch (error) {
      console.error("Error deleting card:", error)
      toast({ title: "Error", description: "Failed to delete virtual card" })
    }
  }

  function copyToClipboard(card: VirtualCard) {
    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://fadercoqr.com"
    const url = `${appUrl}/api/redirect/${card.short_code}`
    navigator.clipboard.writeText(url)
    toast({ title: "Success", description: "Link copied to clipboard" })
  }

  async function downloadQR(card: VirtualCard) {
    try {
      const appUrl = typeof window !== "undefined" ? window.location.origin : "https://fadercoqr.com"
      const cardUrl = `${appUrl}/api/redirect/${card.short_code}`
      const qr = await generateQRCode(cardUrl)
      const link = document.createElement("a")
      link.href = qr
      link.download = `${card.full_name}-nfc.png`
      link.click()
    } catch (error) {
      console.error("Error downloading QR:", error)
      toast({ title: "Error", description: "Failed to download QR code" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Business Card</h1>
              <p className="text-sm text-gray-600">Create and manage your virtual business card with unique QR code</p>
          </div>
          <Button onClick={() => {
            if (cards.length === 0) {
              setShowCreator(true)
            }
          }} disabled={cards.length > 0} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {cards.length > 0 ? "Card Created" : "Create Card"}
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="rounded-2xl border border-gray-200 bg-white/10 p-8 text-center shadow-lg backdrop-blur-xl">
          <div className="text-5xl mb-4">📇</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No virtual cards yet</h3>
          <p className="text-gray-600 mb-4">Create your first NFC virtual card to get started</p>
          <Button onClick={() => setShowCreator(true)}>Create Your First Card</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 max-w-2xl">
          {cards.map((card) => (
            <Card key={card.id} className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl overflow-hidden">
              {card.cover_image_url && (
                <img src={card.cover_image_url} alt={card.full_name} className="w-full h-32 object-cover rounded-lg mb-4" crossOrigin="anonymous" />
              )}

              <div className="flex items-start gap-4 mb-4">
                {card.profile_image_url ? (
                  <img src={card.profile_image_url} alt={card.full_name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" crossOrigin="anonymous" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {card.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{card.full_name}</h3>
                  <p className="text-sm text-gray-600 truncate">{card.job_title || "NFC Card"}</p>
                  {card.company_name && <p className="text-sm text-gray-500 truncate">{card.company_name}</p>}
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p className="truncate">{card.email}</p>
                {card.phone && <p className="truncate">{card.phone}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingCard(card)
                  setShowCreator(true)
                }} className="flex-1">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAnalytics(true)} className="flex-1">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShowQR(card)} className="flex-1">
                  <QrCode className="h-4 w-4 mr-1" />
                  QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(card)} className="flex-1">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowRequestModal(card.id)} 
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {cardRequests["latest"]?.status === 'delivered' 
                    ? 'New Request'
                    : cardRequests["latest"]?.status === 'cancelled' 
                    ? 'Request New'
                    : cardRequests["latest"]?.status === 'in_progress'
                    ? 'In Progress'
                    : cardRequests["latest"]?.status === 'approved'
                    ? 'Request Sent'
                    : cardRequests["latest"]?.status === 'pending'
                    ? 'Pending'
                    : 'Request New'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreator && (
        <VirtualCardCreator
          existingCard={editingCard}
          onClose={() => {
            setShowCreator(false)
            setEditingCard(null)
            loadCards()
          }}
        />
      )}

      {showAnalytics && cards.length > 0 && (
        <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Card Analytics</DialogTitle>
            </DialogHeader>
            <CardAnalyticsDashboard cardId={cards[0]?.id || ""} />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!showRequestModal} onOpenChange={(open) => !open && setShowRequestModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {cardRequests["latest"]?.status 
                ? `NFC Card Request - ${cardRequests["latest"]?.status.toUpperCase()}`
                : 'Request New NFC Card'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Show existing request details if it exists */}
            {cardRequests["latest"]?.status && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2 border border-blue-200">
                <p className="text-sm font-semibold text-gray-900">Request Status</p>
                <p className="text-sm text-gray-700 capitalize">
                  <strong>Type:</strong> {cardRequests["latest"]?.request_type}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Status:</strong> <span className="capitalize font-semibold text-blue-600">{cardRequests["latest"]?.status}</span>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Requested:</strong> {new Date(cardRequests["latest"]?.created_at).toLocaleDateString()}
                </p>
                {cardRequests["latest"]?.timeline_delivery && (
                  <p className="text-sm text-gray-700">
                    <strong>Expected Delivery:</strong> {new Date(cardRequests["latest"]?.timeline_delivery).toLocaleDateString()}
                  </p>
                )}
                {cardRequests["latest"]?.admin_notes && (
                  <p className="text-sm text-gray-700">
                    <strong>Admin Notes:</strong> {cardRequests["latest"]?.admin_notes}
                  </p>
                )}
              </div>
            )}

            {/* Show form only if no pending request or if approved/completed */}
            {(!cardRequests["latest"]?.status || 
             ['delivered', 'cancelled'].includes(cardRequests["latest"]?.status)) && (
              <>
                <div>
                  <Label htmlFor="requestType">Request Type</Label>
                  <select
                    id="requestType"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="new_card">New Card</option>
                    <option value="replacement">Replacement Card</option>
                    <option value="additional">Additional Card</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <textarea
                    id="reason"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Tell us why you need a new card..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowRequestModal(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      const result = await createNFCRequest({ requestType, reason: requestReason })
                      if (result.error) {
                        toast({ title: "Error", description: result.error })
                      } else {
                        toast({ title: "Success", description: "Your request has been submitted!" })
                        setShowRequestModal(null)
                        setRequestReason("")
                        setRequestType("replacement")
                        loadCards()
                      }
                    }} 
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Submit Request
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQRModal !== null} onOpenChange={() => setShowQRModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Virtual Card QR Code</DialogTitle>
          </DialogHeader>
          {qrUrl && (
            <div className="flex flex-col items-center gap-4">
              <img src={qrUrl} alt="QR Code" className="w-64 h-64 rounded-lg" />
              <Button 
                onClick={() => {
                  const card = cards.find(c => c.id === showQRModal)
                  if (card) downloadQR(card)
                }} 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowQRModal(null)}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
