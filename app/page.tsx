import { QrCode, Zap, BarChart3, Link2, MapPin, Clock } from "lucide-react"
import { QRMockup } from "@/components/qr-mockup"
import { SiteFooter } from "@/components/site-footer"
import { HomePageClient } from "@/components/home-page-client"
import { AnimatedBackground } from "@/components/animated-background"
import { FadeWords } from "@/components/fade-words"
import { LandingCarousel } from "@/components/landing-carousel"
import { getCarouselSlides } from "@/app/actions/carousel-actions"
import { createClient } from "@/lib/supabase/server"

async function getLandingPageSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from("settings").select("key, value").like("key", "landing_%")

  const settingsMap: Record<string, string> = {}
  data?.forEach((setting) => {
    settingsMap[setting.key] = setting.value
  })

  return {
    hookWords: settingsMap.landing_hook_words?.split(",") || ["UPDATE", "SCHEDULE", "CHANGE", "WATCH"],
    hookText: settingsMap.landing_hook_text || "your QR anytime — even after printing.",
    hookSubtitle: settingsMap.landing_hook_subtitle || 'No more "oops, it\'s already printed on 1000 packaging".',
    badgeText: settingsMap.landing_badge_text || "Next-Gen QR Platform",
    feature1Title: settingsMap.landing_feature_1_title || "Real-time Analytics",
    feature1Desc: settingsMap.landing_feature_1_desc || "Track every scan instantly",
    feature2Title: settingsMap.landing_feature_2_title || "Live Map View",
    feature2Desc: settingsMap.landing_feature_2_desc || "See where scans happen",
    feature3Title: settingsMap.landing_feature_3_title || "URL Shortener",
    feature3Desc: settingsMap.landing_feature_3_desc || "Built-in short links",
    feature4Title: settingsMap.landing_feature_4_title || "Who, When, Where",
    feature4Desc: settingsMap.landing_feature_4_desc || "Complete scan details",
  }
}

export default async function HomePage() {
  const content = await getLandingPageSettings()
  const carouselSlides = await getCarouselSlides()

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AnimatedBackground />

      <LandingCarousel slides={carouselSlides} />

      <header className="relative z-10 border-b border-border backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8 lg:px-12">
          <div className="flex items-center gap-2 animate-fade-in">
            <QrCode className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-lg font-semibold md:text-xl">FADERCO QR</span>
          </div>
          <HomePageClient />
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 md:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs md:text-sm animate-fade-in-up backdrop-blur-sm">
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                <span className="text-blue-500 font-medium uppercase">{content.badgeText}</span>
              </div>

              <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl animate-fade-in-up animation-delay-200 font-display">
                <span className="block text-foreground uppercase">
                  <FadeWords
                    words={content.hookWords}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent uppercase"
                  />{" "}
                  {content.hookText}
                </span>
                <span className="block mt-2 text-muted-foreground text-lg md:text-xl lg:text-2xl font-normal">
                  {content.hookSubtitle}
                </span>
              </h1>

              <div className="grid grid-cols-2 gap-3 animate-fade-in-up animation-delay-600">
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold uppercase">{content.feature1Title}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{content.feature1Desc}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold uppercase">{content.feature2Title}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{content.feature2Desc}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <Link2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold uppercase">{content.feature3Title}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{content.feature3Desc}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold uppercase">{content.feature4Title}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">{content.feature4Desc}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <QRMockup />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
