"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Users,
  CheckCircle,
  XCircle,
  QrCode,
  MousePointerClick,
  Search,
  Trash2,
  Ban,
  Unlock,
  KeyRound,
  UserPlus,
  Filter,
  Eye,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  resetUserPassword,
  createUser,
  deleteUser,
  updateUserStatus,
  adminGetUserQRCodes,
  loginAsUser, // Added loginAsUser import
} from "@/app/actions/admin-actions"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  full_name: string | null
  company: string | null
  department: string | null
  country: string | null
  status: string
  role: string
  created_at: string
  qr_count?: number
  scan_count?: number
  phone_number: string | null
}

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [countryFilter, setCountryFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingUserQRs, setViewingUserQRs] = useState<any>(null)
  const [userQRCodes, setUserQRCodes] = useState<any[]>([])
  const [loadingQRs, setLoadingQRs] = useState(false)
  const [viewingUserDetails, setViewingUserDetails] = useState<User | null>(null)
  const [createFormData, setCreateFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    company: "",
    phoneNumber: "",
  })
  const { toast } = useToast()

  const companies = Array.from(new Set(users.map((u) => u.company).filter(Boolean))) as string[]
  const countries = Array.from(new Set(users.map((u) => u.country).filter(Boolean))) as string[]
  const departments = Array.from(new Set(users.map((u) => u.department).filter(Boolean))) as string[]

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.full_name?.toLowerCase().includes(query) ||
          user.company?.toLowerCase().includes(query),
      )
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter((user) => user.company === companyFilter)
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((user) => user.country === countryFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((user) => user.department === departmentFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, companyFilter, countryFilter, departmentFilter, users])

  async function loadUsers() {
    const supabase = createClient()

    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (profiles) {
      // Get all QR codes with scan counts in one query
      const { data: qrData } = await supabase
        .from("qr_codes")
        .select("user_id, id")
        .in(
          "user_id",
          profiles.map((p) => p.id),
        )

      // Get scan counts for all QR codes in one query
      const qrIds = qrData?.map((qr) => qr.id) || []
      const { data: scanData } = await supabase.from("scans").select("qr_code_id").in("qr_code_id", qrIds)

      // Build lookup maps
      const qrCountByUser = new Map<string, number>()
      const scanCountByQR = new Map<string, number>()

      qrData?.forEach((qr) => {
        qrCountByUser.set(qr.user_id, (qrCountByUser.get(qr.user_id) || 0) + 1)
      })

      scanData?.forEach((scan) => {
        scanCountByQR.set(scan.qr_code_id, (scanCountByQR.get(scan.qr_code_id) || 0) + 1)
      })

      const scanCountByUser = new Map<string, number>()
      qrData?.forEach((qr) => {
        const userScans = scanCountByUser.get(qr.user_id) || 0
        const qrScans = scanCountByQR.get(qr.id) || 0
        scanCountByUser.set(qr.user_id, userScans + qrScans)
      })

      const usersWithStats = profiles.map((profile) => ({
        ...profile,
        qr_count: qrCountByUser.get(profile.id) || 0,
        scan_count: scanCountByUser.get(profile.id) || 0,
      }))

      setUsers(usersWithStats)
      setFilteredUsers(usersWithStats)
    }
    setLoading(false)
  }

  async function handleViewUserQRs(user: User) {
    setViewingUserQRs(user)
    setLoadingQRs(true)

    const result = await adminGetUserQRCodes(user.id)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
      setUserQRCodes([])
    } else {
      setUserQRCodes(result.qrCodes || [])
    }

    setLoadingQRs(false)
  }

  async function handleUpdateStatus(userId: string, status: "approved" | "rejected" | "blocked") {
    const result = await updateUserStatus(userId, status)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `User ${status} successfully`,
      })
      loadUsers()
    }
  }

  async function handleResetPassword(userId: string, userEmail: string) {
    if (!confirm(`Send password reset email to ${userEmail}?`)) return

    const result = await resetUserPassword(userId, userEmail)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Password reset email sent successfully",
      })
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    const result = await deleteUser(userId)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      loadUsers()
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()

    const result = await createUser(
      createFormData.email,
      createFormData.password,
      createFormData.fullName,
      createFormData.company,
      createFormData.phoneNumber,
    )

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User created successfully",
      })
      setShowCreateModal(false)
      setCreateFormData({ email: "", password: "", fullName: "", company: "", phoneNumber: "" })
      loadUsers()
    }
  }

  async function handleLoginAsUser(user: User) {
    if (!confirm(`Login as ${user.email}? You will be redirected to their dashboard.`)) return

    const result = await loginAsUser(user.id)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result.success) {
      // Store impersonation data in sessionStorage
      sessionStorage.setItem("impersonating_user_id", result.targetUserId!)
      sessionStorage.setItem("original_admin_id", result.originalAdminId!)

      // Redirect to user dashboard
      window.location.href = "/dashboard"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-600">Manage all platform users</p>
            </div>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="border-gray-200 bg-white backdrop-blur-xl text-gray-900">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={createFormData.fullName}
                    onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                    required
                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    required
                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    required
                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-900">
                    Company (Optional)
                  </Label>
                  <Input
                    id="company"
                    value={createFormData.company}
                    onChange={(e) => setCreateFormData({ ...createFormData, company: e.target.value })}
                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-gray-900">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={createFormData.phoneNumber}
                    onChange={(e) => setCreateFormData({ ...createFormData, phoneNumber: e.target.value })}
                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                    Create User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 backdrop-blur-xl shadow-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-200 bg-white pl-10 text-gray-900 placeholder:text-gray-400 backdrop-blur-xl focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex flex-wrap gap-3 flex-1">
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 bg-white text-gray-900">
                <SelectValue placeholder="Filter by Company" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 bg-white">
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 bg-white text-gray-900">
                <SelectValue placeholder="Filter by Country" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 bg-white">
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 bg-white text-gray-900">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 bg-white">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(companyFilter !== "all" || countryFilter !== "all" || departmentFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCompanyFilter("all")
                  setCountryFilter("all")
                  setDepartmentFilter("all")
                }}
                className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">QR Codes</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Scans</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.full_name || "No name"}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.company || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">{user.qr_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-gray-900">{user.scan_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : user.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : user.status === "blocked"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => setViewingUserDetails(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLoginAsUser(user)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        title="Login as this user"
                      >
                        <LogIn className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleViewUserQRs(user)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        title="View QR Codes"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      {user.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(user.id, "approved")}
                            className="bg-green-500 hover:bg-green-600 text-white"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(user.id, "rejected")}
                            title="Reject"
                            className="text-white"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {user.status === "rejected" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(user.id, "approved")}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {user.status === "approved" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(user.id, "blocked")}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          title="Block User"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {user.status === "blocked" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(user.id, "approved")}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          title="Unblock User"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleResetPassword(user.id, user.email)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                        className="text-white"
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

      {/* User Details Dialog */}
      <Dialog open={!!viewingUserDetails} onOpenChange={() => setViewingUserDetails(null)}>
        <DialogContent className="border-gray-200 bg-white backdrop-blur-xl text-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl">User Details</DialogTitle>
          </DialogHeader>
          {viewingUserDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Full Name</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.full_name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Phone Number</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.phone_number || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Company</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.company || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Department</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.department || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Country</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.country || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Status</p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      viewingUserDetails.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : viewingUserDetails.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : viewingUserDetails.status === "blocked"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {viewingUserDetails.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Role</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">QR Codes</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.qr_count || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-500">Total Scans</p>
                  <p className="text-base text-gray-900">{viewingUserDetails.scan_count || 0}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-semibold text-gray-500">Account Created</p>
                  <p className="text-base text-gray-900">{new Date(viewingUserDetails.created_at).toLocaleString()}</p>
                </div>
              </div>
              <Button
                onClick={() => setViewingUserDetails(null)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User QR Codes Dialog */}
      <Dialog open={!!viewingUserQRs} onOpenChange={() => setViewingUserQRs(null)}>
        <DialogContent className="max-w-4xl border-gray-200 bg-white backdrop-blur-xl text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              QR Codes for {viewingUserQRs?.full_name || viewingUserQRs?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {loadingQRs ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : userQRCodes.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-gray-500">
                <p>No QR codes found for this user</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {userQRCodes.map((qr) => (
                  <div key={qr.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <img src={qr.qr_image_url || "/placeholder.svg"} alt={qr.title} className="h-20 w-20 rounded" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{qr.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{qr.destination_url}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <span
                            className={`px-2 py-0.5 rounded-full ${qr.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {qr.status}
                          </span>
                          <span>{qr.scans_used || 0} scans</span>
                          {qr.scan_limit && <span>/ {qr.scan_limit} limit</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
