require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

const testConnection = async () => {
  // Using credentials from .env.local
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local");
    process.exit(1);
  }

  const db = createClient({
    url: url,
    authToken: authToken,
  });

  try {
    console.log("Attempting to connect to Turso database...");
    
    // Test basic connection
    const result = await db.execute("SELECT 1 as test");
    console.log("✓ Successfully connected to Turso database!");
    console.log("Query result:", result.rows);
    
    // Test users table
    console.log("\nChecking users table...");
    const usersResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (usersResult.rows.length > 0) {
      console.log("✓ Users table exists");
      
      // Get table schema
      const schemaResult = await db.execute("PRAGMA table_info(users)");
      console.log("Users table columns:");
      schemaResult.rows.forEach((row) => {
        console.log(`  - ${row.name} (${row.type})`);
      });
      
      // Count users
      const countResult = await db.execute("SELECT COUNT(*) as count FROM users");
      console.log(`Total users in database: ${countResult.rows[0].count}`);
    } else {
      console.log("✗ Users table does not exist!");
    }
    
    console.log("\n✓ All database tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Failed to connect to Turso database:", error.message);
    if (error.message.includes('unauthorized')) {
      console.error("\nPossible causes:");
      console.error("  - Invalid auth token");
      console.error("  - Token has expired");
      console.error("  - Database URL is incorrect");
    }
    process.exit(1);
  }
};

testConnection();
