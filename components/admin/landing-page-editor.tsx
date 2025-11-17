"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LandingPageEditor() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
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
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data, error } = await supabase.from("settings").select("key, value").like("key", "landing_%")

      if (error) throw error

      const settingsMap: Record<string, string> = {}
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting.value
      })

      setSettings({
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
      console.error("Error loading settings:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      for (const [key, value] of Object.entries(settings)) {
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

      await loadSettings()
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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold">Landing Page Content</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Customize the text and messaging on your landing page. Changes will be visible to all visitors.
          </p>

          <div className="border-b pb-4">
            <h4 className="font-medium mb-3">Hero Section</h4>

            <div className="space-y-4">
              <div>
                <Label htmlFor="landing_badge_text">Badge Text</Label>
                <Input
                  id="landing_badge_text"
                  value={settings.landing_badge_text}
                  onChange={(e) => setSettings({ ...settings, landing_badge_text: e.target.value })}
                  placeholder="Next-Gen QR Platform"
                />
                <p className="text-xs text-gray-500 mt-1">The text shown in the blue badge at the top</p>
              </div>

              <div>
                <Label htmlFor="landing_hook_words">Animated Words (comma-separated)</Label>
                <Input
                  id="landing_hook_words"
                  value={settings.landing_hook_words}
                  onChange={(e) => setSettings({ ...settings, landing_hook_words: e.target.value })}
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
                  value={settings.landing_hook_text}
                  onChange={(e) => setSettings({ ...settings, landing_hook_text: e.target.value })}
                  placeholder="your QR anytime — even after printing."
                />
                <p className="text-xs text-gray-500 mt-1">The text that appears after the animated words</p>
              </div>

              <div>
                <Label htmlFor="landing_hook_subtitle">Subtitle Text</Label>
                <Textarea
                  id="landing_hook_subtitle"
                  value={settings.landing_hook_subtitle}
                  onChange={(e) => setSettings({ ...settings, landing_hook_subtitle: e.target.value })}
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
                  value={settings.landing_feature_1_title}
                  onChange={(e) => setSettings({ ...settings, landing_feature_1_title: e.target.value })}
                  placeholder="Real-time Analytics"
                />
                <Label htmlFor="landing_feature_1_desc">Feature 1 Description</Label>
                <Input
                  id="landing_feature_1_desc"
                  value={settings.landing_feature_1_desc}
                  onChange={(e) => setSettings({ ...settings, landing_feature_1_desc: e.target.value })}
                  placeholder="Track every scan instantly"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing_feature_2_title">Feature 2 Title</Label>
                <Input
                  id="landing_feature_2_title"
                  value={settings.landing_feature_2_title}
                  onChange={(e) => setSettings({ ...settings, landing_feature_2_title: e.target.value })}
                  placeholder="Live Map View"
                />
                <Label htmlFor="landing_feature_2_desc">Feature 2 Description</Label>
                <Input
                  id="landing_feature_2_desc"
                  value={settings.landing_feature_2_desc}
                  onChange={(e) => setSettings({ ...settings, landing_feature_2_desc: e.target.value })}
                  placeholder="See where scans happen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing_feature_3_title">Feature 3 Title</Label>
                <Input
                  id="landing_feature_3_title"
                  value={settings.landing_feature_3_title}
                  onChange={(e) => setSettings({ ...settings, landing_feature_3_title: e.target.value })}
                  placeholder="URL Shortener"
                />
                <Label htmlFor="landing_feature_3_desc">Feature 3 Description</Label>
                <Input
                  id="landing_feature_3_desc"
                  value={settings.landing_feature_3_desc}
                  onChange={(e) => setSettings({ ...settings, landing_feature_3_desc: e.target.value })}
                  placeholder="Built-in short links"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing_feature_4_title">Feature 4 Title</Label>
                <Input
                  id="landing_feature_4_title"
                  value={settings.landing_feature_4_title}
                  onChange={(e) => setSettings({ ...settings, landing_feature_4_title: e.target.value })}
                  placeholder="Who, When, Where"
                />
                <Label htmlFor="landing_feature_4_desc">Feature 4 Description</Label>
                <Input
                  id="landing_feature_4_desc"
                  value={settings.landing_feature_4_desc}
                  onChange={(e) => setSettings({ ...settings, landing_feature_4_desc: e.target.value })}
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
            "Save Landing Page Content"
          )}
        </Button>
      </form>
    </Card>
  )
}
