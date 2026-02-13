"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

interface GeoLocation {
  country?: string
  city?: string
  latitude?: number
  longitude?: number
}

async function getLocationFromIP(ip: string): Promise<GeoLocation> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country_name,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      }
    }
  } catch (error) {
    console.error("Error fetching location:", error)
  }
  return {}
}

export async function trackCardView(cardId: string) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "0.0.0.0"
    const userAgent = headersList.get("user-agent") || ""
    const referrer = headersList.get("referer") || ""

    // Parse device type from user agent
    let deviceType = "desktop"
    if (/mobile|android|iphone/i.test(userAgent)) deviceType = "mobile"
    else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet"

    // Parse browser from user agent
    let browser = "unknown"
    if (/chrome/i.test(userAgent)) browser = "Chrome"
    else if (/safari/i.test(userAgent)) browser = "Safari"
    else if (/firefox/i.test(userAgent)) browser = "Firefox"
    else if (/edge/i.test(userAgent)) browser = "Edge"

    // Get location data
    const location = await getLocationFromIP(ip)

    // Insert analytics record
    const { error } = await supabase
      .from("card_analytics")
      .insert({
        card_id: cardId,
        event_type: "view",
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        city: location.city,
        device_type: deviceType,
        browser: browser,
      })

    if (error) {
      console.error("Error tracking card view:", error)
    }
  } catch (error) {
    console.error("Exception tracking card view:", error)
  }
}

export async function getCardAnalytics(cardId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("card_analytics")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching analytics:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Exception fetching analytics:", error)
    return null
  }
}
