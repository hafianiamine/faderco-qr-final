'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, X } from 'lucide-react'
import { createVirtualCard, updateVirtualCard } from '@/app/actions/virtual-card-actions'
import { useToast } from '@/hooks/use-toast'

interface VirtualCardData {
  id: string
  full_name: string
  email: string
  phone?: string | null
  company_name?: string | null
  job_title?: string | null
  website?: string | null
  cover_image_url?: string | null
  accent_color?: string
}

interface VirtualCardCreatorProps {
  existingCard?: VirtualCardData | null
  onClose?: () => void
}

export function VirtualCardCreator({ existingCard, onClose }: VirtualCardCreatorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(existingCard?.full_name || '')
  const [email, setEmail] = useState(existingCard?.email || '')
  const [phone, setPhone] = useState(existingCard?.phone || '')
  const [company, setCompany] = useState(existingCard?.company_name || '')
  const [jobTitle, setJobTitle] = useState(existingCard?.job_title || '')
  const [website, setWebsite] = useState(existingCard?.website || '')
  const [accentColor, setAccentColor] = useState(existingCard?.accent_color || '#6366f1')
  const [coverImage, setCoverImage] = useState<string | null>(existingCard?.cover_image_url || null)

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email) {
      toast({ title: 'Error', description: 'Name and email are required' })
      return
    }

    setLoading(true)
    try {
      const getBase64 = (data: string) => {
        if (!data) return ''
        const matches = data.match(/base64,(.+)/)
        return matches ? matches[1] : data
      }

      const cardData = {
        fullName,
        email,
        phone,
        company,
        jobTitle,
        website,
        accentColor,
        coverImageBase64: coverImage ? getBase64(coverImage) : undefined,
      }

      let result
      if (existingCard) {
        result = await updateVirtualCard(existingCard.id, cardData)
      } else {
        result = await createVirtualCard(cardData)
      }

      if (result.error) {
        toast({ title: 'Error', description: result.error })
      } else {
        toast({ title: 'Success', description: existingCard ? 'Card updated!' : 'Card created!' })
        onClose?.()
      }
    } catch (error) {
      console.error('Error saving card:', error)
      toast({ title: 'Error', description: 'Failed to save virtual card' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{existingCard ? 'Edit Virtual Card' : 'Create Virtual Card'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="CEO"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex gap-2">
              <input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <Input value={accentColor} readOnly className="flex-1" />
            </div>
          </div>

          <div>
            <Label>Cover Image</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {coverImage ? (
                <div className="space-y-2">
                  <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCoverImage(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload cover image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : existingCard ? 'Update Card' : 'Create Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
