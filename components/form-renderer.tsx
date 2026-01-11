"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitFormResponse } from "@/app/actions/form-actions"
import { Textarea } from "@/components/ui/textarea"

interface FormField {
  id: string
  label: string
  field_type: string
  placeholder?: string
  is_required: boolean
  options?: string
}

export function FormRenderer({
  formId,
  title,
  description,
  fields,
}: { formId: string; title: string; description: string; fields: FormField[] }) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    for (const field of fields) {
      if (field.is_required && !responses[field.id]) {
        alert(`${field.label} is required`)
        return
      }
    }

    setLoading(true)
    try {
      const result = await submitFormResponse(formId, responses)
      if (!result.error) {
        setSubmitted(true)
        setResponses({})
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
          <p className="mt-2 text-gray-600">Your response has been recorded successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-2 text-gray-600">{description}</p>}

        <div className="mt-8 space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-gray-900">
                {field.label}
                {field.is_required && <span className="text-red-500">*</span>}
              </Label>

              {field.field_type === "textarea" ? (
                <Textarea
                  placeholder={field.placeholder}
                  value={responses[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.is_required}
                  className="border-gray-300"
                />
              ) : field.field_type === "select" ? (
                <select
                  value={responses[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.is_required}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="">Select an option</option>
                  {field.options?.split(",").map((opt) => (
                    <option key={opt.trim()} value={opt.trim()}>
                      {opt.trim()}
                    </option>
                  ))}
                </select>
              ) : field.field_type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={responses[field.id] || false}
                  onChange={(e) => handleInputChange(field.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              ) : field.field_type === "radio" ? (
                <div className="space-y-2">
                  {field.options?.split(",").map((opt) => (
                    <div key={opt.trim()} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`${field.id}-${opt.trim()}`}
                        name={field.id}
                        value={opt.trim()}
                        checked={responses[field.id] === opt.trim()}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="h-4 w-4 border-gray-300"
                      />
                      <Label htmlFor={`${field.id}-${opt.trim()}`} className="text-gray-700">
                        {opt.trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <Input
                  type={field.field_type}
                  placeholder={field.placeholder}
                  value={responses[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.is_required}
                  className="border-gray-300"
                />
              )}
            </div>
          ))}
        </div>

        <Button type="submit" disabled={loading} className="mt-8 w-full bg-blue-600 hover:bg-blue-700">
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  )
}
