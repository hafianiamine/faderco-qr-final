'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, CheckCircle, AlertCircle, Truck, XCircle } from 'lucide-react'
import { getUserNFCRequests } from '@/app/actions/nfc-request-actions'
import { useToast } from '@/hooks/use-toast'

interface NFCRequest {
  id: string
  request_type: string
  reason: string
  status: string
  timeline_delivery: string
  admin_notes: string
  created_at: string
  updated_at: string
}

export function UserNFCRequestsTracker() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<NFCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<NFCRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      setLoading(true)
      const result = await getUserNFCRequests()
      if (result.error) {
        toast({ title: 'Error', description: result.error })
      } else {
        setRequests(result.data || [])
      }
    } catch (error) {
      console.error('Error loading requests:', error)
      toast({ title: 'Error', description: 'Failed to load your requests' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'approved': return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'in_progress': return <Truck className="w-5 h-5 text-purple-600" />
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />
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
      <div>
        <h2 className="text-2xl font-bold mb-2">NFC Card Requests</h2>
        <p className="text-gray-600">Track the status of your physical NFC card requests</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-600">Loading...</Card>
      ) : requests.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          No requests yet. Request a new card from your dashboard!
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              setSelectedRequest(request)
              setShowDetailModal(true)
            }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(request.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold capitalize">
                      {request.request_type.replace('_', ' ')} Card
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)} whitespace-nowrap`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {request.reason && (
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Requested:</span> {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    {request.timeline_delivery && (
                      <div>
                        <span className="font-medium">Expected:</span> {new Date(request.timeline_delivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {request.admin_notes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      <span className="font-medium">Admin note:</span> {request.admin_notes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Request Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Request Type</p>
                <p className="text-lg font-semibold capitalize">{selectedRequest.request_type.replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedRequest.status)}
                  <p className="text-lg font-semibold capitalize">{selectedRequest.status.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedRequest.reason && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Reason</p>
                  <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requested Date</p>
                  <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
                {selectedRequest.timeline_delivery && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expected Delivery</p>
                    <p className="text-sm">{new Date(selectedRequest.timeline_delivery).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedRequest.admin_notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Message from Admin</p>
                  <p className="text-sm text-blue-800">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
