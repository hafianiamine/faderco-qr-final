"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye, Lock, Settings, GripVertical } from "lucide-react"
import { addFormField, getFormWithFields, updateFormPublished } from "@/app/actions/form-actions"
import { toast } from "sonner"

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

export function FormBuilderAdvanced({ formId }: { formId: string }) {
  const [form, setForm] = useState<any>(null)
  const [fields, setFields] = useState<any[]>([])
  const [fieldType, setFieldType] = useState("text")
  const [label, setLabel] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [conditionalLogic, setConditionalLogic] = useState<any>(null)
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = async () => {
    const result = await getFormWithFields(formId)
    if (!result.error) {
      setForm(result.data)
      setFields(result.data.fields || [])
      setIsPublished(result.data.is_published)
    }
  }

  const handleAddField = async () => {
    if (!label.trim()) {
      toast.error("Label is required")
      return
    }

    setLoading(true)
    try {
      await addFormField(formId, fieldType, label, placeholder, isRequired, undefined, conditionalLogic)
      setLabel("")
      setPlaceholder("")
      setFieldType("text")
      setIsRequired(false)
      setConditionalLogic(null)
      await loadForm()
      toast.success("Field added successfully")
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      await updateFormPublished(formId, !isPublished)
      setIsPublished(!isPublished)
      toast.success(isPublished ? "Form unpublished" : "Form published")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Form Builder</h3>

        {/* Form Fields List */}
        <div className="mb-6 space-y-2">
          {fields.length > 0 ? (
            fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3 rounded border border-gray-200 p-3 bg-gray-50">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-500">
                    {FIELD_TYPES.find((t) => t.value === field.field_type)?.label}
                  </p>
                </div>
                {field.is_required && <span className="text-xs text-red-600">Required</span>}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFieldId(selectedFieldId === field.id ? null : field.id)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No fields added yet. Add your first field below.</p>
          )}
        </div>

        {/* Add Field Section */}
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-medium text-gray-900">Add New Field</h4>

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

          {/* Conditional Logic */}
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <Label className="text-gray-900 flex items-center gap-2 mb-2">
              <span>Show this field if...</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Advanced</span>
            </Label>
            <p className="text-xs text-gray-600 mb-2">
              Set conditional logic to display this field based on other responses
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConditionalLogic({ enabled: !conditionalLogic?.enabled })}
            >
              {conditionalLogic?.enabled ? "Edit Condition" : "Add Condition"}
            </Button>
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
          disabled={loading || fields.length === 0}
          variant={isPublished ? "default" : "outline"}
          className="flex-1 gap-2"
        >
          {isPublished ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isPublished ? "Published - Share Form" : "Publish Form"}
        </Button>
      </div>
    </div>
  )
}
