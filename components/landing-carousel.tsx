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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pointer-events-none">
      <div className="relative w-full max-w-2xl pointer-events-auto">
        {notificationText && showNotification && (
          <div className="relative mb-4 flex items-center justify-center gap-2 text-center px-4 py-2 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <p className="text-sm font-medium text-white drop-shadow-lg">{notificationText}</p>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Image */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
          <img
            src={currentSlide?.image_url || "/placeholder.svg"}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          <button
            onClick={() => setShowCarousel(false)}
            className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
            aria-label="Close carousel"
          >
            <X className="h-6 w-6 text-gray-900" />
          </button>

          {/* Navigation Buttons */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
              >
                <ChevronLeft className="h-6 w-6 text-gray-900" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
              >
                <ChevronRight className="h-6 w-6 text-gray-900" />
              </button>
            </>
          )}

          {/* Slide Counter */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {slides.length}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 justify-center">
          {currentSlide?.link_url && (
            <a href={currentSlide.link_url} target="_blank" rel="noopener noreferrer">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <ExternalLink className="mr-2 h-4 w-4" />
                Discover the Tool
              </Button>
            </a>
          )}
          {slides.length > 1 && (
            <Button variant="outline" onClick={() => setAutoPlay(!autoPlay)} className="bg-white">
              {autoPlay ? "Pause" : "Play"}
            </Button>
          )}
        </div>

        {/* Dot Navigation */}
        {slides.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAutoPlay(false)
                  setCurrentIndex(idx)
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "bg-blue-500 w-8" : "bg-gray-400 w-2"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
