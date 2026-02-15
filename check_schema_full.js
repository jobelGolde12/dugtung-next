require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function checkSchema() {
    try {
        const result = await db.execute("PRAGMA table_info(donor_registrations)");
        console.log("Full Schema:");
        result.rows.forEach(col => console.log(col));
    } catch (e) {
        console.error(e);
    }
}

checkSchema();
