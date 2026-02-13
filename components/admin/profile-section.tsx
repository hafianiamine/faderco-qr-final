"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Upload, Loader2, Check, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProfileSection() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarKey, setAvatarKey] = useState(Date.now())
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone_number: "",
    avatar_url: "",
  })
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    scanAlerts: false,
    weeklyReports: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile({
        name: data?.full_name || "",
        email: user.email || "",
        phone_number: data?.phone_number || "",
        avatar_url: data?.avatar_url || "",
      })
      setNotifications({
        emailNotifications: data?.notification_email ?? true,
        scanAlerts: data?.notification_scan_alerts ?? false,
        weeklyReports: data?.notification_weekly_reports ?? true,
      })
      setAvatarKey(Date.now())
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const { url } = await response.json()

      setProfile((prev) => ({ ...prev, avatar_url: url }))

      // Reload from database to ensure we have the latest data
      await loadProfile()

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.name,
          phone_number: profile.phone_number,
          notification_email: notifications.emailNotifications,
          notification_scan_alerts: notifications.scanAlerts,
          notification_weekly_reports: notifications.weeklyReports,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      let passwordUpdated = false
      if (passwords.newPassword || passwords.confirmPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          toast({
            title: "Password not updated",
            description: "Passwords do not match. Other profile changes were saved.",
            variant: "default",
          })
        } else if (passwords.newPassword.length < 6) {
          toast({
            title: "Password not updated",
            description: "Password must be at least 6 characters. Other profile changes were saved.",
            variant: "default",
          })
        } else {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: passwords.newPassword,
          })

          if (passwordError) {
            toast({
              title: "Password not updated",
              description: passwordError.message + ". Other profile changes were saved.",
              variant: "default",
            })
          } else {
            passwordUpdated = true
            setPasswords({ newPassword: "", confirmPassword: "" })
          }
        }
      }

      setSaved(true)
      toast({
        title: "Success",
        description: passwordUpdated ? "Profile and password updated successfully" : "Profile updated successfully",
      })

      setTimeout(() => setSaved(false), 2000)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24" key={avatarKey}>
              <AvatarImage src={profile.avatar_url ? `${profile.avatar_url}?t=${avatarKey}` : "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{profile.name?.[0]?.toUpperCase() || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </>
                  )}
                </div>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone_number}
              onChange={(e) => setProfile((prev) => ({ ...prev, phone_number: e.target.value }))}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Password Change */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
            <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-900">Email Notifications</Label>
                  <p className="text-xs text-gray-600">Receive email updates about your account</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-900">Scan Alerts</Label>
                  <p className="text-xs text-gray-600">Get notified when your QR codes are scanned</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, scanAlerts: !prev.scanAlerts }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.scanAlerts ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.scanAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-900">Weekly Reports</Label>
                  <p className="text-xs text-gray-600">Receive weekly analytics summaries</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, weeklyReports: !prev.weeklyReports }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading} size="lg" className="min-w-32">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
