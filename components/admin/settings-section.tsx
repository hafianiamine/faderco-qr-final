"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Shield,
  Globe,
  Trash2,
  Plus,
  Upload,
  MessageSquare,
  Video,
  Clock,
  Images,
  Link2,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { addAllowedDomain, removeAllowedDomain } from "@/app/actions/settings-actions"
import {
  updateWelcomePopupSettings,
  updateLandingPopupSettings,
  updateTutorialVideoUrl,
  uploadImageToBlob,
  updateSupportInfo,
  updateNotificationBannerText,
} from "@/app/actions/admin-actions"
import { LandingPageEditor } from "@/components/admin/landing-page-editor"
import { forceAllPasswordResets } from "@/app/actions/security-actions"
import { AlertTriangle } from "lucide-react"
import { getAutoPasswordResetSettings, updateAutoPasswordResetSettings } from "@/app/actions/security-actions"
import {
  createCarouselSlide,
  deleteCarouselSlide,
  getAllCarouselSlides,
  updateCarouselSlide,
} from "@/app/actions/carousel-actions"

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [landingPopup, setLandingPopup] = useState({
    enabled: false,
    title: "Special Offer!",
    description: "Get 20% off your first QR code campaign...",
    imageUrl: "",
  })
  const [landingLoading, setLandingLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("")
  const [tutorialLoading, setTutorialLoading] = useState(false)
  const [supportInfo, setSupportInfo] = useState("")
  const [supportLoading, setSupportLoading] = useState(false)
  const popupImageInputRef = useRef<HTMLInputElement | null>(null)
  const [popupImageFile, setPopupImageFile] = useState<File | null>(null)
  const [popupImagePreview, setPopupImagePreview] = useState<string | null>(null)
  const [footerLoading, setFooterLoading] = useState(false)
  const supabase = createClient()
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [autoResetEnabled, setAutoResetEnabled] = useState(false)
  const [autoResetDays, setAutoResetDays] = useState("30")
  const [autoResetLoading, setAutoResetLoading] = useState(false)

  // New state for Carousel Manager
  const [carouselSlides, setCarouselSlides] = useState<any[]>([])
  const [carouselLoading, setCarouselLoading] = useState(false)
  const [slideImageFile, setSlideImageFile] = useState<File | null>(null)
  const [slideImagePreview, setSlideImagePreview] = useState<string | null>(null)
  const [newSlide, setNewSlide] = useState({
    duration: 5,
    linkUrl: "",
  })
  const slideImageInputRef = useRef<HTMLInputElement | null>(null)

  // State for notification banner text
  const [notificationBannerText, setNotificationBannerText] = useState("")
  const [notificationLoading, setNotificationLoading] = useState(false)

  useEffect(() => {
    loadSettings()
    loadAllowedDomains()
    loadWelcomePopupSettings()
    loadLandingPopupSettings()
    loadTutorialVideoUrl()
    loadSupportInfo()
    loadAutoResetSettings()
    loadCarouselSlides() // Load carousel slides on mount
    loadNotificationBannerText() // Load notification banner text on mount
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
        title: settingsMap.landing_popup_title || "Special Offer!",
        description: settingsMap.landing_popup_description || "Get 20% off your first QR code campaign...",
        imageUrl: settingsMap.landing_popup_image || "",
      })

      if (settingsMap.landing_popup_image) {
        setPopupImagePreview(settingsMap.landing_popup_image)
      }
    } catch (error) {
      console.error("Error loading landing popup settings:", error)
    }
  }

  async function loadTutorialVideoUrl() {
    try {
      const { data: tutorialVideoData, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "tutorial_video_url")
        .maybeSingle()

      if (error) throw error

      setTutorialVideoUrl(tutorialVideoData?.value || "")
    } catch (error) {
      console.error("Error loading tutorial video URL:", error)
    }
  }

  async function loadSupportInfo() {
    try {
      const { data: supportInfoData, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "support_info")
        .maybeSingle()

      if (error) throw error

      setSupportInfo(supportInfoData?.value || "For support, please contact your administrator at support@example.com")
    } catch (error) {
      console.error("Error loading support info:", error)
    }
  }

  async function loadAutoResetSettings() {
    try {
      const settings = await getAutoPasswordResetSettings()
      setAutoResetEnabled(settings.enabled)
      setAutoResetDays(settings.days.toString())
    } catch (error) {
      console.error("Failed to load auto reset settings:", error)
    }
  }

  // New function to load carousel slides
  async function loadCarouselSlides() {
    try {
      const slides = await getAllCarouselSlides()
      setCarouselSlides(slides)
    } catch (error) {
      console.error("Error loading carousel slides:", error)
    }
  }

  // Function to load notification banner text
  async function loadNotificationBannerText() {
    const { data } = await supabase.from("settings").select("value").eq("key", "notification_banner_text").maybeSingle()

    if (data) {
      setNotificationBannerText(data.value || "Discover what we made for FADERCO")
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

  // New handler for carousel slide image upload
  function handleSlideImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSlideImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSlideImagePreview(reader.result as string)
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
        const formData = new FormData()
        formData.append("file", logoFile)
        const uploadResult = await uploadImageToBlob(formData)

        if (uploadResult.error) {
          throw new Error(uploadResult.error)
        }

        logoUrl = uploadResult.url!
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
    setLandingLoading(true)
    setUploadingImage(!!popupImageFile)

    try {
      let imageUrl = landingPopup.imageUrl
      if (popupImageFile) {
        const formData = new FormData()
        formData.append("file", popupImageFile)
        const uploadResult = await uploadImageToBlob(formData)

        if (uploadResult.error) {
          throw new Error(uploadResult.error)
        }

        imageUrl = uploadResult.url!
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
      setLandingLoading(false)
      setUploadingImage(false)
    }
  }

  async function handleFooterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFooterLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role !== "admin") {
        throw new Error("Unauthorized")
      }

      const { error } = await supabase
        .from("settings")
        .upsert({ key: "footer_text", value: settings.footer_text }, { onConflict: "key" })

      if (error) throw error

      toast({
        title: "Success",
        description: "Footer text updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update footer text",
        variant: "destructive",
      })
    } finally {
      setFooterLoading(false)
    }
  }

  async function handleTutorialVideoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTutorialLoading(true)

    try {
      const result = await updateTutorialVideoUrl(tutorialVideoUrl)

      if (result.error) throw new Error(result.error)

      toast({
        title: "Success",
        description: "Tutorial video URL updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update tutorial video URL",
        variant: "destructive",
      })
    } finally {
      setTutorialLoading(false)
    }
  }

  async function handleSupportInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSupportLoading(true)

    try {
      const result = await updateSupportInfo(supportInfo)

      if (result.error) throw new Error(result.error)

      toast({
        title: "Success",
        description: "Support info updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update support info",
        variant: "destructive",
      })
    } finally {
      setSupportLoading(false)
    }
  }

  async function handleForcePasswordReset() {
    if (!confirm("Are you sure you want to force all users to reset their passwords? This action cannot be undone.")) {
      return
    }

    setPasswordResetLoading(true)

    try {
      const result = await forceAllPasswordResets()

      if (result.error) throw new Error(result.error)

      toast({
        title: "Success",
        description: "All users will be required to reset their passwords on next login",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to force password resets",
        variant: "destructive",
      })
    } finally {
      setPasswordResetLoading(false)
    }
  }

  async function handleAutoResetUpdate() {
    setAutoResetLoading(true)

    try {
      await updateAutoPasswordResetSettings(autoResetEnabled, Number.parseInt(autoResetDays))

      toast({
        title: "Success",
        description: "Automated password reset settings updated",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setAutoResetLoading(false)
    }
  }

  // New handler to add a carousel slide
  async function handleAddCarouselSlide(e: React.FormEvent) {
    e.preventDefault()

    if (!slideImageFile) {
      toast({
        title: "Error",
        description: "Please select an image for the slide",
        variant: "destructive",
      })
      return
    }

    setCarouselLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", slideImageFile)
      const uploadResult = await uploadImageToBlob(formData)

      if (uploadResult.error) {
        throw new Error(uploadResult.error)
      }

      await createCarouselSlide(uploadResult.url!, newSlide.duration, newSlide.linkUrl || undefined)

      toast({
        title: "Success",
        description: "Carousel slide added successfully",
      })

      setSlideImageFile(null)
      setSlideImagePreview(null)
      setNewSlide({ duration: 5, linkUrl: "" })
      await loadCarouselSlides()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add carousel slide",
        variant: "destructive",
      })
    } finally {
      setCarouselLoading(false)
    }
  }

  // New handler to delete a carousel slide
  async function handleDeleteSlide(slideId: string) {
    if (!confirm("Are you sure you want to delete this slide?")) return

    try {
      await deleteCarouselSlide(slideId)
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      })
      await loadCarouselSlides()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete slide",
        variant: "destructive",
      })
    }
  }

  // New handler to reorder carousel slides
  async function handleReorderSlide(slideId: string, direction: "up" | "down") {
    const currentIndex = carouselSlides.findIndex((s) => s.id === slideId)
    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === carouselSlides.length - 1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentSlide = carouselSlides[currentIndex]
    const swapSlide = carouselSlides[newIndex]

    try {
      await updateCarouselSlide(currentSlide.id, { display_order: newIndex })
      await updateCarouselSlide(swapSlide.id, { display_order: currentIndex })
      await loadCarouselSlides()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reorder slides",
        variant: "destructive",
      })
    }
  }

  const handleUploadSlideImage = () => {
    if (slideImageInputRef.current) {
      slideImageInputRef.current.click()
    }
  }

  // Handler for notification banner text
  async function handleNotificationBannerSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNotificationLoading(true)

    const result = await updateNotificationBannerText(notificationBannerText)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Notification banner text updated successfully!")
    }

    setNotificationLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Configure platform settings and content</p>
      </div>

      <LandingPageEditor />

      {/* REMOVED: Welcome Popup Settings */}
      {/* REMOVED: Landing Page Popup Settings */}

      {/* New Carousel Manager section */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Images className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Carousel Slides Manager</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload images that will appear as a slideshow on your landing page. Each slide displays for the duration
              you set, with optional click-through links.
            </p>
          </div>

          {/* Add New Slide Form */}
          <form onSubmit={handleAddCarouselSlide} className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h4 className="font-semibold text-sm">Add New Slide</h4>

            <div>
              <Label>Slide Image</Label>
              <div className="space-y-2 mt-2">
                <input
                  ref={slideImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSlideImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadSlideImage}
                  className="w-full bg-transparent"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                {slideImagePreview && (
                  <div className="flex items-center gap-2 rounded border p-2">
                    <img
                      src={slideImagePreview || "/placeholder.svg"}
                      alt="Slide preview"
                      className="h-20 w-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{slideImageFile?.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSlideImageFile(null)
                          setSlideImagePreview(null)
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slide_duration">Duration (seconds)</Label>
                <Input
                  id="slide_duration"
                  type="number"
                  min="1"
                  max="60"
                  value={newSlide.duration}
                  onChange={(e) => setNewSlide({ ...newSlide, duration: Number.parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">How long to display this slide</p>
              </div>
              <div>
                <Label htmlFor="slide_link">Link (Optional)</Label>
                <Input
                  id="slide_link"
                  type="url"
                  placeholder="https://example.com"
                  value={newSlide.linkUrl}
                  onChange={(e) => setNewSlide({ ...newSlide, linkUrl: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">URL to open when clicked</p>
              </div>
            </div>

            <Button type="submit" disabled={carouselLoading || !slideImageFile} className="w-full">
              {carouselLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Slide...
                </>
              ) : (
                "Add Slide"
              )}
            </Button>
          </form>

          {/* Existing Slides List */}
          {carouselSlides.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Current Slides ({carouselSlides.length})</h4>
              {carouselSlides.map((slide, index) => (
                <div key={slide.id} className="border rounded-lg p-3 flex gap-3 bg-white">
                  <img
                    src={slide.image_url || "/placeholder.svg"}
                    alt="Slide"
                    className="h-16 w-16 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{slide.duration_seconds}s</span>
                    </div>
                    {slide.link_url && (
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-blue-600 truncate">{slide.link_url}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReorderSlide(slide.id, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReorderSlide(slide.id, "down")}
                      disabled={index === carouselSlides.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Images className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No slides yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleFooterSubmit} className="space-y-4">
          <div>
            <Label htmlFor="footer_text">Footer Text</Label>
            <Input
              id="footer_text"
              value={settings.footer_text}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              placeholder="© 2025 FADERCO QR. All rights reserved."
            />
            <p className="text-xs text-gray-500 mt-1">This text appears in the footer across all pages</p>
          </div>
          <Button type="submit" disabled={footerLoading}>
            {footerLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Footer Text"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleTutorialVideoSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Platform Tutorial Video</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add a YouTube video URL to help users understand how the platform works. The video will appear in the user
              dashboard menu.
            </p>

            <div>
              <Label htmlFor="tutorial_video">YouTube Video URL</Label>
              <Input
                id="tutorial_video"
                value={tutorialVideoUrl}
                onChange={(e) => setTutorialVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the full YouTube video URL. Users will see a video icon with a pulse animation in their dashboard.
              </p>
            </div>

            {tutorialVideoUrl && (
              <div className="rounded-lg border p-4 bg-gray-50">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="aspect-video bg-black rounded">
                  <iframe
                    className="w-full h-full rounded"
                    src={tutorialVideoUrl.replace("watch?v=", "embed/").split("&")[0]}
                    title="Tutorial Video Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <Button type="submit" disabled={tutorialLoading} className="w-full">
            {tutorialLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Tutorial Video URL"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSupportInfoSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Support Information</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure the support contact information shown to users in the platform notice. This appears in the
              feature tour.
            </p>

            <div>
              <Label htmlFor="support_info">Support Info</Label>
              <Textarea
                id="support_info"
                value={supportInfo}
                onChange={(e) => setSupportInfo(e.target.value)}
                placeholder="For support, please contact your administrator at support@example.com"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide contact information for users who need help or have questions about the platform
              </p>
            </div>
          </div>

          <Button type="submit" disabled={supportLoading} className="w-full">
            {supportLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Support Information"
            )}
          </Button>
        </form>
      </Card>

      {/* New Notification Banner Settings Section */}
      <Card className="p-6">
        <form onSubmit={handleNotificationBannerSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Notification Banner</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure the notification banner text that appears at the top of the landing page
            </p>

            <div>
              <Label htmlFor="notification_banner">Banner Text</Label>
              <Input
                id="notification_banner"
                value={notificationBannerText}
                onChange={(e) => setNotificationBannerText(e.target.value)}
                placeholder="Discover what we made for FADERCO"
              />
              <p className="text-xs text-gray-500 mt-1">
                This text appears in a colorful banner at the top of your landing page
              </p>
            </div>
          </div>

          <Button type="submit" disabled={notificationLoading} className="w-full">
            {notificationLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Banner Text"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold">Security Settings</h3>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1">Force Password Reset (Manual)</h4>
                <p className="text-sm text-amber-700 mb-3">
                  Immediately force all users (excluding admins) to reset their passwords on their next login. Users
                  cannot reuse their last 5 passwords. Use this if you suspect a security breach.
                </p>
                <Button
                  onClick={handleForcePasswordReset}
                  disabled={passwordResetLoading}
                  variant="destructive"
                  size="sm"
                >
                  {passwordResetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Force All Users to Reset Password"
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Automated Password Reset Schedule</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Automatically force users to reset their passwords periodically. The system checks daily and requires
                  password resets based on the schedule you set.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="auto-reset-enabled"
                      checked={autoResetEnabled}
                      onChange={(e) => setAutoResetEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="auto-reset-enabled" className="cursor-pointer">
                      Enable automated password resets
                    </Label>
                  </div>

                  {autoResetEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="reset-days">Reset password every:</Label>
                      <select
                        id="reset-days"
                        value={autoResetDays}
                        onChange={(e) => setAutoResetDays(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="7">7 days (1 week)</option>
                        <option value="15">15 days</option>
                        <option value="20">20 days</option>
                        <option value="30">30 days (1 month)</option>
                        <option value="60">60 days (2 months)</option>
                        <option value="90">90 days (3 months)</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        Users will be required to reset their password if they haven't changed it in the selected time
                        period.
                      </p>
                    </div>
                  )}

                  <Button onClick={handleAutoResetUpdate} disabled={autoResetLoading} size="sm">
                    {autoResetLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold">Whitelist Email Domains</h3>
          </div>
          <p className="text-sm text-gray-600">
            Control which email domains can register accounts. Only users with emails from these domains will be allowed
            to sign up.
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
              <strong>Note:</strong> Only emails ending with {allowedDomains.map((d) => `@${d.domain}`).join(", ")} will
              be allowed to register. All other domains will be blocked.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
