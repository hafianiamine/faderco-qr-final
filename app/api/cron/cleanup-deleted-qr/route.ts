import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Find all pending deletions that are past their scheduled time
    const now = new Date().toISOString()
    const { data: pendingDeletions, error: fetchError } = await supabase
      .from("pending_deletions")
      .select("*")
      .lte("scheduled_deletion_at", now)

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch pending deletions" }, { status: 500 })
    }

    if (!pendingDeletions || pendingDeletions.length === 0) {
      return NextResponse.json({ message: "No QR codes to delete", deleted: 0 })
    }

    // Delete the QR codes
    const qrCodeIds = pendingDeletions.map((pd) => pd.qr_code_id)

    const { error: deleteError } = await supabase.from("qr_codes").delete().in("id", qrCodeIds)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete QR codes" }, { status: 500 })
    }

    // The pending_deletions entries will be automatically deleted due to CASCADE

    return NextResponse.json({
      message: "QR codes deleted successfully",
      deleted: qrCodeIds.length,
      qrCodeIds,
    })
  } catch (error) {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
