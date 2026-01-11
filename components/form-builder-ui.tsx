"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye, Lock, GripVertical } from "lucide-react"
import { createForm, addFormField, getFormWithFields, updateFormPublished } from "@/app/actions/form-actions"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

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

interface FormBuilderUIProps {
  formId?: string
  onSuccess?: () => void
}

export function FormBuilderUI({ formId: providedFormId, onSuccess }: FormBuilderUIProps) {
  const [formId, setFormId] = useState<string | null>(providedFormId || null)
  const [form, setForm] = useState<any>(null)
  const [fields, setFields] = useState<any[]>([])
  const [step, setStep] = useState<"create" | "build" | "preview">("create")

  // Create form state
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")

  // Add field state
  const [fieldType, setFieldType] = useState("text")
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldPlaceholder, setFieldPlaceholder] = useState("")
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldOptions, setFieldOptions] = useState("")

  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (formId) {
      loadForm()
    }
  }, [formId])

  const loadForm = async () => {
    if (!formId) return
    const result = await getFormWithFields(formId)
    if (!result.error && result.data) {
      setForm(result.data)
      setFields(result.data.fields || [])
      setIsPublished(result.data.is_published)
      setStep("build")
    } else {
      toast.error("Failed to load form")
    }
  }

  const handleCreateForm = async () => {
    if (!formTitle.trim()) {
      toast.error("Form title is required")
      return
    }

    setLoading(true)
    try {
      const result = await createForm(formTitle, formDescription)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setFormId(result.data.id)
        setForm(result.data)
        setStep("build")
        toast.success("Form created! Now add fields to your form.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddField = async () => {
    if (!formId || !fieldLabel.trim()) {
      toast.error("Label is required")
      return
    }

    setLoading(true)
    try {
      await addFormField(formId, fieldType, fieldLabel, fieldPlaceholder, fieldRequired, fieldOptions || undefined)
      setFieldLabel("")
      setFieldPlaceholder("")
      setFieldRequired(false)
      setFieldOptions("")
      setFieldType("text")
      await loadForm()
      toast.success("Field added!")
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!formId) return
    setLoading(true)
    try {
      await updateFormPublished(formId, !isPublished)
      setIsPublished(!isPublished)
      toast.success(isPublished ? "Form unpublished" : "Form published! Share your form QR code.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "create") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a New Form</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-title" className="text-gray-900">
                Form Title
              </Label>
              <Input
                id="form-title"
                type="text"
                placeholder="e.g., Customer Feedback Survey"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-600">The name of your form</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description" className="text-gray-900">
                Description (Optional)
              </Label>
              <Textarea
                id="form-description"
                placeholder="Tell people what this form is about..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-gray-300 resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleCreateForm}
              disabled={loading || !formTitle.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create Form"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "build" && formId) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{form?.title}</h3>
              {form?.description && <p className="text-sm text-gray-600 mt-1">{form.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePublish}
                disabled={loading || fields.length === 0}
                variant={isPublished ? "default" : "outline"}
                className="gap-2"
              >
                {isPublished ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isPublished ? "Published" : "Publish"}
              </Button>
            </div>
          </div>

          {/* Fields List */}
          <div className="mb-6 space-y-2">
            <Label className="text-sm font-medium text-gray-900">Fields ({fields.length})</Label>
            {fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-3 rounded border border-gray-200 p-3 bg-gray-50">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{field.label}</p>
                      <p className="text-xs text-gray-500">
                        {FIELD_TYPES.find((t) => t.value === field.field_type)?.label}
                      </p>
                    </div>
                    {field.is_required && <span className="text-xs text-red-600 font-medium">Required</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No fields yet. Add your first field below.</p>
            )}
          </div>

          {/* Add Field Section */}
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-medium text-gray-900">Add New Field</h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="field-type" className="text-gray-900">
                  Field Type
                </Label>
                <select
                  id="field-type"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-label" className="text-gray-900">
                  Label
                </Label>
                <Input
                  id="field-label"
                  type="text"
                  placeholder="e.g., What is your name?"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-placeholder" className="text-gray-900">
                Placeholder (Optional)
              </Label>
              <Input
                id="field-placeholder"
                type="text"
                placeholder="e.g., Enter your answer here"
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                className="border-gray-300"
              />
            </div>

            {["select", "checkbox", "radio"].includes(fieldType) && (
              <div className="space-y-2">
                <Label htmlFor="field-options" className="text-gray-900">
                  Options (comma-separated)
                </Label>
                <Input
                  id="field-options"
                  type="text"
                  placeholder="e.g., Option 1, Option 2, Option 3"
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                id="field-required"
                type="checkbox"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="field-required" className="text-gray-900 cursor-pointer">
                Required field
              </Label>
            </div>

            <Button
              onClick={handleAddField}
              disabled={loading || !fieldLabel.trim()}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </div>
        </div>

        {isPublished && formId && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-900 font-medium mb-2">✅ Form Published</p>
            <p className="text-xs text-green-800 mb-3">
              Your form is live! Share this form link or QR code with respondents:
            </p>
            <div className="bg-white rounded p-2 text-xs text-gray-600 font-mono break-all border border-green-200">
              {`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/form/${formId}`}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
