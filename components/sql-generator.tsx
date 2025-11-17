"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Copy, FileUp, AlertCircle } from "lucide-react"
import { getTableColumns } from "@/lib/db-utils"

export default function SqlGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [sqlScript, setSqlScript] = useState<string>("")
  const [tableName, setTableName] = useState<string>("csv_data")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)

      try {
        // Read file to get headers
        const text = await readFileAsText(selectedFile)
        const lines = text.split("\n")
        if (lines.length === 0) {
          setError("File appears to be empty")
          return
        }

        // Get headers from first line
        const headers = lines[0].split(",").map((h) => h.trim())

        // Get table columns to validate
        const tableColumns = await getTableColumns()

        // Generate SQL script
        generateSqlScript(headers, tableColumns)
      } catch (err) {
        setError(`Error reading file: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        reject(new Error("Error reading file"))
      }
      reader.readAsText(file)
    })
  }

  const generateSqlScript = (headers: string[], tableColumns: string[]) => {
    // Find matching columns
    const matchingColumns = headers.filter((header) => tableColumns.includes(header))

    // Generate SQL script
    let script = `-- SQL Script for importing ${file?.name}\n\n`

    // Create temporary table
    script += `-- Step 1: Create a temporary table\n`
    script += `CREATE TEMP TABLE temp_import (\n`
    script += headers.map((header) => `  "${header}" text`).join(",\n")
    script += `\n);\n\n`

    // Copy command (commented out as it needs to be run from psql)
    script += `-- Step 2: Copy data from CSV file (run this from psql)\n`
    script += `-- \\COPY temp_import FROM '/path/to/${file?.name}' WITH (FORMAT csv, HEADER true);\n\n`

    // Insert command
    script += `-- Step 3: Insert data from temp table to actual table\n`
    script += `INSERT INTO ${tableName} (\n`
    script += matchingColumns.map((col) => `  "${col}"`).join(",\n")
    script += `\n)\nSELECT\n`
    script += matchingColumns.map((col) => `  "${col}"`).join(",\n")
    script += `\nFROM temp_import;\n\n`

    // Drop temp table
    script += `-- Step 4: Drop the temporary table\n`
    script += `DROP TABLE temp_import;\n`

    setSqlScript(script)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(sqlScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="table-name">Target Table</Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Table name"
            />
          </div>

          <div>
            <Label>CSV File</Label>
            <div className="flex items-center gap-2">
              <Input type="text" readOnly value={file?.name || ""} placeholder="No file selected" className="flex-1" />
              <Button type="button" onClick={handleBrowseClick}>
                Browse
              </Button>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            </div>
          </div>
        </div>

        {sqlScript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated SQL Script</Label>
              <Button variant="outline" size="sm" onClick={handleCopyClick} className="flex items-center gap-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea value={sqlScript} readOnly className="font-mono text-sm h-80" />
            <p className="text-xs text-muted-foreground">
              Note: You'll need to run the COPY command from psql or another PostgreSQL client with file access. For
              Supabase, you can use the SQL Editor and modify this script to use their import functionality.
            </p>
          </div>
        )}

        {!file && !sqlScript && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center" onClick={handleBrowseClick}>
            <div className="flex justify-center">
              <FileUp className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mt-4">Select a CSV file to generate SQL import script</p>
            <p className="text-xs text-muted-foreground mt-2">
              The script will include commands to create a temp table, import data, and insert into your target table
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
