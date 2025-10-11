"use client"

import { Button } from "@/components/ui/button"
import { AuthModals } from "@/components/auth-modals"
import { WelcomeBanner } from "@/components/welcome-banner"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function HomePageClient() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [locationData, setLocationData] = useState({ city: "", country: "" })
  const [welcomeSettings, setWelcomeSettings] = useState({
    enabled: true,
    title: "Welcome to Our New Brand Tool",
    description: "Experience the power of FADERCO QR tracking",
  })
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    loadWelcomeSettings()

    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")

    if (searchParams.get("tracked") === "true") {
      // User came from QR code scan - show location data
      const city = searchParams.get("city") || "Unknown"
      const country = searchParams.get("country") || "Unknown"

      setLocationData({ city, country })

      setTimeout(() => {
        setShowWelcome(true)
      }, 500)

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("tracked")
      newUrl.searchParams.delete("city")
      newUrl.searchParams.delete("country")
      newUrl.searchParams.delete("ip")
      window.history.replaceState({}, "", newUrl.toString())
    } else if (!hasSeenWelcome) {
      // First-time visitor - show welcome popup without location data
      setTimeout(() => {
        setShowWelcome(true)
      }, 1000)
    }
  }, [searchParams])

  async function loadWelcomeSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["welcome_popup_enabled", "welcome_popup_title", "welcome_popup_description"])

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value
      })

      setWelcomeSettings({
        enabled: settingsMap.welcome_popup_enabled === "true",
        title: settingsMap.welcome_popup_title || "Welcome to Our New Brand Tool",
        description: settingsMap.welcome_popup_description || "Experience the power of FADERCO QR tracking",
      })
    } catch (error) {
      console.error("[v0] Failed to load welcome settings:", error)
    }
  }

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem("hasSeenWelcome", "true")
  }

  return (
    <>
      <AuthModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />

      {showWelcome && welcomeSettings.enabled && (
        <WelcomeBanner
          city={locationData.city}
          country={locationData.country}
          onClose={handleCloseWelcome}
          onCreateAccount={() => {
            handleCloseWelcome()
            setRegisterOpen(true)
          }}
          title={welcomeSettings.title}
          description={welcomeSettings.description}
        />
      )}

      <nav className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          onClick={() => setLoginOpen(true)}
          className="transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
        >
          Login
        </Button>
        <Button
          onClick={() => setRegisterOpen(true)}
          className="transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
        >
          Get Started
        </Button>
      </nav>
    </>
  )
}
