"use client"

import { createClient } from "@/lib/supabase-client"

// Function to fetch data from the csv_data table with filtering and pagination
export async function fetchCsvData(
  filters: Record<string, string> = {},
  page = 1,
  pageSize = 50,
): Promise<{ data: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }> {
  try {
    const supabase = createClient()

    // Start building the query
    let query = supabase.from("csv_data").select("*", { count: "exact" })

    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      if (value && value !== "all") {
        // Handle date range filter specially
        if (column === "dateRange") {
          try {
            const dateRange = JSON.parse(value)
            if (dateRange.start && dateRange.end) {
              // Filter by DateDebut between start and end dates
              query = query.gte("DateDebut", dateRange.start).lte("DateDebut", dateRange.end)
            }
          } catch (e) {
            console.error("Error parsing date range:", e)
          }
        } else {
          // Regular column filter
          query = query.ilike(column, `%${value}%`)
        }
      }
    })

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    console.log(`Fetching data from ${from} to ${to}`)

    // Execute the query with a timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 30000) // 30 second timeout

    try {
      const { data, error, count } = await query
        .order("id", { ascending: true })
        .range(from, to)
        .abortSignal(abortController.signal)

      clearTimeout(timeoutId)

      if (error) {
        console.error("Error fetching data:", error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} records out of ${count || 0} total`)

      return {
        data: data || [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        throw new Error("Request timed out")
      }
      throw error
    }
  } catch (error) {
    console.error("Error in fetchCsvData:", error)
    throw error
  }
}

// Function to get unique values for a column
export async function getUniqueColumnValues(columnName: string): Promise<string[]> {
  try {
    const supabase = createClient()

    // Get distinct values for the column - limit to 100 to prevent resource exhaustion
    const { data, error } = await supabase.from("csv_data").select(columnName).not(columnName, "is", null).limit(100)

    if (error) {
      console.error(`Error fetching unique values for ${columnName}:`, error)
      throw error
    }

    // Extract unique values
    const uniqueValues = new Set<string>()
    data?.forEach((item) => {
      if (item[columnName]) {
        uniqueValues.add(item[columnName])
      }
    })

    return Array.from(uniqueValues).sort()
  } catch (error) {
    console.error(`Error in getUniqueColumnValues for ${columnName}:`, error)
    return []
  }
}

// Function to get column names
export async function getCsvColumns(): Promise<string[]> {
  try {
    const supabase = createClient()

    // Get a single row to extract column names
    const { data, error } = await supabase.from("csv_data").select("*").limit(1)

    if (error) {
      console.error("Error fetching CSV columns:", error)
      throw error
    }

    if (!data || data.length === 0) {
      // Return default columns if no data is available
      return [
        "Support",
        "Media",
        "DateDebut",
        "heure",
        "Duree",
        "Accroche",
        "MarqueProduit",
        "ProduitPrincipal",
        "MarquePrincipale",
        "Annonceur",
        "Secteur",
        "TypeAchat",
        "Tarif_30s_1pci",
      ]
    }

    // Extract column names from the first row
    return Object.keys(data[0]).filter((col) => !["id", "created_at"].includes(col))
  } catch (error) {
    console.error("Error in getCsvColumns:", error)
    // Return default columns if there's an error
    return [
      "Support",
      "Media",
      "DateDebut",
      "heure",
      "Duree",
      "Accroche",
      "MarqueProduit",
      "ProduitPrincipal",
      "MarquePrincipale",
      "Annonceur",
      "Secteur",
      "TypeAchat",
      "Tarif_30s_1pci",
    ]
  }
}

// Function to import CSV data with throttling
// Update the importCsvChunk function to track duplicates and provide statistics

// Replace the existing importCsvChunk function with this enhanced version:
export async function importCsvChunk(csvChunk: string, fileName: string, isFirstChunk = false) {
  try {
    const supabase = createClient()
    const parsedData = await parseCsv(csvChunk)

    // Initialize counters
    const totalRecords = parsedData.length
    let newRecords = 0
    let duplicateRecords = 0
    let errorCount = 0

    if (parsedData.length === 0) {
      console.log("No data found in this chunk")
      return {
        success: true,
        message: "No data found in this chunk",
        recordCount: 0,
        skippedCount: 0,
        duplicateCount: 0,
        totalProcessed: 0,
      }
    }

    console.log(`Parsed ${parsedData.length} records from chunk`)

    // Use a smaller batch size to prevent resource exhaustion
    const batchSize = 100

    // Process in batches with delay between batches
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize)

      try {
        // Use upsert with onConflict for efficient handling of duplicates
        const { data, error, count } = await supabase.from("csv_data").upsert(batch, {
          onConflict: ["DateDebut", "Support", "heure", "MarquePrincipale", "Duree", "Annonceur"],
          ignoreDuplicates: true,
          count: "exact", // Get count of affected rows
        })

        if (error) {
          console.error(`Error inserting batch:`, error)
          errorCount += batch.length
        } else {
          // Count is the number of rows actually inserted (new records)
          const insertedCount = count || 0
          newRecords += insertedCount

          // Calculate duplicates in this batch
          const duplicatesInBatch = batch.length - insertedCount
          duplicateRecords += duplicatesInBatch

          console.log(`Batch ${i / batchSize + 1}: ${insertedCount} new, ${duplicatesInBatch} duplicates`)
        }

        // Add a small delay between batches to prevent resource exhaustion
        if (i + batchSize < totalRecords) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      } catch (error) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, error)
        errorCount += batch.length
      }
    }

    return {
      success: true,
      message: `Import complete: ${newRecords} new records added, ${duplicateRecords} duplicates skipped`,
      recordCount: newRecords,
      skippedCount: errorCount,
      duplicateCount: duplicateRecords,
      totalProcessed: totalRecords,
    }
  } catch (error) {
    console.error("Error importing CSV chunk:", error)
    throw error
  }
}

// Helper function to parse CSV
async function parseCsv(csvText: string) {
  try {
    // Simple CSV parser
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim())

    if (lines.length === 0) {
      console.log("No lines found in CSV")
      return []
    }

    // Get headers from first line
    const headerLine = lines[0]
    const headers = headerLine.split(",").map((header) => header.trim())

    const data = []

    // Process each line after the header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const values = parseCSVLine(line)

      // Skip if we don't have enough values
      if (values.length < headers.length) {
        continue
      }

      const row: Record<string, string | number> = {}

      // Map each value to its corresponding header
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index]?.trim() || ""
          row[header] = value
        }
      })

      // Only add rows that have at least the key fields
      if (row["Media"] || row["DateDebut"] || row["Annonceur"]) {
        data.push(row)
      }
    }

    return data
  } catch (error) {
    console.error("Error parsing CSV:", error)
    return []
  }
}

// Helper function to handle quoted values in CSV
function parseCSVLine(line: string) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current)
      current = ""
    } else {
      // Add character to current field
      current += char
    }
  }

  // Add the last field
  result.push(current)
  return result
}

// Function to get statistics about the CSV data
export async function getCsvDataStats(): Promise<any> {
  try {
    const supabase = createClient()

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("csv_data")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching CSV data count:", countError)
      throw countError
    }

    // Get unique brands - limit query to prevent resource exhaustion
    const { data: brandsData, error: brandsError } = await supabase
      .from("csv_data")
      .select("MarquePrincipale")
      .not("MarquePrincipale", "is", null)
      .limit(100)

    if (brandsError) {
      console.error("Error fetching unique brands:", brandsError)
      throw brandsError
    }

    const uniqueBrands = new Set(brandsData?.map((item) => item.MarquePrincipale).filter(Boolean))

    // Get unique channels - limit query to prevent resource exhaustion
    const { data: channelsData, error: channelsError } = await supabase
      .from("csv_data")
      .select("Support")
      .not("Support", "is", null)
      .limit(100)

    if (channelsError) {
      console.error("Error fetching unique channels:", channelsError)
      throw channelsError
    }

    const uniqueChannels = new Set(channelsData?.map((item) => item.Support).filter(Boolean))

    // Get unique advertisers - limit query to prevent resource exhaustion
    const { data: advertisersData, error: advertisersError } = await supabase
      .from("csv_data")
      .select("Annonceur")
      .not("Annonceur", "is", null)
      .limit(100)

    if (advertisersError) {
      console.error("Error fetching unique advertisers:", advertisersError)
      throw advertisersError
    }

    const uniqueAdvertisers = new Set(advertisersData?.map((item) => item.Annonceur).filter(Boolean))

    // Get date range
    const { data: dateData, error: dateError } = await supabase
      .from("csv_data")
      .select("DateDebut")
      .not("DateDebut", "is", null)
      .order("DateDebut", { ascending: true })
      .limit(1)

    const { data: dateDataEnd, error: dateErrorEnd } = await supabase
      .from("csv_data")
      .select("DateDebut")
      .not("DateDebut", "is", null)
      .order("DateDebut", { ascending: false })
      .limit(1)

    let startDate = "N/A"
    let endDate = "N/A"

    if (!dateError && dateData && dateData.length > 0) {
      startDate = dateData[0].DateDebut
    }

    if (!dateErrorEnd && dateDataEnd && dateDataEnd.length > 0) {
      endDate = dateDataEnd[0].DateDebut
    }

    // Use a fixed estimate for duration to avoid resource-intensive calculations
    const estimatedTotalDuration = totalCount * 30 // Assuming average duration of 30 seconds

    return {
      totalRecords: totalCount || 0,
      uniqueBrands: uniqueBrands.size,
      uniqueChannels: uniqueChannels.size,
      uniqueAdvertisers: uniqueAdvertisers.size,
      totalDuration: estimatedTotalDuration,
      startDate,
      endDate,
    }
  } catch (error) {
    console.error("Error in getCsvDataStats:", error)
    return {
      totalRecords: 0,
      uniqueBrands: 0,
      uniqueChannels: 0,
      uniqueAdvertisers: 0,
      totalDuration: 0,
      startDate: "N/A",
      endDate: "N/A",
    }
  }
}

// Function to check if data exists
export async function checkDataExists(): Promise<boolean> {
  try {
    const supabase = createClient()

    const { count, error } = await supabase.from("csv_data").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error checking if data exists:", error)
      return false
    }

    return count !== null && count > 0
  } catch (error) {
    console.error("Error in checkDataExists:", error)
    return false
  }
}

// Function to delete all data from the csv_data table
export async function deleteAllCsvData(): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("csv_data").delete().neq("id", 0)

    if (error) {
      console.error("Error deleting all data from csv_data:", error)
      throw error
    }

    console.log("All data deleted from csv_data successfully.")
  } catch (error) {
    console.error("Error in deleteAllCsvData:", error)
    throw error
  }
}

// Function to get brand distribution data
export async function getBrandDistributionData(): Promise<any[]> {
  try {
    const supabase = createClient()

    // Get brand counts
    const { data, error } = await supabase
      .from("csv_data")
      .select("MarquePrincipale")
      .not("MarquePrincipale", "is", null)

    if (error) {
      console.error("Error fetching brand distribution:", error)
      throw error
    }

    // Count brand occurrences
    const brandCounts: Record<string, number> = {}
    data?.forEach((item) => {
      if (item.MarquePrincipale) {
        brandCounts[item.MarquePrincipale] = (brandCounts[item.MarquePrincipale] || 0) + 1
      }
    })

    // Convert to chart data format
    const brandData = Object.entries(brandCounts).map(([brand, count]) => ({
      brand,
      count,
    }))

    return brandData
  } catch (error) {
    console.error("Error in getBrandDistributionData:", error)
    return []
  }
}

// Function to get time series data
export async function getTimeSeriesData(timeColumn: string, brandFilter: string | null = null): Promise<any[]> {
  try {
    const supabase = createClient()

    let query = supabase.from("csv_data").select(timeColumn)

    if (brandFilter) {
      query = query.eq("MarquePrincipale", brandFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching time series data:", error)
      throw error
    }

    const timeCounts: Record<string, number> = {}
    data?.forEach((item) => {
      if (item[timeColumn]) {
        timeCounts[item[timeColumn]] = (timeCounts[item[timeColumn]] || 0) + 1
      }
    })

    const timeSeriesData = Object.entries(timeCounts).map(([time_period, count]) => ({
      time_period,
      count,
    }))

    return timeSeriesData
  } catch (error) {
    console.error("Error in getTimeSeriesData:", error)
    return []
  }
}

// Function to get channel distribution data
export async function getChannelDistributionData(): Promise<any[]> {
  try {
    const supabase = createClient()

    // Get channel counts
    const { data, error } = await supabase.from("csv_data").select("Support").not("Support", "is", null)

    if (error) {
      console.error("Error fetching channel distribution:", error)
      throw error
    }

    // Count channel occurrences
    const channelCounts: Record<string, number> = {}
    data?.forEach((item) => {
      if (item.Support) {
        channelCounts[item.Support] = (channelCounts[item.Support] || 0) + 1
      }
    })

    // Convert to chart data format
    const channelData = Object.entries(channelCounts).map(([channel, count]) => ({
      channel,
      count,
    }))

    return channelData
  } catch (error) {
    console.error("Error in getChannelDistributionData:", error)
    return []
  }
}
