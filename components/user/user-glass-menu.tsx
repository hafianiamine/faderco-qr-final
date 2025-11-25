"use client"
import { QrCode, BarChart3, LogOut, LayoutDashboard, Settings, Plus, Lightbulb, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { getTutorialVideoUrl } from "@/app/actions/admin-actions"

interface UserGlassMenuProps {
  userEmail?: string
  onSectionChange: (section: string) => void
  currentSection: string
  onShowFeatureTour?: () => void
}

export function UserGlassMenu({ userEmail, onSectionChange, currentSection, onShowFeatureTour }: UserGlassMenuProps) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string>("")
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    async function loadAvatar() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle()

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }

        const { videoUrl } = await getTutorialVideoUrl()
        console.log("[v0] Tutorial video URL from database:", videoUrl)
        if (videoUrl) {
          setTutorialVideoUrl(videoUrl)
        }
      }
    }
    loadAvatar()
  }, [])

  const menuItems = [
    { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { id: "qr-codes", label: "My QR Codes", icon: QrCode },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "create", label: "Create QR Code", icon: Plus },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      <div className="fixed left-8 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-full border border-gray-200 bg-white/80 p-3 backdrop-blur-xl shadow-lg">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
                  isActive
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-blue-500",
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 opacity-0 backdrop-blur-xl shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-full border border-gray-200 bg-white/80 p-3 backdrop-blur-xl shadow-lg">
          <button
            onClick={() => onSectionChange("profile")}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
              currentSection === "profile"
                ? "ring-2 ring-blue-500 ring-inset"
                : "hover:ring-2 hover:ring-blue-500/50 hover:ring-inset",
            )}
            title="Profile"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-500 text-white text-sm">
                {userEmail?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 opacity-0 backdrop-blur-xl shadow-lg transition-opacity group-hover:opacity-100">
              Profile
            </span>
          </button>

          <button
            onClick={() => onSectionChange("settings")}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
              currentSection === "settings"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-blue-500",
            )}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 opacity-0 backdrop-blur-xl shadow-lg transition-opacity group-hover:opacity-100">
              Settings
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-red-600 transition-all duration-300 hover:bg-red-50 hover:text-red-700"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 opacity-0 backdrop-blur-xl shadow-lg transition-opacity group-hover:opacity-100">
              Logout
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-full border border-gray-200 bg-white/80 p-3 backdrop-blur-xl shadow-lg">
          {onShowFeatureTour && (
            <button
              onClick={onShowFeatureTour}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
              title="Feature Tour"
            >
              <Lightbulb className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 opacity-0 backdrop-blur-xl shadow-lg transition-opacity group-hover:opacity-100">
                Feature Tour
              </span>
            </button>
          )}

          {tutorialVideoUrl && (
            <button
              onClick={() => setShowVideoModal(true)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
              title="Watch Tutorial"
            >
              <Video className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 opacity-0 backdrop-blur-xl shadow-lg transition-opacity group-hover:opacity-100">
                Watch Tutorial
              </span>
            </button>
          )}
        </div>
      </div>

      {showVideoModal && tutorialVideoUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
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
                src={tutorialVideoUrl}
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
