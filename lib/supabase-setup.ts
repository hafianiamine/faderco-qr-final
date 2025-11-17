"use server"

import { createServerComponentClient } from "./supabase"

export async function setupDatabase() {
  const supabase = createServerComponentClient()

  try {
    console.log("Creating tables in Supabase...")

    // Use raw SQL to create the table - this is more reliable
    const { error } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS data_records (
        id SERIAL PRIMARY KEY,
        title TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (error) {
      console.error("Error creating table:", error)
      throw error
    }

    // Verify the table was created by querying it
    const { data, error: verifyError } = await supabase.from("data_records").select("id").limit(1)

    if (verifyError) {
      console.error("Table verification failed:", verifyError)
      throw verifyError
    }

    console.log("Table verified successfully")
    return { success: true, message: "Database setup complete" }
  } catch (error) {
    console.error("Database setup failed:", error)
    return {
      success: false,
      message: `Database setup failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function checkDatabaseStatus() {
  const supabase = createServerComponentClient()

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from("data_records")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      if (error.code === "42P01") {
        // PostgreSQL error for undefined_table
        return { exists: false, message: "Table does not exist" }
      }
      throw error
    }

    return {
      exists: true,
      recordCount: data?.length || 0,
      recentRecords: data || [],
    }
  } catch (error) {
    console.error("Error checking database status:", error)
    return {
      exists: false,
      message: `Error checking database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function insertTestRecord() {
  const supabase = createServerComponentClient()

  try {
    const testData = {
      title: "Test Record",
      data: [{ test: "data", value: 123 }],
    }

    const { data, error } = await supabase.from("data_records").insert(testData).select()

    if (error) {
      throw error
    }

    return { success: true, message: "Test record inserted successfully" }
  } catch (error) {
    console.error("Error inserting test record:", error)
    return {
      success: false,
      message: `Error inserting test record: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
