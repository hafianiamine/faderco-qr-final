"use client"

import { X, Sparkles } from "lucide-react"
import { useState } from "react"

export function NotificationBanner({ text }: { text: string }) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative z-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Sparkles className="h-4 w-4 flex-shrink-0 animate-pulse" />
          <p className="text-sm font-medium text-balance">{text}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
