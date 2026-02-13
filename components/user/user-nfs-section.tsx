"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { VirtualCardCreator } from "@/components/virtual-card-creator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QrCode, Trash2, Copy, Download, Plus, Loader2, X, Edit2 } from "lucide-react"
import { generateQRCode } from "@/lib/utils/qr-generator"
import { useToast } from "@/hooks/use-toast"
import { deleteVirtualCard } from "@/app/actions/virtual-card-actions"

interface VirtualCard { 
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  job_title: string | null
  website: string | null
  cover_image_url: string | null
  accent_color: string
  short_code: string
  created_at: string
}

export function UserNFSSection() {
  const supabase = createClient()
  const { toast } = useToast()
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [editingCard, setEditingCard] = useState<VirtualCard | null>(null)
  const [showQRModal, setShowQRModal] = useState<string | null>(null)
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
    } catch (error) {
      console.error("Error loading cards:", error)
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
            <h1 className="text-3xl font-bold text-gray-900">Virtual Cards (NFC)</h1>
            <p className="text-sm text-gray-600">Create and manage your NFC virtual card with QR codes</p>
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{card.full_name}</h3>
                  <p className="text-sm text-gray-600">{card.job_title || "NFC Card"}</p>
                </div>
              </div>

              {card.cover_image_url && (
                <img src={card.cover_image_url} alt={card.full_name} className="w-full h-32 object-cover rounded-lg mb-4" />
              )}

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>{card.email}</p>
                {card.phone && <p>{card.phone}</p>}
                {card.company_name && <p>{card.company_name}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setEditingCard(card)
                  setShowCreator(true)
                }} className="flex-1">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShowQR(card)} className="flex-1">
                  <QrCode className="h-4 w-4 mr-1" />
                  QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(card)} className="flex-1">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteCard(card.id)} className="flex-1 text-red-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
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
