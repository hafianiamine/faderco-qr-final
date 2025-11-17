"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ConfirmAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const confirmEmail = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/confirm-admin-email", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: "Admin email confirmed! You can now login." })
      } else {
        setResult({ success: false, message: data.error || "Failed to confirm email" })
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Admin Email</CardTitle>
          <CardDescription>Click the button below to manually confirm the admin email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={confirmEmail} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Admin Email"
            )}
          </Button>

          {result && (
            <div
              className={`flex items-start gap-2 p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
                <p className="text-sm">{result.message}</p>
                {result.success && (
                  <p className="text-sm mt-2">
                    You can now{" "}
                    <a href="/" className="underline font-medium">
                      login here
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
