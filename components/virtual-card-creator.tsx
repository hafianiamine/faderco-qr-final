'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, X, Mail, Phone, Briefcase, Globe, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import { createVirtualCard, updateVirtualCard } from '@/app/actions/virtual-card-actions'
import { createNFCRequest } from '@/app/actions/nfc-request-actions'
import { useToast } from '@/hooks/use-toast'

interface VirtualCard {
  id?: string
  full_name: string
  email: string
  phone?: string | null
  company_name?: string | null
  job_title?: string | null
  website?: string | null
  cover_image_url?: string | null
  theme_color?: string
}

interface VirtualCardCreatorProps {
  existingCard?: VirtualCard | null
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
  const [linkedin, setLinkedin] = useState('')
  const [twitter, setTwitter] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [themeColor, setThemeColor] = useState(existingCard?.theme_color || '#6366f1')
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

  const getBase64 = (data: string) => {
    if (!data) return ''
    const matches = data.match(/base64,(.+)/)
    return matches ? matches[1] : data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email) {
      toast({ title: 'Error', description: 'Name and email are required' })
      return
    }

    setLoading(true)
    try {
      const cardData = {
        fullName,
        email,
        phone,
        company,
        jobTitle,
        website,
        themeColor,
        coverImageBase64: coverImage ? getBase64(coverImage) : undefined,
      }

      if (existingCard?.id) {
        const result = await updateVirtualCard(existingCard.id, cardData)
        if (result.error) {
          toast({ title: 'Error', description: result.error })
        } else {
          toast({ title: 'Success', description: 'Virtual card updated successfully!' })
          onClose?.()
        }
      } else {
        const result = await createVirtualCard(cardData)
        if (result.error) {
          toast({ title: 'Error', description: result.error })
        } else {
          toast({ title: 'Success', description: 'Virtual card created successfully!' })
          onClose?.()
        }
      }
    } catch (error) {
      console.error('Error saving card:', error)
      toast({ title: 'Error', description: 'Failed to save virtual card' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingCard ? 'Edit Virtual Card' : 'Create Virtual Card'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
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
                  placeholder="your@email.com"
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
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company Name"
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
                  placeholder="Your Position"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="themeColor">Theme Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="themeColor"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{themeColor}</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <Label className="text-sm font-semibold">Social Media</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-sky-500" />
                  <Input
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="Twitter URL"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-indigo-600" />
                  <Input
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Facebook URL"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram URL"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="relative border-2 border-dashed rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                {coverImage ? (
                  <div className="space-y-2">
                    <img src={coverImage} alt="Cover" className="w-full h-32 rounded object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center justify-center gap-1 mx-auto"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload cover image</p>
                    <input
                      type="file"
                      id="coverImage"
                      onChange={handleCoverImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : existingCard?.id ? 'Update Card' : 'Create Card'}
              </Button>
            </div>
          </form>

          {/* Live Preview Section */}
          <div className="sticky top-0">
            <Label className="text-base font-semibold mb-4 block">Live Preview</Label>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-xl" style={{ borderColor: themeColor, borderWidth: '4px' }}>
              {/* Cover Image */}
              {coverImage && (
                <img src={coverImage} alt="Cover" className="w-full h-32 object-cover" />
              )}

              <div className="p-6 space-y-4">
                {/* Profile Avatar */}
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold" style={{ borderColor: themeColor }}>
                    {fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </div>

                {/* Name and Title */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">{fullName || 'Your Name'}</h2>
                  {jobTitle && <p className="text-sm text-gray-600">{jobTitle}</p>}
                  {company && <p className="text-xs text-gray-500">{company}</p>}
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4" style={{ color: themeColor }} />
                      <a href={`mailto:${email}`} className="text-gray-700 hover:text-gray-900">
                        {email}
                      </a>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4" style={{ color: themeColor }} />
                      <a href={`tel:${phone}`} className="text-gray-700 hover:text-gray-900">
                        {phone}
                      </a>
                    </div>
                  )}
                  {company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="w-4 h-4" style={{ color: themeColor }} />
                      <span className="text-gray-700">{company}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4" style={{ color: themeColor }} />
                      <a href={website} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 truncate">
                        {website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(linkedin || twitter || facebook || instagram) && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-2">
                      {linkedin && (
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors" title="LinkedIn">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>
                      )}
                      {twitter && (
                        <a href={twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors" title="Twitter">
                          <Twitter className="w-4 h-4 text-sky-500" />
                        </a>
                      )}
                      {facebook && (
                        <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors" title="Facebook">
                          <Facebook className="w-4 h-4 text-indigo-600" />
                        </a>
                      )}
                      {instagram && (
                        <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors" title="Instagram">
                          <Instagram className="w-4 h-4 text-pink-600" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
