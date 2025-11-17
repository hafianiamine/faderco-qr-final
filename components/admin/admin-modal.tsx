"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase-client"
import ProfileManagement from "./profile-management"

export function AdminModal() {
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState("A")
  const supabase = createClient()

  // Fetch user avatar on component mount
  useEffect(() => {
    async function getUserAvatar() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserInitial(user.email?.[0].toUpperCase() || "A")

          const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url)
          }
        }
      } catch (error) {
        console.error("Error fetching avatar:", error)
      }
    }

    getUserAvatar()
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl || undefined} alt="Admin" />
            <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
          </Avatar>
          <span>Admin</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Admin Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="admin-info" className="w-full mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="admin-info">Admin Info</TabsTrigger>
            <TabsTrigger value="system-settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="admin-info">
            <ProfileManagement onComplete={() => setOpen(false)} consolidated={true} />
          </TabsContent>

          <TabsContent value="system-settings">
            <ProfileManagement
              onComplete={() => setOpen(false)}
              showOnlyBrands={true}
              brandLabel="Select Faderco Brands"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
