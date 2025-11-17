import MainDashboard from "@/components/dashboard/main-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard & Analytics</h1>
        <p className="text-muted-foreground mt-2">Comprehensive insights into your TV advertising campaigns</p>
      </div>

      <MainDashboard />
    </div>
  )
}
