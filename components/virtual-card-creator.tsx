'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createVirtualCard, updateVirtualCard } from '@/app/actions/virtual-card-actions'
import { useToast } from '@/hooks/use-toast'
import { Upload, X } from 'lucide-react'

interface VirtualCard {
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  job_title: string | null
  website: string | null
  cover_image_url: string | null
  accent_color: string
}

interface VirtualCardCreatorProps {
  existingCard?: VirtualCard | null
  onClose?: () => void
}

export function VirtualCardCreator({ existingCard, onClose }: VirtualCardCreatorProps) {
  const { toast } = useToast()
  const [fullName, setFullName] = useState(existingCard?.full_name || '')
  const [email, setEmail] = useState(existingCard?.email || '')
  const [phone, setPhone] = useState(existingCard?.phone || '')
  const [company, setCompany] = useState(existingCard?.company_name || '')
  const [jobTitle, setJobTitle] = useState(existingCard?.job_title || '')
  const [website, setWebsite] = useState(existingCard?.website || '')
  const [accentColor, setAccentColor] = useState(existingCard?.accent_color || '#6366f1')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(existingCard?.cover_image_url || null)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (type === 'profile') {
          setProfileImage(base64)
        } else {
          setCoverImage(base64)
        }
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
      // Extract base64 from data URL
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

      if (existingCard) {
        // Update existing card
        const result = await updateVirtualCard(existingCard.id, cardData)
        if (result.error) {
          toast({ title: 'Error', description: result.error })
        } else {
          toast({ title: 'Success', description: 'Virtual card updated successfully!' })
          onClose?.()
        }
      } else {
        // Create new card
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
      const profileBase64 = profileImage?.split(',')[1]
      const coverBase64 = coverImage?.split(',')[1]

      const result = await createVirtualCard(
        {
          fullName,
          email,
          phone,
          company,
          jobTitle,
          website,
          accentColor,
          photoBase64: profileBase64,
          coverImageBase64: coverBase64,
        },
        profileBase64
      )

      if (result.error) {
        toast({ title: 'Error', description: result.error })
      } else {
        toast({ title: 'Success', description: 'Virtual card created!' })
        setFullName('')
        setEmail('')
        setPhone('')
        setCompany('')
        setJobTitle('')
        setWebsite('')
        setProfileImage(null)
        setCoverImage(null)
        setAccentColor('#6366f1')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create card' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Side */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                {coverImage && (
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0" style={{ backgroundColor: accentColor, opacity: coverImage ? 0 : 1 }} />
              </div>

              {/* Profile Section */}
              <div className="relative px-6 pb-6">
                {/* Profile Image */}
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-300 to-purple-300 flex items-center justify-center text-white text-4xl font-bold">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">{fullName || 'Your Name'}</h2>

                {/* Job Title & Company */}
                {(jobTitle || company) && (
                  <div className="text-center mb-4">
                    {jobTitle && <p className="text-sm font-semibold text-gray-700">{jobTitle}</p>}
                    {company && <p className="text-xs text-gray-500">{company}</p>}
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {email && (
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600">✉</span>
                      <span className="text-xs">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600">📱</span>
                      <span className="text-xs">{phone}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  + Add Contact
                </button>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Create Your Digital Card</h1>
            <p className="text-gray-400 mb-8">Design your professional virtual business card</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Image Upload */}
              <div>
                <Label className="text-white mb-2 block">Cover Image</Label>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">{coverImage ? 'Change cover image' : 'Click to upload cover'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} hidden />
                </label>
              </div>

              {/* Profile Image Upload */}
              <div>
                <Label className="text-white mb-2 block">Profile Photo</Label>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-400">{profileImage ? 'Change profile photo' : 'Click to upload photo'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} hidden />
                </label>
              </div>

              {/* Full Name */}
              <div>
                <Label className="text-white">Full Name *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-white">Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              {/* Job Title */}
              <div>
                <Label className="text-white">Job Title</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., CEO, Manager"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Company */}
              <div>
                <Label className="text-white">Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="text-white">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Website */}
              <div>
                <Label className="text-white">Website</Label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Accent Color */}
              <div>
                <Label className="text-white">Accent Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">{accentColor}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
              >
                {loading ? 'Creating...' : 'Create Virtual Card'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
