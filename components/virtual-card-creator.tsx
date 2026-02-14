'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Upload, X, Mail, Phone, Briefcase, Globe, Linkedin, Facebook, Instagram } from 'lucide-react'
import { createVirtualCard, updateVirtualCard } from '@/app/actions/virtual-card-actions'
import { createNFCRequest } from '@/app/actions/nfc-request-actions'
import { useToast } from '@/hooks/use-toast'
import { XLogo } from '@/components/x-logo'

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
  profile_image_url?: string | null
  linkedin?: string | null
  x_url?: string | null
  facebook?: string | null
  instagram?: string | null
}

interface VirtualCardCreatorProps {
  existingCard?: VirtualCard | null
  onClose?: () => void
}

export function VirtualCardCreator({ existingCard, onClose }: VirtualCardCreatorProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(existingCard?.full_name || '')
  const [email, setEmail] = useState(existingCard?.email || '')
  const [phone, setPhone] = useState(existingCard?.phone || '')
  const [company, setCompany] = useState(existingCard?.company_name || '')
  const [jobTitle, setJobTitle] = useState(existingCard?.job_title || '')
  const [website, setWebsite] = useState(existingCard?.website || '')
  const [linkedin, setLinkedin] = useState(existingCard?.linkedin || '')
  const [x, setX] = useState(existingCard?.x_url || '')
  const [facebook, setFacebook] = useState(existingCard?.facebook || '')
  const [instagram, setInstagram] = useState(existingCard?.instagram || '')
  const [themeColor, setThemeColor] = useState(existingCard?.theme_color || '#6366f1')
  const [coverImage, setCoverImage] = useState<string | null>(existingCard?.cover_image_url || null)
  const [profileImage, setProfileImage] = useState<string | null>(existingCard?.profile_image_url || null)

  useEffect(() => {
    async function loadUserProfilePicture() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !profileImage) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        
        if (data?.avatar_url) {
          setProfileImage(data.avatar_url)
        }
      }
    }
    loadUserProfilePicture()
  }, [])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isProfile: boolean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', isProfile ? 'profile' : 'cover')

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (data.url) {
          if (isProfile) {
            setProfileImage(data.url)
          } else {
            setCoverImage(data.url)
          }
        } else {
          toast({ title: "Error", description: "Failed to upload image" })
        }
      } catch (error) {
        console.error("[v0] Image upload error:", error)
        toast({ title: "Error", description: "Failed to upload image" })
      }
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email) {
      toast({ title: "Error", description: "Full name and email are required" })
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
        linkedin,
        x,
        facebook,
        instagram,
        themeColor,
        coverImageUrl: coverImage,
        profileImageUrl: profileImage,
      }

      console.log("[v0] Saving virtual card with profileImage:", profileImage ? "yes" : "no")
      console.log("[v0] Saving virtual card with coverImage:", coverImage ? "yes" : "no")

      let result
      if (existingCard?.id) {
        result = await updateVirtualCard(existingCard.id, cardData)
      } else {
        result = await createVirtualCard(cardData)
      }

      if (result.error) {
        toast({ title: "Error", description: result.error })
      } else {
        toast({ title: "Success", description: `Virtual card ${existingCard?.id ? 'updated' : 'created'} successfully!` })
        
        // Sync profile image to user account
        if (profileImage && profileImage !== existingCard?.profile_image_url) {
          console.log("[v0] Syncing profile picture to user account")
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase
              .from('profiles')
              .update({ avatar_url: profileImage })
              .eq('id', user.id)
          }
        }
        
        onClose?.()
      }
    } catch (error) {
      console.error("[v0] Virtual card error:", error)
      toast({ title: "Error", description: "Failed to save virtual card" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="w-[90vw] max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b flex-shrink-0">
          <DialogTitle>{existingCard ? 'Edit Virtual Card' : 'Create Virtual Card'}</DialogTitle>
          <DialogDescription>
            {existingCard 
              ? 'Update your NFC virtual business card details. Your card URL and QR code will remain the same.'
              : 'Create your NFC virtual business card with a permanent URL and QR code. You can update the details anytime.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 h-full overflow-hidden px-6 pb-6 pt-3">
            {/* Form Section - Left/Middle (2 cols) */}
            <div className="col-span-2 overflow-y-auto pr-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Profile Picture Upload - Compact */}
                <div>
                  <Label htmlFor="profileImage" className="text-sm">Profile Picture</Label>
                  <div className="relative border-2 border-dashed rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                    {profileImage ? (
                      <div className="space-y-2">
                        <img src={profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover mx-auto" crossOrigin="anonymous" />
                        <button
                          type="button"
                          onClick={() => setProfileImage(null)}
                          className="text-red-600 hover:text-red-700 text-xs flex items-center justify-center gap-1 mx-auto"
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-600">Click to upload</p>
                        <input
                          type="file"
                          id="profileImage"
                          onChange={(e) => handleImageChange(e, true)}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Name and Email Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Name"
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Phone and Company Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="phone" className="text-xs">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0000"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-xs">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Job Title and Website Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="jobTitle" className="text-xs">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Position"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-xs">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Theme Color */}
                <div>
                  <Label htmlFor="themeColor" className="text-xs">Theme Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="themeColor"
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">{themeColor}</span>
                  </div>
                </div>

                {/* Social Media - Compact */}
                <div>
                  <Label className="text-xs block mb-2">Social Media</Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <Input
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="LinkedIn URL"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <XLogo className="w-3 h-3 text-sky-500 flex-shrink-0" />
                      <Input
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                        placeholder="X URL"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Facebook className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                      <Input
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="Facebook URL"
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Instagram className="w-3 h-3 text-pink-600 flex-shrink-0" />
                      <Input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="Instagram URL"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image - Compact */}
                <div>
                  <Label htmlFor="coverImage" className="text-xs">Cover Image</Label>
                  <div className="relative border-2 border-dashed rounded-lg p-2 text-center hover:border-gray-400 transition-colors">
                    {coverImage ? (
                      <div className="space-y-1">
                        <img src={coverImage} alt="Cover" className="w-full h-16 rounded object-cover" crossOrigin="anonymous" />
                        <button
                          type="button"
                          onClick={() => setCoverImage(null)}
                          className="text-red-600 hover:text-red-700 text-xs flex items-center justify-center gap-1 mx-auto"
                        >
                          <X className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-600">Click to upload</p>
                        <input
                          type="file"
                          id="coverImage"
                          onChange={(e) => handleImageChange(e, false)}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => onClose?.()} className="flex-1 h-8 text-sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-8 text-sm">
                    {loading ? 'Saving...' : existingCard?.id ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Live Preview Section - Right Side (1 col) */}
            <div className="col-span-1 overflow-y-auto">
              <Label className="text-sm font-semibold mb-2 block">Live Preview</Label>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden shadow-lg" style={{ borderColor: themeColor, borderWidth: '3px' }}>
                {/* Cover Image */}
                {coverImage && (
                  <img src={coverImage} alt="Cover" className="w-full h-20 object-cover" crossOrigin="anonymous" />
                )}

                <div className={`p-3 space-y-2 ${coverImage ? '' : 'pt-3'}`}>
                  {/* Profile Avatar */}
                  <div className="flex justify-center -mt-10 mb-2">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-full border-3 border-white shadow-md object-cover" style={{ borderColor: themeColor }} crossOrigin="anonymous" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-3 border-white shadow-md flex items-center justify-center text-white text-lg font-bold" style={{ borderColor: themeColor }}>
                        {fullName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>

                  {/* Name and Title */}
                  <div className="text-center">
                    <h2 className="text-sm font-bold text-gray-900 truncate">{fullName || 'Your Name'}</h2>
                    {jobTitle && <p className="text-xs text-gray-600 truncate">{jobTitle}</p>}
                    {company && <p className="text-xs text-gray-500 truncate">{company}</p>}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 pt-2 border-t border-gray-200 text-xs">
                    {email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" style={{ color: themeColor }} />
                        <a href={`mailto:${email}`} className="text-gray-700 hover:text-gray-900 truncate">
                          {email}
                        </a>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3 h-3 flex-shrink-0" style={{ color: themeColor }} />
                        <a href={`tel:${phone}`} className="text-gray-700 hover:text-gray-900 truncate">
                          {phone}
                        </a>
                      </div>
                    )}
                    {company && (
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3 h-3 flex-shrink-0" style={{ color: themeColor }} />
                        <span className="text-gray-700 truncate">{company}</span>
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="w-3 h-3 flex-shrink-0" style={{ color: themeColor }} />
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 truncate text-xs">
                          {website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Social Media Links */}
                  {(linkedin || x || facebook || instagram) && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-1">
                        {linkedin && (
                          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-1.5 bg-blue-100 hover:bg-blue-200 rounded transition-colors" title="LinkedIn">
                            <Linkedin className="w-3 h-3 text-blue-600" />
                          </a>
                        )}
                        {x && (
                          <a href={x} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-1.5 bg-sky-100 hover:bg-sky-200 rounded transition-colors" title="X">
                            <XLogo className="w-3 h-3 text-sky-500" />
                          </a>
                        )}
                        {facebook && (
                          <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-1.5 bg-indigo-100 hover:bg-indigo-200 rounded transition-colors" title="Facebook">
                            <Facebook className="w-3 h-3 text-indigo-600" />
                          </a>
                        )}
                        {instagram && (
                          <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-1.5 bg-pink-100 hover:bg-pink-200 rounded transition-colors" title="Instagram">
                            <Instagram className="w-3 h-3 text-pink-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
