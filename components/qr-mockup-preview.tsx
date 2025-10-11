"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, FileText, CreditCard, Monitor } from "lucide-react"

interface QRMockupPreviewProps {
  qrImageUrl: string
  title: string
}

type MockupType = "phone" | "poster" | "card" | "desktop"

export function QRMockupPreview({ qrImageUrl, title }: QRMockupPreviewProps) {
  const [selectedMockup, setSelectedMockup] = useState<MockupType>("phone")

  const mockups = [
    { type: "phone" as MockupType, label: "Phone", icon: Smartphone },
    { type: "poster" as MockupType, label: "Poster", icon: FileText },
    { type: "card" as MockupType, label: "Business Card", icon: CreditCard },
    { type: "desktop" as MockupType, label: "Desktop", icon: Monitor },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Preview in Context</h3>
            <p className="text-sm text-muted-foreground">See how your QR code looks in different formats</p>
          </div>

          {/* Mockup Type Selector */}
          <div className="flex flex-wrap gap-2">
            {mockups.map((mockup) => {
              const Icon = mockup.icon
              return (
                <Button
                  key={mockup.type}
                  variant={selectedMockup === mockup.type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMockup(mockup.type)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {mockup.label}
                </Button>
              )
            })}
          </div>

          {/* Mockup Display */}
          <div className="relative min-h-[400px] flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted rounded-lg p-8">
            {selectedMockup === "phone" && (
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-6">
                    <div className="text-center space-y-4">
                      <div className="text-sm font-medium text-gray-900">Scan to visit</div>
                      <Image
                        src={qrImageUrl || "/placeholder.svg"}
                        alt={title}
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                      <div className="text-xs text-gray-500">{title}</div>
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
                </div>
              </div>
            )}

            {selectedMockup === "poster" && (
              <div className="relative">
                {/* Poster Frame */}
                <div className="w-[320px] h-[450px] bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center justify-between">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-600">Scan the QR code below</p>
                  </div>
                  <Image
                    src={qrImageUrl || "/placeholder.svg"}
                    alt={title}
                    width={220}
                    height={220}
                    className="rounded-lg"
                  />
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Powered by FADERCO QR</p>
                  </div>
                </div>
              </div>
            )}

            {selectedMockup === "card" && (
              <div className="relative">
                {/* Business Card */}
                <div className="w-[400px] h-[240px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 flex items-center justify-between">
                  <div className="flex-1 text-white space-y-2">
                    <h3 className="text-xl font-bold">FADERCO</h3>
                    <p className="text-sm opacity-90">{title}</p>
                    <div className="text-xs opacity-75 space-y-1">
                      <p>contact@faderco.com</p>
                      <p>+213 XXX XXX XXX</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <Image
                      src={qrImageUrl || "/placeholder.svg"}
                      alt={title}
                      width={120}
                      height={120}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMockup === "desktop" && (
              <div className="relative">
                {/* Desktop Monitor */}
                <div className="relative">
                  <div className="w-[500px] h-[320px] bg-gray-900 rounded-t-xl border-8 border-gray-900 shadow-2xl">
                    <div className="w-full h-full bg-white flex items-center justify-center p-8">
                      <div className="text-center space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                        <Image
                          src={qrImageUrl || "/placeholder.svg"}
                          alt={title}
                          width={180}
                          height={180}
                          className="rounded-lg mx-auto"
                        />
                        <p className="text-sm text-gray-600">Scan with your mobile device</p>
                      </div>
                    </div>
                  </div>
                  {/* Monitor Stand */}
                  <div className="w-32 h-4 bg-gray-700 mx-auto rounded-b-lg" />
                  <div className="w-48 h-2 bg-gray-800 mx-auto rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
