"use server"

import { createClient } from "@/lib/supabase/server"

export async function ensureDefaultVirtualCard() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    console.log("[v0] Ensuring default virtual card for user:", user.id)

    // Check if user already has a default card
    const { data: existingCard } = await supabase
      .from("virtual_business_cards")
      .select("id, short_code, short_url")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single()

    if (existingCard) {
      console.log("[v0] User already has default card:", existingCard.id)
      return { data: existingCard }
    }

    // Get user profile for default card data
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, company")
      .eq("id", user.id)
      .single()

    // Generate unique short code
    const shortCode = `${user.id.slice(0, 8)}-${Date.now().toString(36)}`.toLowerCase()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://faderco.com"
    const shortUrl = `${baseUrl}/card/${shortCode}`

    console.log("[v0] Creating default card for user with short_code:", shortCode)

    // Create default virtual card
    const { data: newCard, error } = await supabase
      .from("virtual_business_cards")
      .insert({
        user_id: user.id,
        full_name: profile?.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        company_name: profile?.company || "",
        short_code: shortCode,
        short_url: shortUrl,
        is_default: true,
        theme_color: "#6366f1",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating default card:", error)
      return { error: error.message }
    }

    console.log("[v0] Default virtual card created successfully:", newCard?.id)
    return { data: newCard }
  } catch (error) {
    console.error("[v0] Unexpected error in ensureDefaultVirtualCard:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getDefaultVirtualCard() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: card, error } = await supabase
      .from("virtual_business_cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single()

    if (error) {
      console.error("[v0] Error fetching default card:", error)
      return { error: error.message }
    }

    console.log("[v0] Default virtual card fetched:", card?.id)
    return { data: card }
  } catch (error) {
    console.error("[v0] Unexpected error fetching default card:", error)
    return { error: "An unexpected error occurred" }
  }
}
