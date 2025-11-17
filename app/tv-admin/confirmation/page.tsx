"use client"

import { useState } from "react"
import SpotConfirmation from "@/components/tv-admin/spot-confirmation"
import { BackToDashboardButton } from "@/components/tv-admin/back-to-dashboard-button"
import { Button } from "@/components/ui/button"
import { Filter } from 'lucide-react'
import { FiltersConfirmationModal } from "@/components/tv-admin/filters-confirmation-modal"

export default function ConfirmationPage() {
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters)
  }

  const handleClearAllFilters = () => {
    setActiveFilters({})
  }

  const hasActiveFilters = Object.values(activeFilters).some(
    (val) => val !== "" && val !== null && val !== undefined && val !== "all"
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BackToDashboardButton />
                <h1 className="text-3xl font-bold">Spot Confirmation & Editing</h1>
              </div>
              <p className="text-muted-foreground">Track aired vs failed spots and reschedule when needed</p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => setShowFiltersModal(true)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                View Filters
                <span className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  {Object.values(activeFilters).filter(
                    (v) => v !== "" && v !== null && v !== undefined && v !== "all"
                  ).length}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <SpotConfirmation onFiltersChange={handleFiltersChange} />
      </div>

      <FiltersConfirmationModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={activeFilters}
        onClearAll={handleClearAllFilters}
      />
    </div>
  )
}
