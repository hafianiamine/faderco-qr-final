"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  MapPin,
  Link2,
  Calendar,
  Shield,
  Palette,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Target,
  AlertTriangle,
} from "lucide-react"
import { getSupportInfo } from "@/app/actions/admin-actions"

interface FeatureTourModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

const features = [
  {
    icon: AlertTriangle,
    title: "Important Notice & Responsibility",
    description:
      "You are solely responsible for all QR codes you create and the content they link to. Please ensure you comply with all applicable laws and regulations when using this platform.",
    benefit:
      "Keep your password secure and update it regularly. We are not responsible for any misuse of the system or unauthorized access to your account. Always follow best security practices.",
    color: "text-red-500",
    bgColor: "bg-red-50",
    isNotice: true,
  },
  {
    icon: RefreshCw,
    title: "Update QR Anytime — No Reprinting",
    description:
      "Change your QR destination URL even after printing on 1000+ packages. Perfect for brands launching products with evolving campaigns or designers managing client projects that need flexibility.",
    benefit: "Save thousands on reprinting costs and adapt campaigns in real-time.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Scan Limits & Control",
    description:
      "Set maximum scan limits per QR code for exclusive offers, limited editions, or controlled access. Ideal for brands running flash sales or designers creating VIP experiences.",
    benefit: "Create urgency and exclusivity that drives engagement and conversions.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Calendar,
    title: "Schedule Campaigns",
    description:
      "Set start and end dates for automatic activation. Launch holiday campaigns, seasonal promotions, or timed releases without manual intervention. Designers can schedule client campaigns weeks in advance.",
    benefit: "Automate your marketing calendar and never miss a launch window.",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    icon: MapPin,
    title: "Location-Based Access",
    description:
      "Restrict QR scans to specific geographic areas. Perfect for in-store exclusives, regional campaigns, event check-ins, or employee attendance tracking.",
    benefit: "Drive foot traffic to physical locations and prevent code sharing abuse.",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track every scan with location, device, time, and behavior data. Brands get actionable insights for ROI tracking. Designers can prove campaign success to clients with detailed reports.",
    benefit: "Make data-driven decisions and demonstrate measurable results.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    icon: Palette,
    title: "Professional Customization",
    description:
      "Brand your QR codes with custom colors, transparent logos, and outline effects. Designers can match any brand identity perfectly while maintaining scannability.",
    benefit: "Create stunning, on-brand QR codes that enhance your design work.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    icon: Link2,
    title: "Built-in URL Shortener",
    description:
      "Generate short, memorable links for easy sharing across social media, email, and print. Track link performance alongside QR scans for complete campaign visibility.",
    benefit: "Simplify sharing and unify your tracking across all channels.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description:
      "Password protection, domain restrictions, and access controls keep your campaigns secure. Protect client work and prevent unauthorized use of your QR codes.",
    benefit: "Maintain brand integrity and protect sensitive campaigns.",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
]

export function FeatureTourModal({ isOpen, onClose, userName }: FeatureTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [supportInfo, setSupportInfo] = useState("For support, please contact your administrator.")

  useEffect(() => {
    if (isOpen) {
      getSupportInfo().then((result) => {
        setSupportInfo(result.supportInfo)
      })
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const currentFeature = features[currentStep]
  const Icon = currentFeature.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {currentStep === 0 ? (
              <span>Important Notice</span>
            ) : (
              <span>
                Feature {currentStep} of {features.length - 1}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Learn about the amazing features of FADERCO QR Platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className={`rounded-xl ${currentFeature.bgColor} p-6 transition-all duration-300`}>
            <div className="flex items-start gap-4">
              <div className={`rounded-full bg-white p-3 shadow-lg flex-shrink-0`}>
                <Icon className={`h-6 w-6 ${currentFeature.color}`} />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">{currentFeature.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{currentFeature.description}</p>
                {currentFeature.benefit && (
                  <div className="mt-3 rounded-lg bg-white/60 p-3 border-l-4 border-current">
                    <p className="text-xs font-semibold text-gray-900">
                      {currentFeature.isNotice ? "⚠️" : "💡"}{" "}
                      <span className={currentFeature.color}>
                        {currentFeature.isNotice ? "Security Notice:" : "Why it matters:"}
                      </span>{" "}
                      {currentFeature.benefit}
                    </p>
                  </div>
                )}
                {currentFeature.isNotice && (
                  <div className="mt-3 rounded-lg bg-white/80 p-3 border border-gray-300">
                    <p className="text-xs font-medium text-gray-900">
                      <span className="font-bold">Support:</span> {supportInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-8 bg-blue-500" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleSkip} className="text-gray-500 hover:text-gray-700">
              Skip Tour
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrev} className="gap-2 bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2 bg-blue-500 hover:bg-blue-600">
                {currentStep === features.length - 1 ? (
                  <>
                    Get Started
                    <X className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
