import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { SiteFooter } from "@/components/site-footer"
import { ImpersonationBanner } from "@/components/impersonation-banner" // Added impersonation banner import

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.email === "admin@fadercoqr.com") {
    redirect("/admin")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !profile) {
    redirect("/auth/pending-approval")
  }

  if (profile.status !== "approved") {
    redirect("/auth/pending-approval")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ImpersonationBanner />
      <DashboardNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
