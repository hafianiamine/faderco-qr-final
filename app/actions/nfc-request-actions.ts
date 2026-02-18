'use server'

import { createClient } from '@/lib/supabase/server'

export interface NFCRequestData {
  requestType: 'new_card' | 'replacement' | 'additional'
  reason?: string
}

export async function createNFCRequest(data: NFCRequestData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    console.log("[v0] Creating NFC request for user:", user.id, "Type:", data.requestType)

    const { data: request, error } = await supabase
      .from('nfc_requests')
      .insert({
        user_id: user.id,
        request_type: data.requestType,
        reason: data.reason,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating NFC request:', error)
      return { error: error.message }
    }

    console.log("[v0] NFC request created successfully:", request?.id)
    return { data: request }
  } catch (error) {
    console.error('[v0] Unexpected error creating NFC request:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getUserNFCRequests() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { data: requests, error } = await supabase
      .from('nfc_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching NFC requests:', error)
      return { error: error.message }
    }

    return { data: requests }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getAllNFCRequests() {
  try {
    const supabase = await createClient()

    const { data: requests, error } = await supabase
      .from('nfc_requests')
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all NFC requests:', error)
      return { error: error.message }
    }

    return { data: requests }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateNFCRequest(
  requestId: string,
  updates: {
    status?: string
    timeline_start?: string
    timeline_delivery?: string
    admin_notes?: string
  }
) {
  try {
    const supabase = await createClient()

    console.log("[v0] Admin updating NFC request:", requestId, "Status:", updates.status)

    const { data: request, error } = await supabase
      .from('nfc_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating NFC request:', error)
      return { error: error.message }
    }

    console.log("[v0] NFC request updated successfully:", request?.id, "New status:", request?.status)
    return { data: request }
  } catch (error) {
    console.error('[v0] Unexpected error updating NFC request:', error)
    return { error: 'An unexpected error occurred' }
  }
}
