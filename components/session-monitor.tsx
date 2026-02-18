'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getValidSession, clearSession, resetActivityTimer } from '@/lib/supabase/session-manager'

export function SessionMonitor() {
  const router = useRouter()
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Only run once
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const checkSession = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log('[v0] SessionMonitor: No Supabase session, redirecting to login')
          clearSession()
          router.push('/auth/login')
          return
        }

        console.log('[v0] SessionMonitor: Valid Supabase session found for:', session.user?.email)
        resetActivityTimer()
      } catch (error) {
        console.error('[v0] SessionMonitor: Error checking session:', error)
      }
    }

    // Initial session check on mount
    checkSession()

    // Set up activity tracking to reset inactivity timer
    const trackActivity = () => {
      resetActivityTimer()
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      document.addEventListener(event, trackActivity, true)
    })

    // Periodic session check (every 5 minutes instead of 1 minute)
    sessionCheckIntervalRef.current = setInterval(() => {
      checkSession()
    }, 5 * 60 * 1000)

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, trackActivity, true)
      })

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current)
      }
    }
  }, [router])

  return null
}
