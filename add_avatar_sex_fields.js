const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

async function addFields() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log("Adding avatar_url and sex fields to donor_registrations...");
    
    // Check if columns exist first
    const tableInfo = await db.execute("PRAGMA table_info(donor_registrations)");
    const columns = tableInfo.rows.map(row => row.name);
    
    if (!columns.includes('avatar_url')) {
      await db.execute("ALTER TABLE donor_registrations ADD COLUMN avatar_url TEXT");
      console.log("✅ Added avatar_url to donor_registrations");
    } else {
      console.log("ℹ️  avatar_url already exists in donor_registrations");
    }
    
    if (!columns.includes('sex')) {
      await db.execute("ALTER TABLE donor_registrations ADD COLUMN sex TEXT");
      console.log("✅ Added sex to donor_registrations");
    } else {
      console.log("ℹ️  sex already exists in donor_registrations");
    }

    console.log("\nAdding avatar_url and sex fields to donors...");
    
    const donorsTableInfo = await db.execute("PRAGMA table_info(donors)");
    const donorsColumns = donorsTableInfo.rows.map(row => row.name);
    
    if (!donorsColumns.includes('avatar_url')) {
      await db.execute("ALTER TABLE donors ADD COLUMN avatar_url TEXT");
      console.log("✅ Added avatar_url to donors");
    } else {
      console.log("ℹ️  avatar_url already exists in donors");
    }
    
    if (!donorsColumns.includes('email')) {
      await db.execute("ALTER TABLE donors ADD COLUMN email TEXT");
      console.log("✅ Added email to donors");
    } else {
      console.log("ℹ️  email already exists in donors");
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

addFields();
