"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X } from "lucide-react"
import { useState } from "react"

interface CsvFiltersProps {
  columns: string[]
  filters: Record<string, string>
  onFilterChange: (column: string, value: string) => void
  onClearFilters: () => void
}

export default function CsvFilters({ columns, filters, onFilterChange, onClearFilters }: CsvFiltersProps) {
  const [expanded, setExpanded] = useState<boolean>(false)
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  // Prioritize these columns for filtering
  const priorityColumns = ["Media", "Annonceur", "MarqueProduit", "Secteur", "DateDebut"]

  // Sort columns to show priority columns first
  const sortedColumns = [...columns].sort((a, b) => {
    const aIndex = priorityColumns.indexOf(a)
    const bIndex = priorityColumns.indexOf(b)

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={expanded ? "filters" : undefined}
      onValueChange={(value) => setExpanded(value === "filters")}
    >
      <AccordionItem value="filters">
        <AccordionTrigger className="flex justify-between">
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-sm bg-primary text-primary-foreground rounded-full px-2 py-0.5 ml-2">
              {activeFilterCount}
            </span>
          )}
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {sortedColumns.map((column) => (
              <div key={column} className="space-y-2">
                <Label htmlFor={`filter-${column}`}>{column}</Label>
                <div className="flex gap-2">
                  <Input
                    id={`filter-${column}`}
                    value={filters[column] || ""}
                    onChange={(e) => onFilterChange(column, e.target.value)}
                    placeholder={`Filter by ${column}`}
                  />
                  {filters[column] && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFilterChange(column, "")}
                      className="h-10 w-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClearFilters} disabled={activeFilterCount === 0}>
              Clear All Filters
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
