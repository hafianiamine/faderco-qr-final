import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's dashboards
  const { data: dashboards } = await supabase
    .from("dashboards")
    .select("*")
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })

  // Get default dashboard or create one
  let defaultDashboard = dashboards?.[0]
  if (!defaultDashboard) {
    const { data: newDashboard } = await supabase
      .from("dashboards")
      .insert({
        name: "My Dashboard",
        description: "Default dashboard",
        user_id: data.user.id,
      })
      .select()
      .single()
    defaultDashboard = newDashboard
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <DashboardHeader dashboard={defaultDashboard} />
        <div className="flex-1 p-6">
          <DashboardGrid dashboardId={defaultDashboard?.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}
