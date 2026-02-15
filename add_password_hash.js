require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Missing TURSO env vars");
    process.exit(1);
}

const db = createClient({ url, authToken });

async function addPasswordHash() {
    try {
        console.log("Checking if password_hash column exists...");

        // Check if column exists
        const tableInfo = await db.execute("PRAGMA table_info(users)");
        const hasColumn = tableInfo.rows.some(col => col.name === 'password_hash');

        if (hasColumn) {
            console.log("Column 'password_hash' already exists.");
        } else {
            console.log("Adding 'password_hash' column...");
            await db.execute("ALTER TABLE users ADD COLUMN password_hash TEXT");
            console.log("Successfully added 'password_hash' column.");
        }

    } catch (error) {
        console.error("Error updating schema:", error);
    }
}

addPasswordHash();
