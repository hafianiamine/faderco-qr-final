import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  const { shortCode } = params

  const supabase = await createClient()

  // Get the proper base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  console.log("[v0] Redirect base URL:", baseUrl)

  try {
    // First try to find in qr_codes table
    const { data: qrCode, error: queryError } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("short_code", shortCode)
      .single()

    if (qrCode && !queryError) {
      // Found in qr_codes table - continue with existing QR code logic
      let qrCodeData = qrCode

      // Geofencing validation before other checks
      if (qrCodeData.geofence_enabled && qrCodeData.geofence_latitude && qrCodeData.geofence_longitude && qrCodeData.geofence_radius) {
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Location Verification</title>
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
                .emoji {
                  font-size: 4rem;
                  margin: 0 0 1rem 0;
                }
                h1 {
                  font-size: 2rem;
                  margin: 0 0 1rem 0;
                }
                p {
                  font-size: 1.1rem;
                  opacity: 0.9;
                  line-height: 1.6;
                  margin-bottom: 1.5rem;
                }
                .spinner {
                  border: 4px solid rgba(255, 255, 255, 0.3);
                  border-radius: 50%;
                  border-top: 4px solid white;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  margin: 20px auto;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                .error {
                  background: rgba(255, 0, 0, 0.2);
                  padding: 15px;
                  border-radius: 8px;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="emoji">📍</div>
                <h1>Verifying Your Location</h1>
                <p>This QR code requires location verification to ensure you're in the allowed area.</p>
                <div class="spinner"></div>
                <p id="status">Requesting location access...</p>
              </div>
              <script>
                const targetLat = ${qrCodeData.geofence_latitude};
                const targetLng = ${qrCodeData.geofence_longitude};
                const allowedRadius = ${qrCodeData.geofence_radius};
                const destinationUrl = "${qrCodeData.destination_url}";

                function calculateDistance(lat1, lon1, lat2, lon2) {
                  const R = 6371e3;
                  const φ1 = lat1 * Math.PI / 180;
                  const φ2 = lat2 * Math.PI / 180;
                  const Δφ = (lat2 - lat1) * Math.PI / 180;
                  const Δλ = (lon2 - lon1) * Math.PI / 180;

                  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                          Math.cos(φ1) * Math.cos(φ2) *
                          Math.sin(Δλ/2) * Math.sin(Δλ/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                  return R * c;
                }

                if ("geolocation" in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const userLat = position.coords.latitude;
                      const userLng = position.coords.longitude;
                      const distance = calculateDistance(userLat, userLng, targetLat, targetLng);

                      if (distance <= allowedRadius) {
                        document.getElementById("status").textContent = "✓ Location verified! Redirecting...";
                        setTimeout(() => {
                          window.location.href = destinationUrl;
                        }, 1000);
                      } else {
                        const distanceKm = (distance / 1000).toFixed(1);
                        const allowedKm = (allowedRadius / 1000).toFixed(1);
                        document.querySelector(".container").innerHTML = \`
                          <div class="emoji">🚫</div>
                          <h1>Location Not Allowed</h1>
                          <p>This QR code can only be accessed within \${allowedKm} km of the designated location.</p>
                          <p>You are currently \${distanceKm} km away.</p>
                          <div class="error">
                            <p style="margin: 0; font-size: 0.9rem;">Please move closer to the allowed area to access this content.</p>
                          </div>
                        \`;
                      }
                    },
                    (error) => {
                      document.querySelector(".container").innerHTML = \`
                        <div class="emoji">⚠️</div>
                        <h1>Location Access Required</h1>
                        <p>This QR code requires location access to verify you're in the allowed area.</p>
                        <div class="error">
                          <p style="margin: 0; font-size: 0.9rem;">Please enable location services and refresh the page.</p>
                        </div>
                      \`;
                    }
                  );
                } else {
                  document.querySelector(".container").innerHTML = \`
                    <div class="emoji">⚠️</div>
                    <h1>Location Not Supported</h1>
                    <p>Your browser doesn't support location services.</p>
                    <div class="error">
                      <p style="margin: 0; font-size: 0.9rem;">Please use a modern browser with location support.</p>
                    </div>
                  \`;
                }
              </script>
            </body>
          </html>
          `,
          {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          },
        )
      }

      if (qrCodeData.status === "deleted") {
        return new NextResponse("QR Code Deleted", { status: 410 })
      }

      if (!qrCodeData.is_active || qrCodeData.status === "inactive") {
        return new NextResponse("QR Code Inactive", { status: 403 })
      }

      // Track scan and redirect for regular QR codes
      try {
        const { error: updateError } = await supabase
          .from("qr_codes")
          .update({ scans_used: (qrCodeData.scans_used || 0) + 1 })
          .eq("id", qrCodeData.id)
      } catch (trackError) {
        console.error("Scan tracking error:", trackError)
      }

      // Check if this is a business card
      if (qrCodeData.type === "business_card" && qrCodeData.business_card_id) {
        return NextResponse.redirect(
          new URL(`/business-card/${qrCodeData.business_card_id}`, baseUrl).toString(),
          { status: 307 }
        )
      }

      if (qrCodeData.destination_url) {
        return NextResponse.redirect(qrCodeData.destination_url, { status: 307 })
      }

      return new NextResponse("Invalid QR Code", { status: 404 })
    }

    // Not in qr_codes table - try virtual_business_cards table
    const { data: virtualCard, error: virtualCardError } = await supabase
      .from("virtual_business_cards")
      .select("*")
      .eq("short_code", shortCode)
      .single()

    if (virtualCard && !virtualCardError) {
      // Found a virtual business card - redirect to its display page
      return NextResponse.redirect(
        new URL(`/business-card/${virtualCard.id}`, baseUrl).toString(),
        { status: 307 }
      )
    }

    // Not found in either table
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
  } catch (error) {
    console.error("Redirect error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
