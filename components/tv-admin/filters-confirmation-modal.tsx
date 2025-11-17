"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, X } from 'lucide-react'

interface FiltersProp {
  [key: string]: any
}

interface FiltersConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FiltersProp
  onClearAll?: () => void
}

export function FiltersConfirmationModal({
  isOpen,
  onClose,
  filters,
  onClearAll,
}: FiltersConfirmationModalProps) {
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0)

  const filterEntries = Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)

  if (filterEntries.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Active Filters</DialogTitle>
            <DialogDescription>You haven't applied any filters yet.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const currentFilter = filterEntries[currentFilterIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Active Filters Summary</DialogTitle>
          <DialogDescription>
            You have {filterEntries.length} active filter{filterEntries.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {/* Current Filter Display */}
        <div className="space-y-4 py-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Filter {currentFilterIndex + 1} of {filterEntries.length}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {currentFilter[0]}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                <span className="font-medium">Value:</span> {String(currentFilter[1])}
              </p>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2 justify-center">
            {filterEntries.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentFilterIndex ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
                )}
              />
            ))}
          </div>

          {/* All Filters Summary */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">All Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filterEntries.map(([key, value], index) => (
                <Badge
                  key={index}
                  variant={index === currentFilterIndex ? "default" : "outline"}
                  className="px-3 py-1"
                >
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <DialogFooter className="flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentFilterIndex((prev) =>
                  prev === 0 ? filterEntries.length - 1 : prev - 1
                )
              }
              disabled={filterEntries.length <= 1}
            >
              Previous
            </Button>

            <Button
              onClick={() =>
                setCurrentFilterIndex((prev) =>
                  prev === filterEntries.length - 1 ? 0 : prev + 1
                )
              }
              disabled={filterEntries.length <= 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function
import { cn } from "@/lib/utils"
