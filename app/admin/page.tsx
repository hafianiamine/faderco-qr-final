"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CircularGlassMenu } from "@/components/circular-glass-menu"
import { AnimatedBackground } from "@/components/animated-background"
import { DashboardSection } from "@/components/admin/dashboard-section"
import { UsersSection } from "@/components/admin/users-section"
import { AnalyticsSection } from "@/components/admin/analytics-section"
import { CompaniesSection } from "@/components/admin/companies-section"
import { ProfileSection } from "@/components/admin/profile-section"
import { SettingsSection } from "@/components/admin/settings-section"
import { PendingAccountsSection } from "@/components/admin/pending-accounts-section"
import { AllQRCodesSection } from "@/components/admin/all-qr-codes-section"

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [userEmail, setUserEmail] = useState<string>()
  const [userRole, setUserRole] = useState<string>()

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email)
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        setUserRole(profile?.role || "user")
      }
    }
    loadUser()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedBackground />

      <CircularGlassMenu
        userEmail={userEmail}
        userRole={userRole}
        onSectionChange={setCurrentSection}
        currentSection={currentSection}
      />

      <div className="relative z-10 ml-24 min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          {currentSection === "dashboard" && <DashboardSection />}
          {currentSection === "pending" && <PendingAccountsSection />}
          {currentSection === "users" && <UsersSection />}
          {currentSection === "all-qr-codes" && <AllQRCodesSection />}
          {currentSection === "analytics" && <AnalyticsSection />}
          {currentSection === "companies" && <CompaniesSection />}
          {currentSection === "profile" && <ProfileSection />}
          {currentSection === "settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  )
}
