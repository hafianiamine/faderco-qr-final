"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader } from "@/components/ui/loader"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Search, AlertCircle } from "lucide-react"

// Update the ProfileManagement component to accept new props
export default function ProfileManagement({
  onComplete,
  consolidated = false,
  showOnlyBrands = false,
  brandLabel = "Select Brands That Belong to Your Company",
}: {
  onComplete?: () => void
  consolidated?: boolean
  showOnlyBrands?: boolean
  brandLabel?: string
}) {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingBrands, setLoadingBrands] = useState(true)

  // Fetch user profile and brands on component mount
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)
          setEmail(user.email || "")

          // Get profile data
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

          if (profile) {
            setAvatarUrl(profile.avatar_url)
            setSelectedBrands(profile.owned_brands || [])
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    async function getAllBrands() {
      try {
        setLoadingBrands(true)

        // Always use MarquePrincipale column for brands
        console.log("Using MarquePrincipale column for brands")

        // Get all unique brands from MarquePrincipale
        const { data, error } = await supabase
          .from("csv_data")
          .select("MarquePrincipale")
          .not("MarquePrincipale", "is", null)

        if (error) {
          console.error("Error fetching brands from MarquePrincipale:", error)
          return
        }

        if (data) {
          // Extract unique brands and sort alphabetically
          const uniqueBrands = Array.from(
            new Set(data.map((item) => item.MarquePrincipale?.trim()).filter(Boolean)),
          ).sort()

          const formattedBrands = uniqueBrands.map((brand) => ({
            id: brand,
            name: brand,
          }))

          setBrands(formattedBrands)
          console.log(`Loaded ${formattedBrands.length} unique brands from MarquePrincipale`)
        }
      } catch (error) {
        console.error("Error loading brands:", error)
      } finally {
        setLoadingBrands(false)
      }
    }

    getProfile()
    getAllBrands()
  }, [])

  // Handle image upload
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    setAvatarFile(file)

    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Update profile information
  const updateProfile = async () => {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      if (!user) return

      // Check if passwords match when changing password
      if (password && password !== confirmPassword) {
        setError("Passwords don't match")
        return
      }

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email })
        if (emailError) throw emailError
      }

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password })
        if (passwordError) throw passwordError
      }

      // Upload avatar if changed
      let avatar_url = avatarUrl
      if (avatarFile) {
        try {
          // Check if the avatars bucket exists, if not create it
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

          if (bucketsError) throw bucketsError

          const avatarsBucketExists = buckets.some((bucket) => bucket.name === "avatars")

          // Create the bucket if it doesn't exist
          if (!avatarsBucketExists) {
            const { error: createBucketError } = await supabase.storage.createBucket("avatars", {
              public: true,
            })

            if (createBucketError) {
              console.error("Error creating avatars bucket:", createBucketError)
              throw new Error("Unable to create storage for profile images")
            }
          }

          // Now upload the file
          const fileExt = avatarFile.name.split(".").pop()
          const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatarFile)

          if (uploadError) throw uploadError

          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName)

          avatar_url = publicUrl
        } catch (storageError) {
          console.error("Storage error:", storageError)
          // Continue with profile update but without changing the avatar
          toast({
            title: "Avatar upload failed",
            description: "Your profile will be updated without the new avatar image",
            variant: "destructive",
          })
        }
      }

      // Update profile in database
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url,
        owned_brands: selectedBrands,
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      setSuccess("Profile updated successfully")
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      if (onComplete) {
        onComplete()
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setUpdating(false)
    }
  }

  // Filter brands based on search query
  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Update the return statement to handle consolidated view and showOnlyBrands
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="space-y-4 w-full max-w-md">
          <div className="h-8 w-8 mx-auto">
            <div className="h-full w-full rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // If we're only showing brands (System Settings tab)
  if (showOnlyBrands) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Manage system-wide settings and brand configurations</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-medium">Select Faderco Brands</Label>
                <Badge variant="outline" className="ml-2">
                  {selectedBrands.length} brand{selectedBrands.length !== 1 ? "s" : ""} selected
                </Badge>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>How this works:</strong> Brands you select here will be labeled as "Faderco" brands throughout
                  the dashboard. This affects filtering, analytics, and reporting.
                </p>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search brands..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loadingBrands ? (
                <div className="p-8 text-center">
                  <div className="h-6 w-6 mx-auto mb-2">
                    <div className="h-full w-full rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">Loading brands...</p>
                </div>
              ) : brands.length === 0 ? (
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No brands found</AlertTitle>
                  <AlertDescription>
                    No brands found in the database. Please import data with brand information.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="border rounded-md">
                  <div className="p-3 bg-muted/10 border-b flex justify-between items-center">
                    <span className="font-medium">Brand Name</span>
                    <span className="text-sm text-muted-foreground">Faderco Brand</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredBrands.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No brands match your search.</div>
                    ) : (
                      filteredBrands.map((brand) => {
                        const isSelected = selectedBrands.includes(brand.id)
                        return (
                          <div
                            key={brand.id}
                            className={`flex items-center justify-between p-3 border-b hover:bg-muted/5 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`brand-${brand.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedBrands([...selectedBrands, brand.id])
                                  } else {
                                    setSelectedBrands(selectedBrands.filter((id) => id !== brand.id))
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`brand-${brand.id}`}
                                className={`cursor-pointer ${isSelected ? "font-medium" : ""}`}
                              >
                                {brand.name}
                              </Label>
                            </div>
                            {isSelected && <Badge className="bg-primary hover:bg-primary/90">Faderco</Badge>}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedBrands(brands.map((b) => b.id))}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedBrands([])}>
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={updateProfile} disabled={updating} className="ml-auto">
            {updating ? <Loader size="sm" className="mr-2" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // For consolidated view (Admin Info tab)
  if (consolidated) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>
            Update your profile information, change your password, and manage your profile image
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
              </Avatar>

              <div className="space-y-2 w-full">
                <Label htmlFor="avatar">Upload Profile Image</Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </div>

            {/* Account Info Section */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={updateProfile} disabled={updating} className="ml-auto">
            {updating ? <Loader size="sm" className="mr-2" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Original tabbed view (keep as fallback)
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Profile Management</CardTitle>
        <CardDescription>Update your profile information, change your password, and manage your brands</CardDescription>
      </CardHeader>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="avatar">Profile Image</TabsTrigger>
          <TabsTrigger value="brands">Brand Management</TabsTrigger>
        </TabsList>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="account" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
              </Avatar>

              <div className="space-y-2 w-full">
                <Label htmlFor="avatar">Upload Profile Image</Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="brands" className="space-y-4">
            <div className="space-y-2">
              <Label>{brandLabel}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={selectedBrands.includes(brand.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBrands([...selectedBrands, brand.id])
                        } else {
                          setSelectedBrands(selectedBrands.filter((id) => id !== brand.id))
                        }
                      }}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="cursor-pointer">
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </CardContent>

        <CardFooter>
          <Button onClick={updateProfile} disabled={updating} className="ml-auto">
            {updating ? <Loader size="sm" className="mr-2" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  )
}
