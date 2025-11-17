"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Shield, User, QrCode, MousePointerClick, Building2 } from "lucide-react"
import { updateUserStatus, updateUserRole } from "@/app/actions/admin-actions"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EnhancedUserProfile {
  id: string
  email: string
  full_name: string
  company: string
  role: string
  status: string
  created_at: string
  qr_count: number
  scan_count: number
}

export function EnhancedUserTable({ users }: { users: EnhancedUserProfile[] }) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const handleStatusUpdate = async (userId: string, newStatus: "approved" | "rejected") => {
    setLoadingUserId(userId)
    await updateUserStatus(userId, newStatus)
    setLoadingUserId(null)
  }

  const handleRoleUpdate = async (userId: string, newRole: "user" | "admin") => {
    setLoadingUserId(userId)
    await updateUserRole(userId, newRole)
    setLoadingUserId(null)
  }

  if (users.length === 0) {
    return (
      <div className="py-12 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">No users found</p>
        <p className="text-sm text-muted-foreground">Users will appear here once they register</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead>User</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <QrCode className="h-4 w-4" />
                QR Codes
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <MousePointerClick className="h-4 w-4" />
                Scans
              </div>
            </TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
              <TableCell>
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.company || "N/A"}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={loadingUserId === user.id} className="h-8">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="cursor-pointer hover:opacity-80"
                      >
                        {user.role === "admin" ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <User className="mr-1 h-3 w-3" />
                        )}
                        {user.role}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "user")}>
                      <User className="mr-2 h-4 w-4" />
                      User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === "approved" ? "default" : user.status === "pending" ? "secondary" : "destructive"
                  }
                  className="font-medium"
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1">
                  <QrCode className="h-3 w-3 text-blue-500" />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{user.qr_count}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1">
                  <MousePointerClick className="h-3 w-3 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">{user.scan_count}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {user.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusUpdate(user.id, "approved")}
                        disabled={loadingUserId === user.id}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(user.id, "rejected")}
                        disabled={loadingUserId === user.id}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {user.status === "rejected" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(user.id, "approved")}
                      disabled={loadingUserId === user.id}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {user.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(user.id, "rejected")}
                      disabled={loadingUserId === user.id}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Revoke
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
