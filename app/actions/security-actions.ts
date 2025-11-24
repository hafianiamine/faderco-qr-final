"use server"

import { createClient } from "@/lib/supabase/server"
import { logActivity, getRealIP, parseUserAgent } from "@/lib/activity-logger"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Force all users to reset password
export async function forceAllPasswordResets() {
  const supabase = await createClient()
  const headersList = await headers()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  // Update all users to require password reset
  const { error } = await supabase.from("profiles").update({ force_password_reset: true }).neq("role", "admin") // Don't force admins

  if (error) throw error

  // Log the action
  await logActivity({
    userId: user.id,
    action: "password_reset_forced",
    entityType: "user",
    ipAddress: getRealIP(headersList),
    deviceInfo: JSON.stringify(parseUserAgent(headersList.get("user-agent") || "")),
    newValue: "All users forced to reset password",
  })

  revalidatePath("/admin")
  return { success: true }
}

// Check if current user needs to reset password
export async function checkPasswordResetRequired() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { required: false }

  const { data: profile } = await supabase.from("profiles").select("force_password_reset").eq("id", user.id).single()

  return { required: profile?.force_password_reset || false }
}

// Reset user password and clear the flag
export async function resetUserPassword(newPassword: string) {
  const supabase = await createClient()
  const headersList = await headers()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Update password
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (authError) throw authError

  // Clear the force reset flag and update last password change
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      force_password_reset: false,
      last_password_change: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileError) throw profileError

  // Log the action
  await logActivity({
    userId: user.id,
    action: "password_changed",
    entityType: "user",
    entityId: user.id,
    ipAddress: getRealIP(headersList),
    deviceInfo: JSON.stringify(parseUserAgent(headersList.get("user-agent") || "")),
  })

  revalidatePath("/dashboard")
  return { success: true }
}

// Get all activity logs (admin only)
export async function getActivityLogs(filters?: {
  userId?: string
  actionType?: string
  startDate?: string
  endDate?: string
  limit?: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  let query = supabase
    .from("activity_logs")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(filters?.limit || 100)

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId)
  }

  if (filters?.actionType && filters.actionType !== "all_actions") {
    query = query.eq("action_type", filters.actionType)
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate)
  }

  const { data, error } = await query

  if (error) throw error

  return data
}

// Get user's active sessions
export async function getUserSessions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("last_activity", { ascending: false })

  if (error) throw error

  return data
}

// Terminate a session
export async function terminateSession(sessionId: string) {
  const supabase = await createClient()
  const headersList = await headers()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("user_sessions")
    .update({ is_active: false })
    .eq("id", sessionId)
    .eq("user_id", user.id)

  if (error) throw error

  // Log the action
  await logActivity({
    userId: user.id,
    action: "session_terminated",
    entityType: "session",
    entityId: sessionId,
    ipAddress: getRealIP(headersList),
    deviceInfo: JSON.stringify(parseUserAgent(headersList.get("user-agent") || "")),
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

// Export activity logs to CSV (admin only)
export async function exportActivityLogs(filters?: {
  userId?: string
  actionType?: string
  startDate?: string
  endDate?: string
}) {
  const logs = await getActivityLogs({ ...filters, limit: 10000 })

  // Convert to CSV
  const headers = [
    "Date/Time",
    "User",
    "Email",
    "Action",
    "Entity Type",
    "Entity ID",
    "Old Value",
    "New Value",
    "IP Address",
    "Device Info",
  ]
  const rows = logs.map((log) => [
    new Date(log.created_at).toLocaleString(),
    (log.profiles as any)?.full_name || "Unknown",
    (log.profiles as any)?.email || "Unknown",
    log.action_type,
    log.entity_type || "",
    log.entity_id || "",
    log.old_value || "",
    log.new_value || "",
    log.ip_address || "",
    log.device_info || "",
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csv
}
