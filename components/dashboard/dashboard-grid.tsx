"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, BarChart3, LineChart, Activity, TrendingUp, Users, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardGridProps {
  dashboardId: string
}

interface Widget {
  id: string
  title: string
  widget_type: string
  config: any
  position_x: number
  position_y: number
  width: number
  height: number
}

const sampleWidgets = [
  {
    id: "1",
    title: "Total Revenue",
    widget_type: "metric",
    config: { value: "$45,231", change: "+20.1%", trend: "up" },
    position_x: 0,
    position_y: 0,
    width: 3,
    height: 2,
  },
  {
    id: "2",
    title: "Active Users",
    widget_type: "metric",
    config: { value: "2,350", change: "+180.1%", trend: "up" },
    position_x: 3,
    position_y: 0,
    width: 3,
    height: 2,
  },
  {
    id: "3",
    title: "Sales",
    widget_type: "metric",
    config: { value: "+12,234", change: "+19%", trend: "up" },
    position_x: 6,
    position_y: 0,
    width: 3,
    height: 2,
  },
  {
    id: "4",
    title: "Conversion Rate",
    widget_type: "metric",
    config: { value: "3.2%", change: "+2.5%", trend: "up" },
    position_x: 9,
    position_y: 0,
    width: 3,
    height: 2,
  },
  {
    id: "5",
    title: "Revenue Overview",
    widget_type: "chart",
    config: { type: "line", data: [] },
    position_x: 0,
    position_y: 2,
    width: 8,
    height: 4,
  },
  {
    id: "6",
    title: "Top Products",
    widget_type: "table",
    config: { data: [] },
    position_x: 8,
    position_y: 2,
    width: 4,
    height: 4,
  },
]

export function DashboardGrid({ dashboardId }: DashboardGridProps) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dashboardId) {
      loadWidgets()
    }
  }, [dashboardId])

  const loadWidgets = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("dashboard_widgets")
      .select("*")
      .eq("dashboard_id", dashboardId)
      .order("position_y", { ascending: true })

    if (data && data.length > 0) {
      setWidgets(data)
    } else {
      // Use sample widgets for demo
      setWidgets(sampleWidgets)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-4 h-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="col-span-4 h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Widget Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Widgets</h2>
          <p className="text-sm text-muted-foreground">Customize your dashboard with widgets</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={cn("widget-container", `col-span-${widget.width}`, `row-span-${widget.height}`)}
            style={{
              gridColumn: `span ${widget.width}`,
            }}
          >
            <WidgetCard widget={widget} />
          </div>
        ))}
      </div>
    </div>
  )
}

function WidgetCard({ widget }: { widget: Widget }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "metric":
        return <TrendingUp className="h-4 w-4" />
      case "chart":
        return <BarChart3 className="h-4 w-4" />
      case "table":
        return <Activity className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getMetricIcon = (title: string) => {
    if (title.includes("Revenue")) return <DollarSign className="h-4 w-4" />
    if (title.includes("Users")) return <Users className="h-4 w-4" />
    if (title.includes("Sales")) return <TrendingUp className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {widget.widget_type === "metric" ? getMetricIcon(widget.title) : getIcon(widget.widget_type)}
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {widget.widget_type === "metric" && (
          <div>
            <div className="text-2xl font-bold">{widget.config.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={cn(
                  "inline-flex items-center",
                  widget.config.trend === "up" ? "text-green-500" : "text-red-500",
                )}
              >
                {widget.config.change} from last month
              </span>
            </p>
          </div>
        )}
        {widget.widget_type === "chart" && (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <LineChart className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Chart visualization</p>
            </div>
          </div>
        )}
        {widget.widget_type === "table" && (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Data table</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
