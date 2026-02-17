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

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-12">
      {/* Circular Progress */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#000000"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out'
            }}
          />
        </svg>
        
        {/* Percentage Text */}
        <div className="absolute flex flex-col items-center justify-center z-10">
          <span className="text-3xl font-bold text-black">
            {Math.round(progress)}
          </span>
          <span className="text-xs text-gray-600 mt-1">%</span>
        </div>
      </div>

      {/* FADERCO CONNECT Branding */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black tracking-tight text-center">
        FADERCO<br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>CONNECT
      </h1>
    </div>
  )
}
