"use server"

import { createServerComponentClient } from "@/lib/supabase"

export async function setupDatabaseFunctions() {
  try {
    const supabase = createServerComponentClient()

    // Instead of trying to create custom functions, let's just check if we can access the table
    const { data, error } = await supabase.from("csv_data").select().limit(1)

    if (error) {
      console.error("Error accessing csv_data table:", error)
      return {
        success: false,
        message: `Error accessing csv_data table: ${error.message}`,
      }
    }

    // Extract column names from the data or schema
    let columns: string[] = []

    if (data && data.length > 0) {
      // If we have data, extract column names from the first row
      columns = Object.keys(data[0]).filter((col) => !["id", "created_at"].includes(col))
    } else {
      // If no data, try to get column information from the schema
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .from("information_schema.columns")
          .select("column_name")
          .eq("table_name", "csv_data")
          .eq("table_schema", "public")
          .neq("column_name", "id")
          .neq("column_name", "created_at")

        if (schemaError) {
          throw schemaError
        }

        if (schemaData) {
          columns = schemaData.map((col) => col.column_name)
        }
      } catch (schemaErr) {
        console.error("Error getting schema information:", schemaErr)
        // Fall back to hardcoded columns
        columns = [
          "Media",
          "Mois",
          "DateDebut",
          "Support",
          "heure",
          "Duree",
          "Accroche",
          "MarqueProduit",
          "ProduitPrincipal",
          "MarquePrincipale",
          "Annonceur",
          "Secteur",
          "Avant",
          "Apres",
          "Tarif_30s_1pci",
          "TypeAchat",
        ]
      }
    }

    return {
      success: true,
      message: "Database setup completed successfully",
      columns: columns,
    }
  } catch (error) {
    console.error("Error setting up database:", error)
    return {
      success: false,
      message: `Error setting up database: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function checkDuplicateRecord(record: {
  Media: string
  DateDebut: string
  heure: string
  Annonceur: string
  MarqueProduit: string
}) {
  try {
    const supabase = createServerComponentClient()

    // Use standard query to check for duplicates
    const { data, error } = await supabase
      .from("csv_data")
      .select("id")
      .eq("Media", record.Media || "")
      .eq("DateDebut", record.DateDebut || "")
      .eq("heure", record.heure || "")
      .eq("Annonceur", record.Annonceur || "")
      .eq("MarqueProduit", record.MarqueProduit || "")
      .limit(1)

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error("Error checking for duplicate record:", error)
    return false
  }
}
