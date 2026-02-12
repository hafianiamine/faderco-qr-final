"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Plus, Edit2, Trash2, QrCode as QrCodeIcon, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface VirtualBusinessCard {
  id: string
  full_name: string
  job_title: string | null
  company_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  vcard_data: string
  created_at: string
}

interface QRCode {
  id: string
  business_card_id: string
  short_code: string
  short_url: string
  qr_image_url: string
}

export function UserBusinessCardsSection() {
  const [businessCards, setBusinessCards] = useState<VirtualBusinessCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCardForQR, setSelectedCardForQR] = useState<VirtualBusinessCard | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCode, setQrCode] = useState<QRCode | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)

  useEffect(() => {
    loadBusinessCards()
  }, [])

  async function loadBusinessCards() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("virtual_business_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to load business cards")
        return
      }

      setBusinessCards(data || [])
    } catch (error) {
      console.error("Error loading business cards:", error)
      toast.error("Error loading business cards")
    } finally {
      setLoading(false)
    }
  }

  async function generateQRForCard(card: VirtualBusinessCard) {
    try {
      setGeneratingQR(true)
      setSelectedCardForQR(card)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("User not authenticated")
        return
      }

      // Check if QR already exists for this card
      const { data: existingQR } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("business_card_id", card.id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (existingQR) {
        setQrCode(existingQR as QRCode)
        setShowQRModal(true)
        return
      }

      // Create new QR code for business card
      const response = await fetch("/api/create-business-card-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessCardId: card.id,
          vCardData: card.vcard_data,
          title: `${card.full_name}'s Business Card`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || "Failed to generate QR code")
        return
      }

      const newQR = await response.json()
      setQrCode(newQR)
      setShowQRModal(true)
      toast.success("QR code generated successfully")
    } catch (error) {
      console.error("Error generating QR:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setGeneratingQR(false)
    }
  }

  async function deleteBusinessCard(id: string) {
    if (!confirm("Are you sure you want to delete this business card?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("virtual_business_cards")
        .delete()
        .eq("id", id)

      if (error) {
        toast.error("Failed to delete business card")
        return
      }

      setBusinessCards(businessCards.filter(card => card.id !== id))
      toast.success("Business card deleted")
    } catch (error) {
      console.error("Error deleting business card:", error)
      toast.error("Error deleting business card")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Virtual Business Cards</h2>
          <p className="text-sm text-muted-foreground">Manage your digital business cards and generate QR codes</p>
        </div>
        <Link href="/dashboard?tab=create-card">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Card
          </Button>
        </Link>
      </div>

      {businessCards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-muted p-4">
              <QrCodeIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Business Cards Yet</h3>
          <p className="text-muted-foreground mb-6">Create your first virtual business card to get started</p>
          <Link href="/dashboard?tab=create-card">
            <Button>Create Your First Card</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {businessCards.map((card) => (
            <Card key={card.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">{card.full_name}</h3>
                {card.job_title && <p className="text-sm text-muted-foreground">{card.job_title}</p>}
                {card.company_name && <p className="text-sm text-muted-foreground">{card.company_name}</p>}
              </div>

              {card.email && (
                <p className="text-xs text-muted-foreground truncate">
                  <span className="font-medium">Email:</span> {card.email}
                </p>
              )}
              {card.phone && (
                <p className="text-xs text-muted-foreground truncate">
                  <span className="font-medium">Phone:</span> {card.phone}
                </p>
              )}

              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => generateQRForCard(card)}
                  disabled={generatingQR && selectedCardForQR?.id === card.id}
                >
                  {generatingQR && selectedCardForQR?.id === card.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <QrCodeIcon className="h-4 w-4" />
                  )}
                  QR Code
                </Button>
                <Link href={`/business-card/${card.id}`}>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteBusinessCard(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showQRModal && qrCode && selectedCardForQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">QR Code for {selectedCardForQR.full_name}</h3>
            </div>
            <div className="bg-white p-4 rounded-lg flex justify-center mb-6">
              <img 
                src={qrCode.qr_image_url} 
                alt="QR Code" 
                className="h-64 w-64"
              />
            </div>
            <div className="text-sm text-muted-foreground text-center mb-6">
              <p>Short URL: {qrCode.short_url}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowQRModal(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = qrCode.qr_image_url
                  link.download = `${selectedCardForQR.full_name}-qr.png`
                  link.click()
                }}
              >
                Download
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
