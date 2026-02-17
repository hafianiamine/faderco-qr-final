'use server'

import { createClient } from '@supabase/supabase-js'

export async function getLandingSections() {
  try {
    // Use service role key for server-side queries to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .order('section_number', { ascending: true })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: any) {
    return { data: [], error: error?.message || 'Failed to fetch landing sections' }
  }
}

export async function updateLandingSection(
  sectionNumber: number,
  title: string,
  description: string,
  youtubeUrl: string
) {
  try {
    // Use service role key for server-side updates to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('landing_sections')
      .update({
        title,
        description,
        youtube_url: youtubeUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('section_number', sectionNumber)
      .select()

    if (error) {
      throw error
    }

    return { data: data?.[0] || null, error: null }
  } catch (error: any) {
    return { data: null, error: error?.message || 'Failed to update landing section' }
  }
}
