'use client'

import { useState, useEffect } from 'react'

export function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + Math.random() * 30
        return prev
      })
    }, 300)

    // Show preloader for minimum 2 seconds, then allow transition
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsVisible(false)
        onLoadComplete()
      }, 300)
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [onLoadComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* FADERCO CONNECT Header */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
        <h1 className="text-lg sm:text-2xl font-bold text-black tracking-tight">
          FADERCO<br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>CONNECT
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center gap-8 px-6">
        {/* Spinner */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-black animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-black text-sm sm:text-base font-semibold">Loading experience</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Please wait...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-gray-400 text-xs">
          {Math.round(Math.min(progress, 100))}%
        </p>
      </div>
    </div>
  )
}
