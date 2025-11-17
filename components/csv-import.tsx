"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle, Check, X, FileUp, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getTableColumns } from "@/lib/db-utils"

const ROW_LIMIT = 10000

export default function CsvImport() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [tableColumns, setTableColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validateOnly, setValidateOnly] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStats, setImportStats] = useState<{
    totalProcessed: number
    newRecords: number
    duplicateCount: number
  } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)
      setSuccess(null)

      // Read the first line to get headers
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const firstLine = text.split("\n")[0]
        const headers = firstLine.split(",").map((h) => h.trim())
        setCsvHeaders(headers)

        // Get table columns and create initial mapping
        getTableColumns().then((columns) => {
          setTableColumns(columns)

          // Create initial mapping based on exact matches
          const initialMapping: Record<string, string> = {}
          headers.forEach((header) => {
            if (columns.includes(header)) {
              initialMapping[header] = header
            }
          })

          setColumnMapping(initialMapping)
        })
      }

      reader.readAsText(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      // Trigger the same processing as handleFileChange
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const firstLine = text.split("\n")[0]
        const headers = firstLine.split(",").map((h) => h.trim())
        setCsvHeaders(headers)

        getTableColumns().then((columns) => {
          setTableColumns(columns)

          const initialMapping: Record<string, string> = {}
          headers.forEach((header) => {
            if (columns.includes(header)) {
              initialMapping[header] = header
            }
          })

          setColumnMapping(initialMapping)
        })
      }

      reader.readAsText(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const clearFile = () => {
    setFile(null)
    setCsvHeaders([])
    setColumnMapping({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const updateColumnMapping = (csvHeader: string, dbColumn: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvHeader]: dbColumn,
    }))
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(null)
    setTotalRecords(0)

    try {
      const chunkSize = 1024 * 1024 // 1MB chunks
      const fileSize = file.size
      const totalChunks = Math.ceil(fileSize / chunkSize)
      let processedChunks = 0
      let processedRecords = 0
      let reachedRowLimit = false
      const validationErrors: string[] = []
      const duplicateRecords = 0

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
              const headers = isFirstChunk ? lines[0].split(",").map((h) => h.trim()) : csvHeaders
              const dataLines = isFirstChunk ? lines.slice(1) : lines

              // Process data with column mapping
              const rows = dataLines
                .map((line) => {
                  const values = line.split(",")
                  const row: Record<string, string> = {}

                  // Apply column mapping
                  headers.forEach((header, index) => {
                    const dbColumn = columnMapping[header]
                    if (dbColumn && index < values.length) {
                      row[dbColumn] = values[index]?.trim() || ""
                    }
                  })

                  return row
                })
                .filter((row) => Object.values(row).some((v) => v))

              // Check if we've reached the row limit
              if (processedRecords + rows.length > ROW_LIMIT) {
                const remainingRows = ROW_LIMIT - processedRecords
                const limitedRows = rows.slice(0, remainingRows)
                reachedRowLimit = true

                // Process only up to the limit
                if (limitedRows.length > 0) {
                  if (validateOnly) {
                    processedRecords += limitedRows.length
                  } else {
                    const supabase = createClient()
                    const { data, error } = await supabase.from("csv_data").insert(limitedRows).select("*")

                    if (error) {
                      validationErrors.push(`Error in batch: ${error.message}`)
                      console.error("Insert error:", error)
                    } else {
                      processedRecords += limitedRows.length
                    }
                  }
                  setTotalRecords(processedRecords)
                }

                // Stop processing more chunks
                processedChunks = totalChunks
                setProgress(100)
                resolve()
                return
              }

              // Process rows normally if we haven't hit the limit
              if (rows.length > 0) {
                if (validateOnly) {
                  processedRecords += rows.length
                } else {
                  const supabase = createClient()
                  const { data, error } = await supabase.from("csv_data").insert(rows).select("*")
                  if (error) {
                    validationErrors.push(`Error in batch: ${error.message}`)
                    console.error("Insert error:", error)
                  } else {
                    processedRecords += rows.length
                  }
                }
                setTotalRecords(processedRecords)
              }

              processedChunks++
              setProgress(Math.round((processedChunks / totalChunks) * 100))

              if (end < fileSize && !reachedRowLimit) {
                // Process next chunk
                resolve(readChunk(end, false))
              } else {
                // All chunks processed or limit reached
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

      if (validateOnly) {
        setSuccess(`Validation complete: ${processedRecords} records are ready to import`)
      } else {
        // Store import statistics for display
        const importStats = {
          totalProcessed: processedRecords + duplicateRecords,
          newRecords: processedRecords,
          duplicateCount: duplicateRecords,
        }
        setImportStats(importStats)

        setSuccess(
          `Import complete: ${processedRecords} new records added, ${duplicateRecords} duplicates skipped (${processedRecords + duplicateRecords} total processed)`,
        )
      }
    } catch (err) {
      console.error("Import error:", err)
      setError(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsUploading(false)
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
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>

          {!validateOnly && importStats && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-blue-50 p-2 rounded text-center">
                <div className="font-bold text-blue-700">{importStats.totalProcessed}</div>
                <div className="text-blue-600">Total Records</div>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="font-bold text-green-700">{importStats.newRecords}</div>
                <div className="text-green-600">New Records</div>
              </div>
              <div className="bg-amber-50 p-2 rounded text-center">
                <div className="font-bold text-amber-700">{importStats.duplicateCount}</div>
                <div className="text-amber-600">Duplicates</div>
              </div>
            </div>
          )}
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          file ? "border-primary" : "border-gray-300"
        } ${isUploading ? "opacity-50" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              <span className="font-medium">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile} disabled={isUploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Glissez et déposez votre fichier CSV ici</p>
            <p className="text-xs text-muted-foreground">Format supporté: CSV avec en-têtes dans la première ligne</p>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-700 text-sm">
              <p className="font-semibold flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Attention
              </p>
              <p className="mb-2">Assurez-vous que votre fichier CSV est bien organisé et structuré.</p>
              <p>Des données mal formatées peuvent empêcher l'algorithme d'IA d'analyser correctement vos données.</p>
            </div>

            <Button type="button" variant="outline" onClick={handleBrowseClick}>
              Parcourir les fichiers
            </Button>
          </div>
        )}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
          ref={fileInputRef}
        />
      </div>

      {file && (
        <div className="mt-2 text-sm text-amber-600">
          <p>Note: Import is limited to {ROW_LIMIT.toLocaleString()} rows for optimal performance.</p>
        </div>
      )}

      {csvHeaders.length > 0 && tableColumns.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Column Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Map your CSV columns to database columns. Only mapped columns will be imported.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-2">
            {csvHeaders.map((header) => (
              <div key={header} className="flex items-center justify-between border p-2 rounded">
                <div className="font-medium">{header}</div>
                <select
                  className="border rounded p-1 text-sm"
                  value={columnMapping[header] || ""}
                  onChange={(e) => updateColumnMapping(header, e.target.value)}
                >
                  <option value="">-- Skip this column --</option>
                  {tableColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="validate-only"
              checked={validateOnly}
              onCheckedChange={(checked) => setValidateOnly(checked === true)}
            />
            <Label htmlFor="validate-only">Validate only (don't insert data)</Label>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {validateOnly ? "Validating" : "Importing"}... {progress}% complete ({totalRecords} records processed)
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={clearFile} disabled={!file || isUploading}>
          Clear
        </Button>
        <Button onClick={handleUpload} disabled={!file || isUploading || Object.keys(columnMapping).length === 0}>
          {isUploading
            ? validateOnly
              ? "Validating..."
              : "Importing..."
            : validateOnly
              ? "Validate Data"
              : "Import Data"}
        </Button>
      </div>
    </div>
  )
}
