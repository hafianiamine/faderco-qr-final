"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { generateShortCode } from "@/lib/utils/url-shortener"

interface VirtualCard {
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  job_title: string | null
  website: string | null
  vcard_data: string
}

interface EditVirtualCardFormProps {
  card: VirtualCard | null
  onSuccess: () => void
}

export function EditVirtualCardForm({ card, onSuccess }: EditVirtualCardFormProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [website, setWebsite] = useState("")

  useEffect(() => {
    if (card) {
      setFullName(card.full_name || "")
      setEmail(card.email || "")
      setPhone(card.phone || "")
      setCompany(card.company_name || "")
      setJobTitle(card.job_title || "")
      setWebsite(card.website || "")
    }
  }, [card])

  async function generateVCard() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${fullName}
EMAIL:${email}
${phone ? `TEL:${phone}` : ""}
${jobTitle ? `TITLE:${jobTitle}` : ""}
${company ? `ORG:${company}` : ""}
${website ? `URL:${website}` : ""}
END:VCARD`
    return vcard
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Error", description: "Full name and email are required" })
      return
    }

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({ title: "Error", description: "User not authenticated" })
        return
      }

      const vcardData = await generateVCard()

      if (card) {
        // Update existing card
        const { error } = await supabase
          .from("virtual_business_cards")
          .update({
            full_name: fullName,
            email,
            phone: phone || null,
            company_name: company || null,
            job_title: jobTitle || null,
            website: website || null,
            vcard_data: vcardData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", card.id)
          .eq("user_id", user.id)

        if (error) throw error
        toast({ title: "Success", description: "Virtual card updated" })
      } else {
        // Create new card
        const shortCode = generateShortCode()

        const { error } = await supabase
          .from("virtual_business_cards")
          .insert({
            user_id: user.id,
            full_name: fullName,
            email,
            phone: phone || null,
            company_name: company || null,
            job_title: jobTitle || null,
            website: website || null,
            vcard_data: vcardData,
            short_code: shortCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) throw error
        toast({ title: "Success", description: "Virtual card created" })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving card:", error)
      toast({ title: "Error", description: "Failed to save virtual card" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          placeholder="Acme Corp"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          placeholder="CEO"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : card ? "Update Card" : "Create Card"}
      </Button>
    </form>
  )
}
