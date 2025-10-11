"use server"

import { createClient } from "@/lib/supabase/server"
import { generateQRCode } from "@/lib/utils/qr-generator"
import { generateShortCode, createShortUrl } from "@/lib/utils/url-shortener"
import { revalidatePath } from "next/cache"

export interface QRCustomization {
  colorDark?: string
  colorLight?: string
  logoUrl?: string
  logoSize?: number
  logoOutlineColor?: string
  scanLimit?: number
  scheduledStart?: string
  scheduledEnd?: string
}

export async function createQRCode(title: string, destinationUrl: string, customization?: QRCustomization) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    let shortCode = generateShortCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase.from("qr_codes").select("id").eq("short_code", shortCode).single()

      if (!existing) {
        isUnique = true
      } else {
        shortCode = generateShortCode()
        attempts++
      }
    }

    if (!isUnique) {
      return { error: "Failed to generate unique short code" }
    }

    const shortUrl = createShortUrl(shortCode)

    const qrImageDataUrl = await generateQRCode(shortUrl, {
      color: {
        dark: customization?.colorDark || "#000000",
        light: customization?.colorLight || "#FFFFFF",
      },
    })

    const insertData = {
      user_id: user.id,
      title,
      destination_url: destinationUrl,
      short_code: shortCode,
      short_url: shortUrl,
      qr_image_url: qrImageDataUrl,
      qr_color_dark: customization?.colorDark || "#000000",
      qr_color_light: customization?.colorLight || "#FFFFFF",
      qr_logo_url: customization?.logoUrl || null,
      logo_size: customization?.logoSize || 12,
      logo_outline_color: customization?.logoOutlineColor || "#FFFFFF",
      scan_limit: customization?.scanLimit || null,
      scans_used: 0,
      scheduled_start: customization?.scheduledStart || null,
      scheduled_end: customization?.scheduledEnd || null,
      is_active: true,
      status: "active",
    }

    const { data: qrCode, error: insertError } = await supabase.from("qr_codes").insert(insertData).select().single()

    if (insertError) {
      return { error: `Failed to create QR code: ${insertError.message}` }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/qr-codes")

    return { qrCodeId: qrCode.id, shortCode: qrCode.short_code }
  } catch (error) {
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export async function deleteQRCode(qrCodeId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { error: deleteError } = await supabase.from("qr_codes").delete().eq("id", qrCodeId).eq("user_id", user.id)

    if (deleteError) {
      return { error: "Failed to delete QR code" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/qr-codes")

    return { success: true }
  } catch (error) {
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export async function scheduleQRCodeDeletion(qrCodeId: string, confirmationCode: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const generatedCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // If no confirmation code provided, return the code for user to copy
    if (!confirmationCode) {
      return { confirmationCode: generatedCode }
    }

    // Verify the confirmation code matches
    if (confirmationCode !== generatedCode) {
      return { error: "Confirmation code does not match" }
    }

    const { data: qrCode } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("id", qrCodeId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!qrCode) {
      return { error: "QR code not found" }
    }

    const scheduledDeletionAt = new Date()
    scheduledDeletionAt.setHours(scheduledDeletionAt.getHours() + 12)

    const { error: insertError } = await supabase.from("pending_deletions").insert({
      qr_code_id: qrCodeId,
      user_id: user.id,
      deletion_reason: "User requested deletion",
      password_confirmed: true,
      scheduled_deletion_at: scheduledDeletionAt.toISOString(),
    })

    if (insertError) {
      return { error: "Failed to schedule deletion" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/qr-codes")
    return { success: true, scheduledAt: scheduledDeletionAt.toISOString() }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function cancelQRCodeDeletion(qrCodeId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { error: deleteError } = await supabase
      .from("pending_deletions")
      .delete()
      .eq("qr_code_id", qrCodeId)
      .eq("user_id", user.id)

    if (deleteError) {
      return { error: "Failed to cancel deletion" }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function updateQRCodeDestination(qrCodeId: string, newDestinationUrl: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    try {
      new URL(newDestinationUrl)
    } catch {
      return { error: "Invalid URL format" }
    }

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({
        destination_url: newDestinationUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", qrCodeId)
      .eq("user_id", user.id)

    if (updateError) {
      return { error: `Failed to update destination: ${updateError.message}` }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/qr-codes")

    return { success: true }
  } catch (error) {
    return { error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export async function toggleQRCodeStatus(qrCodeId: string, newStatus: "active" | "inactive") {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
      .eq("user_id", user.id)

    if (updateError) {
      return { error: `Failed to update status: ${updateError.message}` }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/qr-codes")

    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function updateQRCodeSettings(
  qrCodeId: string,
  settings: {
    scanLimit?: number | null
    scheduledStart?: string | null
    scheduledEnd?: string | null
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

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (settings.scanLimit !== undefined) {
      updateData.scan_limit = settings.scanLimit
    }

    if (settings.scheduledStart !== undefined) {
      updateData.scheduled_start = settings.scheduledStart
    }

    if (settings.scheduledEnd !== undefined) {
      updateData.scheduled_end = settings.scheduledEnd
    }

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update(updateData)
      .eq("id", qrCodeId)
      .eq("user_id", user.id)

    if (updateError) {
      return { error: `Failed to update settings: ${updateError.message}` }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/qr-codes")

    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function getPendingDeletions() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data, error } = await supabase
      .from("pending_deletions")
      .select(`
        *,
        qr_codes (
          id,
          title,
          destination_url,
          short_code
        )
      `)
      .eq("user_id", user.id)
      .order("scheduled_deletion_at", { ascending: true })

    if (error) {
      return { error: "Failed to fetch pending deletions" }
    }

    return { pendingDeletions: data || [] }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}
