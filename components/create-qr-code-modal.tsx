'use client'

import type React from 'react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CreateQRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateQRCodeModal({ open, onOpenChange, onSuccess }: CreateQRCodeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    destination_url: '',
    description: '',
  })

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate short code
      const shortCode = Math.random().toString(36).substring(2, 8)

      const { error } = await supabase.from('qr_codes').insert({
        user_id: user.id,
        title: formData.title,
        destination_url: formData.destination_url,
        description: formData.description,
        short_code: shortCode,
        is_active: true,
      })

      if (error) throw error

      toast.success('QR code created successfully!')
      setFormData({ title: '', destination_url: '', description: '' })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating QR code:', error)
      toast.error('Failed to create QR code')
    } finally {
      setLoading(false)
    }
  }

  // Generate QR code data URL using QR server API
  const qrCodeUrl = formData.destination_url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formData.destination_url)}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-[96vw] h-screen max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b flex-shrink-0">
          <DialogTitle>Create New QR Code</DialogTitle>
          <DialogDescription>
            Create a new QR code that redirects to your specified URL. The QR code will be generated automatically with a unique short link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 h-full overflow-hidden px-6 pb-6 pt-3">
            {/* Form Section - Left */}
            <div className="overflow-y-auto pr-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-sm">Title *</Label>
                  <Input
                    id="title"
                    placeholder="My QR Code Campaign"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="h-9 text-sm mt-1"
                  />
                </div>

                {/* Destination URL */}
                <div>
                  <Label htmlFor="url" className="text-sm">Destination URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/landing-page"
                    value={formData.destination_url}
                    onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                    required
                    className="h-9 text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">The URL users will visit when scanning the QR code</p>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about where this QR code will be used or what campaign it supports"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="text-sm mt-1"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="flex-1 h-9 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 h-9 text-sm"
                  >
                    {loading ? 'Creating...' : 'Create QR Code'}
                  </Button>
                </div>
              </form>
            </div>

            {/* QR Code Preview - Right */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 overflow-y-auto">
              <Label className="text-sm font-semibold mb-4">Live QR Preview</Label>
              {qrCodeUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-indigo-500">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code Preview" 
                      className="w-64 h-64 object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Destination URL:</p>
                    <a 
                      href={formData.destination_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:text-blue-800 break-all hover:underline"
                    >
                      {formData.destination_url}
                    </a>
                  </div>
                  {formData.title && (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900">{formData.title}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Enter a URL to generate QR code</p>
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">QR Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
