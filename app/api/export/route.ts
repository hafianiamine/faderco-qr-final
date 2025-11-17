import { createServerComponentClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get export parameters
    const columnsParam = searchParams.get("columns")
    const format = searchParams.get("format") || "csv"

    if (!columnsParam) {
      return NextResponse.json({ error: "No columns specified" }, { status: 400 })
    }

    const columns = columnsParam.split(",")

    // Get filters
    const filters: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("filter_")) {
        const column = key.replace("filter_", "")
        filters[column] = value
      }
    }

    // Connect to Supabase
    const supabase = createServerComponentClient()

    // Build query
    let query = supabase.from("csv_data").select(columns.join(","))

    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        query = query.ilike(column, `%${value}%`)
      }
    })

    // Get data
    const { data, error } = await query.limit(10000) // Limit to 10,000 records for export

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data found matching the criteria" }, { status: 404 })
    }

    // Format response based on requested format
    if (format === "json") {
      return NextResponse.json(data, {
        headers: {
          "Content-Disposition": `attachment; filename="export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      })
    } else {
      // Convert to CSV
      const csvRows = [
        columns.join(","),
        ...data.map((row) =>
          columns
            .map((col) => {
              const value = row[col]
              // Handle values with commas by wrapping in quotes
              return typeof value === "string" && value.includes(",") ? `"${value}"` : value
            })
            .join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
