"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Shield, Globe, Trash2, Plus, Upload, X, Palette, MessageSquare, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addAllowedDomain, removeAllowedDomain } from "@/app/actions/settings-actions"
import { updateWelcomePopupSettings, updateLandingPopupSettings } from "@/app/actions/admin-actions"
import { put } from "@vercel/blob"
import { Switch } from "@/components/ui/switch"
import { LandingPageEditor } from "@/components/admin/landing-page-editor"

export function SettingsSection() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    site_name: "",
    site_description: "",
    support_email: "",
    max_qr_codes_per_user: "",
    platform_logo_url: "",
    navbar_title: "",
    footer_text: "",
  })
  const [welcomePopup, setWelcomePopup] = useState({
    enabled: true,
    title: "Welcome to Our New Brand Tool",
    description: "Experience the power of FADERCO QR tracking with advanced analytics and customization options.",
  })
  const [welcomeLoading, setWelcomeLoading] = useState(false)
  const [allowedDomains, setAllowedDomains] = useState<any[]>([])
  const [newDomain, setNewDomain] = useState("")
  const [domainLoading, setDomainLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [landingPopup, setLandingPopup] = useState({
    enabled: false,
    title: "",
    description: "",
    imageUrl: "",
  })
  const [landingPopupLoading, setLandingPopupLoading] = useState(false)
  const [popupImageFile, setPopupImageFile] = useState<File | null>(null)
  const [popupImagePreview, setPopupImagePreview] = useState<string | null>(null)
  const [popupImageUploading, setPopupImageUploading] = useState(false)
  const popupImageInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
    loadAllowedDomains()
    loadWelcomePopupSettings()
    loadLandingPopupSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data, error } = await supabase.from("settings").select("key, value")

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value
      })

      setSettings({
        site_name: settingsMap.site_name || "",
        site_description: settingsMap.site_description || "",
        support_email: settingsMap.support_email || "",
        max_qr_codes_per_user: settingsMap.max_qr_codes_per_user || "10",
        platform_logo_url: settingsMap.platform_logo_url || "",
        navbar_title: settingsMap.navbar_title || "FADERCO QR",
        footer_text: settingsMap.footer_text || "© 2025 FADERCO QR. All rights reserved.",
      })

      if (settingsMap.platform_logo_url) {
        setLogoPreview(settingsMap.platform_logo_url)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  async function loadWelcomePopupSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["welcome_popup_enabled", "welcome_popup_title", "welcome_popup_description"])

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value
      })

      setWelcomePopup({
        enabled: settingsMap.welcome_popup_enabled === "true",
        title: settingsMap.welcome_popup_title || "Welcome to Our New Brand Tool",
        description:
          settingsMap.welcome_popup_description ||
          "Experience the power of FADERCO QR tracking with advanced analytics and customization options.",
      })
    } catch (error) {
      console.error("Error loading welcome popup settings:", error)
    }
  }

  async function loadAllowedDomains() {
    try {
      const { data, error } = await supabase.from("allowed_domains").select("*").order("domain")

      if (error) throw error

      setAllowedDomains(data || [])
    } catch (error) {
      console.error("Error loading domains:", error)
    }
  }

  async function loadLandingPopupSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["landing_popup_enabled", "landing_popup_title", "landing_popup_description", "landing_popup_image"])

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value
      })

      setLandingPopup({
        enabled: settingsMap.landing_popup_enabled === "true",
        title: settingsMap.landing_popup_title || "",
        description: settingsMap.landing_popup_description || "",
        imageUrl: settingsMap.landing_popup_image || "",
      })

      if (settingsMap.landing_popup_image) {
        setPopupImagePreview(settingsMap.landing_popup_image)
      }
    } catch (error) {
      console.error("Error loading landing popup settings:", error)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Logo file size must be less than 2MB",
          variant: "destructive",
        })
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

  const handlePopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image file size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      setPopupImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPopupImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setSettings({ ...settings, platform_logo_url: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removePopupImage = () => {
    setPopupImageFile(null)
    setPopupImagePreview(null)
    setLandingPopup({ ...landingPopup, imageUrl: "" })
    if (popupImageInputRef.current) {
      popupImageInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let logoUrl = settings.platform_logo_url
      if (logoFile) {
        setLogoUploading(true)
        const blob = await put(`platform-logos/${Date.now()}-${logoFile.name}`, logoFile, {
          access: "public",
        })
        logoUrl = blob.url
        setLogoUploading(false)
      }

      const updatedSettings = { ...settings, platform_logo_url: logoUrl }
      for (const [key, value] of Object.entries(updatedSettings)) {
        const { error } = await supabase.from("settings").upsert(
          {
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "key",
          },
        )

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Settings updated successfully. Refresh the page to see changes.",
      })

      await loadSettings()
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLogoUploading(false)
    }
  }

  async function handleWelcomePopupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWelcomeLoading(true)

    try {
      const result = await updateWelcomePopupSettings(
        welcomePopup.enabled,
        welcomePopup.title,
        welcomePopup.description,
      )

      if (result.error) throw new Error(result.error)

      toast({
        title: "Success",
        description: "Welcome popup settings updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update welcome popup settings",
        variant: "destructive",
      })
    } finally {
      setWelcomeLoading(false)
    }
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault()

    if (!newDomain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain",
        variant: "destructive",
      })
      return
    }

    setDomainLoading(true)

    try {
      const result = await addAllowedDomain(newDomain)

      if (result.error) throw new Error(result.error)

      toast({
        title: "Domain added",
        description: "Users with this email domain can now register.",
      })

      setNewDomain("")
      loadAllowedDomains()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDomainLoading(false)
    }
  }

  async function handleRemoveDomain(domainId: string) {
    try {
      const result = await removeAllowedDomain(domainId)

      if (result.error) throw new Error(result.error)

      toast({
        title: "Domain removed",
        description: "This email domain has been removed from the whitelist.",
      })

      loadAllowedDomains()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function handleLandingPopupSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLandingPopupLoading(true)
    setPopupImageUploading(!!popupImageFile)

    try {
      let imageUrl = landingPopup.imageUrl
      if (popupImageFile) {
        const blob = await put(`landing-popup-images/${Date.now()}-${popupImageFile.name}`, popupImageFile, {
          access: "public",
        })
        imageUrl = blob.url
      }

      const result = await updateLandingPopupSettings(
        landingPopup.enabled,
        landingPopup.title,
        landingPopup.description,
        imageUrl,
      )

      if (result.error) throw new Error(result.error)

      toast({
        title: "Success",
        description: "Landing page popup settings updated successfully.",
      })

      await loadLandingPopupSettings()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update landing page popup settings",
        variant: "destructive",
      })
    } finally {
      setLandingPopupLoading(false)
      setPopupImageUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-gray-600 mt-2">Configure your QR platform</p>
      </div>

      <LandingPageEditor />

      <Card className="p-6">
        <form onSubmit={handleWelcomePopupSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Welcome Popup Settings</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure the welcome banner that appears when visitors are tracked from QR code scans.
            </p>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="welcome-enabled" className="text-base font-medium">
                  Enable Welcome Popup
                </Label>
                <p className="text-sm text-muted-foreground">Show welcome banner to tracked visitors</p>
              </div>
              <Switch
                id="welcome-enabled"
                checked={welcomePopup.enabled}
                onCheckedChange={(checked) => setWelcomePopup({ ...welcomePopup, enabled: checked })}
              />
            </div>

            <div>
              <Label htmlFor="welcome_title">Popup Title</Label>
              <Input
                id="welcome_title"
                value={welcomePopup.title}
                onChange={(e) => setWelcomePopup({ ...welcomePopup, title: e.target.value })}
                placeholder="Welcome to Our New Brand Tool"
                disabled={!welcomePopup.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">The main heading shown in the welcome banner</p>
            </div>

            <div>
              <Label htmlFor="welcome_description">Popup Description</Label>
              <Textarea
                id="welcome_description"
                value={welcomePopup.description}
                onChange={(e) => setWelcomePopup({ ...welcomePopup, description: e.target.value })}
                placeholder="Experience the power of FADERCO QR tracking..."
                rows={3}
                disabled={!welcomePopup.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">The description text shown below the title</p>
            </div>
          </div>

          <Button type="submit" disabled={welcomeLoading} className="w-full">
            {welcomeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Welcome Popup Settings"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleLandingPopupSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Landing Page Popup</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure a promotional popup that appears on your landing page with an optional image.
            </p>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50">
              <div className="space-y-0.5">
                <Label htmlFor="landing-popup-enabled" className="text-base font-medium">
                  Enable Landing Page Popup
                </Label>
                <p className="text-sm text-muted-foreground">Show popup to landing page visitors</p>
              </div>
              <Switch
                id="landing-popup-enabled"
                checked={landingPopup.enabled}
                onCheckedChange={(checked) => setLandingPopup({ ...landingPopup, enabled: checked })}
              />
            </div>

            <div>
              <Label htmlFor="landing_popup_title">Popup Title</Label>
              <Input
                id="landing_popup_title"
                value={landingPopup.title}
                onChange={(e) => setLandingPopup({ ...landingPopup, title: e.target.value })}
                placeholder="Special Offer!"
                disabled={!landingPopup.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">The main heading shown in the popup</p>
            </div>

            <div>
              <Label htmlFor="landing_popup_description">Popup Description</Label>
              <Textarea
                id="landing_popup_description"
                value={landingPopup.description}
                onChange={(e) => setLandingPopup({ ...landingPopup, description: e.target.value })}
                placeholder="Get 20% off your first QR code campaign..."
                rows={3}
                disabled={!landingPopup.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">The description text shown in the popup</p>
            </div>

            <div>
              <Label>Popup Image (Optional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={popupImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePopupImageUpload}
                    className="hidden"
                    id="popup-image-upload"
                    disabled={!landingPopup.enabled}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => popupImageInputRef.current?.click()}
                    className="flex-1"
                    disabled={!landingPopup.enabled}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {popupImagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                  {popupImagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removePopupImage}
                      disabled={!landingPopup.enabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {popupImagePreview && (
                  <div className="flex items-center gap-2 rounded border border-border p-2 bg-gray-50">
                    <img
                      src={popupImagePreview || "/placeholder.svg"}
                      alt="Popup image preview"
                      className="h-24 w-24 rounded object-cover"
                    />
                    <span className="text-xs text-muted-foreground">{popupImageFile?.name || "Current image"}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">Upload an image for the popup (max 5MB)</p>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={landingPopupLoading || popupImageUploading} className="w-full">
            {landingPopupLoading || popupImageUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {popupImageUploading ? "Uploading image..." : "Saving..."}
              </>
            ) : (
              "Save Landing Page Popup Settings"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Platform Branding</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Customize the look and feel of your platform. Changes will be reflected globally.
            </p>

            <div>
              <Label htmlFor="navbar_title">Navbar Title</Label>
              <Input
                id="navbar_title"
                value={settings.navbar_title}
                onChange={(e) => setSettings({ ...settings, navbar_title: e.target.value })}
                placeholder="FADERCO QR"
              />
              <p className="text-xs text-gray-500 mt-1">The title displayed in the navigation bar</p>
            </div>

            <div>
              <Label>Platform Logo</Label>
              <div className="space-y-2">
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
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button type="button" variant="ghost" size="icon" onClick={removeLogo}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {logoPreview && (
                  <div className="flex items-center gap-2 rounded border border-border p-2 bg-gray-50">
                    <img
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      className="h-12 w-12 rounded object-contain"
                    />
                    <span className="text-xs text-muted-foreground">{logoFile?.name || "Current logo"}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">Upload a logo for your platform (max 2MB)</p>
              </div>
            </div>

            <div>
              <Label htmlFor="footer_text">Footer Text</Label>
              <Textarea
                id="footer_text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                placeholder="© 2025 FADERCO QR. All rights reserved."
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">The text displayed in the footer</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">General Settings</h3>

            <div>
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="FADERCO QR"
              />
            </div>

            <div>
              <Label htmlFor="site_description">Site Description</Label>
              <Input
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                placeholder="Next-Gen QR Platform"
              />
            </div>

            <div>
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                placeholder="support@fadercoqr.com"
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">User Limits</h3>

            <div>
              <Label htmlFor="max_qr_codes_per_user">Max QR Codes Per User</Label>
              <Input
                id="max_qr_codes_per_user"
                type="number"
                min="1"
                value={settings.max_qr_codes_per_user}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    max_qr_codes_per_user: e.target.value,
                  })
                }
                placeholder="10"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum number of QR codes each user can create</p>
            </div>
          </div>

          <Button type="submit" disabled={loading || logoUploading} className="w-full">
            {loading || logoUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {logoUploading ? "Uploading logo..." : "Saving..."}
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Whitelist Email Domains</h3>
            </div>
            <p className="text-sm text-gray-600">
              Control which email domains can register accounts. Only users with emails from these domains will be
              allowed to sign up.
            </p>
          </div>

          <form onSubmit={handleAddDomain} className="flex gap-2">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com or @example.com"
              className="flex-1"
              disabled={domainLoading}
            />
            <Button type="submit" disabled={domainLoading}>
              {domainLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Domain
            </Button>
          </form>

          <div className="space-y-2">
            {allowedDomains.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No domains added yet</p>
                <p className="text-xs">Add domains to restrict registration to specific email addresses</p>
              </div>
            ) : (
              allowedDomains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between rounded-lg border p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="font-mono text-sm">@{domain.domain}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDomain(domain.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {allowedDomains.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Only emails ending with {allowedDomains.map((d) => `@${d.domain}`).join(", ")}{" "}
                will be allowed to register. All other domains will be blocked.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
