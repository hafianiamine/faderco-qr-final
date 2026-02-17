"use client"

import { useEffect, useState } from "react"

interface RotatingTextProps {
  words: string[]
  className?: string
}

export function RotatingText({ words, className = "" }: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % words.length
          return newIndex
        })
        setIsAnimating(false)
      }, 300)
    }, [words.length])

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <span
      className={`inline-block min-h-[1.2em] transition-all duration-300 ${
        isAnimating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {words[currentIndex]}
    </span>
  )
}
