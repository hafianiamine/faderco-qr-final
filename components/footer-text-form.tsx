"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateFooterText } from "@/app/actions/admin-actions"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FooterTextFormProps {
  currentFooterText: string
}

export function FooterTextForm({ currentFooterText }: FooterTextFormProps) {
  const [footerText, setFooterText] = useState(currentFooterText)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      toast.loading("Updating footer text...", { id: "footer-update" })

      const result = await updateFooterText(footerText)

      toast.dismiss("footer-update")

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Footer text updated successfully!")
      }
    } catch (error) {
      toast.dismiss("footer-update")
      toast.error("Failed to update footer text")
      console.error("Error updating footer text:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="footerText">Footer Text</Label>
        <Textarea
          id="footerText"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="© 2025 FADERCO QR. All rights reserved."
          rows={3}
          required
        />
        <p className="text-xs text-muted-foreground">This text will appear at the bottom of all pages</p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Footer Text"
        )}
      </Button>
    </form>
  )
}
