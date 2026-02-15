'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface HeroSection {
  id: number
  section_number: number
  title: string
  description: string
  youtube_url: string
}

const RANDOM_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1518066000714-58c45f1b773c?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1506362249092-2ff845876ae6?w=1920&h=1080&fit=crop',
]

export function LandingHeroSections({ sections }: { sections: HeroSection[] }) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('')

  useEffect(() => {
    // Set random background image
    const randomImage = RANDOM_IMAGES[Math.floor(Math.random() * RANDOM_IMAGES.length)]
    setBackgroundImage(randomImage)
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return

      setIsScrolling(true)
      setTimeout(() => setIsScrolling(false), 1000)

      if (e.deltaY > 0) {
        setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1))
      } else {
        setCurrentSection((prev) => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isScrolling, sections.length])

  const section = sections[currentSection] || sections[0]

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Fixed Header - Fully Transparent */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-12 py-6">
          <div className="text-white font-bold text-lg tracking-tight">FADERCO CONNECT</div>
          
          <nav className="flex items-center gap-12 text-white text-sm font-medium">
            <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="hover:text-gray-300 transition-colors">solution</a>
            <a href="#" className="hover:text-gray-300 transition-colors">green hosting</a>
            <a href="#" className="hover:text-gray-300 transition-colors">zero paper</a>
            <a href="#" className="hover:text-gray-300 transition-colors">about us</a>
          </nav>
          
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-white hover:text-gray-300 transition-colors text-sm font-medium">
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 w-full h-screen flex items-center justify-between px-12">
        {/* Left Content */}
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight text-balance">
            {section?.title || 'Loading...'}
          </h1>
          <p className="text-lg text-gray-100 leading-relaxed max-w-xl">
            {section?.description || 'Loading...'}
          </p>
        </div>

        {/* Right Side - Dot Indicators */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
          {sections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSection(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === currentSection ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to section ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 text-center py-6 text-gray-500 text-sm z-20">
        Built in a corner © 2026 FADERCO QR.
      </div>
    </div>
  )
}
