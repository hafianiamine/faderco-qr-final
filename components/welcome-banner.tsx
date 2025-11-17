"use client"

import { MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WelcomeBannerProps {
  city: string
  country: string
  onClose: () => void
  onCreateAccount: () => void
  title?: string
  description?: string
}

export function WelcomeBanner({
  city,
  country,
  onClose,
  onCreateAccount,
  title = "Welcome to Our New Brand Tool",
  description = "Experience the power of FADERCO QR tracking",
}: WelcomeBannerProps) {
  const getCountryFlag = (countryName: string) => {
    const countryToCode: Record<string, string> = {
      Algeria: "DZ",
      France: "FR",
      "United States": "US",
      "United Kingdom": "GB",
      Germany: "DE",
      Spain: "ES",
      Italy: "IT",
      Canada: "CA",
      Australia: "AU",
      Japan: "JP",
      China: "CN",
      India: "IN",
      Brazil: "BR",
      Mexico: "MX",
      Russia: "RU",
    }

    const code = countryToCode[countryName]
    if (!code) return "🌍"

    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const isTrackedVisitor = city !== "Unknown" || country !== "Unknown"
  const locationText =
    city !== "Unknown" && country !== "Unknown" ? `${city}, ${country}` : country !== "Unknown" ? country : ""

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
      <div className="relative w-full max-w-md animate-slide-down pointer-events-auto">
        <div className="relative rounded-xl border border-border bg-card/95 backdrop-blur-lg p-4 shadow-2xl">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-3 pr-8">
            <div className="rounded-full bg-blue-500/10 p-2 flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1">
                {title}
                {isTrackedVisitor && (
                  <>
                    {" "}
                    — user from {locationText} {country !== "Unknown" && getCountryFlag(country)}
                  </>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{description}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={onCreateAccount} className="flex-1">
                  Create an account
                </Button>
                <Button size="sm" variant="outline" onClick={onClose}>
                  Dismiss
                </Button>
              </div>
              {isTrackedVisitor && (
                <p className="text-xs text-muted-foreground mt-2">
                  We use IP-based location for analytics only —{" "}
                  <a href="#" className="underline hover:text-foreground">
                    Privacy
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
