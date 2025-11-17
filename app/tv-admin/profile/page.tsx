"use client"

import { AdminProfileForm } from "@/components/tv-admin/admin-profile-form"
import { BrandManagement } from "@/components/tv-admin/brand-management"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/tv-admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Profile & Brand Management</h1>
              <p className="text-muted-foreground">Manage your profile and organize your brands</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <AdminProfileForm />
          <BrandManagement />
        </div>
      </div>
    </div>
  )
}
