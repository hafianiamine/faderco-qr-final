"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download } from "lucide-react"

interface DataExportProps {
  data: any[]
}

export default function DataExport({ data }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (data.length === 0) return

    setIsExporting(true)

    try {
      let content: string
      let filename: string
      let mimeType: string

      if (exportFormat === "csv") {
        const headers = Object.keys(data[0])
        const csvRows = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((header) => {
                const cell = row[header]
                // Handle cells with commas by wrapping in quotes
                return typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
              })
              .join(","),
          ),
        ]
        content = csvRows.join("\n")
        filename = `exported-data-${new Date().toISOString().slice(0, 10)}.csv`
        mimeType = "text/csv"
      } else {
        content = JSON.stringify(data, null, 2)
        filename = `exported-data-${new Date().toISOString().slice(0, 10)}.json`
        mimeType = "application/json"
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
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

        <Button onClick={handleExport} disabled={data.length === 0 || isExporting} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : `Export ${data.length} Records`}
        </Button>
      </div>

      {data.length === 0 && <div className="text-sm text-muted-foreground">No data available to export</div>}
    </div>
  )
}
