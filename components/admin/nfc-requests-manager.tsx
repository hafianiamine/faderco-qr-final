'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, X, Clock, Send } from 'lucide-react'
import { getAllNFCRequests, updateNFCRequest } from '@/app/actions/nfc-request-actions'
import { useToast } from '@/hooks/use-toast'

interface NFCRequest {
  id: string
  user_id: string
  request_type: string
  reason: string
  status: string
  timeline_start: string
  timeline_delivery: string
  admin_notes: string
  created_at: string
  user: {
    id: string
    full_name: string
    email: string
  }
}

export function NFCRequestsManager() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<NFCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<NFCRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [timelineDelivery, setTimelineDelivery] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      setLoading(true)
      const result = await getAllNFCRequests()
      if (result.error) {
        toast({ title: 'Error', description: result.error })
      } else {
        setRequests(result.data || [])
      }
    } catch (error) {
      console.error('Error loading requests:', error)
      toast({ title: 'Error', description: 'Failed to load NFC requests' })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateRequest() {
    if (!selectedRequest) return

    try {
      const result = await updateNFCRequest(selectedRequest.id, {
        status: updateStatus || undefined,
        timeline_delivery: timelineDelivery || undefined,
        admin_notes: adminNotes || undefined,
      })

      if (result.error) {
        toast({ title: 'Error', description: result.error })
      } else {
        toast({ title: 'Success', description: 'Request updated successfully' })
        setShowDetailModal(false)
        loadRequests()
      }
    } catch (error) {
      console.error('Error updating request:', error)
      toast({ title: 'Error', description: 'Failed to update request' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">NFC Card Requests</h2>
        <Button onClick={loadRequests} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card className="p-8 text-center text-gray-600">
            No requests yet
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{request.user?.full_name || 'Unknown User'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{request.user?.email}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Type:</span> {request.request_type.replace('_', ' ')}
                  </p>
                  {request.reason && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Requested: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedRequest(request)
                    setUpdateStatus(request.status)
                    setTimelineDelivery(request.timeline_delivery || '')
                    setAdminNotes(request.admin_notes || '')
                    setShowDetailModal(true)
                  }}
                  variant="outline"
                  size="sm"
                >
                  Manage
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Update Request Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage NFC Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">User</p>
                <p className="text-sm text-gray-600">{selectedRequest.user?.full_name}</p>
                <p className="text-xs text-gray-500">{selectedRequest.user?.email}</p>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="delivery">Expected Delivery Date</Label>
                <Input
                  id="delivery"
                  type="date"
                  value={timelineDelivery.split('T')[0] || ''}
                  onChange={(e) => setTimelineDelivery(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDetailModal(false)} className="flex-1">
                  Close
                </Button>
                <Button onClick={handleUpdateRequest} className="flex-1">
                  <Send className="h-4 w-4 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
