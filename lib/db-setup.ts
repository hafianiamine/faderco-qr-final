import { createClient } from "@/lib/supabase-client"

// Initialize the database
export async function initializeDatabase(): Promise<void> {
  try {
    const supabase = createClient()

    // Check if the csv_data table exists
    const { data: tableExists, error: tableError } = await supabase.from("csv_data").select("id").limit(1).single()

    if (tableError && tableError.code !== "PGRST116") {
      // If error is not "no rows returned", then there's a real error
      console.error("Error checking csv_data table:", tableError)
      throw new Error(`Failed to check csv_data table: ${tableError.message}`)
    }

    // Table exists, no need to create it
    console.log("Database initialized successfully")
    return
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Check if data exists in the csv_data table
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

// Delete all data from the csv_data table
export async function deleteAllData(): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("csv_data").delete().neq("id", 0)

    if (error) {
      console.error("Error deleting data:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "All data deleted successfully" }
  } catch (error) {
    console.error("Error in deleteAllData:", error)
    return { success: false, message: error instanceof Error ? error.message : String(error) }
  }
}
