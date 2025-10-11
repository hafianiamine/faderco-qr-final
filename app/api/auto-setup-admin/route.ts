import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const adminEmail = "admin@fadercoqr.com"
    const adminPassword = "Admin@1234"

    // Step 1: Delete existing admin user if exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAdmin = existingUsers?.users.find((u) => u.email === adminEmail)

    if (existingAdmin) {
      await supabase.from("profiles").delete().eq("id", existingAdmin.id)
      await supabase.auth.admin.deleteUser(existingAdmin.id)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Step 2: Create new admin user with email confirmed
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Admin",
        phone: "+213675398778",
        company: "FADERCO",
        department: "Administration",
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "admin",
        status: "approved",
      })
      .eq("id", newUser.user!.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { data: verifyProfile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", newUser.user!.id)
      .single()

    console.log("Profile verification:", verifyProfile)

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully!",
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
      profile: verifyProfile,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
