import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BusinessCardDisplay } from '@/components/business-card-display'

export async function generateMetadata({ params }: { params: { shortCode: string } }) {
  const supabase = await createClient()

  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('title, vcard_data, type')
    .eq('short_code', params.shortCode)
    .single()

  if (!qrCode || !qrCode.vcard_data) {
    return {
      title: 'Business Card Not Found',
    }
  }

  return {
    title: qrCode.title || 'Business Card',
    description: 'View and save this business card',
  }
}

export default async function BusinessCardPage({ params }: { params: { shortCode: string } }) {
  const supabase = await createClient()

  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('vcard_data, type, is_active, status')
    .eq('short_code', params.shortCode)
    .single()

  if (error || !qrCode) {
    redirect('/404')
  }

  if (!qrCode.is_active || qrCode.status === 'inactive') {
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

  // Check if it's a business card with vCard data
  if (!qrCode.vcard_data || qrCode.type !== 'business_card') {
    redirect('/404')
  }

  return <BusinessCardDisplay vCardData={qrCode.vcard_data} />
}
