
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { hashPassword, signToken, normalizeRole } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).optional(),
  contact_number: z.string().min(1).optional(),
  role: z.enum(["user", "donor"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const { email, password, full_name, contact_number } = body;
    const role = normalizeRole(body.role ?? "user");

    const existing = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (existing.rows.length > 0) {
      throw new ApiError(409, "Email already registered");
    }

    // Generate integer ID instead of UUID to match schema
    const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users");
    const maxId = Number((result.rows[0] as any)?.max_id ?? 0);
    const id = maxId + 1;

    const password_hash = await hashPassword(password);
    const created_at = new Date().toISOString();

    // Insert user with password_hash and integer ID
    await db.execute(
      "INSERT INTO users (id, email, password_hash, role, full_name, contact_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, email, password_hash, role, full_name ?? null, contact_number ?? null, created_at]
    );

    // Sign token with string ID (important for jwt)
    const token = signToken({ id: String(id), role });

    return jsonSuccess({
      access_token: token,
      refresh_token: "", // No refresh token in this implementation
      token_type: "bearer",
      user: {
        id: String(id), // Ensure ID is string for SecureStore
        email,
        role,
        full_name,
        contact_number,
      },
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
