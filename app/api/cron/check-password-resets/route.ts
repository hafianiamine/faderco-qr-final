import { checkAndForcePasswordResets } from "@/app/actions/security-actions"
import { NextResponse } from "next/server"

// This endpoint should be called by a cron job daily
// Configure in Vercel: https://vercel.com/docs/cron-jobs
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await checkAndForcePasswordResets()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
