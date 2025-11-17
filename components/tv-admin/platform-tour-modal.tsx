'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, X } from 'lucide-react'

const PLATFORM_FEATURES = [
  {
    id: 1,
    title: 'Manage TV Channel Deals 📺',
    description:
      'Create and manage TV channel contracts with spot allocations, payments tracking, and special event pricing. Perfect for managing multiple channel relationships and campaign budgets.',
    highlight:
      '💡 Why it matters: Centralize all your TV advertising agreements in one place and never lose track of contract details or payment schedules.',
  },
  {
    id: 2,
    title: 'Brand Hierarchy Management 🏢',
    description:
      'Organize your brands in a hierarchical structure (Category → Brand → Sub-brand). Simplify management of multiple brands and sub-brands across different channels.',
    highlight:
      '💡 Why it matters: Keep your brand portfolio organized and easily manage brand-specific campaigns without confusion.',
  },
  {
    id: 3,
    title: 'Intelligent Ad Planning & Scheduling 📅',
    description:
      'Schedule TV ads with automatic validation against contract limits, daily caps, and available spots. Real-time calculations show resource consumption and remaining capacity.',
    highlight:
      '💡 Why it matters: Never exceed contract limits or daily caps. Get instant feedback on ad scheduling decisions.',
  },
  {
    id: 4,
    title: 'Spot Confirmation & Rescheduling ✅',
    description:
      'Track which ads aired successfully and which failed. Easily reschedule failed spots to different dates or time slots with automatic recalculation.',
    highlight:
      '💡 Why it matters: Ensure all your paid ads actually air. Quick rescheduling keeps your campaigns on track.',
  },
  {
    id: 5,
    title: 'Comprehensive Analytics Dashboard 📊',
    description:
      'Visualize deal consumption, brand performance trends, channel utilization, and spending analysis. Multiple chart types help you understand campaign performance at a glance.',
    highlight:
      '💡 Why it matters: Make data-driven decisions with real-time insights into your TV advertising ROI.',
  },
  {
    id: 6,
    title: 'Special Events & Extra Packages 🎉',
    description:
      'Add special events (Ramadan, holidays, etc.) with custom pricing. Purchase extra packages when initial spots run out to maximize your campaign reach.',
    highlight:
      '💡 Why it matters: Capitalize on high-traffic periods and maximize your advertising flexibility.',
  },
]

interface PlatformTourModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PlatformTourModal({ isOpen, onClose }: PlatformTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const feature = PLATFORM_FEATURES[currentStep]
  const progress = ((currentStep + 1) / PLATFORM_FEATURES.length) * 100

  const handleNext = () => {
    if (currentStep < PLATFORM_FEATURES.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Welcome to TV Ad Scheduling! 👋
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Let's show you what you can do with our platform:
          </p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {feature.description}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
              <p className="text-xs text-blue-900 dark:text-blue-300 font-medium">
                {feature.highlight}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1 mb-6">
            {PLATFORM_FEATURES.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= currentStep
                    ? 'bg-blue-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
            Step {currentStep + 1} of {PLATFORM_FEATURES.length}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            Skip Tour
          </button>
          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {currentStep === PLATFORM_FEATURES.length - 1 ? (
              <>
                Get Started <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
