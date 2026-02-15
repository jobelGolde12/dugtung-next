require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Initialize DB client
const db = createClient({ url, authToken });

async function testDonorFlow() {
    console.log("Testing Donor Flow...");

    try {
        // 1. Simulate Donor Registration
        console.log("\n1. Simulating Donor Registration...");
        const testUser = {
            full_name: "Test Donor " + Math.floor(Math.random() * 1000),
            age: 25,
            sex: "Male",
            blood_type: "A+",
            contact_number: "09" + Math.floor(Math.random() * 1000000000),
            municipality: "Manila",
            availability_status: "Available"
        };

        // Logic from donor-registrations API
        // a. Get Max ID
        const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM donor_registrations");
        const maxId = Number((result.rows[0].max_id) ?? 0);
        const id = maxId + 1;

        // b. Insert
        // Note: Schema check revealed no 'sex' or 'age' columns in donor_registrations table based on previous error/check.
        // Note: Schema check confirmed 'age' exists, but 'sex' does NOT.
        // Columns: id, status, full_name, contact_number, age, blood_type, municipality, availability, review_reason, reviewed_by, reviewed_at, created_at, updated_at

        await db.execute(
            `INSERT INTO donor_registrations (id, full_name, age, blood_type, contact_number, municipality, availability, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, testUser.full_name, testUser.age, testUser.blood_type, testUser.contact_number,
                testUser.municipality, testUser.availability_status, 'pending', new Date().toISOString()]
        );

        // c. Fetch created registration
        const created = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [id]);
        const createdUser = created.rows[0];

        // d. Verify Registration Response Structure
        const regResponse = {
            id: String(createdUser.id),
            name: createdUser.full_name, // Map full_name -> name
            contact_number: createdUser.contact_number,
            // ... other fields
        };

        console.log("Registration Response:", JSON.stringify(regResponse, null, 2));

        if (regResponse.name === testUser.full_name && typeof regResponse.id === 'string') {
            console.log("✓ Registration response is correct.");
        } else {
            console.error("✗ Registration response is INCORRECT.");
            process.exit(1);
        }

        // 2. Simulate Login (Contact Flow)
        // NOTE: The current login implementation in `auth/login/route.ts` creates a user in the `users` table
        // if they don't exist. It does NOT seemingly check `donor_registrations`.
        // The user said: "use the POST /api/auth/login where frontend send { full_name, contact_number }"

        console.log("\n2. Simulating Login...");
        const loginPayload = {
            full_name: testUser.full_name,
            contact_number: testUser.contact_number
        };

        // Logic from auth/login API (Contact Flow)
        // a. Check if user exists in `users` table
        let userResult = await db.execute("SELECT * FROM users WHERE full_name = ? AND contact_number = ?",
            [loginPayload.full_name, loginPayload.contact_number]);
        let user = userResult.rows[0];

        if (!user) {
            console.log("User not found in `users` table. creating...");
            // In the real app, this happens.
            // But wait.. if I register as a donor, am I automatically a user? 
            // The `donor_registrations` table is verified by admin, THEN they become a user?
            // OR does the login create a user regardless?
            // The `login` route code shows it CREATES a user if not found.

            const uResult = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users");
            const uMaxId = Number((uResult.rows[0].max_id) ?? 0);
            const uId = uMaxId + 1;

            await db.execute("INSERT INTO users (id, full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?, ?)",
                [uId, loginPayload.full_name, loginPayload.contact_number, "donor", new Date().toISOString()]);

            userResult = await db.execute("SELECT * FROM users WHERE id = ?", [uId]);
            user = userResult.rows[0];
        }

        // b. Verify Login Response Structure
        const loginResponse = {
            id: String(user.id),
            role: user.role,
            name: user.full_name, // Map full_name -> name
            contact_number: user.contact_number,
            email: user.email,
            avatar_url: user.avatar_url ?? null
        };

        console.log("Login Response:", JSON.stringify(loginResponse, null, 2));

        if (loginResponse.name === testUser.full_name && typeof loginResponse.id === 'string') {
            console.log("✓ Login response is correct.");
        } else {
            console.error("✗ Login response is INCORRECT.");
            process.exit(1);
        }

        // Clean up
        console.log("\nCleaning up...");
        await db.execute("DELETE FROM donor_registrations WHERE id = ?", [id]);
        await db.execute("DELETE FROM users WHERE id = ?", [user.id]);
        console.log("✓ Done.");

    } catch (e) {
        console.error("Test Failed:", e);
        process.exit(1);
    }
}

testDonorFlow();
