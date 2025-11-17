"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { X } from "lucide-react"

interface DataFiltersProps {
  columns: string[]
  filters: Record<string, string>
  onFilterChange: (column: string, value: string) => void
  onClearFilters: () => void
}

export default function DataFilters({ columns, filters, onFilterChange, onClearFilters }: DataFiltersProps) {
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <Accordion type="single" collapsible className="w-full">
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
            {columns.map((column) => (
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
