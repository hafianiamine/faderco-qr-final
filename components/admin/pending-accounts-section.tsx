"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserCheck, Mail, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateUserStatus, confirmUserEmail } from "@/app/actions/admin-actions"
import { useToast } from "@/hooks/use-toast"

interface PendingUser {
  id: string
  email: string
  full_name: string | null
  company: string | null
  status: string
  created_at: string
  email_confirmed_at: string | null
}

export function PendingAccountsSection() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPendingUsers()
  }, [])

  async function loadPendingUsers() {
    const supabase = createClient()

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, company, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (profiles) {
      setPendingUsers(
        profiles.map((p: any) => ({
          ...p,
          email_confirmed_at: null, // Can't check auth status from client, so mark as null
        })),
      )
    }
    setLoading(false)
  }

  async function handleConfirmEmail(userId: string) {
    const result = await confirmUserEmail(userId)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Email confirmed successfully",
      })
      loadPendingUsers()
    }
  }

  async function handleApprove(userId: string) {
    const result = await updateUserStatus(userId, "approved")
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User approved successfully",
      })
      loadPendingUsers()
    }
  }

  async function handleReject(userId: string) {
    const result = await updateUserStatus(userId, "rejected")
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User rejected successfully",
      })
      loadPendingUsers()
    }
  }

  async function handleApproveAndConfirm(userId: string) {
    // First confirm email
    const confirmResult = await confirmUserEmail(userId)
    if (confirmResult.error) {
      toast({
        title: "Error",
        description: confirmResult.error,
        variant: "destructive",
      })
      return
    }

    // Then approve
    const approveResult = await updateUserStatus(userId, "approved")
    if (approveResult.error) {
      toast({
        title: "Error",
        description: approveResult.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "User confirmed and approved successfully",
      })
      loadPendingUsers()
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
          <Clock className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Accounts</h1>
            <p className="text-sm text-gray-600">Review and approve user registrations</p>
          </div>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white/80 p-12 text-center backdrop-blur-xl shadow-lg">
          <UserCheck className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No pending accounts</h3>
          <p className="mt-2 text-sm text-gray-600">All user registrations have been processed</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Email Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Registered</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingUsers.map((user) => {
                  const isEmailConfirmed = !!user.email_confirmed_at
                  return (
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
                          {isEmailConfirmed ? (
                            <>
                              <Mail className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-700">Confirmed</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-700">Not Confirmed</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {!isEmailConfirmed ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveAndConfirm(user.id)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                                title="Confirm Email & Approve"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve & Confirm
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmEmail(user.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                title="Confirm Email Only"
                              >
                                <Mail className="mr-1 h-4 w-4" />
                                Confirm Email
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              title="Approve Account"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.id)}
                            title="Reject Account"
                            className="text-white"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
