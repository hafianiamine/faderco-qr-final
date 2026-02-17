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
      return { error: error.message }
    }

    return { data: request }
    } catch (error) {
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

    const { data: request, error } = await supabase
      .from('nfc_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data: request }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}
