"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { QrCode, Eye, Download, Plus, X, Edit, Trash2, Power, PowerOff, Copy, Check, Clock } from "lucide-react"
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
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [pageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadQRCodes()
    loadPendingDeletions()
  }, [])

  const filteredQRCodes = qrCodes.filter((qr) => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "standard") {
      return !qr.type || qr.type === "standard"
    }
    if (selectedFilter === "wifi") {
      return qr.type === "wifi"
    }
    if (selectedFilter === "business_card") {
      return qr.type === "business_card"
    }
    return true
  })

  const paginatedQRCodes = filteredQRCodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const totalPages = Math.ceil(filteredQRCodes.length / pageSize)

  async function loadQRCodes() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setQrCodes([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error loading QR codes:", error)
        toast.error("Failed to load QR codes")
        setQrCodes([])
      } else {
        setQrCodes(Array.isArray(data) ? data : [])
      }

      setLoading(false)
    } catch (error) {
      console.error("Error in loadQRCodes:", error)
      toast.error("Failed to load QR codes")
      setQrCodes([]) // Ensure state is always an array
      setLoading(false)
    }
  }

  async function loadPendingDeletions() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setPendingDeletions([])
        return
      }

      const pendingData = await getPendingDeletions(user.id)
      setPendingDeletions(pendingData || [])
    } catch (error) {
      console.error("Error loading pending deletions:", error)
      setPendingDeletions([]) // Ensure state is always an array
    }
  }

  async function handleUpdateDestination() {
    if (!editingQR || !newDestinationUrl) return

    setIsUpdating(true)
    try {
      await updateQRCodeDestination(editingQR.id, newDestinationUrl)
      toast.success("QR code updated successfully")
      setEditingQR(null)
      setNewDestinationUrl("")
      loadQRCodes()
    } catch (error) {
      console.error("Error updating QR code:", error)
      toast.error("Failed to update QR code")
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleConfirmDeletion() {
    if (!deletingQR || !userInputCode) return

    try {
      await scheduleQRCodeDeletion(deletingQR.id)
      toast.success("QR code scheduled for deletion")
      setDeletingQR(null)
      setUserInputCode("")
      setConfirmationCode("")
      loadQRCodes()
      loadPendingDeletions()
    } catch (error) {
      console.error("Error scheduling deletion:", error)
      toast.error("Failed to schedule deletion")
    }
  }

  async function handleToggleStatus() {
    if (!editingQR) return

    try {
      await toggleQRCodeStatus(editingQR.id)
      toast.success("QR code status updated")
      loadQRCodes()
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Failed to update status")
    }
  }

  function isPendingDeletion(qr: any) {
    const scheduledTime = new Date(qr.scheduled_deletion_at).getTime()
    const now = new Date().getTime()

    if (scheduledTime > now) {
      return { scheduled_deletion_at: qr.scheduled_deletion_at, qr_code_id: qr.id }
    }
    // Safe check: ensure pendingDeletions is an array before calling .find()
    if (!Array.isArray(pendingDeletions)) {
      return null
    }
    return pendingDeletions.find((pd) => pd.qr_code_id === qr.id)
  }

  function getRemainingDeletionTime(scheduledTime: string) {
    const scheduled = new Date(scheduledTime).getTime()
    const now = new Date().getTime()
    const diff = scheduled - now

    if (diff <= 0) return "Deleting soon..."

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  function isNewlyCreated(createdAt: string) {
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
                Create QR Code
              </>
            )}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl">
          <CreateQRCodeFormInline
            onSuccess={() => {
              setShowCreateForm(false)
              loadQRCodes()
            }}
          />
        </div>
      )}

      {qrCodes.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white/10 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter("standard")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFilter === "standard"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setSelectedFilter("wifi")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFilter === "wifi"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              WiFi
            </button>
            <button
              onClick={() => setSelectedFilter("business_card")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFilter === "business_card"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Business Card
            </button>
          </div>
          {filteredQRCodes.length > 0 && (
            <p className="mt-3 text-sm text-gray-600">
              Showing {filteredQRCodes.length} of {qrCodes.length} QR codes
            </p>
          )}
        </div>
      )}

      {filteredQRCodes.length === 0 && qrCodes.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white/10 p-12 text-center shadow-lg backdrop-blur-xl">
          <QrCode className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No QR codes found</h3>
          <p className="mt-2 text-sm text-gray-600">Try selecting a different filter</p>
        </div>
      ) : qrCodes.length === 0 ? (
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
          {paginatedQRCodes.map((qr) => {
            const pendingDeletion = isPendingDeletion(qr)
            return (
              <div
                key={qr.id}
                className="rounded-2xl border border-gray-200 bg-white/10 p-6 shadow-lg backdrop-blur-xl hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-balance">{qr.title}</h3>
                    {qr.destination_url && (
                      <p className="text-xs text-gray-600 truncate mt-1">{qr.destination_url}</p>
                    )}
                  </div>
                  <Badge
                    className={`flex-shrink-0 ${
                      qr.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {qr.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {isNewlyCreated(qr.created_at) && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex-shrink-0">
                    New
                  </Badge>
                )}
                {qr.type === "wifi" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex-shrink-0">
                    WiFi
                  </Badge>
                )}
                {qr.type === "business_card" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex-shrink-0">
                    Business Card
                  </Badge>
                )}
                {pendingDeletion && (
                  <Badge variant="destructive" className="flex-shrink-0 uppercase">
                    <Clock className="mr-1 h-3 w-3" />
                    {getRemainingDeletionTime(pendingDeletion.scheduled_deletion_at)}
                  </Badge>
                )}

                <div className="my-4">
                  <QRWithLogo qr={qr} />
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingQR(qr)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel Deletion
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingQR(qr)}
                    className="w-full"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = qr.qr_image_url || "/placeholder.svg"
                      link.download = `${qr.title}.png`
                      link.click()
                    }}
                    className="w-full"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingQR(qr)
                      setNewDestinationUrl(qr.destination_url || "")
                    }}
                    className="w-full"
                  >
                    <Edit className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    className="w-full"
                  >
                    {qr.active ? (
                      <>
                        <PowerOff className="mr-1 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="mr-1 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setDeletingQR(qr)
                      setConfirmationCode(Math.random().toString(36).substring(2, 8).toUpperCase())
                      setUserInputCode("")
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!viewingQR} onOpenChange={(open) => !open && setViewingQR(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{viewingQR?.title}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              {viewingQR && <QRWithLogo qr={viewingQR} />}
              <div>
                <p className="text-xs text-gray-600">Destination URL:</p>
                <p className="text-sm font-mono text-gray-900 break-all">{viewingQR?.destination_url}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">QR Code ID:</p>
                <p className="text-sm font-mono text-gray-900">{viewingQR?.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Type:</p>
                <p className="text-sm text-gray-900">{viewingQR?.type || "Standard"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Created:</p>
                <p className="text-sm text-gray-900">{viewingQR ? new Date(viewingQR.created_at).toLocaleString() : ""}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Scans:</p>
                <p className="text-sm text-gray-900">{viewingQR?.scan_count || 0}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(viewingQR?.qr_code_id || "")
                  toast.success("QR Code ID copied!")
                }}
              >
                Copy ID
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!editingQR} onOpenChange={(open) => !open && setEditingQR(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Destination URL</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <Input
                placeholder="https://example.com"
                value={newDestinationUrl}
                onChange={(e) => setNewDestinationUrl(e.target.value)}
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
              {isUpdating ? "Updating..." : "Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingQR} onOpenChange={(open) => !open && setDeletingQR(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm QR Code Deletion</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>This QR code will be permanently deleted. This action cannot be undone.</p>
              <p className="font-semibold">To confirm, please enter this code:</p>
              <p className="text-center text-lg font-bold text-red-600 tracking-widest">{confirmationCode}</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={() => {
                navigator.clipboard.writeText(confirmationCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}>
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
                placeholder="Enter confirmation code"
                value={userInputCode}
                onChange={(e) => setUserInputCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeletingQR(null)
                setUserInputCode("")
                setConfirmationCode("")
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
          setQrWithLogo(qr.qr_image_url)
        }
      }
    }
    embedLogo()
  }, [qr])

  return <img src={qrWithLogo || qr.qr_image_url || "/placeholder.svg"} alt={qr.title} className="mx-auto h-32 w-32" />
}
