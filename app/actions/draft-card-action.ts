"use server"

import { createClient } from "@/lib/supabase/server"
import { generateShortCode } from "@/lib/utils/url-shortener"

export async function createDraftCard(
  userId: string,
  fullName: string,
  email: string,
  phoneNumber: string,
  company: string
) {
  const supabase = await createClient()

  try {
    const shortCode = generateShortCode()

    const { data, error } = await supabase
      .from("virtual_business_cards")
      .insert({
        user_id: userId,
        full_name: fullName,
        email: email,
        phone: phoneNumber,
        company_name: company,
        job_title: "", // Empty, user can fill later
        website: "",
        vcard_data: "", // Will be generated when user completes
        short_code: shortCode,
        accent_color: "#6366f1",
        cover_image_url: null,
      })
      .select()

    if (error) {
      console.error("Error creating draft card:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error in createDraftCard:", error)
    return null
  }
}
