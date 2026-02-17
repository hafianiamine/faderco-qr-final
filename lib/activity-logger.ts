// Centralized activity logging utility
import { createClient } from "@/lib/supabase/server"

export type ActivityAction =
  | "login_success"
  | "login_failed"
  | "logout"
  | "qr_created"
  | "qr_edited"
  | "qr_deleted"
  | "qr_disabled"
  | "qr_enabled"
  | "password_changed"
  | "password_reset_forced"
  | "settings_changed"
  | "session_terminated"
  | "profile_updated"

interface LogActivityParams {
  userId?: string
  action: ActivityAction
  entityType?: "qr_code" | "user" | "setting" | "session"
  entityId?: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  deviceInfo?: string
  userAgent?: string
}

export async function logActivity(params: LogActivityParams) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("activity_logs").insert({
      user_id: params.userId || null,
      action_type: params.action,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      old_value: params.oldValue || null,
      new_value: params.newValue || null,
      ip_address: params.ipAddress || null,
      device_info: params.deviceInfo || null,
      user_agent: params.userAgent || null,
    })

    if (error) {
      // Silently fail activity logging
    }
  } catch (error) {
    // Silently fail activity logging
  }
}

// Helper to extract device info from user agent
export function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)

  let deviceType = "Desktop"
  if (isTablet) deviceType = "Tablet"
  else if (isMobile) deviceType = "Mobile"

  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Edge")) browser = "Edge"

  let os = "Unknown"
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac OS")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS"

  return { deviceType, browser, os }
}

// Get real IP address from headers (handles proxies and CDNs)
export function getRealIP(headers: Headers): string {
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("cf-connecting-ip") || // Cloudflare
    headers.get("x-client-ip") ||
    "Unknown"
  )
}
