"use server"

import { createClient } from "@/lib/supabase/server"
import { logActivity, getRealIP, parseUserAgent } from "@/lib/activity-logger"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { createHash } from "crypto"

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

// Hash password for comparison (without storing)
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

async function isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
  const supabase = await createClient()
  const passwordHash = hashPassword(newPassword)

  // Check last 5 passwords
  const { data } = await supabase
    .from("password_history")
    .select("password_hash")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (!data) return false

  return data.some((record) => record.password_hash === passwordHash)
}

async function savePasswordHistory(userId: string, password: string) {
  const supabase = await createClient()
  const passwordHash = hashPassword(password)

  await supabase.from("password_history").insert({
    user_id: userId,
    password_hash: passwordHash,
  })

  // Keep only last 5 passwords
  const { data: history } = await supabase
    .from("password_history")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (history && history.length > 5) {
    const idsToDelete = history.slice(5).map((h) => h.id)
    await supabase.from("password_history").delete().in("id", idsToDelete)
  }
}

// Reset user password and clear the flag
export async function resetUserPassword(newPassword: string) {
  const supabase = await createClient()
  const headersList = await headers()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const isReused = await isPasswordReused(user.id, newPassword)
  if (isReused) {
    return { error: "You cannot reuse your last 5 passwords. Please choose a different password." }
  }

  // Update password
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (authError) return { error: authError.message }

  await savePasswordHistory(user.id, newPassword)

  // Clear the force reset flag and update last password change
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      force_password_reset: false,
      last_password_change: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileError) return { error: profileError.message }

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
  qrCodeId?: string
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

  if (filters?.qrCodeId) {
    query = query.eq("entity_type", "qr_code").eq("entity_id", filters.qrCodeId)
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

export async function getAllUsersForFilter() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name", { ascending: true })

  if (error) throw error

  return data
}

export async function getAllQRCodesForFilter() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("qr_codes")
    .select("id, title, destination_url")
    .order("title", { ascending: true })

  if (error) throw error

  return data
}

// Export activity logs to CSV (admin only)
export async function exportActivityLogs(filters?: {
  userId?: string
  qrCodeId?: string
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

export async function getAutoPasswordResetSettings() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { data: enabledSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "auto_password_reset_enabled")
    .single()

  const { data: daysSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "auto_password_reset_days")
    .single()

  return {
    enabled: enabledSetting?.value === "true",
    days: Number.parseInt(daysSetting?.value || "30"),
  }
}

export async function updateAutoPasswordResetSettings(enabled: boolean, days: number) {
  const supabase = await createClient()
  const headersList = await headers()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  await supabase.from("settings").update({ value: enabled.toString() }).eq("key", "auto_password_reset_enabled")

  await supabase.from("settings").update({ value: days.toString() }).eq("key", "auto_password_reset_days")

  // Log the action
  await logActivity({
    userId: user.id,
    action: "settings_changed",
    entityType: "setting",
    ipAddress: getRealIP(headersList),
    deviceInfo: JSON.stringify(parseUserAgent(headersList.get("user-agent") || "")),
    newValue: `Auto password reset: ${enabled ? "enabled" : "disabled"}, every ${days} days`,
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function checkAndForcePasswordResets() {
  const supabase = await createClient()

  // Get settings
  const { data: enabledSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "auto_password_reset_enabled")
    .single()

  const { data: daysSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "auto_password_reset_days")
    .single()

  const enabled = enabledSetting?.value === "true"
  const days = Number.parseInt(daysSetting?.value || "30")

  if (!enabled) {
    return { message: "Auto password reset is disabled" }
  }

  // Calculate the cutoff date
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  // Find users who haven't changed password in X days
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, last_password_change")
    .neq("role", "admin")
    .or(`last_password_change.is.null,last_password_change.lt.${cutoffDate.toISOString()}`)

  if (error) throw error

  if (!users || users.length === 0) {
    return { message: "No users need password reset", count: 0 }
  }

  // Force password reset for these users
  const userIds = users.map((u) => u.id)
  await supabase.from("profiles").update({ force_password_reset: true }).in("id", userIds)

  return { message: `Forced password reset for ${users.length} users`, count: users.length }
}
