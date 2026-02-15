'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface HeroSection {
  id: number
  section_number: number
  title: string
  description: string
  youtube_url: string
}

export function LandingHeroSections({ sections }: { sections: HeroSection[] }) {
  const [activeSection, setActiveSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const container = document.getElementById('hero-scroll-container')
    if (!container) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsScrolling(false), 1000)

      const scrollTop = container.scrollTop
      const sectionHeight = container.clientHeight
      const current = Math.round(scrollTop / sectionHeight)
      setActiveSection(Math.min(current, sections.length - 1))
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [sections.length])

  const scrollToSection = (index: number) => {
    const container = document.getElementById('hero-scroll-container')
    if (container) {
      const targetScroll = index * container.clientHeight
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Scroll Container */}
      <div
        id="hero-scroll-container"
        className="relative w-full h-screen overflow-y-scroll scroll-smooth snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Hero Sections */}
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="relative w-full h-screen flex flex-col items-center justify-center snap-start overflow-hidden"
          >
            {/* YouTube Background Video */}
            <div className="absolute inset-0 w-full h-full">
              <iframe
                src={`${section.youtube_url}?autoplay=1&mute=1&loop=1&playlist=${section.youtube_url.split('=')[1]}&controls=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                style={{
                  border: 'none',
                  pointerEvents: 'none',
                }}
                allow="autoplay; encrypted-media"
                title={section.title}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20 h-full flex flex-col justify-center">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {section.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-lg">
                  {section.description}
                </p>
              </div>
            </div>

            {/* Scroll Indicator (only on first section) */}
            {index === 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                <p className="text-white text-sm">Scroll to explore</p>
                <ChevronDown className="w-6 h-6 text-white animate-bounce" />
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-white">
            FADERCO CONNECT
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              Home
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              solution
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              green hosting
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              zero paper
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              about us
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              Login
            </a>
            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Dot Indicators */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              activeSection === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
