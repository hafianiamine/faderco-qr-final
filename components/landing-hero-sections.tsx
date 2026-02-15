'use client'

import { useEffect, useState } from 'react'
import { AuthModals } from '@/components/auth-modals'

interface HeroSection {
  id: number
  section_number: number
  title: string
  description: string
  youtube_url: string
}

export function LandingHeroSections({ sections }: { sections: HeroSection[] }) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling || sections.length === 0) return

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

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/embed')) return url
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&vq=hd1080`
  }

  return (
    <>
      <AuthModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />
      
      <div className="relative w-full h-screen overflow-hidden bg-black">
        {/* YouTube Video Background */}
        <div className="absolute inset-0 z-0 w-full h-full">
          {section?.youtube_url && (
            <iframe
              src={getYouTubeEmbedUrl(section.youtube_url)}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none', pointerEvents: 'none' }}
              allow="autoplay; encrypted-media"
              title="Hero background video"
            />
          )}
          {/* Black Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>

        {/* Fixed Header - Fully Transparent */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 md:py-6">
          <div className="flex items-center justify-between w-full">
            <div className="text-white font-bold text-lg md:text-xl tracking-tight">FADERCO CONNECT</div>
            
            <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-white text-sm font-medium">
              <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
              <a href="#" className="hover:text-gray-300 transition-colors">solution</a>
              <a href="#" className="hover:text-gray-300 transition-colors">green hosting</a>
              <a href="#" className="hover:text-gray-300 transition-colors">zero paper</a>
              <a href="#" className="hover:text-gray-300 transition-colors">about us</a>
            </nav>
            
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setLoginOpen(true)}
                className="text-white hover:text-gray-300 transition-colors text-xs md:text-sm font-medium"
              >
                Login
              </button>
              <button 
                onClick={() => setRegisterOpen(true)}
                className="bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 w-full h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-12 pt-20 md:pt-0">
          {/* Left Content */}
          <div className="max-w-2xl flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight text-balance">
              {section?.title || 'Loading...'}
            </h1>
            <p className="text-base md:text-lg text-gray-100 leading-relaxed max-w-xl">
              {section?.description || 'Loading...'}
            </p>
          </div>

          {/* Right Side - Dot Indicators */}
          <div className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 md:gap-4">
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  idx === currentSection ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to section ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 text-center py-4 md:py-6 text-gray-500 text-xs md:text-sm z-20 px-4">
          Built in a corner © 2026 FADERCO QR.
        </div>
      </div>
    </>
  )
}
