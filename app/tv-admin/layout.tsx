"use client"

import type React from "react"
import { TVAdminSidebar } from "@/components/tv-admin/tv-admin-sidebar"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { createClient } from "@/lib/supabase-client"
import { PageLoader } from "@/components/ui/loader"

export default function TVAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="flex h-screen bg-white">
      <TVAdminSidebar />
      <main className="flex-1 overflow-auto bg-white">
        {children}
      </main>
    </div>
  )
}
