import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ message: "Forbidden - Admin access required" }, { status: 403 })
    }

    const { email, fullName, company } = await request.json()

    // Create invitation record (you can add an invitations table later)
    // For now, we'll just send an email with a registration link

    // TODO: Implement email sending with your email service
    // For now, return success
    console.log(`[v0] Invitation would be sent to ${email} (${fullName} from ${company})`)

    return NextResponse.json({
      message: "Invitation sent successfully",
      email,
    })
  } catch (error) {
    console.error("[v0] Error sending invitation:", error)
    return NextResponse.json({ message: "Failed to send invitation" }, { status: 500 })
  }
}
