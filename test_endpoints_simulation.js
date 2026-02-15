require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@libsql/client");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function simulateEndpoints() {
    const results = {};

    try {
        // ---------------------------------------------------------
        // TEST 1: /api/auth/login
        // Payload: { "full_name": "Admin User", "contact_number": "09423456789" }
        // ---------------------------------------------------------
        console.log("Testing /api/auth/login...");
        const loginBody = {
            full_name: "Admin User",
            contact_number: "09423456789"
        };

        try {
            // Logic from app/api/auth/login/route.ts (Contact Flow)
            const { full_name, contact_number } = loginBody;
            const fullNameString = String(full_name);
            const contactNumberString = String(contact_number);

            let user;
            const existing = await db.execute("SELECT * FROM users WHERE full_name = ? AND contact_number = ?", [fullNameString, contactNumberString]);
            user = existing.rows[0];

            if (!user) {
                console.log("User not found, creating new user...");
                const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users");
                const maxId = Number((result.rows[0].max_id) ?? 0);
                const id = maxId + 1;
                const now = new Date();
                const created_at = now.toISOString();
                const role = "donor"; // Default role

                await db.execute("INSERT INTO users (id, full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?, ?)",
                    [id, fullNameString, contactNumberString, role, created_at]);

                const created = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
                user = created.rows[0];
            }

            // Normalize Response
            const userForResponse = {
                id: String(user.id),
                role: user.role,
                name: user.full_name,
                contact_number: user.contact_number,
                email: user.email,
                avatar_url: user.avatar_url ?? null
            };

            results['/api/auth/login'] = {
                status: "Success",
                response: {
                    access_token: "mock_token",
                    token_type: "bearer",
                    user: userForResponse
                }
            };

        } catch (error) {
            results['/api/auth/login'] = {
                status: "Failed",
                error: error.message
            };
        }

        // ---------------------------------------------------------
        // TEST 2: /api/donor-registrations
        // Payload: { "full_name": "Juan Dela Cruz", "age": 25, "sex": "Male", "blood_type": "A+", ... }
        // ---------------------------------------------------------
        console.log("Testing /api/donor-registrations...");
        const regBody = {
            "full_name": "Juan Dela Cruz",
            "age": 25,
            "sex": "Male",
            "blood_type": "A+",
            "contact_number": "09123456789",
            "municipality": "Manila",
            "availability_status": "Available"
        };

        try {
            // Logic from app/api/donor-registrations/route.ts
            const data = { ...regBody };

            // 1. Data Cleaning/Transformation
            if (data.availability_status) {
                data.availability = data.availability_status;
                delete data.availability_status;
            }

            if (data.sex) {
                delete data.sex; // API explicitly removes this
            }

            if (data.age) {
                const parsedAge = parseInt(String(data.age), 10);
                if (isNaN(parsedAge)) throw new Error("Invalid age value");
                data.age = parsedAge;
            }

            // 2. ID Generation
            if (!data.id) {
                const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM donor_registrations");
                const maxId = Number((result.rows[0].max_id) ?? 0);
                data.id = maxId + 1;
            }

            if (!data.status) {
                data.status = "pending";
            }

            // 3. Insert
            // Dynamic insert logic simulation
            const keys = Object.keys(data); // [full_name, age, blood_type, contact_number, ...]
            // Note: assertSafeIdentifier check skipped for simulation, assuming keys are safe
            const placeholders = keys.map(() => "?").join(", ");
            const values = keys.map((key) => data[key]);

            // We also need to add created_at if not present, route might rely on default or explicit
            // Route.ts doesn't explicitly add created_at in the simulation I saw? 
            // Ah, looking at Step 192 (file content):
            // It DOES NOT explicitly add created_at in the INSERT logic shown in lines 102-108.
            // It relies on `Object.keys(data)`.
            // However, the DB schema (Step 232) shows `created_at` has a default value `strftime(...)`.
            // So omitting it is fine.

            const sql = `INSERT INTO donor_registrations (${keys.join(", ")}) VALUES (${placeholders})`;
            await db.execute(sql, values);

            // 4. Fetch and Return
            const createdId = Number(data.id);
            const created = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [createdId]);

            if (created.rows.length === 0) throw new Error("Failed to create donor registration");

            const createdUser = created.rows[0];

            // Normalize Response (as updated in Step 204)
            const userForResponse = {
                id: String(createdUser.id),
                name: createdUser.full_name,
                contact_number: createdUser.contact_number,
                municipality: createdUser.municipality,
                blood_type: createdUser.blood_type,
                age: createdUser.age,
                status: createdUser.status,
                availability: createdUser.availability,
                created_at: createdUser.created_at
            };

            results['/api/donor-registrations'] = {
                status: "Success",
                response: userForResponse
            };

            // Clean up donor registration for repeated testing
            await db.execute("DELETE FROM donor_registrations WHERE id = ?", [createdId]);

        } catch (error) {
            results['/api/donor-registrations'] = {
                status: "Failed",
                error: error.message,
                stack: error.stack
            };
        }

    } catch (e) {
        console.error("Global Error:", e);
    }

    console.log(JSON.stringify(results, null, 2));
}

simulateEndpoints();
