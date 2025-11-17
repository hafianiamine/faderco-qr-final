import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createTVAdClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

// TV Ad System Types
export interface TVAdminProfile {
  id: string
  name: string
  email: string
  phone?: string
  profile_image_url?: string
  company_name?: string
  created_at: string
  updated_at: string
}

export interface TVBrandCategory {
  id: string
  admin_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TVBrand {
  id: string
  category_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TVSubBrand {
  id: string
  brand_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TVDeal {
  id: string
  admin_id: string
  channel_name: string
  start_date: string
  end_date: string
  total_spots: number
  max_seconds_per_spot: number
  daily_cap?: number
  initial_payment?: number
  contract_file_url?: string
  employee_created_by?: string
  created_at: string
  updated_at: string
}

export interface TVSpecialEvent {
  id: string
  deal_id: string
  event_name: string
  start_date: string
  end_date: string
  extra_fee_amount: number
  created_at: string
}

export interface TVExtraPackage {
  id: string
  deal_id: string
  additional_spots: number
  amount_paid: number
  package_date: string
  special_event_id?: string
  created_at: string
}

export interface TVPayment {
  id: string
  deal_id: string
  payment_amount: number
  payment_date: string
  payment_type: "initial" | "extra_package" | "special_event"
  extra_package_id?: string
  notes?: string
  created_at: string
}

export interface TVAdSpot {
  id: string
  admin_id: string
  deal_id: string
  category_id: string
  brand_id: string
  sub_brand_id?: string
  ad_title: string
  scheduled_date: string
  duration_seconds: number
  airing_count: number
  status: "pending" | "confirmed" | "failed"
  failure_reason?: string
  special_event_fee: number
  created_at: string
  updated_at: string
}

// Helper functions for calculations
export function calculateSpotsUsed(durationSeconds: number, maxSecondsPerSpot: number, airingCount: number): number {
  const secondsConsumed = durationSeconds * airingCount
  return secondsConsumed / maxSecondsPerSpot
}

export function calculateSecondsConsumed(durationSeconds: number, airingCount: number): number {
  return durationSeconds * airingCount
}

export function calculateRemainingSpots(totalSpots: number, usedSpots: number, extraSpots = 0): number {
  return totalSpots + extraSpots - usedSpots
}

export function calculateRemainingSeconds(
  totalSpots: number,
  maxSecondsPerSpot: number,
  usedSeconds: number,
  extraSpots = 0,
): number {
  const totalSeconds = (totalSpots + extraSpots) * maxSecondsPerSpot
  return totalSeconds - usedSeconds
}
