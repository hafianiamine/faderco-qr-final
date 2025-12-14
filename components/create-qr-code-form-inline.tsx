"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createQRCode } from "@/app/actions/qr-actions"
import { Loader2, Upload, X, Download, QrCode, FileText, Wifi } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { generateQRCode } from "@/lib/utils/qr-generator"
import { addLogoToQRClient } from "@/lib/utils/qr-generator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { LocationPicker } from "@/components/location-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CreateQRCodeFormInlineProps {
  onSuccess?: () => void
}

export function CreateQRCodeFormInline({ onSuccess }: CreateQRCodeFormInlineProps) {
  const [activeTab, setActiveTab] = useState("standard")
  const [title, setTitle] = useState("")
  const [destinationUrl, setDestinationUrl] = useState("")
  const [colorDark, setColorDark] = useState("#000000")
  const [colorLight, setColorLight] = useState("#FFFFFF")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(12)
  const [logoOutlineColor, setLogoOutlineColor] = useState("#FFFFFF")
  const [scanLimit, setScanLimit] = useState<number | undefined>(undefined)
  const [scheduledStart, setScheduledStart] = useState("")
  const [scheduledEnd, setScheduledEnd] = useState("")
  const [geofenceEnabled, setGeofenceEnabled] = useState(false)
  const [geofenceLatitude, setGeofenceLatitude] = useState<number | null>(null)
  const [geofenceLongitude, setGeofenceLongitude] = useState<number | null>(null)
  const [geofenceRadius, setGeofenceRadius] = useState(1000)
  const [isLoading, setIsLoading] = useState(false)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const generatePreview = async () => {
      if (!destinationUrl) {
        setQrPreview(null)
        return
      }

      try {
        const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/redirect/PREVIEW`

        const baseQr = await generateQRCode(previewUrl, {
          color: {
            dark: colorDark,
            light: colorLight,
          },
        })

        if (logoPreview && typeof window !== "undefined") {
          const qrWithLogo = await addLogoToQRClient(baseQr, logoPreview, 512, logoSize, logoOutlineColor)
          setQrPreview(qrWithLogo)
        } else {
          setQrPreview(baseQr)
        }
      } catch (err) {
        console.error("Error generating preview:", err)
      }
    }

    const debounce = setTimeout(generatePreview, 300)
    return () => clearTimeout(debounce)
  }, [destinationUrl, colorDark, colorLight, logoPreview, logoSize, logoOutlineColor])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size must be less than 2MB")
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (geofenceEnabled && (!geofenceLatitude || !geofenceLongitude)) {
      toast.error("Please set a location for geofencing")
      setIsLoading(false)
      return
    }

    try {
      toast.loading("Generating your QR code...", { id: "qr-generation" })

      const result = await createQRCode(title, destinationUrl, {
        colorDark,
        colorLight,
        logoUrl: logoPreview || undefined,
        logoSize,
        logoOutlineColor,
        scanLimit: scanLimit || undefined,
        scheduledStart: scheduledStart || undefined,
        scheduledEnd: scheduledEnd || undefined,
        geofenceEnabled,
        geofenceLatitude: geofenceLatitude || undefined,
        geofenceLongitude: geofenceLongitude || undefined,
        geofenceRadius,
      })

      toast.dismiss("qr-generation")

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result.qrCodeId) {
        toast.success("QR Code Created Successfully!")
        setTitle("")
        setDestinationUrl("")
        setColorDark("#000000")
        setColorLight("#FFFFFF")
        setLogoSize(12)
        setLogoOutlineColor("#FFFFFF")
        setScanLimit(undefined)
        setScheduledStart("")
        setScheduledEnd("")
        setGeofenceEnabled(false)
        setGeofenceLatitude(null)
        setGeofenceLongitude(null)
        setGeofenceRadius(1000)
        removeLogo()
        onSuccess?.()
      }
    } catch (err) {
      toast.dismiss("qr-generation")
      setError("An unexpected error occurred")
      toast.error("Failed to create QR code")
      console.error("Error creating QR code:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPreview = () => {
    if (!qrPreview) {
      toast.error("No QR code to download")
      return
    }

    const link = document.createElement("a")
    link.download = `${title || "qr-code"}-preview.png`
    link.href = qrPreview
    link.click()
    toast.success("QR code downloaded!")
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="standard" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          Standard QR
        </TabsTrigger>
        <TabsTrigger value="forms" disabled className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Forms
          <span className="ml-1 rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-600">
            Coming Soon
          </span>
        </TabsTrigger>
        <TabsTrigger value="special" disabled className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          WiFi & Business Cards
          <span className="ml-1 rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-600">
            Coming Soon
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="standard" className="mt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-900">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="My Campaign QR Code"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-white/30 border-gray-200"
              />
              <p className="text-xs text-gray-600">A descriptive name for your QR code</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationUrl" className="text-gray-900">
                Destination URL
              </Label>
              <Input
                id="destinationUrl"
                type="url"
                placeholder="https://example.com/landing-page"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                required
                className="bg-white/30 border-gray-200"
              />
              <p className="text-xs text-gray-600">The URL where users will be redirected when they scan the QR code</p>
            </div>

            <div className="space-y-4 rounded-lg border border-gray-200 bg-white/20 p-4 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-900">Customize QR Code</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="colorDark" className="text-gray-900">
                    Foreground Color
                  </Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start bg-white/30 border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border" style={{ backgroundColor: colorDark }} />
                            <span className="text-sm text-gray-900">{colorDark}</span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          <Label>Choose Color</Label>
                          <Input
                            type="color"
                            value={colorDark}
                            onChange={(e) => setColorDark(e.target.value)}
                            className="h-10 w-full"
                          />
                          <Input
                            type="text"
                            value={colorDark}
                            onChange={(e) => setColorDark(e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorLight" className="text-gray-900">
                    Background Color
                  </Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start bg-white/30 border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border" style={{ backgroundColor: colorLight }} />
                            <span className="text-sm text-gray-900">{colorLight}</span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          <Label>Choose Color</Label>
                          <Input
                            type="color"
                            value={colorLight}
                            onChange={(e) => setColorLight(e.target.value)}
                            className="h-10 w-full"
                          />
                          <Input
                            type="text"
                            value={colorLight}
                            onChange={(e) => setColorLight(e.target.value)}
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900">Logo (Optional)</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-white/30 border-gray-200"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoFile ? "Change Logo" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button type="button" variant="ghost" size="icon" onClick={removeLogo}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {logoPreview && (
                  <div className="flex items-center gap-2 rounded border border-gray-200 bg-white/20 p-2">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      className="h-12 w-12 rounded object-contain"
                    />
                    <span className="text-xs text-gray-600">{logoFile?.name}</span>
                  </div>
                )}
                <p className="text-xs text-gray-600">Add a logo to the center of your QR code (max 2MB)</p>
              </div>

              {logoPreview && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-900">Logo Size: {logoSize}%</Label>
                    <Slider
                      value={[logoSize]}
                      onValueChange={(value) => setLogoSize(value[0])}
                      min={5}
                      max={25}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600">Adjust the size of the logo in the QR code</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoOutlineColor" className="text-gray-900">
                      Logo Outline Color
                    </Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start bg-white/30 border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded border" style={{ backgroundColor: logoOutlineColor }} />
                              <span className="text-sm text-gray-900">{logoOutlineColor}</span>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-2">
                            <Label>Choose Outline Color</Label>
                            <Input
                              type="color"
                              value={logoOutlineColor}
                              onChange={(e) => setLogoOutlineColor(e.target.value)}
                              className="h-10 w-full"
                            />
                            <Input
                              type="text"
                              value={logoOutlineColor}
                              onChange={(e) => setLogoOutlineColor(e.target.value)}
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="text-xs text-gray-600">Color of the outline stroke around the logo</p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="scanLimit" className="text-gray-900">
                  Scan Limit (Optional)
                </Label>
                <Input
                  id="scanLimit"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={scanLimit || ""}
                  onChange={(e) => setScanLimit(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  className="bg-white/30 border-gray-200"
                />
                <p className="text-xs text-gray-600">Maximum number of scans allowed (leave empty for unlimited)</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduledStart" className="text-gray-900">
                    Start Date (Optional)
                  </Label>
                  <Input
                    id="scheduledStart"
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="bg-white/30 border-gray-200"
                  />
                  <p className="text-xs text-gray-600">When QR becomes active</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledEnd" className="text-gray-900">
                    End Date (Optional)
                  </Label>
                  <Input
                    id="scheduledEnd"
                    type="datetime-local"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="bg-white/30 border-gray-200"
                  />
                  <p className="text-xs text-gray-600">When QR expires</p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="geofence-toggle" className="text-sm font-medium text-gray-900">
                      Location-Based Access
                    </Label>
                    <p className="text-xs text-gray-600">Restrict QR code access to a specific geographic area</p>
                  </div>
                  <Switch id="geofence-toggle" checked={geofenceEnabled} onCheckedChange={setGeofenceEnabled} />
                </div>

                {geofenceEnabled && (
                  <div className="space-y-3 pt-2">
                    <LocationPicker
                      latitude={geofenceLatitude}
                      longitude={geofenceLongitude}
                      onLocationChange={(lat, lng) => {
                        setGeofenceLatitude(lat)
                        setGeofenceLongitude(lng)
                      }}
                    />

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-900">
                        Allowed Radius:{" "}
                        {geofenceRadius >= 1000 ? `${(geofenceRadius / 1000).toFixed(1)} km` : `${geofenceRadius} m`}
                      </Label>
                      <Slider
                        value={[geofenceRadius]}
                        onValueChange={(value) => setGeofenceRadius(value[0])}
                        min={100}
                        max={10000}
                        step={100}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-600">Users must be within this distance to scan the QR code</p>
                    </div>

                    <div className="rounded-md bg-blue-100/50 p-3 text-xs text-blue-900">
                      <p className="font-medium mb-1">💡 Perfect for:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                        <li>In-store promotions and coupons</li>
                        <li>Event check-ins at specific venues</li>
                        <li>Regional marketing campaigns</li>
                        <li>Employee attendance tracking</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Creating QR Code...</span>
                </>
              ) : (
                "Create QR Code"
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white/20 p-8 backdrop-blur-sm">
                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">Live Preview</h3>
                <div className="flex items-center justify-center rounded-lg bg-white p-8">
                  {qrPreview ? (
                    <img src={qrPreview || "/placeholder.svg"} alt="QR Code Preview" className="h-64 w-64" />
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="mx-auto mb-2 h-16 w-16 rounded-lg border-2 border-dashed border-gray-300" />
                        <p className="text-sm">Enter a URL to see preview</p>
                      </div>
                    </div>
                  )}
                </div>
                {qrPreview && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Preview only - Final QR will include tracking
                  </p>
                )}
                {title && (
                  <div className="mt-4 text-center">
                    <p className="font-medium text-gray-900">{title}</p>
                    {destinationUrl && <p className="mt-1 truncate text-sm text-gray-600">{destinationUrl}</p>}
                  </div>
                )}
                {qrPreview && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-white/30 border-gray-200"
                      onClick={handleDownloadPreview}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Preview
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="forms" className="mt-0">
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <FileText className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Form QR Codes Coming Soon</h3>
          <p className="text-center text-sm text-gray-600 px-4">
            Create QR codes that link to custom forms for collecting data from users.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="special" className="mt-0">
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <Wifi className="mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">WiFi & Business Card QR Codes Coming Soon</h3>
          <p className="text-center text-sm text-gray-600 px-4">
            Create WiFi connection QR codes and vertical business card QR codes.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
