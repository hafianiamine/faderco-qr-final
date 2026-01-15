"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Building2, Users, X, Plus } from "lucide-react"

interface Company {
  name: string
  userCount: number
}

interface User {
  id: string
  full_name: string
  email: string
  position: string
  phone_number: string
  company: string
}

export function CompaniesSection() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [draggedCompany, setDraggedCompany] = useState<string | null>(null)
  const [draggedUser, setDraggedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [companyUsers, setCompanyUsers] = useState<User[]>([])
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false)
  const [newCompanyName, setNewCompanyName] = useState("")

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    const supabase = createClient()
    const { data: profiles } = await supabase.from("profiles").select("company").not("company", "is", null)

    if (profiles) {
      const companyMap = new Map<string, number>()
      profiles.forEach((p) => {
        if (p.company) {
          const normalizedName = p.company.toLowerCase()
          const originalName = p.company

          let existingKey = ""
          for (const [key] of companyMap) {
            if (key.toLowerCase() === normalizedName) {
              existingKey = key
              break
            }
          }

          if (existingKey) {
            companyMap.set(existingKey, (companyMap.get(existingKey) || 0) + 1)
          } else {
            companyMap.set(originalName, 1)
          }
        }
      })

      const companiesArray = Array.from(companyMap.entries())
        .map(([name, userCount]) => ({ name, userCount }))
        .sort((a, b) => b.userCount - a.userCount)

      setCompanies(companiesArray)
    }
  }

  async function loadCompanyUsers(companyName: string) {
    const supabase = createClient()
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, email, position, phone_number, company")
      .eq("company", companyName)

    if (users) {
      setCompanyUsers(users as User[])
    }
  }

  async function handleMergeCompanies(sourceName: string, targetName: string) {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.from("profiles").update({ company: targetName }).eq("company", sourceName)
      await loadCompanies()
      setDraggedCompany(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUserMove(userId: string, targetCompany: string) {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.from("profiles").update({ company: targetCompany }).eq("id", userId)
      await loadCompanies()
      if (selectedCompany) {
        await loadCompanyUsers(selectedCompany)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateCompany() {
    if (!newCompanyName.trim()) return

    const supabase = createClient()
    // Find a user and assign to new company (or just mark it as existing)
    const { data: firstUser } = await supabase.from("profiles").select("id").limit(1).single()

    if (firstUser) {
      await supabase.from("profiles").update({ company: newCompanyName }).eq("id", firstUser.id)
    }

    setNewCompanyName("")
    setShowNewCompanyForm(false)
    await loadCompanies()
  }

  const handleCompanyDragStart = (companyName: string) => {
    setDraggedCompany(companyName)
  }

  const handleCompanyDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add("ring-2", "ring-blue-400")
  }

  const handleCompanyDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-blue-400")
  }

  const handleCompanyDrop = (targetCompanyName: string, e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove("ring-2", "ring-blue-400")

    if (draggedCompany && draggedCompany !== targetCompanyName) {
      handleMergeCompanies(draggedCompany, targetCompanyName)
    }
  }

  const handleUserDragStart = (user: User) => {
    setDraggedUser(user)
  }

  const handleUserDragOverCompany = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add("ring-2", "ring-green-400")
  }

  const handleUserDragLeaveCompany = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-green-400")
  }

  const handleUserDropOnCompany = (targetCompanyName: string, e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove("ring-2", "ring-green-400")

    if (draggedUser && draggedUser.company !== targetCompanyName) {
      handleUserMove(draggedUser.id, targetCompanyName)
      setDraggedUser(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-sm text-gray-600">Organizations using the platform</p>
              <p className="text-xs text-gray-500 mt-1">
                Drag a company onto another to merge them, or click to manage users
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewCompanyForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="h-4 w-4" />
            New Company
          </button>
        </div>
      </div>

      {showNewCompanyForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Create New Company</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateCompany()
              }}
            />
            <button
              onClick={handleCreateCompany}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewCompanyForm(false)
                setNewCompanyName("")
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div
            key={company.name}
            draggable
            onDragStart={() => handleCompanyDragStart(company.name)}
            onDragOver={handleCompanyDragOver}
            onDragLeave={handleCompanyDragLeave}
            onDrop={(e) => handleCompanyDrop(company.name, e)}
            onClick={() => {
              setSelectedCompany(company.name)
              loadCompanyUsers(company.name)
            }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300 cursor-pointer"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{company.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{company.userCount} users</span>
            </div>
            {isLoading && draggedCompany === company.name && <p className="text-xs text-blue-600 mt-2">Merging...</p>}
          </div>
        ))}
      </div>

      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedCompany} - Users</h2>
              <button onClick={() => setSelectedCompany(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              {companyUsers.length === 0 ? (
                <p className="text-gray-500">No users in this company</p>
              ) : (
                companyUsers.map((user) => (
                  <div
                    key={user.id}
                    draggable
                    onDragStart={() => handleUserDragStart(user)}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-move"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        {user.position} • {user.phone_number}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Drag users to another company card to move them</p>
              <div className="grid gap-2 grid-cols-2">
                {companies
                  .filter((c) => c.name !== selectedCompany)
                  .map((company) => (
                    <div
                      key={company.name}
                      onDragOver={handleUserDragOverCompany}
                      onDragLeave={handleUserDragLeaveCompany}
                      onDrop={(e) => handleUserDropOnCompany(company.name, e)}
                      className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm font-medium text-gray-600 hover:border-blue-400 transition"
                    >
                      Move to {company.name}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
