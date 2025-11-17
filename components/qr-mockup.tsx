"use client"
import { useEffect, useState } from "react"
import { Smartphone } from "lucide-react"
import QRCode from "qrcode"

export function QRMockup() {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    const generateQR = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fadercoqr.com"
        const url = `${baseUrl}?scanned=true`
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
        setQrCodeUrl(qrDataUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }
    generateQR()
  }, [])

  return (
    <div className="relative">
      {/* Phone Mockup */}
      <div className="relative mx-auto h-[400px] w-[200px] rounded-[2.5rem] border-8 border-foreground/20 bg-background shadow-2xl md:h-[500px] md:w-[250px]">
        {/* Phone Screen */}
        <div className="flex h-full flex-col items-center justify-center p-6">
          {/* QR Code Container */}
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-white p-2 md:h-40 md:w-40">
              {qrCodeUrl ? (
                <>
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="relative z-10 h-full w-full" />

                  {/* Blue gradient shape inside QR - always present */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-transparent animate-pulse-slow rounded-lg" />

                  {/* Scanning wave effect - white gradient moving down continuously */}
                  <div className="absolute inset-x-0 top-0 z-30 h-1 bg-gradient-to-b from-white via-white/80 to-transparent animate-scan-wave-continuous shadow-lg shadow-white/50" />

                  {/* Secondary subtle wave for depth */}
                  <div className="absolute inset-x-0 top-0 z-30 h-2 bg-gradient-to-b from-blue-300/60 via-blue-200/40 to-transparent animate-scan-wave-continuous-delayed" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground md:text-sm">Scan to visit</p>
        </div>

        {/* Phone Notch */}
        <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground/20" />
      </div>

      {/* Floating Icons */}
      <div className="absolute -right-4 top-10 animate-float-delayed">
        <div className="rounded-full bg-blue-500/20 p-3 backdrop-blur-sm">
          <Smartphone className="h-5 w-5 text-blue-500 md:h-6 md:w-6" />
        </div>
      </div>

      <div className="absolute -left-4 bottom-20 animate-float">
        <div className="rounded-full bg-blue-500/20 p-3 backdrop-blur-sm">
          <svg className="h-5 w-5 text-blue-500 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
