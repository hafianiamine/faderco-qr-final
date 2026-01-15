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
import { FormBuilderUI } from "@/components/form-builder-ui"
import { v4 as uuidv4 } from "uuid"

interface CreateQRCodeFormInlineProps {
  onSuccess?: () => void
  setShowCreateForm: (show: boolean) => void
}

export function CreateQRCodeFormInline({ onSuccess, setShowCreateForm }: CreateQRCodeFormInlineProps) {
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
  const [wifiSSID, setWifiSSID] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [wifiSecurity, setWifiSecurity] = useState("WPA")
  const [cardFirstName, setCardFirstName] = useState("")
  const [cardLastName, setCardLastName] = useState("")
  const [cardPhone, setCardPhone] = useState("")
  const [cardEmail, setCardEmail] = useState("")
  const [cardCompany, setCardCompany] = useState("")
  const [cardPosition, setCardPosition] = useState("")
  const [cardWebsite, setCardWebsite] = useState("")
  const [successQRData, setSuccessQRData] = useState<{
    qrCodeId: string
    title: string
    qrImage: string
  } | null>(null)

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
        const qrCodeId = result.qrCodeId
        setSuccessQRData({
          qrCodeId,
          title: title,
          qrImage: qrPreview || "",
        })
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

  const handleWiFiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!wifiSSID) {
      toast.error("Please enter WiFi network name (SSID)")
      setIsLoading(false)
      return
    }

    try {
      toast.loading("Generating WiFi QR code...", { id: "qr-generation" })

      const wifiString = `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};;`
      const result = await createQRCode(`WiFi - ${wifiSSID}`, wifiString, {
        colorDark,
        colorLight,
        qrCodeType: "wifi",
      })

      toast.dismiss("qr-generation")

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("WiFi QR Code Created!")
        setWifiSSID("")
        setWifiPassword("")
        setWifiSecurity("WPA")
        onSuccess?.()
      }
    } catch (err) {
      toast.dismiss("qr-generation")
      toast.error("Failed to create WiFi QR code")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!cardFirstName || !cardLastName) {
      toast.error("Please enter first and last name")
      setIsLoading(false)
      return
    }

    try {
      toast.loading("Generating business card QR code...", { id: "qr-generation" })

      const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${cardFirstName} ${cardLastName}
N:${cardLastName};${cardFirstName};;;
TEL:${cardPhone}
EMAIL:${cardEmail}
ORG:${cardCompany}
TITLE:${cardPosition}
URL:${cardWebsite}
END:VCARD`

      const result = await createQRCode(`Business Card - ${cardFirstName} ${cardLastName}`, vCardData, {
        colorDark,
        colorLight,
        qrCodeType: "business_card",
      })

      toast.dismiss("qr-generation")

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success("Business Card QR Code Created!")
        setCardFirstName("")
        setCardLastName("")
        setCardPhone("")
        setCardEmail("")
        setCardCompany("")
        setCardPosition("")
        setCardWebsite("")
        onSuccess?.()
      }
    } catch (err) {
      toast.dismiss("qr-generation")
      toast.error("Failed to create business card QR code")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Standard QR
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="wifi" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WiFi QR
          </TabsTrigger>
          <TabsTrigger value="business-card" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Business Card
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
                <p className="text-xs text-gray-600">
                  The URL where users will be redirected when they scan the QR code
                </p>
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
                        onClick={() => {}}
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
          <FormBuilderUI formId={uuidv4()} />
        </TabsContent>

        <TabsContent value="wifi" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Create WiFi QR Code
                </h3>
                <form onSubmit={handleWiFiSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wifiSSID" className="text-gray-900">
                      Network Name (SSID) *
                    </Label>
                    <Input
                      id="wifiSSID"
                      type="text"
                      placeholder="MyNetwork"
                      value={wifiSSID}
                      onChange={(e) => setWifiSSID(e.target.value)}
                      required
                      className="bg-white/30 border-gray-200"
                    />
                    <p className="text-xs text-gray-600">The WiFi network name</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wifiPassword" className="text-gray-900">
                      Password
                    </Label>
                    <Input
                      id="wifiPassword"
                      type="password"
                      placeholder="••••••••"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="bg-white/30 border-gray-200"
                    />
                    <p className="text-xs text-gray-600">WiFi password (leave empty for open network)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wifiSecurity" className="text-gray-900">
                      Security Type
                    </Label>
                    <select
                      id="wifiSecurity"
                      value={wifiSecurity}
                      onChange={(e) => setWifiSecurity(e.target.value)}
                      className="w-full rounded border border-gray-200 bg-white/30 px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Open (No Password)</option>
                    </select>
                    <p className="text-xs text-gray-600">Network security type</p>
                  </div>

                  <div className="space-y-4 rounded-lg border border-gray-200 bg-white/20 p-4">
                    <h4 className="text-sm font-medium text-gray-900">Customize QR Code</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="wifiColorDark" className="text-gray-900">
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
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wifiColorLight" className="text-gray-900">
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
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && <div className="text-sm text-red-600">{error}</div>}

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating WiFi QR Code...
                      </>
                    ) : (
                      "Create WiFi QR Code"
                    )}
                  </Button>
                </form>
              </div>
            </div>

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
                          <Wifi className="mx-auto mb-2 h-16 w-16" />
                          <p className="text-sm">Enter network details to see preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="business-card" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create Business Card QR Code
                </h3>
                <form onSubmit={handleBusinessCardSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-900">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={cardFirstName}
                        onChange={(e) => setCardFirstName(e.target.value)}
                        className="bg-white/30 border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-900">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={cardLastName}
                        onChange={(e) => setCardLastName(e.target.value)}
                        className="bg-white/30 border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardPhone" className="text-gray-900">
                      Phone
                    </Label>
                    <Input
                      id="cardPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={cardPhone}
                      onChange={(e) => setCardPhone(e.target.value)}
                      className="bg-white/30 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardEmail" className="text-gray-900">
                      Email
                    </Label>
                    <Input
                      id="cardEmail"
                      type="email"
                      placeholder="john@company.com"
                      value={cardEmail}
                      onChange={(e) => setCardEmail(e.target.value)}
                      className="bg-white/30 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardCompany" className="text-gray-900">
                      Company
                    </Label>
                    <Input
                      id="cardCompany"
                      type="text"
                      placeholder="Acme Inc"
                      value={cardCompany}
                      onChange={(e) => setCardCompany(e.target.value)}
                      className="bg-white/30 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardPosition" className="text-gray-900">
                      Position/Title
                    </Label>
                    <Input
                      id="cardPosition"
                      type="text"
                      placeholder="CEO"
                      value={cardPosition}
                      onChange={(e) => setCardPosition(e.target.value)}
                      className="bg-white/30 border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardWebsite" className="text-gray-900">
                      Website
                    </Label>
                    <Input
                      id="cardWebsite"
                      type="url"
                      placeholder="https://acme.com"
                      value={cardWebsite}
                      onChange={(e) => setCardWebsite(e.target.value)}
                      className="bg-white/30 border-gray-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Business Card QR"
                    )}
                  </Button>
                </form>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <div className="w-full max-w-md space-y-4 sticky top-6">
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">💡 How it Works</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-semibold">📇</span>
                      <span>
                        <strong>Business Card:</strong> Users scan to save your contact info to their phone
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {successQRData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Created!</h2>
              <div className="text-sm text-gray-600">{successQRData.title}</div>
            </div>

            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              {successQRData.qrImage ? (
                <img src={successQRData.qrImage || "/placeholder.svg"} alt="QR Code" className="mx-auto h-48 w-48" />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded bg-gray-200">
                  <span className="text-gray-400">Loading...</span>
                </div>
              )}
            </div>

            <div className="mb-6 flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <a href={successQRData.qrImage} download={`${successQRData.title}.png`}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>

            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Your QR code is ready!</div>
              <div className="text-xs text-gray-600 mb-3">
                Your QR code has been created successfully. You can find it in the "My QR Codes" section where you can
                edit, view, or manage it.
              </div>
              <Button
                variant="outline"
                className="w-full text-blue-600 hover:text-blue-700 bg-transparent"
                onClick={() => {
                  setSuccessQRData(null)
                  window.location.hash = "#go-to-my-qr"
                  setShowCreateForm(false)
                }}
              >
                Go to My QR Codes
              </Button>
            </div>

            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setSuccessQRData(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
