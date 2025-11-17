"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function AutoSetupPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSetup = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auto-setup-admin", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Setup failed")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Account Setup</CardTitle>
          <CardDescription>
            Click the button below to automatically create and configure your admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success ? (
            <>
              <Button onClick={handleSetup} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Create Admin Account"
                )}
              </Button>

              {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Admin account created successfully!</span>
              </div>

              <div className="p-4 bg-muted rounded-md space-y-2">
                <p className="text-sm font-medium">Login Credentials:</p>
                <p className="text-sm">
                  Email: <code className="bg-background px-2 py-1 rounded">admin@fadercoqr.com</code>
                </p>
                <p className="text-sm">
                  Password: <code className="bg-background px-2 py-1 rounded">Admin@1234</code>
                </p>
              </div>

              <Button onClick={() => (window.location.href = "/auth/login")} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
