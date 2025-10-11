"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const user = data.user

      if (!user?.email_confirmed_at) {
        await supabase.auth.signOut()
        setError("Email not confirmed. Please check your email or contact an administrator to confirm your account.")
        setIsLoading(false)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("status, role").eq("id", user?.id).single()

      // Allow admin email to bypass approval check
      if (user?.email !== "admin@fadercoqr.com") {
        if (profile?.status === "pending") {
          await supabase.auth.signOut()
          setError("Your account is pending approval. Please wait for an administrator to approve your registration.")
          setIsLoading(false)
          return
        }

        if (profile?.status === "rejected") {
          await supabase.auth.signOut()
          setError("Your account registration was rejected. Please contact an administrator.")
          setIsLoading(false)
          return
        }

        if (profile?.status === "blocked") {
          await supabase.auth.signOut()
          setError("Your account has been blocked. Please contact an administrator.")
          setIsLoading(false)
          return
        }
      }

      if (profile?.role === "admin") {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
      router.refresh()
    } catch (error: unknown) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login to FADERCO QR</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@faderco.dz"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="underline underline-offset-4">
                    Register
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
