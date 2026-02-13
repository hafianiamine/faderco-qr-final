'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, CheckCircle2, Clock, AlertCircle, Truck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NFCRequest {
  id: string
  user_id: string
  request_type: string
  reason: string
  status: 'pending' | 'approved' | 'in_progress' | 'delivered' | 'cancelled'
  timeline_start: string | null
  timeline_delivery: string | null
  admin_notes: string | null
  created_at: string
  user_email?: string
}

interface VirtualCard {
  id: string
  full_name: string
  email: string
  phone?: string
  company_name?: string
  job_title?: string
  website?: string
  cover_image_url?: string
  theme_color?: string
}

export function AdminNFCRequestsSection() {
  const [requests, setRequests] = useState<NFCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<NFCRequest | null>(null)
  const [virtualCard, setVirtualCard] = useState<VirtualCard | null>(null)
  const [newStatus, setNewStatus] = useState<'approved' | 'in_progress' | 'delivered' | 'cancelled'>('approved')
  const [adminNotes, setAdminNotes] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [filterStatus])

  async function loadRequests() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('nfc_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error

      // Fetch user emails and virtual cards
      const enrichedRequests = await Promise.all(
        (data || []).map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', req.user_id)
            .single()

          return {
            ...req,
            user_email: profile?.email,
          }
        })
      )

      setRequests(enrichedRequests)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast({ title: 'Error', description: 'Failed to load NFC requests' })
    } finally {
      setLoading(false)
    }
  }

  async function handleViewRequest(request: NFCRequest) {
    try {
      const supabase = createClient()

      // Get the user's virtual card
      const { data: cards } = await supabase
        .from('virtual_business_cards')
        .select('*')
        .eq('user_id', request.user_id)
        .limit(1)

      if (cards && cards.length > 0) {
        setVirtualCard(cards[0])
      }

      setSelectedRequest(request)
      setNewStatus(request.status as any)
      setAdminNotes(request.admin_notes || '')
      setDeliveryDate(request.timeline_delivery?.split('T')[0] || '')
    } catch (error) {
      console.error('Error loading request details:', error)
      toast({ title: 'Error', description: 'Failed to load request details' })
    }
  }

  async function handleUpdateRequest() {
    try {
      if (!selectedRequest) return

      const supabase = createClient()

      const { error } = await supabase
        .from('nfc_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          timeline_delivery: deliveryDate ? new Date(deliveryDate).toISOString() : null,
          timeline_start: newStatus === 'in_progress' && !selectedRequest.timeline_start ? new Date().toISOString() : selectedRequest.timeline_start,
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      toast({ title: 'Success', description: 'Request updated successfully' })
      setSelectedRequest(null)
      loadRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast({ title: 'Error', description: 'Failed to update request' })
    }
  }

  const statusConfig = {
  const STATUS_CONFIG = {
    pending: { icon: Clock, color: 'bg-yellow-100', textColor: 'text-yellow-800', label: 'Pending' },
    approved: { icon: CheckCircle2, color: 'bg-blue-100', textColor: 'text-blue-800', label: 'Approved' },
    in_progress: { icon: Truck, color: 'bg-purple-100', textColor: 'text-purple-800', label: 'In Progress' },
    delivered: { icon: CheckCircle2, color: 'bg-green-100', textColor: 'text-green-800', label: 'Delivered' },
    cancelled: { icon: AlertCircle, color: 'bg-red-100', textColor: 'text-red-800', label: 'Cancelled' },
  }

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    const Icon = config?.icon || Clock
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">NFC Requests Management</h2>
        <p className="text-gray-600">Manage physical NFC card requests from users</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'in_progress', 'delivered', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            className="capitalize"
          >
            {status === 'in_progress' ? 'In Progress' : status}
          </Button>
        ))}
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => {
            const requestStatus = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = requestStatus.icon

            return (
              <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewRequest(request)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 capitalize">{request.request_type} Request</h3>
                      <Badge className={`${requestStatus.color} ${requestStatus.textColor} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {requestStatus.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.user_email}</p>
                    {request.reason && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600">{request.reason}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      {request.timeline_delivery && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Delivery: {new Date(request.timeline_delivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    handleViewRequest(request)
                  }}>
                    View Details
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="capitalize">{selectedRequest.request_type} Request Details</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Virtual Card Preview */}
              <div>
                <h4 className="font-semibold mb-4 text-gray-900">Virtual Card</h4>
                {virtualCard ? (
                  <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                    <div className="space-y-4">
                      {virtualCard.cover_image_url && (
                        <img src={virtualCard.cover_image_url} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                      )}
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: virtualCard.theme_color }}>
                          {virtualCard.full_name?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-center">
                        <h5 className="font-semibold text-gray-900">{virtualCard.full_name}</h5>
                        {virtualCard.job_title && <p className="text-sm text-gray-600">{virtualCard.job_title}</p>}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{virtualCard.email}</p>
                        {virtualCard.phone && <p>{virtualCard.phone}</p>}
                        {virtualCard.company_name && <p>{virtualCard.company_name}</p>}
                        {virtualCard.website && <a href={virtualCard.website} className="text-blue-600 hover:underline">{virtualCard.website}</a>}
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No virtual card found
                  </div>
                )}
              </div>

              {/* Right: Request Details & Updates */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase">Request Type</Label>
                  <p className="text-gray-900 capitalize mt-1">{selectedRequest.request_type}</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase">User Email</Label>
                  <p className="text-gray-900 mt-1">{selectedRequest.user_email}</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase">Requested Date</Label>
                  <p className="text-gray-900 mt-1">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <Label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase">Status</Label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="approved">Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="delivery" className="text-xs font-semibold text-gray-500 uppercase">Expected Delivery Date</Label>
                  <Input
                    id="delivery"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs font-semibold text-gray-500 uppercase">Admin Notes</Label>
                  <textarea
                    id="notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this request..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase">Reason for Request</Label>
                  <p className="text-gray-900 mt-1 text-sm">{selectedRequest.reason || 'No reason provided'}</p>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateRequest} className="flex-1">
                    Update Request
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
