"use client"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Grid3x3, BarChart3, Plus, Settings, LogOut, User } from 'lucide-react'

interface DashboardSidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Grid3x3,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Add",
    href: "/dashboard/add",
    icon: Plus,
  },
]

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3 py-6">
      
      {/* Main Menu Items */}
      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href} title={item.name}>
              <button
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-lg",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-white text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="w-8 h-px bg-border my-2" />

      {/* User Profile - Avatar */}
      <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all flex-shrink-0">
        <User className="h-5 w-5" />
      </button>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3">
        <button
          title="Settings"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-muted-foreground hover:bg-muted transition-all shadow-md hover:shadow-lg flex-shrink-0"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={signOut}
          title="Logout"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-orange-500 hover:bg-orange-50 transition-all shadow-md hover:shadow-lg flex-shrink-0"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  )
}
