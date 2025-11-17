import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the user's IP from the request headers
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const userIp = forwarded?.split(",")[0] || realIp || "Unknown"

    // Fetch location data from ipapi.co
    const response = await fetch(`https://ipapi.co/${userIp}/json/`, {
      headers: {
        "User-Agent": "FADERCO-QR-Platform",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch location")
    }

    const data = await response.json()

    return NextResponse.json({
      city: data.city || "Unknown",
      country: data.country_name || "Unknown",
      countryCode: data.country_code || "XX",
      timezone: data.timezone || "UTC",
      ip: data.ip || userIp,
      region: data.region || "Unknown",
      latitude: data.latitude || null,
      longitude: data.longitude || null,
    })
  } catch (error) {
    console.error("Location API error:", error)

    // Fallback to a different API
    try {
      const fallbackResponse = await fetch("https://ip-api.com/json/")
      const fallbackData = await fallbackResponse.json()

      return NextResponse.json({
        city: fallbackData.city || "Unknown",
        country: fallbackData.country || "Unknown",
        countryCode: fallbackData.countryCode || "XX",
        timezone: fallbackData.timezone || "UTC",
        ip: fallbackData.query || "Unknown",
        region: fallbackData.regionName || "Unknown",
        latitude: fallbackData.lat || null,
        longitude: fallbackData.lon || null,
      })
    } catch (fallbackError) {
      console.error("Fallback location API error:", fallbackError)

      return NextResponse.json({
        city: "Unknown",
        country: "Unknown",
        countryCode: "XX",
        timezone: "UTC",
        ip: "Unknown",
        region: "Unknown",
        latitude: null,
        longitude: null,
      })
    }
  }
}
