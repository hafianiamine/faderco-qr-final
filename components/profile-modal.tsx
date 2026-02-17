"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, User, Mail, Phone, Lock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { updateProfileAvatar } from "@/app/actions/settings-actions"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail?: string
  userRole?: string
}

export function ProfileModal({ open, onOpenChange, userEmail, userRole }: ProfileModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    avatar_url: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (open) {
      loadProfile()
    }
  }, [open])

  async function loadProfile() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone_number, avatar_url")
        .eq("id", user.id)
        .single()

      setProfile({
        full_name: data?.full_name || "",
        phone_number: data?.phone_number || "",
        email: user.email || "",
        avatar_url: data?.avatar_url || "",
        password: "",
        confirmPassword: "",
      })
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    setAvatarLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!data.url) throw new Error('Failed to upload image')

      const result = await updateProfileAvatar(data.url)
      if (result.error) throw new Error(result.error)

      setProfile({ ...profile, avatar_url: data.url })
      await loadProfile()

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setAvatarLoading(false)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      let passwordUpdated = false
      if (profile.password || profile.confirmPassword) {
        if (profile.password !== profile.confirmPassword) {
          toast({
            title: "Password not updated",
            description: "Passwords do not match. Other profile changes were saved.",
            variant: "default",
          })
        } else if (profile.password.length < 6) {
          toast({
            title: "Password not updated",
            description: "Password must be at least 6 characters. Other profile changes were saved.",
            variant: "default",
          })
        } else {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: profile.password,
          })

          if (passwordError) {
            toast({
              title: "Password not updated",
              description: passwordError.message + ". Other profile changes were saved.",
              variant: "default",
            })
          } else {
            passwordUpdated = true
          }
        }
      }

      toast({
        title: "Profile updated",
        description: passwordUpdated
          ? "Your profile and password have been updated successfully."
          : "Your profile has been updated successfully.",
      })

      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>Update your profile information and avatar</DialogDescription>
        </DialogHeader>

        <form onSubmit={updateProfile} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24" key={profile.avatar_url}>
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-500 text-white text-2xl">
                {profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || userEmail?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload-modal"
                disabled={avatarLoading}
              />
              <Label htmlFor="avatar-upload-modal" className="cursor-pointer">
                <Button type="button" variant="outline" disabled={avatarLoading} asChild>
                  <span>
                    {avatarLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Photo
                  </span>
                </Button>
              </Label>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF (max 2MB)</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input id="email" type="email" value={profile.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email cannot be changed here</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Role
              </Label>
              <Input id="role" value={userRole || "user"} disabled className="bg-gray-50 capitalize" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={profile.phone_number}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
