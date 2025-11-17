"use client"

import { useState, useEffect } from "react"

interface FadeWordsProps {
  words: string[]
  className?: string
}

export function FadeWords({ words, className = "" }: FadeWordsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false)
    }, 3500) // Show for 3.5 seconds

    const changeWordTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
      setIsVisible(true)
    }, 5000) // Total cycle: 5 seconds

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(changeWordTimer)
    }
  }, [currentIndex, words.length])

  return (
    <span
      className={`inline-block transition-opacity duration-[1500ms] ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {words[currentIndex]}
    </span>
  )
}
