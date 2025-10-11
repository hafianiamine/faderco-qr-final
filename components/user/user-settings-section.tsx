"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Settings, User, Lock, Bell, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { put } from "@vercel/blob"

export function UserSettingsSection() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    company: "",
    avatar_url: "",
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [preferences, setPreferences] = useState({
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

    if (!user) return

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        company: data.company || "",
        avatar_url: data.avatar_url || "",
      })
    }
  }

  async function handleProfileUpdate() {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    }
    setLoading(false)
  }

  async function handlePasswordChange() {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
      setPasswords({ current: "", new: "", confirm: "" })
    }
    setLoading(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const blob = await put(`avatars/${Date.now()}-${file.name}`, file, {
        access: "public",
      })

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from("profiles").update({ avatar_url: blob.url }).eq("id", user.id)

      setProfile({ ...profile, avatar_url: blob.url })
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Manage your account preferences</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-10 w-10 text-gray-500" />
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-500 p-2 hover:bg-blue-600"
              >
                <Upload className="h-3 w-3 text-white" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Profile Picture</p>
              <p className="text-xs text-gray-500">Click the icon to upload a new avatar</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-gray-900">
              Full Name
            </Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-gray-900">
              Company
            </Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              placeholder="Enter your company name"
            />
          </div>

          <Button onClick={handleProfileUpdate} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Save className="mr-2 h-4 w-4" />
            Save Profile
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-gray-900">
              New Password
            </Label>
            <Input
              id="new_password"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-gray-900">
              Confirm Password
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Lock className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive email updates about your account</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Scan Alerts</p>
              <p className="text-sm text-gray-600">Get notified when your QR codes are scanned</p>
            </div>
            <Switch
              checked={preferences.scanAlerts}
              onCheckedChange={(checked) => setPreferences({ ...preferences, scanAlerts: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Weekly Reports</p>
              <p className="text-sm text-gray-600">Receive weekly analytics summaries</p>
            </div>
            <Switch
              checked={preferences.weeklyReports}
              onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
