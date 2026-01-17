"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { QrCode, Eye, Download, Plus, X, Edit, Trash2, Copy, Check, Clock } from "lucide-react"
import { CreateQRCodeFormInline } from "@/components/create-qr-code-form-inline"
import {
  scheduleQRCodeDeletion,
  cancelQRCodeDeletion,
  updateQRCodeDestination,
  toggleQRCodeStatus,
  getPendingDeletions,
} from "@/app/actions/qr-actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { addLogoToQRClient } from "@/lib/utils/qr-generator"
import { Badge } from "@/components/ui/badge"

export function UserQRCodesSection() {
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingQR, setEditingQR] = useState<any>(null)
  const [newDestinationUrl, setNewDestinationUrl] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingQR, setDeletingQR] = useState<any>(null)
  const [viewingQR, setViewingQR] = useState<any>(null)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [userInputCode, setUserInputCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [pendingDeletions, setPendingDeletions] = useState<any[]>([])

  useEffect(() => {
    loadQRCodes()
    loadPendingDeletions()
    const deleteCheckInterval = setInterval(() => {
      setQrCodes((prev) => {
        return prev.filter((qr) => {
          if (qr.scheduled_deletion_at) {
            const scheduledTime = new Date(qr.scheduled_deletion_at).getTime()
            const deletionTime = new Date(scheduledTime + 12 * 60 * 60 * 1000).getTime()
            const now = new Date().getTime()
            if (now >= deletionTime) {
              return false // Remove from list
            }
          }
          return true
        })
      })
    }, 1000)
    return () => clearInterval(deleteCheckInterval)
  }, [])

  async function loadQRCodes() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading QR codes:", error)
        toast.error("Failed to load QR codes")
        setQrCodes([])
      } else {
        setQrCodes(data || [])
      }

      setLoading(false)
    } catch (error) {
      console.error("Exception loading QR codes:", error)
      setQrCodes([])
      setLoading(false)
    }
  }

  async function loadPendingDeletions() {
    const result = await getPendingDeletions()
    if (!result.error && result.pendingDeletions) {
      setPendingDeletions(result.pendingDeletions)
    }
  }

  async function handleEdit(qr: any) {
    setEditingQR(qr)
    setNewDestinationUrl(qr.destination_url)
  }

  async function handleUpdateDestination() {
    if (!editingQR || !newDestinationUrl) return

    setIsUpdating(true)
    const result = await updateQRCodeDestination(editingQR.id, newDestinationUrl)
    setIsUpdating(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Destination URL updated successfully!")
      setEditingQR(null)
      setNewDestinationUrl("")
      loadQRCodes()
    }
  }

  async function handleRequestDeletion(qr: any) {
    setDeletingQR(qr)
    setUserInputCode("")
    setCopied(false)

    // Get the confirmation code
    const result = await scheduleQRCodeDeletion(qr.id, "")
    if (result.confirmationCode) {
      setConfirmationCode(result.confirmationCode)
    } else if (result.error) {
      toast.error(result.error)
      setDeletingQR(null)
    }
  }

  async function handleConfirmDeletion() {
    if (!deletingQR || !userInputCode) return

    const result = await scheduleQRCodeDeletion(deletingQR.id, userInputCode)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success) {
      toast.success("QR code scheduled for deletion in 12 hours. You can cancel anytime before then.")
      setDeletingQR(null)
      setConfirmationCode("")
      setUserInputCode("")
      loadQRCodes()
      loadPendingDeletions()
    }
  }

  async function handleCancelDeletion(qrCodeId: string) {
    const result = await cancelQRCodeDeletion(qrCodeId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Deletion cancelled successfully!")
      loadPendingDeletions()
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(confirmationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleToggleStatus(qr: any) {
    const newStatus = qr.status === "active" ? "inactive" : "active"
    const result = await toggleQRCodeStatus(qr.id, newStatus)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`QR code ${newStatus === "active" ? "activated" : "deactivated"} successfully!`)
      loadQRCodes()
    }
  }

  function handleView(qr: any) {
    setViewingQR(qr)
  }

  function isPendingDeletion(qr: any) {
    if (qr.scheduled_deletion_at) {
      const scheduledTime = new Date(qr.scheduled_deletion_at).getTime()
      const now = new Date().getTime()
      // Only show as pending if scheduled time is in the future
      if (scheduledTime > now) {
        return { scheduled_deletion_at: qr.scheduled_deletion_at, qr_code_id: qr.id }
      }
    }
    return pendingDeletions.find((pd) => pd.qr_code_id === qr.id)
  }

  function getTimeRemaining(scheduledAt: string) {
    const now = new Date()
    const scheduled = new Date(scheduledAt)
    const deletionTime = new Date(scheduled.getTime() + 12 * 60 * 60 * 1000).getTime()
    const diff = deletionTime.getTime() - now.getTime()

    if (diff <= 0) return "Deleting soon..."

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  function isNewQRCode(createdAt: string) {
    const created = new Date(createdAt).getTime()
    const now = new Date().getTime()
    const fiveMinutesAgo = now - 5 * 60 * 1000
    return created > fiveMinutesAgo
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My QR Codes</h1>
            <p className="text-sm text-gray-600">Manage all your QR codes</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {showCreateForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </>
            )}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
          <CreateQRCodeFormInline
            onSuccess={() => {
              loadQRCodes()
              setShowCreateForm(false)
            }}
          />
        </div>
      )}

      {qrCodes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white/10 p-12 text-center shadow-lg backdrop-blur-xl">
          <QrCode className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No QR codes yet</h3>
          <p className="mt-2 text-sm text-gray-600">Create your first QR code to get started</p>
          <Button onClick={() => setShowCreateForm(true)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
            Create QR Code
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qr) => {
            const pendingDeletion = isPendingDeletion(qr)
            return (
              <div
                key={qr.id}
                className={`group relative rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg ${
                  pendingDeletion ? "border-red-300 bg-red-50/20" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {isNewQRCode(qr.created_at) && <Badge className="mb-2 bg-green-500 text-white">NEW</Badge>}
                    {pendingDeletion && (
                      <Badge className="mb-2 bg-red-500 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled for Deletion
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{qr.title}</h3>
                <p className="text-sm text-gray-600 mb-4 truncate">{qr.destination_url}</p>

                <div className="mb-4 rounded-lg bg-gray-50 p-4 flex items-center justify-center">
                  {qr.qr_image_url ? (
                    <img src={qr.qr_image_url || "/placeholder.svg"} alt={qr.title} className="h-32 w-32" />
                  ) : (
                    <div className="h-32 w-32 flex items-center justify-center bg-gray-200 rounded">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>

                {pendingDeletion && (
                  <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <p className="text-xs text-gray-700">
                      This QR code will be permanently deleted in{" "}
                      {getTimeRemaining(pendingDeletion.scheduled_deletion_at)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full bg-transparent"
                      onClick={() => handleCancelDeletion(qr.id)}
                    >
                      Cancel Deletion
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleView(qr)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => handleToggleStatus(qr)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent"
                  onClick={() => handleEdit(qr)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit URL
                </Button>

                {!pendingDeletion && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRequestDeletion(qr)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!viewingQR} onOpenChange={(open) => !open && setViewingQR(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{viewingQR?.title}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="rounded-lg bg-white p-4">
                {viewingQR?.qr_logo_url ? (
                  <QRWithLogo qr={viewingQR} />
                ) : (
                  <img
                    src={viewingQR?.qr_image_url || "/placeholder.svg"}
                    alt={viewingQR?.title}
                    className="mx-auto h-64 w-64"
                  />
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Destination URL:</span>
                  <p className="text-muted-foreground break-all">{viewingQR?.destination_url}</p>
                </div>
                <div>
                  <span className="font-semibold">Short Code:</span>
                  <p className="text-muted-foreground font-mono">{viewingQR?.short_code}</p>
                </div>
                <div>
                  <span className="font-semibold">Total Scans:</span>
                  <p className="text-muted-foreground">{viewingQR?.scans_used || 0}</p>
                </div>
                <div>
                  <span className="font-semibold">Status:</span>
                  <p className="text-muted-foreground capitalize">{viewingQR?.status}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href={viewingQR?.qr_image_url} download={`${viewingQR?.title}.png`}>
                Download
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!editingQR} onOpenChange={(open) => !open && setEditingQR(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Destination URL</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Update the destination URL for "{editingQR?.title}". The QR code image will remain the same.</p>
              <Input
                placeholder="https://example.com"
                value={newDestinationUrl}
                onChange={(e) => setNewDestinationUrl(e.target.value)}
                className="font-mono"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setEditingQR(null)
                setNewDestinationUrl("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateDestination} disabled={isUpdating || !newDestinationUrl}>
              {isUpdating ? "Updating..." : "Update URL"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingQR} onOpenChange={(open) => !open && setDeletingQR(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm QR Code Deletion</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                You are about to schedule "{deletingQR?.title}" for deletion. This QR code will be permanently deleted
                in <strong>12 hours</strong>.
              </div>
              <div className="text-sm">To confirm, please copy the code below and paste it in the input field:</div>
              <div className="rounded-lg bg-gray-100 p-3 font-mono text-center text-lg font-bold tracking-wider">
                {confirmationCode}
              </div>
              <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleCopyCode}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
              <Input
                placeholder="Paste confirmation code here"
                value={userInputCode}
                onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
                className="font-mono text-center"
              />
              <p className="text-xs text-muted-foreground">
                You can cancel the deletion anytime within the next 12 hours.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeletingQR(null)
                setConfirmationCode("")
                setUserInputCode("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeletion}
              disabled={!userInputCode || userInputCode !== confirmationCode}
              className="bg-red-600 hover:bg-red-700"
            >
              Schedule Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function QRWithLogo({ qr }: { qr: any }) {
  const [qrWithLogo, setQrWithLogo] = useState<string | null>(null)

  useEffect(() => {
    async function embedLogo() {
      if (qr.qr_image_url && qr.qr_logo_url) {
        try {
          const result = await addLogoToQRClient(
            qr.qr_image_url,
            qr.qr_logo_url,
            512,
            qr.logo_size || 12,
            qr.logo_outline_color || "#FFFFFF",
          )
          setQrWithLogo(result)
        } catch (error) {
          console.error("Failed to embed logo:", error)
          setQrWithLogo(qr.qr_image_url)
        }
      }
    }
    embedLogo()
  }, [qr])

  return <img src={qrWithLogo || qr.qr_image_url || "/placeholder.svg"} alt={qr.title} className="mx-auto h-32 w-32" />
}
