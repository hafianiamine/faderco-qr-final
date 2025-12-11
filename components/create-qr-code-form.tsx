"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createQRCode } from "@/app/actions/qr-actions"
import { Loader2, Upload, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"

export function CreateQRCodeForm() {
  const [title, setTitle] = useState("")
  const [destinationUrl, setDestinationUrl] = useState("")
  const [qrCodeType, setQRCodeType] = useState<"standard" | "business_card" | "wifi">("standard")
  const [wifiSsid, setWifiSsid] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [colorDark, setColorDark] = useState("#000000")
  const [colorLight, setColorLight] = useState("#FFFFFF")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

    try {
      toast.loading("Generating your QR code...", { id: "qr-generation" })

      let finalDestinationUrl = destinationUrl
      if (qrCodeType === "wifi" && wifiSsid) {
        finalDestinationUrl = `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`
      } else if (qrCodeType === "business_card") {
        // Store business card type in metadata for formatting
      }

      const result = await createQRCode(title, finalDestinationUrl, {
        colorDark,
        colorLight,
        logoUrl: logoPreview || undefined,
        qrCodeType,
      })

      toast.dismiss("qr-generation")

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else if (result.qrCodeId) {
        toast.success("QR Code Generated Successfully!", {
          description: "Redirecting to your new QR code...",
        })
        setTimeout(() => {
          router.push(`/dashboard/qr-codes/${result.qrCodeId}`)
        }, 500)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="qrCodeType">QR Code Type</Label>
        <select
          id="qrCodeType"
          value={qrCodeType}
          onChange={(e) => setQRCodeType(e.target.value as "standard" | "business_card" | "wifi")}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
        >
          <option value="standard">Standard QR Code (URL)</option>
          <option value="business_card">Business Card QR Code (Vertical)</option>
          <option value="wifi">WiFi QR Code</option>
        </select>
        <p className="text-xs text-muted-foreground">Choose the type of QR code you want to create</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="My Campaign QR Code"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">A descriptive name for your QR code</p>
      </div>

      {qrCodeType === "wifi" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="wifiSsid">WiFi Network Name (SSID)</Label>
            <Input
              id="wifiSsid"
              type="text"
              placeholder="MyNetwork"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">The SSID of your WiFi network</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifiPassword">WiFi Password</Label>
            <Input
              id="wifiPassword"
              type="password"
              placeholder="••••••••"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave blank if no password is required</p>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="destinationUrl">Destination URL</Label>
          <Input
            id="destinationUrl"
            type="url"
            placeholder="https://example.com/landing-page"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            The URL where users will be redirected when they scan the QR code
          </p>
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium">Customize QR Code</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Dark Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="colorDark">Foreground Color</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    style={{ backgroundColor: colorDark }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border" style={{ backgroundColor: colorDark }} />
                      <span className="text-sm">{colorDark}</span>
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

          {/* Light Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="colorLight">Background Color</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    style={{ backgroundColor: colorLight }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border" style={{ backgroundColor: colorLight }} />
                      <span className="text-sm">{colorLight}</span>
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

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label>Logo (Optional)</Label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
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
            <div className="flex items-center gap-2 rounded border border-border p-2">
              <img
                src={logoPreview || "/placeholder.svg"}
                alt="Logo preview"
                className="h-12 w-12 rounded object-contain"
              />
              <span className="text-xs text-muted-foreground">{logoFile?.name}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Add a logo to the center of your QR code (max 2MB)</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
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
  )
}
