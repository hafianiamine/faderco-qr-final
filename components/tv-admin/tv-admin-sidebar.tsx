"use client"

import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Calendar, Clock, BarChart3, Settings, LogOut } from 'lucide-react'
import { createClient } from "@/lib/supabase-client"

interface TVAdminSidebarProps {
  className?: string
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/tv-admin",
    icon: LayoutDashboard,
  },
  {
    name: "Profile & Brands",
    href: "/tv-admin/profile",
    icon: FileText,
  },
  {
    name: "Deals & Contracts",
    href: "/tv-admin/deals",
    icon: FileText,
  },
  {
    name: "Ad Planning",
    href: "/tv-admin/planning",
    icon: Calendar,
  },
  {
    name: "Spot Confirmation",
    href: "/tv-admin/confirmation",
    icon: Clock,
  },
  {
    name: "Analytics",
    href: "/tv-admin/analytics",
    icon: BarChart3,
  },
]

export function TVAdminSidebar({ className }: TVAdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className={cn(
      "w-20 h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center py-6 gap-4 shadow-lg flex-shrink-0",
      className
    )}>
      {/* Logo */}
      <Link href="/tv-admin" title="Go to Dashboard" className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-all hover:shadow-md hover:scale-110">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
      </Link>

      {/* Main Menu */}
      <nav className="flex flex-col gap-3 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/tv-admin" && pathname === "/tv-admin")
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className="group relative"
            >
              <button
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md",
                  isActive
                    ? "bg-white text-blue-600 shadow-lg scale-110"
                    : "bg-white/80 text-blue-600 hover:bg-white"
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3">
        <button
          title="Settings"
          className="w-12 h-12 rounded-full bg-white/80 text-blue-600 flex items-center justify-center hover:bg-white transition-all hover:shadow-md"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-12 h-12 rounded-full bg-red-400 text-white flex items-center justify-center hover:bg-red-500 transition-all hover:shadow-md"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}
