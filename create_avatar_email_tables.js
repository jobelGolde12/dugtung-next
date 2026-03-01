const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

async function createAvatarEmailTables() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log("Creating user_avatars table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_avatars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        avatar_data TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("✅ user_avatars table created");

    console.log("Creating user_emails table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        is_verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("✅ user_emails table created");

    console.log("Creating donor_avatars table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS donor_avatars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER NOT NULL,
        avatar_data TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT,
        FOREIGN KEY (donor_id) REFERENCES donors(id)
      )
    `);
    console.log("✅ donor_avatars table created");

    console.log("Creating donor_emails table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS donor_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        donor_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        is_verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT,
        FOREIGN KEY (donor_id) REFERENCES donors(id)
      )
    `);
    console.log("✅ donor_emails table created");

    console.log("Creating donor_registration_avatars table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS donor_registration_avatars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_id INTEGER NOT NULL,
        avatar_data TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (registration_id) REFERENCES donor_registrations(id)
      )
    `);
    console.log("✅ donor_registration_avatars table created");

    console.log("Creating donor_registration_emails table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS donor_registration_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (registration_id) REFERENCES donor_registrations(id)
      )
    `);
    console.log("✅ donor_registration_emails table created");

    console.log("\n✅ All tables created successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

createAvatarEmailTables();
