"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Upload, Trash2, Plus, GripVertical, ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { uploadImageToBlob } from "@/app/actions/admin-actions"
import { createCarouselSlide, deleteCarouselSlide, getAllCarouselSlides } from "@/app/actions/carousel-actions"

interface CarouselSlide {
  id: string
  image_url: string
  duration_seconds: number
  link_url?: string
  display_order: number
}

export function CarouselManager() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [newSlide, setNewSlide] = useState({
    imageUrl: "",
    duration: 5,
    linkUrl: "",
  })

  useEffect(() => {
    loadSlides()
  }, [])

  async function loadSlides() {
    try {
      setLoading(true)
      const data = await getAllCarouselSlides()
      setSlides(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load carousel slides",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadImageToBlob(formData)
      if (result.success && result.url) {
        setNewSlide({ ...newSlide, imageUrl: result.url })
        toast({ title: "Image uploaded successfully" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleAddSlide() {
    if (!newSlide.imageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await createCarouselSlide(newSlide.imageUrl, newSlide.duration, newSlide.linkUrl || undefined)
      setNewSlide({ imageUrl: "", duration: 5, linkUrl: "" })
      await loadSlides()
      toast({ title: "Slide added successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add slide",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteSlide(slideId: string) {
    try {
      setLoading(true)
      await deleteCarouselSlide(slideId)
      await loadSlides()
      toast({ title: "Slide deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Landing Page Carousel</h3>
          </div>

          {/* Add New Slide Form */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold">Add New Slide</h4>

            <div>
              <Label>Image</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  id="carousel-image-upload"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("carousel-image-upload")?.click()}
                  disabled={uploadingImage}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
              {newSlide.imageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={newSlide.imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="h-20 w-20 rounded object-cover"
                  />
                  <span className="text-sm text-gray-600">Image uploaded</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={newSlide.duration}
                onChange={(e) => setNewSlide({ ...newSlide, duration: Number.parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="link">Link URL (Optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com"
                value={newSlide.linkUrl}
                onChange={(e) => setNewSlide({ ...newSlide, linkUrl: e.target.value })}
              />
            </div>

            <Button onClick={handleAddSlide} disabled={loading || !newSlide.imageUrl} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </div>
        </div>
      </Card>

      {/* Existing Slides */}
      {slides.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Existing Slides ({slides.length})</h4>
          <div className="space-y-3">
            {slides.map((slide) => (
              <div key={slide.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <img
                  src={slide.image_url || "/placeholder.svg"}
                  alt="Slide"
                  className="h-16 w-24 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Duration: {slide.duration_seconds}s</p>
                  {slide.link_url && <p className="text-xs text-gray-600 truncate">Link: {slide.link_url}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSlide(slide.id)} disabled={loading}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
