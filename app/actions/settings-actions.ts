"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfileAvatar(avatarUrl: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings")
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateUserEmail(newEmail: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: "Verification email sent to new address" }
}

export async function addAllowedDomain(domain: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  // Clean domain (remove @ and whitespace)
  const cleanDomain = domain.replace(/^@/, "").trim().toLowerCase()

  const { error } = await supabase.from("allowed_domains").insert({
    domain: cleanDomain,
    created_by: user.id,
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "Domain already exists" }
    }
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function removeAllowedDomain(domainId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("allowed_domains").delete().eq("id", domainId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updatePlatformSettings(settings: {
  platform_name?: string
  platform_logo?: string
  footer_text?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  // Update each setting
  for (const [key, value] of Object.entries(settings)) {
    if (value !== undefined) {
      await supabase.from("settings").upsert(
        {
          key,
          value,
        },
        {
          onConflict: "key",
        },
      )
    }
  }

  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/admin")
  return { success: true }
}
