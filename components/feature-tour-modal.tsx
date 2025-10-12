"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, BarChart3, MapPin, Link2, Calendar, Shield, Palette, ChevronLeft, ChevronRight, X } from "lucide-react"

interface FeatureTourModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

const features = [
  {
    icon: QrCode,
    title: "Create Dynamic QR Codes",
    description:
      "Generate professional QR codes with custom colors, logos, and styling. Update the destination URL anytime — even after printing.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: MapPin,
    title: "Location-Based Access",
    description:
      "Set geographic restrictions on your QR codes. Perfect for in-store promotions, regional campaigns, and on-site employee check-ins.",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track every scan instantly with detailed analytics including location, device type, time, and user behavior patterns.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Link2,
    title: "Built-in URL Shortener",
    description:
      "Create short, memorable links for your QR codes. Easy to share and track across all your marketing channels.",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    icon: Calendar,
    title: "Schedule & Expire QR Codes",
    description:
      "Set start and end dates for your campaigns. Automatically activate or deactivate QR codes based on your schedule.",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description:
      "Password protection, scan limits, and domain restrictions keep your QR codes secure and prevent unauthorized access.",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description:
      "Brand your QR codes with custom colors, logos with transparent backgrounds, and outline effects for a professional look.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
]

export function FeatureTourModal({ isOpen, onClose, userName }: FeatureTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {currentStep === 0 ? (
              <span>Hello {userName ? userName.split("@")[0] : "there"}! 👋</span>
            ) : (
              <span>
                Feature {currentStep + 1} of {features.length}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {currentStep === 0 && (
            <p className="text-gray-600 text-lg">
              Welcome to your QR code management platform! Let's show you what you can do with our system.
            </p>
          )}

          <div className={`rounded-2xl ${currentFeature.bgColor} p-8 transition-all duration-300`}>
            <div className="flex items-start gap-6">
              <div className={`rounded-full bg-white p-4 shadow-lg`}>
                <Icon className={`h-8 w-8 ${currentFeature.color}`} />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">{currentFeature.title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{currentFeature.description}</p>
              </div>
            </div>
          </div>

          {/* Progress indicators */}
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

          {/* Navigation buttons */}
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
