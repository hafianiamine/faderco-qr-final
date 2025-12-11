"use client"

import { Button } from "@/components/ui/button"
import { AuthModals } from "@/components/auth-modals"
import { useState } from "react"

export function HomePageClient() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  return (
    <>
      <AuthModals
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />

      <nav className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          onClick={() => setLoginOpen(true)}
          className="transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
        >
          Login
        </Button>
        <Button
          onClick={() => setRegisterOpen(true)}
          className="transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
        >
          Get Started
        </Button>
      </nav>
    </>
  )
}
