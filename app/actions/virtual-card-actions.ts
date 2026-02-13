"use server"

import { createClient } from "@/lib/supabase/server"
import { generateShortCode, createShortUrl } from "@/lib/utils/url-shortener"
import { revalidatePath } from "next/cache"

export interface VirtualCardData {
  fullName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  website?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  photoBase64?: string
  coverImageBase64?: string
  accentColor?: string
}

function generateVCard(card: VirtualCardData, photoBase64?: string): string {
  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.fullName}
N:${card.fullName.split(" ").pop() || ""};${card.fullName.split(" ")[0] || ""};;;
EMAIL:${card.email}`

  if (card.phone) vcard += `\nTEL:${card.phone}`
  if (card.company) vcard += `\nORG:${card.company}`
  if (card.jobTitle) vcard += `\nTITLE:${card.jobTitle}`
  if (card.website) vcard += `\nURL:${card.website}`
  if (card.linkedin) vcard += `\nX-SOCIALPROFILE;TYPE=LinkedIn:${card.linkedin}`
  if (card.twitter) vcard += `\nX-SOCIALPROFILE;TYPE=Twitter:${card.twitter}`
  if (card.facebook) vcard += `\nX-SOCIALPROFILE;TYPE=Facebook:${card.facebook}`
  if (card.instagram) vcard += `\nX-SOCIALPROFILE;TYPE=Instagram:${card.instagram}`
  if (photoBase64) vcard += `\nPHOTO;ENCODING=BASE64;TYPE=JPEG:${photoBase64}`
  
  vcard += "\nEND:VCARD"
  return vcard
}

export async function createVirtualCard(cardData: VirtualCardData, photoBase64?: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Generate unique short code
    let shortCode = generateShortCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from("virtual_business_cards")
        .select("id")
        .eq("short_code", shortCode)
        .maybeSingle()

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

    // Generate vCard
    const vcard = generateVCard(cardData, photoBase64)

    // Generate proper short URL (server-side)
    const shortUrl = createShortUrl(shortCode)

    // Store in database
    const { data, error } = await supabase.from("virtual_business_cards").insert({
      user_id: user.id,
      full_name: cardData.fullName,
      email: cardData.email,
      phone: cardData.phone,
      company_name: cardData.company,
      job_title: cardData.jobTitle,
      website: cardData.website,
      vcard_data: vcard,
      short_code: shortCode,
      cover_image_url: cardData.coverImageBase64 ? `data:image/jpeg;base64,${cardData.coverImageBase64}` : null,
      accent_color: cardData.accentColor || "#6366f1",
    }).select()

    if (error) {
      console.error("Database error:", error)
      return { error: "Failed to create virtual card" }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      card: data?.[0],
      shortUrl: shortUrl,
      shortCode: shortCode,
    }
  } catch (error) {
    console.error("Error creating virtual card:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateVirtualCard(cardId: string, cardData: VirtualCardData, photoBase64?: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Verify ownership
    const { data: card } = await supabase
      .from("virtual_business_cards")
      .select("user_id")
      .eq("id", cardId)
      .single()

    if (!card || card.user_id !== user.id) {
      return { error: "Unauthorized" }
    }

    // Generate vCard
    const vcard = generateVCard(cardData, photoBase64)

    // Update database
    const { data, error } = await supabase
      .from("virtual_business_cards")
      .update({
        full_name: cardData.fullName,
        email: cardData.email,
        phone: cardData.phone,
        company_name: cardData.company,
        job_title: cardData.jobTitle,
        website: cardData.website,
        vcard_data: vcard,
        cover_image_url: cardData.coverImageBase64 ? `data:image/jpeg;base64,${cardData.coverImageBase64}` : undefined,
        accent_color: cardData.accentColor || "#6366f1",
      })
      .eq("id", cardId)
      .select()

    if (error) {
      console.error("Database error:", error)
      return { error: "Failed to update virtual card" }
    }

    revalidatePath("/dashboard")

    return {
      success: true,
      card: data?.[0],
    }
  } catch (error) {
    console.error("Error updating virtual card:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteVirtualCard(cardId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Verify ownership
    const { data: card } = await supabase
      .from("virtual_business_cards")
      .select("user_id")
      .eq("id", cardId)
      .single()

    if (!card || card.user_id !== user.id) {
      return { error: "Unauthorized" }
    }

    // Delete
    const { error } = await supabase.from("virtual_business_cards").delete().eq("id", cardId)

    if (error) {
      console.error("Database error:", error)
      return { error: "Failed to delete virtual card" }
    }

    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting virtual card:", error)
    return { error: "An unexpected error occurred" }
  }
}
