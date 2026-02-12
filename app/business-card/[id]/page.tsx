import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BusinessCardDisplay } from '@/components/business-card-display'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: businessCard } = await supabase
    .from('virtual_business_cards')
    .select('full_name, vcard_data')
    .eq('id', params.id)
    .single()

  if (!businessCard || !businessCard.vcard_data) {
    return {
      title: 'Business Card Not Found',
    }
  }

  return {
    title: businessCard.full_name || 'Business Card',
    description: 'View and save this business card',
  }
}

export default async function BusinessCardPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: businessCard, error } = await supabase
    .from('virtual_business_cards')
    .select('full_name, vcard_data')
    .eq('id', params.id)
    .single()

  if (error || !businessCard) {
    redirect('/404')
  }

  // Check if business card has vCard data
  if (!businessCard.vcard_data) {
    redirect('/404')
  }

  return <BusinessCardDisplay vCardData={businessCard.vcard_data} />
}
