"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Edit2, Trash2, Plus, Copy, Download, ExternalLink, Upload, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateQRCode } from "@/lib/utils/qr-generator"
import { useToast } from "@/hooks/use-toast"
import { createVirtualCard, updateVirtualCard, deleteVirtualCard } from "@/app/actions/virtual-card-actions"

interface VirtualCard {
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  job_title: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  facebook: string | null
  instagram: string | null
  photo_url: string | null
  vcard_data: string
  short_code: string
  created_at: string
}

export function UserNFSSection() {
  const supabase = createClient()
  const { toast } = useToast()
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<VirtualCard | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [twitter, setTwitter] = useState("")
  const [facebook, setFacebook] = useState("")
  const [instagram, setInstagram] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)

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

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 2MB" })
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoRef.current) photoRef.current.value = ""
  }

  async function generateVCard(fullNameVal: string, emailVal: string, phoneVal?: string, companyVal?: string, jobTitleVal?: string, websiteVal?: string, linkedinVal?: string, twitterVal?: string, facebookVal?: string, instagramVal?: string) {
    let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${fullNameVal}
EMAIL:${emailVal}
${phoneVal ? `TEL:${phoneVal}\n` : ""}${jobTitleVal ? `TITLE:${jobTitleVal}\n` : ""}${companyVal ? `ORG:${companyVal}\n` : ""}${websiteVal ? `URL:${websiteVal}\n` : ""}${linkedinVal ? `X-LINKEDIN:${linkedinVal}\n` : ""}${twitterVal ? `X-TWITTER:${twitterVal}\n` : ""}${facebookVal ? `X-FACEBOOK:${facebookVal}\n` : ""}${instagramVal ? `X-INSTAGRAM:${instagramVal}\n` : ""}END:VCARD`
    return vcard
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Error", description: "Full name and email are required" })
      return
    }

    try {
      setIsSubmitting(true)
      
      let photoBase64: string | undefined = undefined
      if (photoFile) {
        const reader = new FileReader()
        photoBase64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string
            resolve(base64.split(",")[1])
          }
          reader.readAsDataURL(photoFile)
        })
      }

      const cardData = {
        fullName,
        email,
        phone: phone || undefined,
        company: company || undefined,
        jobTitle: jobTitle || undefined,
        website: website || undefined,
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        facebook: facebook || undefined,
        instagram: instagram || undefined,
      }

      if (editingCard) {
        const result = await updateVirtualCard(editingCard.id, cardData, photoBase64)
        if (result.error) {
          toast({ title: "Error", description: result.error })
          return
        }
        toast({ title: "Success", description: "Virtual card updated" })
      } else {
        const result = await createVirtualCard(cardData, photoBase64)
        if (result.error) {
          toast({ title: "Error", description: result.error })
          return
        }
        toast({ title: "Success", description: "Virtual card created" })
      }

      resetForm()
      setShowEditModal(false)
      loadCards()
    } catch (error) {
      console.error("Error saving card:", error)
      toast({ title: "Error", description: "Failed to save virtual card" })
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setEditingCard(null)
    setFullName("")
    setEmail("")
    setPhone("")
    setCompany("")
    setJobTitle("")
    setWebsite("")
    setLinkedin("")
    setTwitter("")
    setFacebook("")
    setInstagram("")
    removePhoto()
  }

  function openEditModal(card?: VirtualCard) {
    if (card) {
      setEditingCard(card)
      setFullName(card.full_name)
      setEmail(card.email)
      setPhone(card.phone || "")
      setCompany(card.company_name || "")
      setJobTitle(card.job_title || "")
      setWebsite(card.website || "")
      setLinkedin(card.linkedin || "")
      setTwitter(card.twitter || "")
      setFacebook(card.facebook || "")
      setInstagram(card.instagram || "")
      if (card.photo_url) setPhotoPreview(card.photo_url)
    } else {
      resetForm()
    }
    setShowEditModal(true)
  }

  async function handleShowQR(card: VirtualCard) {
    try {
      // Build the redirect URL using the short code
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
    // Use the short code redirect URL
    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://fadercoqr.com"
    const url = `${appUrl}/api/redirect/${card.short_code}`
    navigator.clipboard.writeText(url)
    toast({ title: "Success", description: "Link copied to clipboard" })
  }

  async function downloadQR(card: VirtualCard) {
    try {
      // Use the short code redirect URL
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
            <p className="text-sm text-gray-600">Create and manage your NFC virtual cards</p>
          </div>
          <Button onClick={() => openEditModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Card
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="rounded-2xl border border-gray-200 bg-white/10 p-8 text-center shadow-lg backdrop-blur-xl">
          <div className="text-5xl mb-4">📇</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No virtual cards yet</h3>
          <p className="text-gray-600 mb-4">Create your first NFC virtual card to get started</p>
          <Button onClick={() => openEditModal()}>Create Your First Card</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{card.full_name}</h3>
                  <p className="text-sm text-gray-600">{card.job_title || "NFC Card"}</p>
                </div>
              </div>

              {card.photo_url && (
                <img src={card.photo_url} alt={card.full_name} className="w-full h-32 object-cover rounded-lg mb-4" />
              )}

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>{card.email}</p>
                {card.phone && <p>{card.phone}</p>}
                {card.company_name && <p>{card.company_name}</p>}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleShowQR(card)} className="flex-1">
                  <QrCode className="h-4 w-4 mr-1" />
                  QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(card)} className="flex-1">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEditModal(card)} className="flex-1">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
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

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Edit Virtual Card" : "Create Virtual Card"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="bg-white/30 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="bg-white/30 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photo (Optional)</Label>
              <div className="flex gap-2">
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => photoRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {photoFile ? "Change Photo" : "Upload Photo"}
                </Button>
                {photoPreview && (
                  <Button type="button" variant="ghost" size="icon" onClick={removePhoto}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white/30 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc"
                  className="bg-white/30 border-gray-200"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="CEO"
                  className="bg-white/30 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-white/30 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-gray-200 bg-white/20 p-4">
              <h4 className="font-semibold text-gray-900">Social Media (Optional)</h4>
              <div className="space-y-3">
                <Input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="bg-white/30 border-gray-200"
                />
                <Input
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter/X URL"
                  className="bg-white/30 border-gray-200"
                />
                <Input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook URL"
                  className="bg-white/30 border-gray-200"
                />
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram URL"
                  className="bg-white/30 border-gray-200"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingCard ? "Update Card" : "Create Card"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showQRModal !== null} onOpenChange={() => setShowQRModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Virtual Card QR Code</DialogTitle>
          </DialogHeader>
          {qrUrl && (
            <div className="flex flex-col items-center gap-4">
              <img src={qrUrl} alt="QR Code" className="w-64 h-64 rounded-lg" />
              <Button onClick={() => downloadQR(cards.find(c => c.id === showQRModal) || cards[0])} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
