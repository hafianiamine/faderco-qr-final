'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getValidSession, clearSession, resetActivityTimer } from '@/lib/supabase/session-manager'

export function SessionMonitor() {
  const router = useRouter()
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Only run once
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const checkSession = async () => {
      console.log('[v0] SessionMonitor: Checking session validity')
      const session = getValidSession()

      if (!session) {
        console.log('[v0] SessionMonitor: No valid session, redirecting to login')
        clearSession()
        router.push('/login')
        return
      }

      console.log('[v0] SessionMonitor: Session is valid, user:', session.userId)
    }

    // Initial session check
    checkSession()

    // Set up activity tracking
    const trackActivity = () => {
      resetActivityTimer()
      console.log('[v0] Activity detected, timer reset')

      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }

    // Activity event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => {
      document.addEventListener(event, trackActivity, true)
    })

    // Periodic session check (every 1 minute)
    activityCheckIntervalRef.current = setInterval(() => {
      checkSession()
    }, 60 * 1000)

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, trackActivity, true)
      })

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      if (activityCheckIntervalRef.current) {
        clearInterval(activityCheckIntervalRef.current)
      }
    }
  }, [router])

  return null
}
