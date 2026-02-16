'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { updateLandingSection } from '@/app/actions/landing-sections-actions'
import { Loader2, Upload, X } from 'lucide-react'

interface HeroSection {
  id: number
  section_number: number
  title: string
  description: string
  youtube_url: string
  video_url?: string
}

interface LandingSectionsEditorProps {
  sections: HeroSection[]
  onUpdate?: () => void
}

export function LandingSectionsEditor({ sections, onUpdate }: LandingSectionsEditorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [videoLoading, setVideoLoading] = useState<Record<number, boolean>>({})
  const [formData, setFormData] = useState(
    sections.reduce((acc, section) => ({
      ...acc,
      [section.section_number]: {
        title: section.title,
        description: section.description,
        youtube_url: section.youtube_url,
        video_url: section.video_url || '',
      },
    }), {} as Record<number, { title: string; description: string; youtube_url: string; video_url: string }>)
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

  const handleVideoUpload = async (sectionNumber: number, file: File) => {
    setVideoLoading(prev => ({ ...prev, [sectionNumber]: true }))
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('sectionNumber', sectionNumber.toString())

      const response = await fetch('/api/upload-section-video', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        [sectionNumber]: {
          ...prev[sectionNumber],
          video_url: data.url,
        },
      }))

      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      })
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setVideoLoading(prev => ({ ...prev, [sectionNumber]: false }))
    }
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

          {/* Video Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Upload Video (Blob Storage)</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 500 * 1024 * 1024) {
                      toast({
                        title: 'Error',
                        description: 'Video file must be less than 500MB',
                        variant: 'destructive',
                      })
                    } else {
                      handleVideoUpload(section.section_number, file)
                    }
                  }
                }}
                disabled={videoLoading[section.section_number]}
                className="hidden"
                id={`video-upload-${section.section_number}`}
              />
              <Button
                onClick={() => document.getElementById(`video-upload-${section.section_number}`)?.click()}
                disabled={videoLoading[section.section_number]}
                variant="outline"
                className="gap-2"
              >
                {videoLoading[section.section_number] ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose Video
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Max 500MB. Supports MP4, WebM, and other video formats
            </p>
          </div>

          {/* Video URL Preview */}
          {formData[section.section_number]?.video_url && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Video Stored</label>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 truncate">{formData[section.section_number].video_url}</p>
                <Button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    [section.section_number]: {
                      ...prev[section.section_number],
                      video_url: '',
                    },
                  }))}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <video
                src={formData[section.section_number].video_url}
                controls
                className="w-full h-48 bg-black rounded-lg"
              />
            </div>
          )}

          {/* YouTube URL (Legacy) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">YouTube Video URL (Legacy)</label>
            <Input
              value={formData[section.section_number]?.youtube_url || ''}
              onChange={(e) => handleChange(section.section_number, 'youtube_url', e.target.value)}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
              type="url"
            />
            <p className="text-xs text-gray-500">
              Legacy support. Prefer uploading videos via Blob above
            </p>
          </div>

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
