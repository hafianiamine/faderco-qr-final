'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { updateLandingSection } from '@/app/actions/landing-sections-actions'
import { Loader2 } from 'lucide-react'

interface HeroSection {
  id: number
  section_number: number
  title: string
  description: string
  youtube_url: string
}

interface LandingSectionsEditorProps {
  sections: HeroSection[]
  onUpdate?: () => void
}

export function LandingSectionsEditor({ sections, onUpdate }: LandingSectionsEditorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(
    sections.reduce((acc, section) => ({
      ...acc,
      [section.section_number]: {
        title: section.title,
        description: section.description,
        youtube_url: section.youtube_url,
      },
    }), {} as Record<number, { title: string; description: string; youtube_url: string }>)
  )

  const handleChange = (sectionNumber: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [sectionNumber]: {
        ...prev[sectionNumber],
        [field]: value,
      },
    }))
  }

  const handleSave = async (sectionNumber: number) => {
    setLoading(true)
    try {
      const data = formData[sectionNumber]
      const result = await updateLandingSection(
        sectionNumber,
        data.title,
        data.description,
        data.youtube_url
      )

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `Section ${sectionNumber} updated successfully`,
        })
        onUpdate?.()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Landing Page Hero Sections</h2>
      </div>

      {sections.map((section) => (
        <Card key={section.id} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Section {section.section_number}</h3>
            <span className="text-xs text-gray-500">ID: {section.id}</span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Section Title</label>
            <Input
              value={formData[section.section_number]?.title || ''}
              onChange={(e) => handleChange(section.section_number, 'title', e.target.value)}
              placeholder="Enter section title"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {formData[section.section_number]?.title.length || 0}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              value={formData[section.section_number]?.description || ''}
              onChange={(e) => handleChange(section.section_number, 'description', e.target.value)}
              placeholder="Enter section description"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-gray-500">
              {formData[section.section_number]?.description.length || 0}/300 characters
            </p>
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">YouTube Video URL</label>
            <Input
              value={formData[section.section_number]?.youtube_url || ''}
              onChange={(e) => handleChange(section.section_number, 'youtube_url', e.target.value)}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
              type="url"
            />
            <p className="text-xs text-gray-500">
              Use YouTube embed format (e.g., https://www.youtube.com/embed/dQw4w9WgXcQ)
            </p>
          </div>

          {/* Preview */}
          {formData[section.section_number]?.youtube_url && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Video Preview</label>
              <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
                <iframe
                  src={formData[section.section_number].youtube_url}
                  className="w-full h-full"
                  allow="autoplay"
                  title="Video preview"
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={() => handleSave(section.section_number)}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Section'
            )}
          </Button>
        </Card>
      ))}
    </div>
  )
}
