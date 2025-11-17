import { createClient } from "@/lib/supabase/client"

// Validate email against allowed domains from database
export async function isValidEmail(email: string): Promise<boolean> {
  const supabase = createClient()

  // Fetch allowed domains from database
  const { data: domains } = await supabase.from("allowed_domains").select("domain")

  if (!domains || domains.length === 0) {
    // If no domains configured, allow all emails
    return true
  }

  const emailLower = email.toLowerCase()
  return domains.some((d) => emailLower.endsWith(`@${d.domain}`))
}

export async function getEmailValidationError(email: string): Promise<string | null> {
  if (!email) {
    return "Email is required"
  }

  const isValid = await isValidEmail(email)

  if (!isValid) {
    const supabase = createClient()
    const { data: domains } = await supabase.from("allowed_domains").select("domain")

    const domainList = domains?.map((d) => `@${d.domain}`).join(", ") || "allowed domains"
    return `Only ${domainList} email addresses are allowed`
  }

  return null
}
