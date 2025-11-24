"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Building2, Users } from "lucide-react"

interface Company {
  name: string
  userCount: number
}

export function CompaniesSection() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
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
    loadCompanies()
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-sm text-gray-600">Organizations using the platform</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div
            key={company.name}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{company.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{company.userCount} users</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
