"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { getEmailValidationError } from "@/lib/utils/email-validator"

interface AuthModalsProps {
  loginOpen: boolean
  registerOpen: boolean
  onLoginOpenChange: (open: boolean) => void
  onRegisterOpenChange: (open: boolean) => void
}

export function AuthModals({ loginOpen, registerOpen, onLoginOpenChange, onRegisterOpenChange }: AuthModalsProps) {
  return (
    <>
      <LoginModal
        open={loginOpen}
        onOpenChange={onLoginOpenChange}
        onSwitchToRegister={() => {
          onLoginOpenChange(false)
          onRegisterOpenChange(true)
        }}
      />
      <RegisterModal
        open={registerOpen}
        onOpenChange={onRegisterOpenChange}
        onSwitchToLogin={() => {
          onRegisterOpenChange(false)
          onLoginOpenChange(true)
        }}
      />
    </>
  )
}

function LoginModal({
  open,
  onOpenChange,
  onSwitchToRegister,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToRegister: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      setResetSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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

      const { data: profile } = await supabase.from("profiles").select("status, role").eq("id", data.user?.id).single()

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

      onOpenChange(false)

      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (resetSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Check your email</DialogTitle>
            <DialogDescription>
              We&apos;ve sent you a password reset link. Please check your email and follow the instructions.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setResetSuccess(false)
              setShowForgotPassword(false)
              onOpenChange(false)
            }}
            className="w-full"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {showForgotPassword ? "Reset Password" : "Login to FADERCO QR"}
          </DialogTitle>
          <DialogDescription>
            {showForgotPassword
              ? "Enter your email address and we'll send you a reset link"
              : "Enter your credentials to access your account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@faderco.dz"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!showForgotPassword && (
              <div className="grid gap-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? showForgotPassword
                  ? "Sending reset link..."
                  : "Logging in..."
                : showForgotPassword
                  ? "Send Reset Link"
                  : "Login"}
            </Button>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            {!showForgotPassword && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            )}
            {showForgotPassword ? (
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="underline underline-offset-4 hover:text-primary"
              >
                Back to login
              </button>
            ) : (
              <div>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegisterModal({
  open,
  onOpenChange,
  onSwitchToLogin,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [company, setCompany] = useState("")
  const [department, setDepartment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const emailError = await getEmailValidationError(email)
    if (emailError) {
      setError(emailError)
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/pending-approval`,
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            company: company,
            department: department,
          },
        },
      })

      if (error) throw error
      
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Check your email</DialogTitle>
            <DialogDescription>
              We&apos;ve sent you a confirmation email. Please verify your email address and wait for admin approval.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Register for FADERCO QR</DialogTitle>
          <DialogDescription>Create your account with your FADERCO email</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegister}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="register-fullName">Full Name</Label>
              <Input
                id="register-fullName"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-phone">Phone Number</Label>
              <Input
                id="register-phone"
                type="tel"
                placeholder="+213 555 123 456"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@faderco.dz"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-company">Company</Label>
              <Input
                id="register-company"
                type="text"
                placeholder="FADERCO"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-department">Department</Label>
              <Input
                id="register-department"
                type="text"
                placeholder="Marketing"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="underline underline-offset-4 hover:text-primary">
              Login
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
