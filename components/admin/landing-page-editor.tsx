"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Play } from "lucide-react"
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

  return (
    <div className="space-y-6">
      {/* NEW HERO SECTIONS */}
      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Landing Page Hero Sections</h3>
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
