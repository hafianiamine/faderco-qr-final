'use client'

import { useState, useEffect } from 'react'

export function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Show preloader for minimum 2 seconds, then allow transition
    const timer = setTimeout(() => {
      setIsVisible(false)
      onLoadComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onLoadComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-white text-sm sm:text-base font-medium">Loading experience</p>
          <p className="text-white/60 text-xs sm:text-sm mt-2">Please wait...</p>
        </div>

        {/* Progress Indicator */}
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
