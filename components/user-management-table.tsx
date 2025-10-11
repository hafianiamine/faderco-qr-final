"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Shield, User } from "lucide-react"
import { updateUserStatus, updateUserRole } from "@/app/actions/admin-actions"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  created_at: string
}

export function UserManagementTable({ users }: { users: UserProfile[] }) {
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
    return <p className="py-8 text-center text-muted-foreground">No users found</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={loadingUserId === user.id}>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="cursor-pointer">
                      {user.role === "admin" ? <Shield className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "user")}>User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "admin")}>Admin</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            <TableCell>
              <Badge
                variant={user.status === "approved" ? "default" : user.status === "pending" ? "secondary" : "outline"}
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {user.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(user.id, "approved")}
                      disabled={loadingUserId === user.id}
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
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
