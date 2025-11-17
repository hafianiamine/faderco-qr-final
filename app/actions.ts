"use server"

import { createServerComponentClient } from "@/lib/supabase"
import { parseCsv, storeDataInSupabase } from "@/lib/data-utils"

// Fetch data from Supabase
export async function fetchDataFromSupabase() {
  try {
    const supabase = createServerComponentClient()

    // Try to get data from the data_records table
    const { data, error } = await supabase
      .from("data_records")
      .select("data")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching data from Supabase:", error)
      // If there's an error, try to get data from the URL
      return await fetchAndStoreInitialData()
    }

    // If we have data, return it
    if (data && data.length > 0) {
      return { data: data[0].data }
    }

    // If no data, fetch from URL and store
    return await fetchAndStoreInitialData()
  } catch (error) {
    console.error("Error in fetchDataFromSupabase:", error)
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

    if (parsedData.length === 0) {
      throw new Error("No data found in the CSV")
    }

    // Store the data in Supabase
    try {
      await storeDataInSupabase(parsedData, "Initial Import")
    } catch (storeError) {
      console.error("Failed to store data, but returning parsed data:", storeError)
      // Even if storing fails, return the parsed data
    }

    return { data: parsedData }
  } catch (error) {
    console.error("Error fetching initial data:", error)
    throw error
  }
}

// Import data from CSV text
export async function importCsvData(csvText: string, title: string) {
  try {
    const parsedData = await parseCsv(csvText) // Use await here since parseCsv is now async

    if (parsedData.length === 0) {
      throw new Error("No data found in the CSV")
    }

    try {
      await storeDataInSupabase(parsedData, title)
    } catch (storeError) {
      console.error("Failed to store imported data:", storeError)
      // Continue anyway to return the parsed data
    }

    return { success: true, data: parsedData }
  } catch (error) {
    console.error("Error importing CSV data:", error)
    throw error
  }
}

// Import data from URL
export async function importCsvFromUrl(url: string, title: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    return await importCsvData(text, title)
  } catch (error) {
    console.error("Error importing CSV from URL:", error)
    throw error
  }
}

// Delete all data
export async function deleteAllData() {
  try {
    const supabase = createServerComponentClient()

    // Delete all records from the data_records table
    const { error } = await supabase.from("data_records").delete().neq("id", 0) // This will match all records

    if (error) {
      console.error("Error deleting data:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteAllData:", error)
    throw error
  }
}
