import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  const { shortCode } = params

  const supabase = await createClient()

  try {
    const { data: qrCode, error: queryError } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("short_code", shortCode)
      .single()

    if (queryError || !qrCode) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code Not Found</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
              }
              h1 {
                font-size: 3rem;
                margin: 0 0 1rem 0;
              }
              p {
                font-size: 1.2rem;
                opacity: 0.9;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔍</h1>
              <h1>QR Code Not Found</h1>
              <p>This QR code doesn't exist or has been deleted. Please contact the QR code owner.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      )
    }

    if (qrCode.status === "deleted") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code Deleted</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
              }
              h1 {
                font-size: 3rem;
                margin: 0 0 1rem 0;
              }
              p {
                font-size: 1.2rem;
                opacity: 0.9;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🗑️</h1>
              <h1>QR Code Deleted</h1>
              <p>This QR code has been deleted by the owner and is no longer available.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 410,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      )
    }

    if (qrCode.scheduled_start) {
      const startDate = new Date(qrCode.scheduled_start)
      const now = new Date()
      if (now < startDate) {
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code Not Yet Active</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                  color: white;
                  text-align: center;
                  padding: 20px;
                }
                .container {
                  max-width: 500px;
                }
                .emoji {
                  font-size: 4rem;
                  margin: 0 0 1rem 0;
                }
                h1 {
                  font-size: 2.5rem;
                  margin: 0 0 1rem 0;
                }
                p {
                  font-size: 1.2rem;
                  opacity: 0.9;
                  line-height: 1.6;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="emoji">⏰</div>
                <h1>Coming Soon!</h1>
                <p>This QR code is scheduled to become active on ${startDate.toLocaleDateString()}. Please check back later!</p>
              </div>
            </body>
          </html>
          `,
          {
            status: 403,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          },
        )
      }
    }

    if (qrCode.scheduled_end) {
      const endDate = new Date(qrCode.scheduled_end)
      const now = new Date()
      if (now > endDate) {
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Code Expired</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                  color: white;
                  text-align: center;
                  padding: 20px;
                }
                .container {
                  max-width: 500px;
                }
                .emoji {
                  font-size: 4rem;
                  margin: 0 0 1rem 0;
                }
                h1 {
                  font-size: 2.5rem;
                  margin: 0 0 1rem 0;
                }
                p {
                  font-size: 1.2rem;
                  opacity: 0.9;
                  line-height: 1.6;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="emoji">⏱️</div>
                <h1>QR Code Expired</h1>
                <p>This QR code expired on ${endDate.toLocaleDateString()} and is no longer available.</p>
              </div>
            </body>
          </html>
          `,
          {
            status: 410,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          },
        )
      }
    }

    if (qrCode.scan_limit && qrCode.scans_used >= qrCode.scan_limit) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Scan Limit Reached</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
              }
              .emoji {
                font-size: 4rem;
                margin: 0 0 1rem 0;
              }
              h1 {
                font-size: 2.5rem;
                margin: 0 0 1rem 0;
              }
              p {
                font-size: 1.2rem;
                opacity: 0.9;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="emoji">🚫</div>
              <h1>Scan Limit Reached</h1>
              <p>This QR code has reached its maximum number of scans (${qrCode.scan_limit}) and is no longer available.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 403,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      )
    }

    if (!qrCode.is_active || qrCode.status === "inactive") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code Inactive</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
              .container {
                max-width: 500px;
              }
              .emoji {
                font-size: 4rem;
                margin: 0 0 1rem 0;
              }
              h1 {
                font-size: 2.5rem;
                margin: 0 0 1rem 0;
              }
              p {
                font-size: 1.2rem;
                opacity: 0.9;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="emoji">⏸️</div>
              <h1>QR Code Inactive</h1>
              <p>The owner has temporarily deactivated this QR code.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 403,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        },
      )
    }

    try {
      // Track scan details in scans table
      await trackScanAsync(request, qrCode.id)

      // Increment scans_used counter in qr_codes table
      const { error: updateError } = await supabase
        .from("qr_codes")
        .update({ scans_used: (qrCode.scans_used || 0) + 1 })
        .eq("id", qrCode.id)

      if (updateError) {
        // Log error but don't block redirect
        console.error("Failed to update scan count:", updateError)
      }
    } catch (trackError) {
      // Silent fail - don't block redirect
      console.error("Scan tracking error:", trackError)
    }

    return NextResponse.redirect(qrCode.destination_url, { status: 307 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function trackScanAsync(request: NextRequest, qrCodeId: string) {
  try {
    const supabase = await createClient()

    const rawIp = getClientIp(request)
    const ip = rawIp && rawIp !== "unknown" ? rawIp.replace("::ffff:", "").trim() : null

    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || null

    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)
    const os = getOS(userAgent)

    const locationData = ip ? await getLocationData(ip) : { country: null, city: null, latitude: null, longitude: null }

    await supabase.from("scans").insert({
      qr_code_id: qrCodeId,
      country: locationData.country,
      city: locationData.city,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      device_type: deviceType,
      browser: browser,
      os: os,
      referrer: referer,
      ip_address: ip || "unknown",
    })
  } catch (error) {
    // Silent fail
  }
}

function getClientIp(request: NextRequest): string | null {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) {
    const firstIp = xff.split(",")[0].trim()
    if (firstIp && !isLocalIp(firstIp)) {
      return firstIp
    }
  }

  const xr = request.headers.get("x-real-ip")
  if (xr && !isLocalIp(xr)) {
    return xr
  }

  const cf = request.headers.get("cf-connecting-ip")
  if (cf && !isLocalIp(cf)) {
    return cf
  }

  if (request.ip && !isLocalIp(request.ip)) {
    return request.ip
  }

  return null
}

function isLocalIp(ip: string): boolean {
  return (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.3") ||
    ip.startsWith("fc00:") ||
    ip.startsWith("fd00:")
  )
}

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "Mobile"
  if (/tablet|ipad/i.test(userAgent)) return "Tablet"
  return "Desktop"
}

function getBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return "Chrome"
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari"
  if (/firefox/i.test(userAgent)) return "Firefox"
  if (/edg/i.test(userAgent)) return "Edge"
  if (/opera|opr/i.test(userAgent)) return "Opera"
  return "Other"
}

function getOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return "Windows"
  if (/mac/i.test(userAgent)) return "macOS"
  if (/linux/i.test(userAgent)) return "Linux"
  if (/android/i.test(userAgent)) return "Android"
  if (/ios|iphone|ipad/i.test(userAgent)) return "iOS"
  return "Other"
}

async function getLocationData(ip: string): Promise<{
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}> {
  if (!ip || ip === "unknown" || isLocalIp(ip)) {
    return {
      country: null,
      city: null,
      latitude: null,
      longitude: null,
    }
  }

  try {
    const geoUrl = `https://ipapi.co/${encodeURIComponent(ip)}/json/`

    const response = await fetch(geoUrl, {
      headers: {
        "User-Agent": "FADERCO-QR/1.0",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return {
        country: null,
        city: null,
        latitude: null,
        longitude: null,
      }
    }

    const geodata = await response.json()

    return {
      country: geodata.country_name || geodata.country || null,
      city: geodata.city || null,
      latitude: geodata.latitude || null,
      longitude: geodata.longitude || null,
    }
  } catch (error) {
    return {
      country: null,
      city: null,
      latitude: null,
      longitude: null,
    }
  }
}
