import { QrCode, Zap, BarChart3, Link2, MapPin, Clock } from "lucide-react"
import { QRMockup } from "@/components/qr-mockup"
import { SiteFooter } from "@/components/site-footer"
import { HomePageClient } from "@/components/home-page-client"
import { AnimatedBackground } from "@/components/animated-background"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AnimatedBackground />

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
                <span className="text-blue-500 font-medium">Next-Gen QR Platform</span>
              </div>

              <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl animate-fade-in-up animation-delay-200">
                <span className="block text-foreground">With FADERCO QR you can</span>
                <span className="block mt-2 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  create, track, and analyse
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground md:text-lg lg:text-xl animate-fade-in-up animation-delay-400 lg:mx-0">
                Your complete toolkit for QR code management with built-in analytics, URL shortening, and real-time
                tracking.
              </p>

              <div className="grid grid-cols-2 gap-3 animate-fade-in-up animation-delay-600">
                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold">Real-time Analytics</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">Track every scan instantly</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold">Live Map View</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">See where scans happen</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <Link2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold">URL Shortener</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">Built-in short links</div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/50 backdrop-blur-sm p-3 text-left border border-border/50 hover:border-blue-500/30 transition-all">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs md:text-sm font-semibold">Who, When, Where</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground">Complete scan details</div>
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
