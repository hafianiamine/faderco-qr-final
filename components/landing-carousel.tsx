"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselSlide {
  id: string
  image_url: string
  duration_seconds: number
  link_url?: string
}

interface LandingCarouselProps {
  slides: CarouselSlide[]
  notificationText?: string
}

export function LandingCarousel({ slides, notificationText }: LandingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [showCarousel, setShowCarousel] = useState(true)
  const [showNotification, setShowNotification] = useState(true)

  useEffect(() => {
    if (!slides || slides.length === 0 || !showCarousel) {
      return
    }

    const currentSlide = slides[currentIndex]
    const timer = setTimeout(
      () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length)
      },
      (currentSlide?.duration_seconds || 5) * 1000,
    )

    return () => clearTimeout(timer)
  }, [currentIndex, autoPlay, slides, showCarousel])

  const goToPrevious = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const currentSlide = slides[currentIndex]

  if (!slides || slides.length === 0 || !showCarousel) {
    return null
  }

  return (
    <div className="relative w-full pointer-events-auto">
      {notificationText && showNotification && (
        <div className="relative mb-3 flex items-center justify-center gap-2 text-center px-3 py-2 animate-fade-in">
          <Sparkles className="h-3 w-3 text-yellow-400 flex-shrink-0" />
          <p className="text-xs font-medium text-white drop-shadow-lg">{notificationText}</p>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900 shadow-xl">
        <img
          src={currentSlide?.image_url || "/placeholder.svg"}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        <button
          onClick={() => setShowCarousel(false)}
          className="absolute top-2 right-2 z-20 bg-white/80 hover:bg-white rounded-full p-1 transition-all"
          aria-label="Close carousel"
        >
          <X className="h-4 w-4 text-gray-900" />
        </button>

        {/* Navigation Buttons */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-gray-900" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition-all"
            >
              <ChevronRight className="h-4 w-4 text-gray-900" />
            </button>
          </>
        )}

        {/* Slide Counter */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {currentIndex + 1} / {slides.length}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2 justify-center">
        {currentSlide?.link_url && (
          <a href={currentSlide.link_url} target="_blank" rel="noopener noreferrer">
            <Button className="bg-blue-500 hover:bg-blue-600 text-xs px-3 py-1 h-auto">
              <ExternalLink className="mr-1 h-3 w-3" />
              Discover
            </Button>
          </a>
        )}
        {slides.length > 1 && (
          <Button variant="outline" onClick={() => setAutoPlay(!autoPlay)} className="bg-white text-xs px-3 py-1 h-auto">
            {autoPlay ? "Pause" : "Play"}
          </Button>
        )}
      </div>

      {/* Dot Navigation */}
      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAutoPlay(false)
                setCurrentIndex(idx)
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "bg-blue-500 w-6" : "bg-gray-400 w-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
