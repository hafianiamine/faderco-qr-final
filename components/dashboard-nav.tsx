"use client"

import { QrCode, LayoutDashboard, LogOut, Shield, Settings, Video } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string>()
  const [userName, setUserName] = useState<string>()
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string>("")
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle()

        setIsAdmin(profile?.role === "admin")
        setUserName(profile?.full_name || user.email?.split("@")[0])
      }

      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "tutorial_video_url")
        .maybeSingle()

      if (settingsData?.value) {
        setTutorialVideoUrl(settingsData.value)
      }
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ]

  if (isAdmin) {
    navItems.push({
      title: "Admin",
      href: "/admin",
      icon: Shield,
    })
  }

  return (
    <>
      <nav className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            <span className="text-xl font-semibold">FADERCO QR</span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Button key={item.href} asChild variant={isActive ? "secondary" : "ghost"} className="gap-2">
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {tutorialVideoUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVideoModal(true)}
              className="relative"
              title="Watch Tutorial"
            >
              <Video className="h-5 w-5 text-blue-500" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {userEmail?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "User"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {showVideoModal && tutorialVideoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full aspect-video" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full">
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <iframe
                className="w-full h-full rounded-lg"
                src={tutorialVideoUrl.replace("watch?v=", "embed/")}
                title="Tutorial Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
