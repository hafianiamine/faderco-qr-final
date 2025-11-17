"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear authentication cookie
    document.cookie = "authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Redirect to login page
    setTimeout(() => {
      router.push("/login")
    }, 500)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <Skeleton className="h-12 w-48 mb-4" />
      <p className="text-muted-foreground">Logging out...</p>
    </div>
  )
}
