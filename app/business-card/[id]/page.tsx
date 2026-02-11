import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BusinessCardDisplay } from '@/components/business-card-display'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: businessCard } = await supabase
    .from('virtual_business_cards')
    .select('title, vcard_data')
    .eq('id', params.id)
    .single()

  if (!businessCard || !businessCard.vcard_data) {
    return {
      title: 'Business Card Not Found',
    }
  }

  return {
    title: businessCard.title || 'Business Card',
    description: 'View and save this business card',
  }
}

export default async function BusinessCardPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: businessCard, error } = await supabase
    .from('virtual_business_cards')
    .select('title, vcard_data, is_active')
    .eq('id', params.id)
    .single()

  if (error || !businessCard) {
    redirect('/404')
  }

  if (!businessCard.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="text-5xl mb-4">⏸️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Card Inactive</h1>
          <p className="text-gray-600">This business card has been deactivated by the owner.</p>
        </div>
      </div>
    )
  }

  // Check if business card has vCard data
  if (!businessCard.vcard_data) {
    redirect('/404')
  }

  return <BusinessCardDisplay vCardData={businessCard.vcard_data} />
}
