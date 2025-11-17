"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, Building, Phone, Mail, Camera } from "lucide-react"
import { createTVAdClient, type TVAdminProfile } from "@/lib/supabase/tv-ad-client"

interface AdminProfileFormProps {
  onProfileUpdate?: (profile: TVAdminProfile) => void
}

export function AdminProfileForm({ onProfileUpdate }: AdminProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Partial<TVAdminProfile>>({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    profile_image_url: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      console.log("[v0] Loading profile...")
      const supabase = createTVAdClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("[v0] Current user:", user)
      console.log("[v0] User error:", userError)

      if (user) {
        console.log("[v0] Fetching profile for user ID:", user.id)
        const { data: existingProfile, error: profileError } = await supabase
          .from("tv_admin_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        console.log("[v0] Profile data:", existingProfile)
        console.log("[v0] Profile error:", profileError)

        if (existingProfile) {
          setProfile(existingProfile)
        } else {
          // Pre-fill with user email if available
          setProfile((prev) => ({ ...prev, email: user.email || "" }))
        }
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("[v0] Submitting profile form...")
      const supabase = createTVAdClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] Current user for submit:", user)

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        })
        return
      }

      const profileData = {
        id: user.id,
        name: profile.name!,
        email: profile.email!,
        phone: profile.phone || null,
        company_name: profile.company_name || null,
        profile_image_url: profile.profile_image_url || null,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Profile data to save:", profileData)

      const { data, error } = await supabase.from("tv_admin_profiles").upsert(profileData).select().single()

      console.log("[v0] Upsert result:", { data, error })

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      if (onProfileUpdate && data) {
        onProfileUpdate(data)
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      toast({
        title: "Error",
        description: `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TVAdminProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Admin Profile
        </CardTitle>
        <CardDescription>Manage your personal information and company details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">
                {profile.name
                  ? profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={profile.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={profile.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+212-6-12-34-56-78"
                  value={profile.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={profile.company_name || ""}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={loadProfile}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
