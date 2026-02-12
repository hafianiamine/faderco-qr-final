"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QrCode, Edit2, Trash2, Plus, Copy, Download, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateQRCode } from "@/lib/utils/qr-generator"
import { EditVirtualCardForm } from "@/components/edit-virtual-card-form"
import { useToast } from "@/hooks/use-toast"

interface VirtualCard {
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  job_title: string | null
  website: string | null
  vcard_data: string
  short_code: string
  created_at: string
}

export function UserNFSSection() {
  const supabase = createClient()
  const { toast } = useToast()
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
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

  async function handleDeleteCard(cardId: string) {
    try {
      const { error } = await supabase
        .from("virtual_business_cards")
        .delete()
        .eq("id", cardId)

      if (error) throw error
      setCards(cards.filter(c => c.id !== cardId))
      toast({ title: "Success", description: "Virtual card deleted" })
    } catch (error) {
      console.error("Error deleting card:", error)
      toast({ title: "Error", description: "Failed to delete card" })
    }
  }

  function getCardUrl(shortCode: string) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/api/redirect/${shortCode}`
  }

  async function handleShowQR(card: VirtualCard) {
    try {
      setSelectedCard(card)
      const cardUrl = getCardUrl(card.short_code)
      const qr = await generateQRCode(cardUrl)
      setQrUrl(qr)
      setShowQRModal(card.id)
    } catch (error) {
      console.error("Error generating QR:", error)
      toast({ title: "Error", description: "Failed to generate QR code" })
    }
  }

  async function downloadQR() {
    try {
      if (!selectedCard || !qrUrl) return
      
      const link = document.createElement("a")
      link.href = qrUrl
      link.download = `nfc-card-${selectedCard.full_name.replace(/\s+/g, "-")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({ title: "Success", description: "QR code downloaded" })
    } catch (error) {
      console.error("Error downloading QR:", error)
      toast({ title: "Error", description: "Failed to download QR code" })
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Link copied to clipboard" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Virtual Cards (NFC)</h1>
            <p className="text-sm text-gray-600 mt-1">Create and manage virtual cards with NFC tags</p>
          </div>
          <Button
            onClick={() => {
              setSelectedCard(null)
              setShowEditModal(true)
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Virtual Card
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Loading virtual cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
            <p className="text-gray-500 mb-4">No virtual cards yet</p>
            <Button
              onClick={() => {
                setSelectedCard(null)
                setShowEditModal(true)
              }}
              variant="outline"
            >
              Create Your First Card
            </Button>
          </div>
        ) : (
          cards.map((card) => (
            <Card key={card.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Card Info */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{card.full_name}</h3>
                  {card.job_title && <p className="text-sm text-gray-600">{card.job_title}</p>}
                  {card.company_name && <p className="text-xs text-gray-500">{card.company_name}</p>}
                </div>

                {/* Contact Info */}
                <div className="text-sm space-y-1">
                  {card.email && (
                    <p className="text-gray-600 truncate">
                      <span className="text-gray-500">Email:</span> {card.email}
                    </p>
                  )}
                  {card.phone && (
                    <p className="text-gray-600">
                      <span className="text-gray-500">Phone:</span> {card.phone}
                    </p>
                  )}
                </div>

                {/* Short Code Display */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Short Code:</p>
                  <p className="font-mono text-sm font-bold text-gray-900">{card.short_code}</p>
                </div>

                {/* Card URL */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Card URL:</p>
                  <p className="font-mono text-xs text-blue-600 break-all truncate">{getCardUrl(card.short_code)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(getCardUrl(card.short_code))}
                    className="flex-1 gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">Copy Link</span>
                    <span className="sm:hidden">Copy</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShowQR(card)}
                    className="flex-1 gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span className="hidden sm:inline">QR Code</span>
                    <span className="sm:hidden">QR</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCard(card)
                      setShowEditModal(true)
                    }}
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCard(card.id)}
                    className="flex-1 gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCard ? "Edit Virtual Card" : "Create Virtual Card"}
            </DialogTitle>
          </DialogHeader>
          <EditVirtualCardForm
            card={selectedCard}
            onSuccess={() => {
              setShowEditModal(false)
              loadCards()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={!!showQRModal} onOpenChange={() => setShowQRModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Virtual Card QR Code</DialogTitle>
          </DialogHeader>
          {selectedCard && qrUrl && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg flex justify-center">
                <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{selectedCard.full_name}</p>
                <p className="text-xs text-gray-500 break-all">{getCardUrl(selectedCard.short_code)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(getCardUrl(selectedCard.short_code))}
                  className="flex-1 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </Button>
                <Button
                  onClick={downloadQR}
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
