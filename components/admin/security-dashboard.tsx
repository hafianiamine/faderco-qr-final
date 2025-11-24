"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Download, Filter, AlertTriangle, Loader2 } from "lucide-react"
import {
  getActivityLogs,
  exportActivityLogs,
  getAllUsersForFilter,
  getAllQRCodesForFilter,
} from "@/app/actions/security-actions"
import { useToast } from "@/hooks/use-toast"

export function SecurityDashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [qrCodes, setQRCodes] = useState<any[]>([])
  const [filters, setFilters] = useState({
    userId: "",
    qrCodeId: "",
    actionType: "all_actions",
    startDate: "",
    endDate: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadLogs()
    loadFilterOptions()
  }, [])

  async function loadFilterOptions() {
    try {
      const [usersData, qrCodesData] = await Promise.all([getAllUsersForFilter(), getAllQRCodesForFilter()])
      setUsers(usersData)
      setQRCodes(qrCodesData)
    } catch (error: any) {
      console.error("Error loading filter options:", error)
    }
  }

  async function loadLogs() {
    setLoading(true)
    try {
      const filterParams: any = { ...filters }
      // Remove empty string filters
      if (!filterParams.userId) delete filterParams.userId
      if (!filterParams.qrCodeId) delete filterParams.qrCodeId
      if (!filterParams.actionType || filterParams.actionType === "all_actions") delete filterParams.actionType
      if (!filterParams.startDate) delete filterParams.startDate
      if (!filterParams.endDate) delete filterParams.endDate

      const data = await getActivityLogs(filterParams)
      setLogs(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load activity logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const filterParams: any = { ...filters }
      if (!filterParams.userId) delete filterParams.userId
      if (!filterParams.qrCodeId) delete filterParams.qrCodeId
      if (!filterParams.actionType || filterParams.actionType === "all_actions") delete filterParams.actionType
      if (!filterParams.startDate) delete filterParams.startDate
      if (!filterParams.endDate) delete filterParams.endDate

      const csv = await exportActivityLogs(filterParams)

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Activity logs have been exported to CSV",
      })
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export logs",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }

  function formatAction(action: string) {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-semibold">Security & Activity Logs</h2>
          </div>
          <Button onClick={handleExport} disabled={exporting} variant="outline">
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <div>
            <Label>Action Type</Label>
            <Select value={filters.actionType} onValueChange={(value) => setFilters({ ...filters, actionType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_actions">All actions</SelectItem>
                <SelectItem value="login_success">Login Success</SelectItem>
                <SelectItem value="login_failed">Login Failed</SelectItem>
                <SelectItem value="qr_created">QR Created</SelectItem>
                <SelectItem value="qr_edited">QR Edited</SelectItem>
                <SelectItem value="qr_deleted">QR Deleted</SelectItem>
                <SelectItem value="password_changed">Password Changed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>User</Label>
            <Select value={filters.userId} onValueChange={(value) => setFilters({ ...filters, userId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>QR Code</Label>
            <Select value={filters.qrCodeId} onValueChange={(value) => setFilters({ ...filters, qrCodeId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All QR codes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_qr_codes">All QR codes</SelectItem>
                {qrCodes.map((qr) => (
                  <SelectItem key={qr.id} value={qr.id}>
                    {qr.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={loadLogs} disabled={loading} className="mb-6 w-full">
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">No activity logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(log.created_at)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{log.profiles?.full_name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">{log.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatAction(log.action_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {log.old_value && <div className="text-gray-500">From: {log.old_value}</div>}
                      {log.new_value && <div>To: {log.new_value}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">{log.ip_address || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-xs">
                      {log.device_info ? JSON.parse(log.device_info).deviceType : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Important Legal Notice</h3>
            <p className="text-sm text-gray-600">
              These activity logs contain real IP addresses and device information that can be used for legal purposes.
              If you need to provide evidence to law enforcement, use the Export CSV button to generate a complete
              report with timestamps, user actions, and network information.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
