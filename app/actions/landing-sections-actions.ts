'use server'

import { createClient } from '@/lib/supabase/server'

export async function getLandingSections() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .order('section_number', { ascending: true })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error: any) {
    console.error('[v0] Error fetching landing sections:', error.message)
    return { data: [], error: error.message }
  }
}

export async function updateLandingSection(
  sectionNumber: number,
  title: string,
  description: string,
  youtubeUrl: string
) {
  const supabase = await createClient()

  try {
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

    if (error) throw error

    return { data: data?.[0] || null, error: null }
  } catch (error: any) {
    console.error('[v0] Error updating landing section:', error.message)
    return { data: null, error: error.message }
  }
}
