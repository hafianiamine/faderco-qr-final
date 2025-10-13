"use client"

import { useEffect, useState } from "react"
import { QrCode, Power, PowerOff, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAllQRCodes, adminToggleQRStatus, adminDeleteQRCode } from "@/app/actions/admin-actions"
import { toast } from "sonner"
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

export function AllQRCodesSection() {
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [filteredQRCodes, setFilteredQRCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingQR, setDeletingQR] = useState<any>(null)

  useEffect(() => {
    loadQRCodes()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQRCodes(qrCodes)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredQRCodes(
        qrCodes.filter(
          (qr) =>
            qr.title?.toLowerCase().includes(query) ||
            qr.destination_url?.toLowerCase().includes(query) ||
            qr.profiles?.email?.toLowerCase().includes(query) ||
            qr.profiles?.full_name?.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, qrCodes])

  async function loadQRCodes() {
    try {
      const result = await getAllQRCodes()
      if (result.error) {
        toast.error(result.error)
        setQrCodes([])
        setFilteredQRCodes([])
      } else {
        setQrCodes(result.qrCodes || [])
        setFilteredQRCodes(result.qrCodes || [])
      }
    } catch (error) {
      toast.error("Failed to load QR codes")
      setQrCodes([])
      setFilteredQRCodes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(qr: any) {
    const newStatus = qr.status === "active" ? "inactive" : "active"
    const result = await adminToggleQRStatus(qr.id, newStatus)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`QR code ${newStatus === "active" ? "activated" : "paused"} successfully!`)
      loadQRCodes()
    }
  }

  async function handleDelete() {
    if (!deletingQR) return

    const result = await adminDeleteQRCode(deletingQR.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("QR code deleted successfully!")
      setDeletingQR(null)
      loadQRCodes()
    }
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
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase font-display">All QR Codes</h1>
            <p className="text-sm text-gray-600">View and manage QR codes from all users</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 backdrop-blur-xl shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, URL, user email, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {filteredQRCodes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white/80 p-12 text-center shadow-lg backdrop-blur-xl">
          <QrCode className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {qrCodes.length === 0 ? "No QR codes found" : "No matching QR codes"}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {qrCodes.length === 0 ? "Users haven't created any QR codes yet" : "Try adjusting your search query"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">QR Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Destination</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Scans</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQRCodes.map((qr) => (
                  <tr key={qr.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={qr.qr_image_url || "/placeholder.svg"} alt={qr.title} className="h-12 w-12 rounded" />
                        <div>
                          <div className="font-medium text-gray-900">{qr.title}</div>
                          <div className="text-xs text-gray-500 font-mono">{qr.short_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{qr.profiles?.full_name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{qr.profiles?.email}</div>
                        {qr.profiles?.company && <div className="text-xs text-gray-400">{qr.profiles.company}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-700" title={qr.destination_url}>
                        {qr.destination_url}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-900">{qr.scans_used || 0}</span>
                      {qr.scan_limit && <span className="text-gray-500">/{qr.scan_limit}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          qr.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {qr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(qr)}
                          className="border-gray-200"
                          title={qr.status === "active" ? "Pause QR Code" : "Activate QR Code"}
                        >
                          {qr.status === "active" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingQR(qr)}
                          title="Delete QR Code"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlertDialog open={!!deletingQR} onOpenChange={(open) => !open && setDeletingQR(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingQR?.title}" owned by {deletingQR?.profiles?.email}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
