'use client'

import { Mail, Phone, Briefcase, Globe, Linkedin, Twitter, Facebook, Instagram, Download } from 'lucide-react'

interface BusinessCardData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  photo?: string
}

function parseVCard(vCardData: string): BusinessCardData {
  const data: BusinessCardData = {
    firstName: '',
    lastName: '',
  }

  const lines = vCardData.split('\n')

  for (const line of lines) {
    if (line.startsWith('FN:')) {
      const fullName = line.substring(3)
      const parts = fullName.split(' ')
      data.firstName = parts[0] || ''
      data.lastName = parts.slice(1).join(' ') || ''
    }
    if (line.startsWith('N:')) {
      const nameParts = line.substring(2).split(';')
      data.lastName = nameParts[0] || data.lastName
      data.firstName = nameParts[1] || data.firstName
    }
    if (line.startsWith('EMAIL:')) {
      data.email = line.substring(6)
    }
    if (line.startsWith('TEL:')) {
      data.phone = line.substring(4)
    }
    if (line.startsWith('ORG:')) {
      data.company = line.substring(4)
    }
    if (line.startsWith('TITLE:')) {
      data.position = line.substring(6)
    }
    if (line.startsWith('URL:')) {
      data.website = line.substring(4)
    }
    if (line.includes('X-SOCIALPROFILE;TYPE=LinkedIn:')) {
      data.linkedin = line.split('X-SOCIALPROFILE;TYPE=LinkedIn:')[1]
    }
    if (line.includes('X-SOCIALPROFILE;TYPE=Twitter:')) {
      data.twitter = line.split('X-SOCIALPROFILE;TYPE=Twitter:')[1]
    }
    if (line.includes('X-SOCIALPROFILE;TYPE=Facebook:')) {
      data.facebook = line.split('X-SOCIALPROFILE;TYPE=Facebook:')[1]
    }
    if (line.includes('X-SOCIALPROFILE;TYPE=Instagram:')) {
      data.instagram = line.split('X-SOCIALPROFILE;TYPE=Instagram:')[1]
    }
    if (line.includes('PHOTO;')) {
      const photoMatch = line.match(/PHOTO[^:]*:(.+)/)
      if (photoMatch) {
        data.photo = `data:image/jpeg;base64,${photoMatch[1]}`
      }
    }
  }

  return data
}

export function BusinessCardDisplay({ vCardData }: { vCardData: string }) {
  const card = parseVCard(vCardData)

  const downloadVCard = () => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`)
    element.setAttribute('download', `${card.firstName}_${card.lastName}.vcf`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header Background */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

        {/* Card Content */}
        <div className="px-6 pb-6 pt-0">
          {/* Profile Photo */}
          {card.photo ? (
            <div className="mb-4 flex justify-center">
              <img
                src={card.photo || "/placeholder.svg"}
                alt={`${card.firstName} ${card.lastName}`}
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                style={{ marginTop: '-64px' }}
              />
            </div>
          ) : (
            <div
              className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-200 to-purple-200 shadow-lg font-bold text-white text-3xl"
              style={{ marginTop: '-64px' }}
            >
              {card.firstName.charAt(0)}
              {card.lastName.charAt(0)}
            </div>
          )}

          {/* Name */}
          <h1 className="text-center text-2xl font-bold text-gray-900">
            {card.firstName} {card.lastName}
          </h1>

          {/* Position */}
          {card.position && (
            <p className="mt-1 text-center text-sm font-semibold text-indigo-600">{card.position}</p>
          )}

          {/* Company */}
          {card.company && (
            <p className="text-center text-sm text-gray-600">{card.company}</p>
          )}

          {/* Contact Information */}
          <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
            {card.email && (
              <a
                href={`mailto:${card.email}`}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 hover:bg-indigo-50 transition"
              >
                <Mail className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span className="break-all">{card.email}</span>
              </a>
            )}

            {card.phone && (
              <a
                href={`tel:${card.phone}`}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 hover:bg-indigo-50 transition"
              >
                <Phone className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span>{card.phone}</span>
              </a>
            )}

            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 hover:bg-indigo-50 transition"
              >
                <Globe className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span className="break-all">{card.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Social Links */}
          {(card.linkedin || card.twitter || card.facebook || card.instagram) && (
            <div className="mt-6 flex justify-center gap-4 border-t border-gray-200 pt-6">
              {card.linkedin && (
                <a
                  href={card.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {card.twitter && (
                <a
                  href={card.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition"
                  title="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {card.facebook && (
                <a
                  href={card.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {card.instagram && (
                <a
                  href={card.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={downloadVCard}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 px-4 font-semibold text-white hover:bg-indigo-700 transition"
          >
            <Download className="h-5 w-5" />
            Save Contact
          </button>
        </div>
      </div>
    </div>
  )
}
