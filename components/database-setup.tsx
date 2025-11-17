"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { setupDatabase, checkDatabaseStatus, insertTestRecord } from "@/lib/supabase-setup"
import { Database, RefreshCw, AlertCircle, CheckCircle2, Plus } from "lucide-react"

export default function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await checkDatabaseStatus()
      setStatus(result)

      if (result.exists) {
        setSuccess(`Database table exists with ${result.recordCount} records`)
      } else {
        setError(result.message || "Database table does not exist")
      }
    } catch (err) {
      setError(`Error checking database: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupDatabase = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await setupDatabase()

      if (result.success) {
        setSuccess(result.message)
        await checkStatus()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error setting up database: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsertTestRecord = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await insertTestRecord()

      if (result.success) {
        setSuccess(result.message)
        await checkStatus()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(`Error inserting test record: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Configure and verify your Supabase database connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {status && status.exists && status.recentRecords && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Records:</h3>
            <div className="rounded-md border p-4 bg-gray-50">
              <pre className="text-xs overflow-auto">{JSON.stringify(status.recentRecords, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkStatus} disabled={isLoading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Check Status
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={handleInsertTestRecord}
            disabled={isLoading || !status?.exists}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Insert Test Record
          </Button>

          <Button onClick={handleSetupDatabase} disabled={isLoading} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Setup Database
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
