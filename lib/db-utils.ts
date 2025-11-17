"use client"

import { createClient } from "@/lib/supabase-client"

// Get all columns from the csv_data table
export async function getTableColumns(): Promise<string[]> {
  try {
    const supabase = createClient()

    // Get a single row to extract column names
    const { data, error } = await supabase.from("csv_data").select("*").limit(1)

    if (error) {
      console.error("Error fetching table columns:", error)
      throw error
    }

    if (!data || data.length === 0) {
      // If no data, try to get columns from RPC
      const { data: columnsData, error: columnsError } = await supabase.rpc("get_table_columns", {
        table_name: "csv_data",
      })

      if (columnsError) {
        console.error("Error fetching columns via RPC:", columnsError)
        // Fallback to hardcoded columns based on schema
        return [
          "id",
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
          "created_at",
        ]
      }

      return columnsData || []
    }

    // Extract column names from the first row
    return Object.keys(data[0])
  } catch (error) {
    console.error("Error in getTableColumns:", error)
    // Fallback to hardcoded columns based on schema
    return [
      "id",
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
      "created_at",
    ]
  }
}

// Get table schema information
export async function getTableSchema(tableName = "csv_data"): Promise<any> {
  try {
    const supabase = createClient()

    // Use RPC to get schema info
    const { data, error } = await supabase.rpc("get_table_schema", {
      table_name: tableName,
    })

    if (error) {
      console.error("Error fetching table schema:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getTableSchema:", error)
    return null
  }
}

// Create RPC function for getting table columns (run this once in SQL editor)
export const createRpcFunctions = `
-- Function to get table columns
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS text[] AS $$
DECLARE
  columns text[];
BEGIN
  SELECT array_agg(column_name::text) INTO columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = $1;
  
  RETURN columns;
END;
$$ LANGUAGE plpgsql;

-- Function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS json AS $$
DECLARE
  schema_info json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
  ) INTO schema_info
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = $1;
  
  RETURN schema_info;
END;
$$ LANGUAGE plpgsql;
`
