"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export async function updateUserStatus(userId: string, status: "approved" | "rejected" | "blocked") {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Update user status
    const { error } = await supabase.from("profiles").update({ status }).eq("id", userId)

    if (error) {
      console.error("Error updating user status:", error)
      return { error: "Failed to update user status" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateUserStatus:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Update user role
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return { error: "Failed to update user role" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateUserRole:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateFooterText(footerText: string) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Update or insert footer text setting
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "footer_text", value: footerText }, { onConflict: "key" })

    if (error) {
      console.error("Error updating footer text:", error)
      return { error: "Failed to update footer text" }
    }

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in updateFooterText:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function resetUserPassword(userId: string, userEmail: string) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Send password reset email using Supabase Admin API
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("Error sending password reset:", error)
      return { error: "Failed to send password reset email" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in resetUserPassword:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function createUser(email: string, password: string, fullName: string, company?: string) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created accounts
      user_metadata: {
        full_name: fullName,
        company: company || "",
      },
    })

    if (createError) {
      console.error("Error creating user:", createError)
      return { error: createError.message }
    }

    // Auto-approve the user since admin is creating them
    if (newUser.user) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: "approved", company: company || "" })
        .eq("id", newUser.user.id)

      if (updateError) {
        console.error("Error updating user profile:", updateError)
      }
    }

    revalidatePath("/admin")
    return { success: true, userId: newUser.user?.id }
  } catch (error) {
    console.error("Error in createUser:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function confirmUserEmail(userId: string) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Use Supabase Admin API to confirm email
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (error) {
      console.error("Error confirming email:", error)
      return { error: "Failed to confirm email" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in confirmUserEmail:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Delete user profile (cascade will handle related records)
    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return { error: "Failed to delete user" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getAllQRCodes() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Fetch QR codes
    const { data: qrCodes, error: qrError } = await supabaseAdmin
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (qrError) {
      return { error: "Failed to fetch QR codes" }
    }

    // Fetch user profiles and create a map
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, company")

    if (profileError) {
      return { error: "Failed to fetch user profiles" }
    }

    // Create a profile map for quick lookup
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

    // Combine QR codes with their profile data
    const enrichedQRCodes = (qrCodes || []).map((qr: any) => ({
      ...qr,
      profiles: profileMap.get(qr.user_id) || null,
    }))

    return { qrCodes: enrichedQRCodes }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function adminToggleQRStatus(qrCodeId: string, newStatus: "active" | "inactive") {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({
        status: newStatus,
        is_active: newStatus === "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrCodeId)

    if (updateError) {
      return { error: "Failed to update QR status" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function adminDeleteQRCode(qrCodeId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const { error: deleteError } = await supabase.from("qr_codes").delete().eq("id", qrCodeId)

    if (deleteError) {
      return { error: "Failed to delete QR code" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function adminUpdateQRCode(
  qrCodeId: string,
  updates: {
    title?: string
    destination_url?: string
    scan_limit?: number | null
    scheduled_start?: string | null
    scheduled_end?: string | null
  },
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase.from("qr_codes").update(updateData).eq("id", qrCodeId)

    if (updateError) {
      return { error: "Failed to update QR code" }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function adminGetUserQRCodes(userId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const { data: qrCodes, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })

    if (error) {
      return { error: "Failed to fetch user QR codes" }
    }

    return { qrCodes }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function updateWelcomePopupSettings(enabled: boolean, title: string, description: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    await supabase.from("settings").upsert(
      [
        { key: "welcome_popup_enabled", value: enabled.toString() },
        { key: "welcome_popup_title", value: title },
        { key: "welcome_popup_description", value: description },
      ],
      { onConflict: "key" },
    )

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function updateLandingPopupSettings(
  enabled: boolean,
  title: string,
  description: string,
  imageUrl?: string,
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const settings = [
      { key: "landing_popup_enabled", value: enabled.toString() },
      { key: "landing_popup_title", value: title },
      { key: "landing_popup_description", value: description },
    ]

    if (imageUrl !== undefined) {
      settings.push({ key: "landing_popup_image", value: imageUrl })
    }

    await supabase.from("settings").upsert(settings, { onConflict: "key" })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function loginAsUser(targetUserId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    // Store original admin ID in session storage (client will handle this)
    return { success: true, targetUserId, originalAdminId: user.id }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function updateTutorialVideoUrl(videoUrl: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("settings")
      .upsert({ key: "tutorial_video_url", value: videoUrl }, { onConflict: "key" })

    if (error) {
      return { error: "Failed to update tutorial video URL" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function uploadImageToBlob(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    if (!file) {
      return { error: "No file provided" }
    }

    const blob = await put(file.name, file, {
      access: "public",
    })

    return { success: true, url: blob.url }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { error: "Failed to upload image" }
  }
}

export async function getTutorialVideoUrl() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "tutorial_video_url")
      .maybeSingle()

    if (error) {
      console.error("Error fetching tutorial video URL:", error)
      return { videoUrl: "hhttps://www.youtube.com/watch?v=jwiSLaQyZ0U" }
    }

    return { videoUrl: data?.value || "https://www.youtube.com/watch?v=jwiSLaQyZ0U" }
  } catch (error) {
    console.error("Error in getTutorialVideoUrl:", error)
    return { videoUrl: "https://www.youtube.com/watch?v=jwiSLaQyZ0U" }
  }
}

export async function updateSupportInfo(supportInfo: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("settings")
      .upsert({ key: "support_info", value: supportInfo }, { onConflict: "key" })

    if (error) {
      return { error: "Failed to update support info" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function getSupportInfo() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("settings").select("value").eq("key", "support_info").maybeSingle()

    if (error) {
      console.error("Error fetching support info:", error)
      return { supportInfo: "For support, please contact your administrator." }
    }

    return { supportInfo: data?.value || "For support, please contact your administrator." }
  } catch (error) {
    console.error("Error in getSupportInfo:", error)
    return { supportInfo: "For support, please contact your administrator." }
  }
}
