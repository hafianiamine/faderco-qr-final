"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedEmail, setImpersonatedEmail] = useState("")

  useEffect(() => {
    const impersonatingUserId = sessionStorage.getItem("impersonating_user_id")
    if (impersonatingUserId) {
      setIsImpersonating(true)
      loadImpersonatedUserEmail(impersonatingUserId)
    }
  }, [])

  async function loadImpersonatedUserEmail(userId: string) {
    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("email").eq("id", userId).single()
    if (data) {
      setImpersonatedEmail(data.email)
    }
  }

  async function handleReturnToAdmin() {
    // Clear impersonation data
    sessionStorage.removeItem("impersonating_user_id")
    sessionStorage.removeItem("original_admin_id")

    // Redirect to admin dashboard
    window.location.href = "/admin"
  }

  if (!isImpersonating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <span className="font-semibold">Admin Mode:</span>
        <span>Viewing as {impersonatedEmail}</span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleReturnToAdmin}
        className="bg-white text-orange-500 hover:bg-gray-100"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Return to Admin Dashboard
      </Button>
    </div>
  )
}
