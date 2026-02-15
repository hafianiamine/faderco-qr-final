'use client'

import { useState, useEffect } from 'react'

export function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + Math.random() * 25
        return prev
      })
    }, 200)

    // Complete at 2 seconds
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-12">
      {/* FADERCO CONNECT Branding */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight text-center">
        FADERCO<br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>CONNECT
      </h1>

      {/* Progress Bar */}
      <div className="w-40 h-1 bg-gray-300 rounded-full overflow-hidden">
        <div 
          className="h-full bg-black rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
