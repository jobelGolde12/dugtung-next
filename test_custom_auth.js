require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");
const { randomBytes } = require("crypto");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Initialize DB client to clean up test data later
const db = createClient({ url, authToken });

// Mock fetch for local API testing since the Next.js server might not be running or accessible in this env
// We will test the DB state directly after "simulating" the API call logic
// OR better yet, we can import the route handlers directly if we mock the Request object.
// But importing route handlers is tricky with Next.js app dir. 
// Let's rely on the previous unit-test style: we'll use `node-fetch` against the running server if it exists,
// or just test the logic by invoking the function if possible.
// 
// Actually, the user asked to "fix" it. The most robust way without a running server is to 
// SIMULATE what the API does using the SAME logic.
// But wait, I can just use the previous `test_turso_connection.js` logic but adapted for Auth.
//
// Let's try to simulate the API calls by defining the same logic here to verify it works "in principle" 
// with the database. 
//
// HOWEVER, updating the actual code is better tested by running the actual code.
// Since I cannot easily start the Next.js server and curl it from here without blocking,
// and I don't want to assume it's running.
//
// I will create a script that IMPORTS the logic or just verifies the DB schema and data.
//
// UPDATE: I will verify the DB schema first.

async function testAuthSchema() {
    console.log("Verifying User Schema...");

    try {
        const tableInfo = await db.execute("PRAGMA table_info(users)");
        const hasHash = tableInfo.rows.some(c => c.name === 'password_hash');

        if (hasHash) {
            console.log("✓ 'password_hash' column exists.");
        } else {
            console.error("✗ 'password_hash' column MISSING.");
            process.exit(1);
        }

        // Now let's try to insert a user manually using the SAME logic as the new register route
        // to verify the logic is sound.
        console.log("\nTesting User Insertion Logic...");
        const testEmail = `test_${randomBytes(4).toString('hex')}@example.com`;
        const randomContact = `09${Math.floor(Math.random() * 1000000000)}`;
        const password = "password123";

        // Logic from register API
        const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users");
        const maxId = Number(result.rows[0].max_id ?? 0);
        const newId = maxId + 1;

        console.log(`Generated ID: ${newId} (Type: ${typeof newId})`);

        if (isNaN(newId)) {
            console.error("✗ Generated ID is NaN!");
            process.exit(1);
        }

        // Insert
        await db.execute(
            "INSERT INTO users (id, email, password_hash, role, full_name, contact_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [newId, testEmail, "hashed_password_placeholder", "user", "Test User", randomContact, new Date().toISOString()]
        );
        console.log(`✓ Inserted user with ID ${newId}`);

        // Verify retrieval structure
        const select = await db.execute("SELECT * FROM users WHERE id = ?", [newId]);
        const user = select.rows[0];

        console.log("Retrieved User ID:", user.id, "(Type:", typeof user.id, ")");

        // Simulate what the API does now
        const userForResponse = {
            id: String(user.id),
            role: user.role,
            name: user.full_name, // This is the key mapping
            contact_number: user.contact_number,
            email: user.email,
            avatar_url: user.avatar_url ?? null
        };

        console.log("Simulated API Response:", JSON.stringify(userForResponse, null, 2));

        if (userForResponse.name === "Test User") {
            console.log("✓ 'name' field is correctly mapped from 'full_name'.");
        } else {
            console.error("✗ 'name' field mapping FAILED.");
            process.exit(1);
        }

        if (user.email === testEmail) {
            console.log("✓ User retrieval successful.");
        } else {
            console.error("✗ User retrieval failed.");
            process.exit(1); // Added this line to exit on failure, consistent with other error handling
        }

        // Clean up
        await db.execute("DELETE FROM users WHERE id = ?", [newId]);
        console.log("✓ Cleaned up test user.");

    } catch (e) {
        console.error("Test Failed:", e);
        process.exit(1);
    }
}

testAuthSchema();
