"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/lib/activity-logger"
import { headers } from "next/headers"

export async function createForm(title: string, description: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data, error } = await supabase
      .from("forms")
      .insert({
        user_id: user.id,
        title,
        description,
      })
      .select()
      .single()

    if (error) throw error

    // Ensure action_type is provided as second parameter
    await logActivity(user.id, "form_created", "forms", data.id, null, { title, description })
    revalidatePath("/dashboard")

    return { data }
  } catch (error) {
    console.error("Error creating form:", error)
    return { error: "Failed to create form" }
  }
}

export async function addFormField(
  formId: string,
  fieldType: string,
  label: string,
  placeholder: string,
  isRequired: boolean,
  options?: string,
  conditionalLogic?: { fieldId?: string; operator?: string; value?: string },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Verify form ownership
    const { data: form } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("user_id", user.id)
      .maybeSingle()
    if (!form) {
      return { error: "Form not found" }
    }

    const { data: fields } = await supabase
      .from("form_fields")
      .select("field_order")
      .eq("form_id", formId)
      .order("field_order", { ascending: false })
      .limit(1)
    const nextOrder = (fields?.[0]?.field_order ?? -1) + 1

    const { data, error } = await supabase
      .from("form_fields")
      .insert({
        form_id: formId,
        field_type: fieldType,
        label,
        placeholder,
        is_required: isRequired,
        options: options || null,
        field_order: nextOrder,
        conditional_logic: conditionalLogic ? JSON.stringify(conditionalLogic) : null,
      })
      .select()
      .single()

    if (error) throw error

    await logActivity(user.id, "form_field_added", "form_fields", data.id, null, { formId, fieldType, label })
    revalidatePath("/dashboard")

    return { data }
  } catch (error) {
    console.error("Error adding form field:", error)
    return { error: "Failed to add field" }
  }
}

export async function getFormWithFields(formId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (formError) throw formError
    if (!form) return { error: "Form not found" }

    const { data: fields, error: fieldsError } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("field_order", { ascending: true })

    if (fieldsError) throw fieldsError

    return { data: { ...form, fields } }
  } catch (error) {
    console.error("Error getting form:", error)
    return { error: "Failed to get form" }
  }
}

export async function submitFormResponse(formId: string, responseData: Record<string, any>) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const { data, error } = await supabase
      .from("form_responses")
      .insert({
        form_id: formId,
        response_data: responseData,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/form/${formId}`)
    return { data }
  } catch (error) {
    console.error("Error submitting form response:", error)
    return { error: "Failed to submit response" }
  }
}

export async function getFormResponses(formId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Verify form ownership
    const { data: form } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", user.id).single()
    if (!form) {
      return { error: "Form not found" }
    }

    const { data: responses, error } = await supabase
      .from("form_responses")
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false })

    if (error) throw error

    return { data: responses }
  } catch (error) {
    console.error("Error getting form responses:", error)
    return { error: "Failed to get responses" }
  }
}

export async function getFormStats(formId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Verify form ownership
    const { data: form } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", user.id).single()
    if (!form) {
      return { error: "Form not found" }
    }

    const { count: totalResponses, error: countError } = await supabase
      .from("form_responses")
      .select("*", { count: "exact", head: true })
      .eq("form_id", formId)

    if (countError) throw countError

    return { data: { totalResponses: totalResponses || 0 } }
  } catch (error) {
    console.error("Error getting form stats:", error)
    return { error: "Failed to get stats" }
  }
}

export async function updateFormPublished(formId: string, isPublished: boolean) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data, error } = await supabase
      .from("forms")
      .update({ is_published: isPublished })
      .eq("id", formId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    await logActivity(user.id, isPublished ? "form_published" : "form_unpublished", "forms", formId)
    revalidatePath("/dashboard")

    return { data }
  } catch (error) {
    console.error("Error updating form:", error)
    return { error: "Failed to update form" }
  }
}

export async function updateFormFieldCondition(fieldId: string, conditionalLogic?: any) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data, error } = await supabase
      .from("form_fields")
      .update({ conditional_logic: conditionalLogic ? JSON.stringify(conditionalLogic) : null })
      .eq("id", fieldId)
      .select()
      .single()

    if (error) throw error

    await logActivity(user.id, "form_condition_updated", "form_fields", fieldId)
    revalidatePath("/dashboard")

    return { data }
  } catch (error) {
    console.error("Error updating form condition:", error)
    return { error: "Failed to update condition" }
  }
}
