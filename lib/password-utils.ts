// Server-only password utilities
"use server"

import { createHash } from "crypto"

export async function hashPassword(password: string): Promise<string> {
  return createHash("sha256").update(password).digest("hex")
}

export async function checkPasswordHistory(userId: string, newPassword: string, historyCount = 5): Promise<boolean> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const newPasswordHash = await hashPassword(newPassword)

  // Get user's password history
  const { data: history } = await supabase
    .from("password_history")
    .select("password_hash")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(historyCount)

  if (!history || history.length === 0) {
    return false // No history, password is new
  }

  // Check if new password matches any in history
  return history.some((record) => record.password_hash === newPasswordHash)
}

export async function savePasswordToHistory(userId: string, password: string): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const passwordHash = await hashPassword(password)

  await supabase.from("password_history").insert({
    user_id: userId,
    password_hash: passwordHash,
  })
}
