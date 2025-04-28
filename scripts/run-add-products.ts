import { createServerClient } from "@/lib/supabase"
import * as fs from "fs"
import * as path from "path"

async function main() {
  try {
    console.log("Starting to add new products...")
    
    // Initialize Supabase client
    const supabase = createServerClient()
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, "add-new-products.sql")
    const sqlContent = fs.readFileSync(sqlPath, "utf-8")
    
    // Execute the SQL statements
    const { error } = await supabase.from("products").insert(sqlContent)
    
    if (error) {
      throw error
    }
    
    console.log("Successfully added new products to the database!")
  } catch (error) {
    console.error("Error adding products:", error)
    process.exit(1)
  }
}

main() 