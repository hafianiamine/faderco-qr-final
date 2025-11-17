"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Download } from "lucide-react"

interface CsvExportProps {
  columns: string[]
  filters: Record<string, string>
}

export default function CsvExport({ columns, filters }: CsvExportProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [isExporting, setIsExporting] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns)

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const selectAllColumns = () => {
    setSelectedColumns([...columns])
  }

  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  const handleExport = async () => {
    if (selectedColumns.length === 0) return

    setIsExporting(true)

    try {
      // Build query parameters
      const params = new URLSearchParams()

      // Add selected columns
      params.append("columns", selectedColumns.join(","))

      // Add filters
      Object.entries(filters).forEach(([column, value]) => {
        if (value) {
          params.append(`filter_${column}`, value)
        }
      })

      // Add format
      params.append("format", exportFormat)

      // Create a download link
      const downloadUrl = `/api/export?${params.toString()}`

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `export-${new Date().toISOString().slice(0, 10)}.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Export Data</h3>

        <RadioGroup
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as "csv" | "json")}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv">CSV Format</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json">JSON Format</Label>
          </div>
        </RadioGroup>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Select Columns to Export</Label>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllColumns}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllColumns}>
                Deselect All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 border rounded-md p-4 max-h-[300px] overflow-y-auto">
            {columns.map((column) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column}`}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={() => handleColumnToggle(column)}
                />
                <Label htmlFor={`column-${column}`} className="text-sm">
                  {column}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || selectedColumns.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </div>
    </div>
  )
}
