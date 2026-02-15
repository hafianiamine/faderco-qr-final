"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HeroSection {
  id: number
  section_number: number
  title: string
  description: string
  youtube_url: string
}

export function LandingPageEditor() {
  const [loading, setLoading] = useState(false)
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [oldSettings, setOldSettings] = useState({
    landing_hook_words: "",
    landing_hook_text: "",
    landing_hook_subtitle: "",
    landing_badge_text: "",
    landing_feature_1_title: "",
    landing_feature_1_desc: "",
    landing_feature_2_title: "",
    landing_feature_2_desc: "",
    landing_feature_3_title: "",
    landing_feature_3_desc: "",
    landing_feature_4_title: "",
    landing_feature_4_desc: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadAllContent()
  }, [])

  async function loadAllContent() {
    try {
      setLoading(true)
      
      // Load hero sections
      const { data: sections, error: sectionsError } = await supabase
        .from("landing_sections")
        .select("*")
        .order("section_number", { ascending: true })

      if (sectionsError) throw sectionsError
      setHeroSections(sections || [])

      // Load old settings
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("key, value")
        .like("key", "landing_%")

      if (settingsError) throw settingsError

      const settingsMap: Record<string, string> = {}
      settings?.forEach((setting) => {
        settingsMap[setting.key] = setting.value
      })

      setOldSettings({
        landing_hook_words: settingsMap.landing_hook_words || "UPDATE,SCHEDULE,CHANGE,WATCH",
        landing_hook_text: settingsMap.landing_hook_text || "your QR anytime — even after printing.",
        landing_hook_subtitle:
          settingsMap.landing_hook_subtitle || 'No more "oops, it\'s already printed on 1000 packaging".',
        landing_badge_text: settingsMap.landing_badge_text || "Next-Gen QR Platform",
        landing_feature_1_title: settingsMap.landing_feature_1_title || "Real-time Analytics",
        landing_feature_1_desc: settingsMap.landing_feature_1_desc || "Track every scan instantly",
        landing_feature_2_title: settingsMap.landing_feature_2_title || "Live Map View",
        landing_feature_2_desc: settingsMap.landing_feature_2_desc || "See where scans happen",
        landing_feature_3_title: settingsMap.landing_feature_3_title || "URL Shortener",
        landing_feature_3_desc: settingsMap.landing_feature_3_desc || "Built-in short links",
        landing_feature_4_title: settingsMap.landing_feature_4_title || "Who, When, Where",
        landing_feature_4_desc: settingsMap.landing_feature_4_desc || "Complete scan details",
      })
    } catch (error) {
      console.error("Error loading content:", error)
      toast({
        title: "Error",
        description: "Failed to load landing page content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateHeroSection(section: HeroSection) {
    try {
      setLoading(true)
      const { error } = await supabase
        .from("landing_sections")
        .update({
          title: section.title,
          description: section.description,
          youtube_url: section.youtube_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", section.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Hero Section ${section.section_number} updated successfully`,
      })
      await loadAllContent()
    } catch (error) {
      console.error("Error updating section:", error)
      toast({
        title: "Error",
        description: "Failed to update hero section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitOldSettings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      for (const [key, value] of Object.entries(oldSettings)) {
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
        description: "Landing page content updated successfully. Refresh the homepage to see changes.",
      })

      await loadAllContent()
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: "Failed to update landing page content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* NEW HERO SECTIONS */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">🎬 NEW: 3-Section Hero with Videos</h3>
          </div>
          <p className="text-sm text-blue-800">
            Edit the 3 main hero sections that appear when users scroll the landing page. Each section has its own YouTube video background.
          </p>

          {heroSections.map((section) => (
            <HeroSectionForm
              key={section.id}
              section={section}
              onUpdate={handleUpdateHeroSection}
              loading={loading}
            />
          ))}
        </div>
      </Card>

      {/* OLD SETTINGS - for backward compatibility */}
      <Card className="p-6 opacity-75">
        <form onSubmit={handleSubmitOldSettings} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold">Landing Page Content (Legacy)</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              These are the old hero section settings. The NEW 3-Section Hero above is recommended.
            </p>

            <div className="border-b pb-4">
              <h4 className="font-medium mb-3">Hero Section</h4>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="landing_badge_text">Badge Text</Label>
                  <Input
                    id="landing_badge_text"
                    value={oldSettings.landing_badge_text}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_badge_text: e.target.value })}
                    placeholder="Next-Gen QR Platform"
                  />
                  <p className="text-xs text-gray-500 mt-1">The text shown in the blue badge at the top</p>
                </div>

                <div>
                  <Label htmlFor="landing_hook_words">Animated Words (comma-separated)</Label>
                  <Input
                    id="landing_hook_words"
                    value={oldSettings.landing_hook_words}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_hook_words: e.target.value })}
                    placeholder="UPDATE,SCHEDULE,CHANGE,WATCH"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Words that fade in/out in the main heading (separate with commas)
                  </p>
                </div>

                <div>
                  <Label htmlFor="landing_hook_text">Main Hook Text</Label>
                  <Input
                    id="landing_hook_text"
                    value={oldSettings.landing_hook_text}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_hook_text: e.target.value })}
                    placeholder="your QR anytime — even after printing."
                  />
                  <p className="text-xs text-gray-500 mt-1">The text that appears after the animated words</p>
                </div>

                <div>
                  <Label htmlFor="landing_hook_subtitle">Subtitle Text</Label>
                  <Textarea
                    id="landing_hook_subtitle"
                    value={oldSettings.landing_hook_subtitle}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_hook_subtitle: e.target.value })}
                    placeholder={'No more "oops, it\'s already printed on 1000 packaging".'}
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">The subtitle below the main heading</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h4 className="font-medium mb-3">Feature Cards</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landing_feature_1_title">Feature 1 Title</Label>
                  <Input
                    id="landing_feature_1_title"
                    value={oldSettings.landing_feature_1_title}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_1_title: e.target.value })}
                    placeholder="Real-time Analytics"
                  />
                  <Label htmlFor="landing_feature_1_desc">Feature 1 Description</Label>
                  <Input
                    id="landing_feature_1_desc"
                    value={oldSettings.landing_feature_1_desc}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_1_desc: e.target.value })}
                    placeholder="Track every scan instantly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landing_feature_2_title">Feature 2 Title</Label>
                  <Input
                    id="landing_feature_2_title"
                    value={oldSettings.landing_feature_2_title}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_2_title: e.target.value })}
                    placeholder="Live Map View"
                  />
                  <Label htmlFor="landing_feature_2_desc">Feature 2 Description</Label>
                  <Input
                    id="landing_feature_2_desc"
                    value={oldSettings.landing_feature_2_desc}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_2_desc: e.target.value })}
                    placeholder="See where scans happen"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landing_feature_3_title">Feature 3 Title</Label>
                  <Input
                    id="landing_feature_3_title"
                    value={oldSettings.landing_feature_3_title}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_3_title: e.target.value })}
                    placeholder="URL Shortener"
                  />
                  <Label htmlFor="landing_feature_3_desc">Feature 3 Description</Label>
                  <Input
                    id="landing_feature_3_desc"
                    value={oldSettings.landing_feature_3_desc}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_3_desc: e.target.value })}
                    placeholder="Built-in short links"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landing_feature_4_title">Feature 4 Title</Label>
                  <Input
                    id="landing_feature_4_title"
                    value={oldSettings.landing_feature_4_title}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_4_title: e.target.value })}
                    placeholder="Who, When, Where"
                  />
                  <Label htmlFor="landing_feature_4_desc">Feature 4 Description</Label>
                  <Input
                    id="landing_feature_4_desc"
                    value={oldSettings.landing_feature_4_desc}
                    onChange={(e) => setOldSettings({ ...oldSettings, landing_feature_4_desc: e.target.value })}
                    placeholder="Complete scan details"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Legacy Landing Page Content"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}

function HeroSectionForm({
  section,
  onUpdate,
  loading,
}: {
  section: HeroSection
  onUpdate: (section: HeroSection) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState(section)

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-blue-200">
      <h4 className="font-semibold text-blue-900">Section {section.section_number}</h4>

      <div>
        <Label htmlFor={`title-${section.id}`}>Title</Label>
        <Input
          id={`title-${section.id}`}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter section title"
        />
      </div>

      <div>
        <Label htmlFor={`desc-${section.id}`}>Description</Label>
        <Textarea
          id={`desc-${section.id}`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter section description"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor={`youtube-${section.id}`}>YouTube URL</Label>
        <Input
          id={`youtube-${section.id}`}
          type="url"
          value={formData.youtube_url}
          onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-gray-500 mt-1">Full YouTube URL or video ID. This video will autoplay as the background.</p>
      </div>

      <Button
        onClick={() => onUpdate(formData)}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Section"
        )}
      </Button>
    </div>
  )
}
