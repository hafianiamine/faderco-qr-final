'use client'

import { useEffect, useState } from 'react'
import { AuthModals } from '@/components/auth-modals'
import { InfoModal } from '@/components/info-modal'

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
  const [openModal, setOpenModal] = useState<string | null>(null)

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling || sections.length === 0) return

      setIsScrolling(true)
      setTimeout(() => setIsScrolling(false), 800)

      if (e.deltaY > 0) {
        // Scroll down - loop back to first section if at the end
        setCurrentSection((prev) => (prev + 1) % sections.length)
      } else {
        // Scroll up - loop to last section if at the beginning
        setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length)
      }
    }

    let touchStart = 0
    let touchEnd = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.changedTouches[0].screenY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEnd = e.changedTouches[0].screenY
      if (isScrolling || sections.length === 0) return

      const diff = touchStart - touchEnd
      if (Math.abs(diff) > 50) {
        setIsScrolling(true)
        setTimeout(() => setIsScrolling(false), 800)

        if (diff > 0) {
          // Swipe up - loop back to first section if at the end
          setCurrentSection((prev) => (prev + 1) % sections.length)
        } else {
          // Swipe down - loop to last section if at the beginning
          setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length)
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isScrolling, sections.length])

  const section = sections[currentSection] || sections[0]

  // Convert YouTube URL to embed format - without controls
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/embed')) return url
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&fs=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`
  }

  return (
    <>
      <AuthModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />

      {/* Info Modals */}
      <InfoModal
        open={openModal === 'solution'}
        onOpenChange={(open) => setOpenModal(open ? 'solution' : null)}
        title="Our Solution"
        description="Smart NFC and QR technology for modern businesses"
        content={
          <div className="space-y-4 text-sm text-gray-700">
            <p>We provide innovative NFC and QR code solutions that allow businesses to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Update content anytime without reprinting</li>
              <li>Track engagement in real-time</li>
              <li>Create sustainable, reusable experiences</li>
              <li>Reduce operational costs and environmental impact</li>
            </ul>
          </div>
        }
      />

      <InfoModal
        open={openModal === 'green-hosting'}
        onOpenChange={(open) => setOpenModal(open ? 'green-hosting' : null)}
        title="Green Hosting"
        description="Sustainable infrastructure for a better future"
        content={
          <div className="space-y-4 text-sm text-gray-700">
            <p>Our commitment to environmental sustainability includes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>100% renewable energy powered servers</li>
              <li>Carbon-neutral operations</li>
              <li>Minimal electronic waste</li>
              <li>Eco-friendly business practices</li>
            </ul>
          </div>
        }
      />

      <InfoModal
        open={openModal === 'zero-paper'}
        onOpenChange={(open) => setOpenModal(open ? 'zero-paper' : null)}
        title="Zero Paper Experience"
        description="Go digital, eliminate waste"
        content={
          <div className="space-y-4 text-sm text-gray-700">
            <p>Transform your business with our zero-paper solutions:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Digital business cards with NFC technology</li>
              <li>Reusable ID cards that update instantly</li>
              <li>Smart QR codes for dynamic content</li>
              <li>Complete traceability and analytics</li>
            </ul>
          </div>
        }
      />

      <InfoModal
        open={openModal === 'about-us'}
        onOpenChange={(open) => setOpenModal(open ? 'about-us' : null)}
        title="About FADERCO Connect"
        description="Leading innovation in sustainable digital solutions"
        content={
          <div className="space-y-4 text-sm text-gray-700">
            <p>FADERCO Connect is a forward-thinking company dedicated to revolutionizing how businesses interact with their customers through sustainable, innovative NFC and QR technology.</p>
            <p>Our mission is to eliminate unnecessary paper waste while providing cutting-edge digital solutions that are secure, scalable, and environmentally responsible.</p>
            <p>Founded with a vision of building a connected world, we're committed to helping businesses make a positive impact on the environment while improving their operations.</p>
          </div>
        }
      />
      
      <div className="relative w-full h-screen overflow-hidden bg-black">
        {/* YouTube Video Background */}
        <div className="absolute inset-0 z-0 w-full h-full">
          {section?.youtube_url && (
            <iframe
              key={section.id}
              src={getYouTubeEmbedUrl(section.youtube_url)}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none', pointerEvents: 'none' }}
              allow="autoplay; encrypted-media"
              title="Hero background video"
            />
          )}
          {/* Black Gradient Overlay - Super dark left, fading to transparent top */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>

        {/* Fixed Header - Fully Transparent */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 md:py-6">
          <div className="flex items-center justify-between w-full">
            <button 
              onClick={() => setCurrentSection(0)}
              className="text-white font-bold text-lg md:text-xl tracking-tight hover:opacity-80 transition-opacity"
            >
              FADERCO CONNECT
            </button>
            
            <nav className="hidden md:flex items-center gap-2 lg:gap-4 text-white text-sm font-medium">
              <button 
                onClick={() => setCurrentSection(0)}
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 transform origin-center"
              >
                Home
              </button>
              <button 
                onClick={() => setOpenModal('solution')}
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 transform origin-center"
              >
                solution
              </button>
              <button 
                onClick={() => setOpenModal('green-hosting')}
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 transform origin-center"
              >
                green hosting
              </button>
              <button 
                onClick={() => setOpenModal('zero-paper')}
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 transform origin-center"
              >
                zero paper
              </button>
              <button 
                onClick={() => setOpenModal('about-us')}
                className="px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 transform origin-center"
              >
                about us
              </button>
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
        <div className="relative z-10 w-full h-screen flex items-end px-4 sm:px-6 md:px-12 pb-24 sm:pb-20 md:pb-16 transition-opacity duration-500">
          {/* Left Content - Positioned at bottom left */}
          <div className="w-full md:flex-1 md:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
              {section?.title || 'Loading...'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-100 leading-relaxed text-left max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              {section?.description || 'Loading...'}
            </p>
          </div>

          {/* Right Side - Dot Indicators */}
          <div className="fixed right-4 sm:right-6 md:right-8 bottom-16 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-20 flex sm:flex-col gap-2 sm:gap-3 md:gap-4">
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
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
