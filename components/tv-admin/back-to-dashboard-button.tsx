"use client"

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface BackToDashboardButtonProps {
  showMenu?: boolean
}

export function BackToDashboardButton({ showMenu = true }: BackToDashboardButtonProps) {
  const router = useRouter()

  if (showMenu) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => router.push("/tv-admin")}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous Page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push("/tv-admin")}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Button>
  )
}
