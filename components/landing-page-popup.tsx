"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface LandingPagePopupProps {
  enabled: boolean
  title: string
  description: string
  imageUrl?: string
}

export function LandingPagePopup({ enabled, title, description, imageUrl }: LandingPagePopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [enabled])

  if (!enabled || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="relative w-full h-full md:h-auto md:max-w-lg bg-white md:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:rounded-2xl rounded-none">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 hover:bg-gray-100 bg-white/90 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        {imageUrl && (
          <div className="relative w-full h-64 md:h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
            <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
          </div>
        )}

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
          <p className="text-gray-600 text-center">{description}</p>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setIsOpen(false)}>
            Got it!
          </Button>
        </div>
      </div>
    </div>
  )
}
