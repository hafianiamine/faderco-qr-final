"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { fr } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimePeriodFilterProps {
  onFilterChange: (startDate: string | null, endDate: string | null) => void
  locale?: string
}

export default function TimePeriodFilter({ onFilterChange, locale = "en" }: TimePeriodFilterProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const dateLocale = locale === "fr" ? fr : undefined

  const formatDateForFilter = (date: Date | null): string | null => {
    if (!date || !isValid(date)) return null
    return format(date, "M/d/yyyy")
  }

  const handlePresetFilter = (filter: string) => {
    setActiveFilter(filter)
    const today = new Date()
    let startDate: Date | null = null
    let endDate: Date | null = null

    switch (filter) {
      case "today":
        startDate = today
        endDate = today
        break
      case "yesterday":
        startDate = subDays(today, 1)
        endDate = subDays(today, 1)
        break
      case "thisWeek":
        startDate = startOfWeek(today, { weekStartsOn: 1 })
        endDate = endOfWeek(today, { weekStartsOn: 1 })
        break
      case "lastWeek":
        const lastWeekEnd = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1)
        startDate = startOfWeek(lastWeekEnd, { weekStartsOn: 1 })
        endDate = lastWeekEnd
        break
      case "thisMonth":
        startDate = startOfMonth(today)
        endDate = endOfMonth(today)
        break
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1)
        startDate = startOfMonth(lastMonth)
        endDate = endOfMonth(lastMonth)
        break
      case "last7Days":
        startDate = subDays(today, 6)
        endDate = today
        break
      case "last30Days":
        startDate = subDays(today, 29)
        endDate = today
        break
      case "all":
        startDate = null
        endDate = null
        break
      default:
        break
    }

    onFilterChange(formatDateForFilter(startDate), formatDateForFilter(endDate))
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate || undefined)
    setActiveFilter("custom")

    if (selectedDate && isValid(selectedDate)) {
      const formattedDate = formatDateForFilter(selectedDate)
      onFilterChange(formattedDate, formattedDate)
    }

    setIsCalendarOpen(false)
  }

  const clearFilters = () => {
    setActiveFilter(null)
    setDate(undefined)
    onFilterChange(null, null)
  }

  const getButtonVariant = (filter: string) => {
    return activeFilter === filter ? "default" : "outline"
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Filtrer par période</h3>

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="quick">Périodes rapides</TabsTrigger>
          <TabsTrigger value="custom">Date personnalisée</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={getButtonVariant("today")} size="sm" onClick={() => handlePresetFilter("today")}>
              {locale === "fr" ? "Aujourd'hui" : "Today"}
            </Button>
            <Button variant={getButtonVariant("yesterday")} size="sm" onClick={() => handlePresetFilter("yesterday")}>
              {locale === "fr" ? "Hier" : "Yesterday"}
            </Button>
            <Button variant={getButtonVariant("thisWeek")} size="sm" onClick={() => handlePresetFilter("thisWeek")}>
              {locale === "fr" ? "Cette semaine" : "This week"}
            </Button>
            <Button variant={getButtonVariant("lastWeek")} size="sm" onClick={() => handlePresetFilter("lastWeek")}>
              {locale === "fr" ? "Semaine dernière" : "Last week"}
            </Button>
            <Button variant={getButtonVariant("thisMonth")} size="sm" onClick={() => handlePresetFilter("thisMonth")}>
              {locale === "fr" ? "Ce mois" : "This month"}
            </Button>
            <Button variant={getButtonVariant("lastMonth")} size="sm" onClick={() => handlePresetFilter("lastMonth")}>
              {locale === "fr" ? "Mois dernier" : "Last month"}
            </Button>
            <Button variant={getButtonVariant("last7Days")} size="sm" onClick={() => handlePresetFilter("last7Days")}>
              {locale === "fr" ? "7 derniers jours" : "Last 7 days"}
            </Button>
            <Button variant={getButtonVariant("last30Days")} size="sm" onClick={() => handlePresetFilter("last30Days")}>
              {locale === "fr" ? "30 derniers jours" : "Last 30 days"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="flex flex-col space-y-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "PPP", { locale: dateLocale })
                    : locale === "fr"
                      ? "Sélectionner une date"
                      : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus locale={dateLocale} />
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={clearFilters} disabled={!activeFilter}>
          {locale === "fr" ? "Effacer les filtres" : "Clear filters"}
        </Button>

        <Button variant={getButtonVariant("all")} size="sm" onClick={() => handlePresetFilter("all")}>
          {locale === "fr" ? "Toutes les données" : "All data"}
        </Button>
      </div>
    </div>
  )
}
