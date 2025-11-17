"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, FileUp } from "lucide-react"
import { getTableColumns } from "@/lib/db-utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function DataValidator() {
  const [file, setFile] = useState<File | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [validationResults, setValidationResults] = useState<{
    totalRows: number
    validRows: number
    missingColumns: string[]
    extraColumns: string[]
    sampleIssues: Array<{ row: number; issue: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setValidationResults(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
      setValidationResults(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const validateFile = async () => {
    if (!file) return

    setIsValidating(true)
    setProgress(0)
    setError(null)
    setValidationResults(null)

    try {
      // Get table columns
      const tableColumns = await getTableColumns()

      const chunkSize = 1024 * 1024 // 1MB chunks
      const fileSize = file.size
      const totalChunks = Math.ceil(fileSize / chunkSize)
      let processedChunks = 0
      let totalRows = 0
      let validRows = 0
      let csvHeaders: string[] = []
      const sampleIssues: Array<{ row: number; issue: string }> = []

      const reader = new FileReader()

      const readChunk = (start: number, isFirstChunk: boolean) => {
        return new Promise<void>((resolve, reject) => {
          const end = Math.min(start + chunkSize, fileSize)
          const chunk = file.slice(start, end)

          reader.onload = async (e) => {
            try {
              const chunkText = e.target?.result as string

              // Parse CSV
              const lines = chunkText.split(/\r?\n/).filter((line) => line.trim())

              if (isFirstChunk) {
                // Get headers from first line
                csvHeaders = lines[0].split(",").map((h) => h.trim())

                // Skip header row for counting
                totalRows += lines.length - 1
              } else {
                totalRows += lines.length
              }

              // Validate rows
              const dataLines = isFirstChunk ? lines.slice(1) : lines

              for (let i = 0; i < dataLines.length; i++) {
                const line = dataLines[i]
                if (!line.trim()) continue

                const values = line.split(",")

                // Check if row has correct number of columns
                if (values.length !== csvHeaders.length) {
                  const rowNumber = isFirstChunk ? i + 2 : totalRows - dataLines.length + i + 1
                  if (sampleIssues.length < 10) {
                    sampleIssues.push({
                      row: rowNumber,
                      issue: `Column count mismatch: expected ${csvHeaders.length}, got ${values.length}`,
                    })
                  }
                  continue
                }

                // Check for empty required fields
                let hasRequiredFields = false
                if (csvHeaders.includes("Media") && values[csvHeaders.indexOf("Media")].trim()) {
                  hasRequiredFields = true
                }
                if (csvHeaders.includes("DateDebut") && values[csvHeaders.indexOf("DateDebut")].trim()) {
                  hasRequiredFields = true
                }
                if (csvHeaders.includes("Annonceur") && values[csvHeaders.indexOf("Annonceur")].trim()) {
                  hasRequiredFields = true
                }

                if (!hasRequiredFields) {
                  const rowNumber = isFirstChunk ? i + 2 : totalRows - dataLines.length + i + 1
                  if (sampleIssues.length < 10) {
                    sampleIssues.push({
                      row: rowNumber,
                      issue: "Missing required fields (Media, DateDebut, or Annonceur)",
                    })
                  }
                  continue
                }

                validRows++
              }

              processedChunks++
              setProgress(Math.round((processedChunks / totalChunks) * 100))

              if (end < fileSize) {
                // Process next chunk
                resolve(readChunk(end, false))
              } else {
                // All chunks processed
                resolve()
              }
            } catch (error) {
              reject(error)
            }
          }

          reader.onerror = () => {
            reject(new Error("Error reading file"))
          }

          reader.readAsText(chunk)
        })
      }

      await readChunk(0, true)

      // Compare headers with table columns
      const missingColumns = tableColumns.filter(
        (col) => !["id", "created_at"].includes(col) && !csvHeaders.includes(col),
      )

      const extraColumns = csvHeaders.filter((header) => !tableColumns.includes(header))

      setValidationResults({
        totalRows,
        validRows,
        missingColumns,
        extraColumns,
        sampleIssues,
      })
    } catch (err) {
      console.error("Validation error:", err)
      setError(`Validation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsValidating(false)
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

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          file ? "border-primary" : "border-gray-300"
        } ${isValidating ? "opacity-50" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              <span className="font-medium">{file.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUp className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Drag and drop your CSV file here</p>
            <p className="text-xs text-muted-foreground">The file will be validated against the database schema</p>
            <Button type="button" variant="outline" onClick={handleBrowseClick}>
              Browse Files
            </Button>
          </div>
        )}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isValidating}
          ref={fileInputRef}
        />
      </div>

      {isValidating && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">Validating... {progress}% complete</p>
        </div>
      )}

      {validationResults && (
        <Card className="mt-6">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold">{validationResults.totalRows.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valid Rows</p>
                <p className="text-2xl font-bold">
                  {validationResults.validRows.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({Math.round((validationResults.validRows / validationResults.totalRows) * 100)}%)
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Column Analysis</p>

              {validationResults.missingColumns.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Missing Columns (in database but not in CSV)</p>
                  <div className="flex flex-wrap gap-2">
                    {validationResults.missingColumns.map((col) => (
                      <Badge key={col} variant="outline">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {validationResults.extraColumns.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Extra Columns (in CSV but not in database)</p>
                  <div className="flex flex-wrap gap-2">
                    {validationResults.extraColumns.map((col) => (
                      <Badge key={col} variant="outline">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {validationResults.sampleIssues.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Sample Issues</p>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {validationResults.sampleIssues.map((issue, i) => (
                    <div key={i} className="text-xs py-1 border-b last:border-0">
                      <span className="font-medium">Row {issue.row}:</span> {issue.issue}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert
              className={
                validationResults.validRows === validationResults.totalRows
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }
            >
              <Check
                className={`h-4 w-4 ${validationResults.validRows === validationResults.totalRows ? "text-green-500" : "text-yellow-500"}`}
              />
              <AlertDescription
                className={
                  validationResults.validRows === validationResults.totalRows ? "text-green-700" : "text-yellow-700"
                }
              >
                {validationResults.validRows === validationResults.totalRows
                  ? "All rows are valid and ready for import"
                  : `${validationResults.totalRows - validationResults.validRows} rows have issues that may cause import problems`}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setFile(null)
            setValidationResults(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }}
          disabled={!file || isValidating}
        >
          Clear
        </Button>
        <Button onClick={validateFile} disabled={!file || isValidating}>
          {isValidating ? "Validating..." : "Validate CSV"}
        </Button>
      </div>
    </div>
  )
}
