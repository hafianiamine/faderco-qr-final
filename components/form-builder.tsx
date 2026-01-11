"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye, Lock } from "lucide-react"
import { addFormField, updateFormPublished } from "@/app/actions/form-actions"

const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "date", label: "Date" },
]

export function FormBuilder({ formId }: { formId: string }) {
  const [fieldType, setFieldType] = useState("text")
  const [label, setLabel] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddField = async () => {
    if (!label.trim()) return

    setLoading(true)
    try {
      await addFormField(formId, fieldType, label, placeholder, isRequired)
      setLabel("")
      setPlaceholder("")
      setFieldType("text")
      setIsRequired(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      await updateFormPublished(formId, !isPublished)
      setIsPublished(!isPublished)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Form Field</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fieldType" className="text-gray-900">
              Field Type
            </Label>
            <select
              id="fieldType"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="label" className="text-gray-900">
              Field Label
            </Label>
            <Input
              id="label"
              type="text"
              placeholder="e.g., What is your name?"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 border-gray-300"
            />
          </div>

          <div>
            <Label htmlFor="placeholder" className="text-gray-900">
              Placeholder (Optional)
            </Label>
            <Input
              id="placeholder"
              type="text"
              placeholder="e.g., John Doe"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="mt-1 border-gray-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="required" className="text-gray-900">
              Required field
            </Label>
          </div>

          <Button
            onClick={handleAddField}
            disabled={loading || !label.trim()}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handlePublish}
          disabled={loading}
          variant={isPublished ? "default" : "outline"}
          className="flex-1 gap-2"
        >
          {isPublished ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isPublished ? "Published" : "Publish Form"}
        </Button>
      </div>
    </div>
  )
}
