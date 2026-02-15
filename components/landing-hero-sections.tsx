'use client'

import { useEffect, useState } from 'react'
import { AuthModals } from '@/components/auth-modals'
import { InfoModal } from '@/components/info-modal'
import { LandingCarousel } from '@/components/landing-carousel'
import { LoadingScreen } from '@/components/loading-screen'
import { Home, Zap, FileText, Users, Loader2, Volume2, VolumeX, Menu, X, Moon, Sun } from 'lucide-react'
import { getCarouselSlides } from '@/app/actions/carousel-actions'

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
  const [showPreloader, setShowPreloader] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCarousel, setShowCarousel] = useState(false)
  const [carouselSlides, setCarouselSlides] = useState<any[]>([])
  const [textVisible, setTextVisible] = useState(false)
  const [activeMenuItems, setActiveMenuItems] = useState<number[]>([])
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Fetch carousel slides and show popup after 3 minutes (180 seconds)
    const timer = setTimeout(async () => {
      const slides = await getCarouselSlides()
      setCarouselSlides(slides)
      setShowCarousel(true)
    }, 180000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Detect mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Show text when preloader is done
    if (!showPreloader) {
      setTextVisible(true)
    }
  }, [showPreloader])

  useEffect(() => {
    // Fade out current text on section change
    setTextVisible(false)
    const timer = setTimeout(() => {
      setTextVisible(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [currentSection])

  useEffect(() => {
    if (mobileMenuOpen) {
      // Trigger staggered animation for menu items
      setActiveMenuItems([])
      const timers = [
        setTimeout(() => setActiveMenuItems([0]), 100),
        setTimeout(() => setActiveMenuItems(prev => [...prev, 1]), 250),
        setTimeout(() => setActiveMenuItems(prev => [...prev, 2]), 400),
        setTimeout(() => setActiveMenuItems(prev => [...prev, 3]), 550)
      ]
      return () => timers.forEach(t => clearTimeout(t))
    } else {
      setActiveMenuItems([])
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling || sections.length === 0) return

      setIsScrolling(true)
      let newSection = currentSection
      
      if (e.deltaY > 0) {
        newSection = (currentSection + 1) % sections.length
      } else {
        newSection = (currentSection - 1 + sections.length) % sections.length
      }

      // Fade out current text
      setTextVisible(false)
      
      // After fade out and delay, switch section and fade in new text
      setTimeout(() => {
        setCurrentSection(newSection)
        setTimeout(() => {
          setTextVisible(true)
          setIsScrolling(false)
        }, 500) // Delay before fading in new text
      }, 500) // Fade out duration
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
        let newSection = currentSection
        
        if (diff > 0) {
          newSection = (currentSection + 1) % sections.length
        } else {
          newSection = (currentSection - 1 + sections.length) % sections.length
        }

        // Fade out current text
        setTextVisible(false)
        
        // After fade out and delay, switch section and fade in new text
        setTimeout(() => {
          setCurrentSection(newSection)
          setTimeout(() => {
            setTextVisible(true)
            setIsScrolling(false)
          }, 500)
        }, 500)
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
  }, [isScrolling, sections.length, currentSection])

  const section = sections[currentSection] || sections[0]

  // Extract YouTube video ID and convert to embed URL
  const getYouTubeEmbedUrl = (url: string, muted: boolean = true) => {
    if (!url) return ''
    // Handle different YouTube URL formats
    let videoId = ''
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0]
    } else {
      videoId = url // assume it's already a video ID
    }
    
    const muteParam = muted ? '1' : '0'
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&fs=0&iv_load_policy=3`
  }

  return (
    <>
      {/* Loading Screen - Shows on initial page load */}
      <LoadingScreen onLoadComplete={() => setShowPreloader(false)} />

      <AuthModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />

      {/* Carousel Modal - Shows after 3 minutes */}
      {showCarousel && carouselSlides.length > 0 && (
        <LandingCarousel 
          slides={carouselSlides} 
          notificationText="Check out our latest tools & features!"
        />
      )}

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
      <div className={`fixed inset-0 w-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`} style={{ height: '100dvh' }}>
        {/* Video Background - Full viewport coverage with iframe cover scaling */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          {section?.youtube_url ? (
              <iframe
                key={section.id}
                src={getYouTubeEmbedUrl(section.youtube_url, isMuted)}
                className="absolute"
                style={{ 
                  border: 'none', 
                  pointerEvents: 'none',
                  top: isMobile ? '-5%' : '50%',
                  left: '50%',
                  transform: isMobile ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
                  width: isMobile ? '200%' : '130%',
                  height: isMobile ? '200%' : '130%',
                  opacity: isDarkMode ? 1 : 0.6
                }}
                allow="autoplay; encrypted-media"
                title="Hero background video"
              />
          ) : (
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'}`} />
          )}
          {/* Gradient Overlay - Black at top fading to transparent */}
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-black via-black/50 to-transparent' : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent'}`} />
        </div>

        {/* Fixed Header - Fully Transparent */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between w-full">
            <button 
              onClick={() => setCurrentSection(0)}
              className={`font-bold text-lg md:text-xl tracking-tight hover:opacity-80 transition-opacity shrink-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              FADERCO CONNECT
            </button>
            
            {/* Desktop Navigation */}
            <nav className={`hidden md:flex items-center gap-1 text-sm font-medium flex-1 justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <button 
                onClick={() => setCurrentSection(0)}
                className={`px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 transform origin-center flex items-center gap-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'}`}
              >
                <Home className="h-4 w-4" />
                Home
              </button>
              <button 
                onClick={() => setOpenModal('solution')}
                className={`px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 transform origin-center flex items-center gap-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'}`}
              >
                <Zap className="h-4 w-4" />
                solution
              </button>
              <button 
                onClick={() => setOpenModal('zero-paper')}
                className={`px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 transform origin-center flex items-center gap-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'}`}
              >
                <FileText className="h-4 w-4" />
                zero paper
              </button>
              <button 
                onClick={() => setOpenModal('about-us')}
                className={`px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 transform origin-center flex items-center gap-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-900/10'}`}
              >
                <Users className="h-4 w-4" />
                about us
              </button>
            </nav>
            
            {/* Desktop Auth & Mobile Hamburger */}
            <div className="flex items-center gap-2 md:gap-6 shrink-0">
              {/* Theme Toggle - Mobile only next to hamburger */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`md:hidden p-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Theme Toggle - Desktop only */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`hidden md:block p-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="hidden md:flex items-center gap-4 md:gap-6">
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

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Fullscreen */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg md:hidden flex flex-col animate-in fade-in duration-300">
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Menu Content - Staggered Animation */}
            <div className="flex flex-col items-center justify-center flex-1 gap-8">
              {[
                { icon: Home, label: 'Home', action: () => setCurrentSection(0) },
                { icon: Zap, label: 'solution', action: () => setOpenModal('solution') },
                { icon: FileText, label: 'zero paper', action: () => setOpenModal('zero-paper') },
                { icon: Users, label: 'about us', action: () => setOpenModal('about-us') }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    item.action()
                    setMobileMenuOpen(false)
                  }}
                  className={`text-white text-2xl font-semibold hover:text-gray-300 transition-colors flex items-center gap-3 ${
                    activeMenuItems.includes(idx) ? 'animate-stagger-in' : 'opacity-0'
                  }`}
                >
                  <item.icon className="h-7 w-7" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-3 w-full px-4 pb-8">
              <button 
                onClick={() => {
                  setLoginOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="text-white border border-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  setRegisterOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className={`relative z-10 w-full h-screen flex items-end px-4 sm:px-6 md:px-12 font-display ${isMobile ? 'pb-40 sm:pb-20 md:pb-16' : 'pb-24 sm:pb-20 md:pb-16'}`}>
          {/* Left Content - Hero Text with Fade In/Out */}
          <div className="w-full md:flex-1 md:max-w-2xl">
            <div className={`transition-all duration-500 ${textVisible ? 'animate-fade-in-blue opacity-100' : 'animate-fade-out-down opacity-0'}`}>
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight text-left max-w-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {section?.title || 'Loading...'}
              </h1>
              <p className={`text-xs sm:text-sm md:text-base leading-relaxed text-left max-w-2xl ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                {section?.description || 'Loading...'}
              </p>
            </div>
          </div>

          {/* Right Side - Dot Indicators - Fixed on right side, stacked vertically on all devices */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 md:gap-4">
            {sections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
                  idx === currentSection 
                    ? isDarkMode ? 'bg-white scale-125' : 'bg-gray-900 scale-125'
                    : isDarkMode ? 'bg-white/50 hover:bg-white/80' : 'bg-gray-900/30 hover:bg-gray-900/60'
                }`}
                aria-label={`Go to section ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`fixed bottom-0 left-0 right-0 text-center py-4 md:py-6 text-xs md:text-sm z-20 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Built in a corner © 2026 FADERCO QR.
        </div>
      </div>
    </>
  )
}
