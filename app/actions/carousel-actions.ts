"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCarouselSlides() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("carousel_slides")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) throw error

  return data || []
}

export async function createCarouselSlide(imageUrl: string, durationSeconds: number, linkUrl?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  // Get the highest display order
  const { data: maxOrder } = await supabase
    .from("carousel_slides")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)

  const nextOrder = (maxOrder?.[0]?.display_order || 0) + 1

  const { error } = await supabase.from("carousel_slides").insert({
    image_url: imageUrl,
    duration_seconds: durationSeconds,
    link_url: linkUrl || null,
    display_order: nextOrder,
  })

  if (error) throw error

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true }
}

export async function updateCarouselSlide(
  slideId: string,
  updates: {
    image_url?: string
    duration_seconds?: number
    link_url?: string
    display_order?: number
  },
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { error } = await supabase.from("carousel_slides").update(updates).eq("id", slideId)

  if (error) throw error

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true }
}

export async function deleteCarouselSlide(slideId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { error } = await supabase.from("carousel_slides").delete().eq("id", slideId)

  if (error) throw error

  revalidatePath("/")
  revalidatePath("/admin")
  return { success: true }
}

export async function getAllCarouselSlides() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { data, error } = await supabase.from("carousel_slides").select("*").order("display_order", { ascending: true })

  if (error) throw error

  return data || []
}
