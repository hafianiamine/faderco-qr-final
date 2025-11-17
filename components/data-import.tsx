"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle } from "lucide-react"
import { importCsvData, importCsvFromUrl } from "@/app/actions"

interface DataImportProps {
  onImport: (data: any[]) => void
}

export default function DataImport({ onImport }: DataImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvUrl, setCsvUrl] = useState("")
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setSuccess(null)
    }
  }

  const handleFileImport = async () => {
    if (!file) {
      setError("Please select a file to import")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      const result = await importCsvData(text, file.name)

      if (result.success && result.data) {
        onImport(result.data)
        setSuccess(`Successfully imported ${result.data.length} records from ${file.name}`)
      } else {
        throw new Error("Failed to import data")
      }
    } catch (err) {
      setError(`Failed to import file: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlImport = async () => {
    if (!csvUrl) {
      setError("Please enter a URL")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await importCsvFromUrl(csvUrl, `URL Import: ${new Date().toISOString()}`)

      if (result.success && result.data) {
        onImport(result.data)
        setSuccess(`Successfully imported ${result.data.length} records from URL`)
      } else {
        throw new Error("Failed to import data from URL")
      }
    } catch (err) {
      setError(`Failed to import from URL: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import from File</h3>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
        </div>
        <Button onClick={handleFileImport} disabled={!file || isLoading} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import File
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import from URL</h3>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="csv-url">CSV URL</Label>
          <div className="flex gap-2">
            <Input
              id="csv-url"
              type="url"
              placeholder="https://example.com/data.csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
            />
            <Button onClick={handleUrlImport} disabled={!csvUrl || isLoading}>
              Import
            </Button>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Supported format: CSV files with headers in the first row</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  )
}
