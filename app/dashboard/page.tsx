"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserGlassMenu } from "@/components/user/user-glass-menu"
import { AnimatedBackground } from "@/components/animated-background"
import { UserDashboardSection } from "@/components/user/user-dashboard-section"
import { UserQRCodesSection } from "@/components/user/user-qr-codes-section"
import { UserAnalyticsSection } from "@/components/user/user-analytics-section"
import { UserProfileSection } from "@/components/user/user-profile-section"
import { UserSettingsSection } from "@/components/user/user-settings-section"
import { CreateQRCodeFormInline } from "@/components/create-qr-code-form-inline"
import { UserNFSSection } from "@/components/user/user-nfs-section"
import { FeatureTourModal } from "@/components/feature-tour-modal"
import { ForcePasswordResetModal } from "@/components/force-password-reset-modal"
import { checkPasswordResetRequired } from "@/app/actions/security-actions"

export default function UserDashboardPage() {
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [userEmail, setUserEmail] = useState<string>()
  const [showFeatureTour, setShowFeatureTour] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [tourShownOnce, setTourShownOnce] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email)
        
        // Only show tour once per browser session
        const hasSeenTour = sessionStorage.getItem(`tour-seen-${user.id}`)
        if (!hasSeenTour && !tourShownOnce) {
          setShowFeatureTour(true)
          setTourShownOnce(true)
          sessionStorage.setItem(`tour-seen-${user.id}`, 'true')
        }

        const { required } = await checkPasswordResetRequired()
        setShowPasswordReset(required)
      }
    }
    loadUser()
  }, [tourShownOnce])

  useEffect(() => {
    async function checkReset() {
      const { required } = await checkPasswordResetRequired()
      if (required) {
        setShowPasswordReset(true)
      }
    }
    checkReset()
  }, [currentSection])

  const handleCloseTour = () => {
    setShowFeatureTour(false)
  }

  const handleShowTour = () => {
    setShowFeatureTour(true)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedBackground />

      <UserGlassMenu
        userEmail={userEmail}
        onSectionChange={setCurrentSection}
        currentSection={currentSection}
        onShowFeatureTour={handleShowTour}
      />

      <FeatureTourModal isOpen={showFeatureTour && !showPasswordReset} onClose={handleCloseTour} userName={userEmail} />

      <ForcePasswordResetModal isOpen={showPasswordReset} />

      <div className="relative z-10 ml-0 md:ml-24 min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {currentSection === "dashboard" && <UserDashboardSection />}
          {currentSection === "qr-codes" && <UserQRCodesSection />}
          {currentSection === "analytics" && <UserAnalyticsSection />}
          {currentSection === "profile" && <UserProfileSection />}
          {currentSection === "create" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
                <h1 className="text-3xl font-bold text-gray-900">Create QR Code</h1>
                <p className="text-sm text-gray-600">Generate a new QR code with custom styling</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
                <CreateQRCodeFormInline />
              </div>
            </div>
          )}
          {currentSection === "nfs" && <UserNFSSection />}
        </div>
      </div>
    </div>
  )
}
