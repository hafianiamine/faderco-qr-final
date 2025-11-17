"use server"

import { createServerComponentClient } from "./supabase"

// Function to fetch CSV data from URL and store in Supabase
export async function fetchCsvData() {
  try {
    // First check if we have data in Supabase
    const supabase = createServerComponentClient()

    const { data: existingData, error: fetchError } = await supabase
      .from("data_records")
      .select("data")
      .order("created_at", { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error("Error fetching data from Supabase:", fetchError)
      // If there's an error fetching, try to get data from the URL
      return await fetchAndStoreInitialData()
    }

    // If we have data in Supabase, return it
    if (existingData && existingData.length > 0) {
      return { data: existingData[0].data }
    }

    // Otherwise fetch from URL and store in Supabase
    return await fetchAndStoreInitialData()
  } catch (error) {
    console.error("Error in fetchCsvData:", error)
    throw error
  }
}

// Fetch data from URL and store in Supabase
async function fetchAndStoreInitialData() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Book1-pya4UiHgETmrhSOczlZtucCbh2brKj.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    const parsedData = await parseCsv(text) // Use await here since parseCsv is now async

    // Store the data in Supabase
    if (parsedData.length > 0) {
      await storeDataInSupabase(parsedData, "Initial Import")
    }

    return { data: parsedData }
  } catch (error) {
    console.error("Error fetching initial data:", error)
    throw error
  }
}

// Function to store data in Supabase
export async function storeDataInSupabase(data: any[], title: string) {
  try {
    const supabase = createServerComponentClient()

    // Store the data - the table already exists
    const { error } = await supabase.from("data_records").insert({
      title: title,
      data: data,
    })

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error storing data in Supabase:", error)
    throw error
  }
}

// Function to get all records from Supabase
export async function getAllRecordsFromSupabase() {
  try {
    const supabase = createServerComponentClient()

    const { data, error } = await supabase
      .from("data_records")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error getting records from Supabase:", error)
    throw error
  }
}

// Helper function to parse CSV - making it async to comply with Server Actions requirements
export async function parseCsv(csvText: string) {
  // Simple CSV parser
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length === 0) {
    return []
  }

  const headers = lines[0].split(",").map((header) => header.trim())

  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length === headers.length) {
      const row: Record<string, string | number> = {}

      headers.forEach((header, index) => {
        const value = values[index].trim()
        // Try to convert to number if possible
        const numValue = Number(value)
        row[header] = !isNaN(numValue) && value !== "" ? numValue : value
      })

      data.push(row)
    }
  }

  return data
}

// Helper function to handle quoted values in CSV
function parseCSVLine(line: string) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
