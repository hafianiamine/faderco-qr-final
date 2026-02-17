'use client'

import { Mail, Phone, Briefcase, Globe, Download, MessageCircle, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface VirtualCard {
  id: string
  full_name: string
  email: string
  phone?: string
  company_name?: string
  job_title?: string
  website?: string
  cover_image_url?: string
  profile_image_url?: string
  theme_color?: string
  vcard_data: string
}

interface BusinessCardDisplayProps {
  card: VirtualCard
}

export function BusinessCardDisplay({ card }: BusinessCardDisplayProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)
  const accentColor = card.theme_color || '#6366f1'

  // Debug logging
  console.log("[v0] BusinessCard loaded:", { 
    id: card.id,
    name: card.full_name,
    coverImageUrl: card.cover_image_url,
    imageExists: !!card.cover_image_url,
    imageUrl: card.cover_image_url ? card.cover_image_url.substring(0, 100) : 'none'
  })

  const handleImageError = () => {
    console.error("[v0] Image failed to load:", card.cover_image_url)
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log("[v0] Image loaded successfully:", card.cover_image_url)
  }

  const downloadVCard = () => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(card.vcard_data))
    element.setAttribute('download', `${card.full_name}.vcf`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast({ title: 'Success', description: 'Contact saved!' })
  }

  const copyPhone = () => {
    if (card.phone) {
      navigator.clipboard.writeText(card.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Copied!', description: 'Phone number copied to clipboard' })
    }
  }

  const sendWhatsApp = () => {
    if (card.phone) {
      const message = `Hi ${card.full_name}, I found your contact from your digital card!`
      window.open(`https://wa.me/${card.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            {card.cover_image_url && !imageError ? (
              <img 
                src={card.cover_image_url} 
                alt="Cover" 
                className="w-full h-full object-cover" 
                crossOrigin="anonymous"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: accentColor }} />
            )}
          </div>

          {/* Card Body */}
          <div className="relative px-6 pb-8">
            {/* Profile Image */}
            <div className="flex justify-center -mt-20 mb-4">
              {card.profile_image_url && !imageError ? (
                <img 
                  src={card.profile_image_url}
                  alt={card.full_name}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                  style={{ borderColor: accentColor }}
                  crossOrigin="anonymous"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 border-4 border-white shadow-xl flex items-center justify-center text-white text-6xl font-bold" style={{ borderColor: accentColor }}>
                  {card.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-1">{card.full_name}</h1>

            {/* Job Title & Company */}
            {(card.job_title || card.company_name) && (
              <div className="text-center mb-6">
                {card.job_title && <p className="text-sm font-semibold text-gray-700">{card.job_title}</p>}
                {card.company_name && <p className="text-xs text-gray-500">{card.company_name}</p>}
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3 mb-8">
              {/* Email */}
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5" style={{ color: accentColor }} />
                  <span className="text-sm text-gray-700">{card.email}</span>
                </a>
              )}

              {/* Phone */}
              {card.phone && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyPhone}
                    className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5" style={{ color: accentColor }} />
                    <span className="text-sm text-gray-700">{card.phone}</span>
                  </button>
                  {card.phone && (
                    <button
                      onClick={sendWhatsApp}
                      className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      title="Send via WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </button>
                  )}
                </div>
              )}

              {/* Website */}
              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Globe className="w-5 h-5" style={{ color: accentColor }} />
                  <span className="text-sm text-gray-700 truncate">{card.website}</span>
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={downloadVCard}
                className="flex-1 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                <Download className="w-4 h-4" />
                Save Contact
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-400 text-center mt-6">Digital Business Card</p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Created with FadercoQR
        </p>
      </div>
    </div>
  )
}
