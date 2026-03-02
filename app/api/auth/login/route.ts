import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { comparePassword, normalizeRole, signToken } from "@/lib/auth";

const emailLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const contactLoginSchema = z.object({
  full_name: z.string().min(1),
  contact_number: z.string().min(1),
});

const loginSchema = z.union([emailLoginSchema, contactLoginSchema]);

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());

    if ("email" in body) {
      const { email, password } = body;

      // Ensure email is a string to prevent type mismatch
      const emailString = String(email);

      // Log the types of the values being passed to the query
      console.log("LOGIN BY EMAIL - ARG TYPES:", {
        email: { value: emailString, type: typeof emailString }
      });

      try {
        const result = await db.execute("SELECT * FROM users WHERE email = ?", [emailString]);

        if (result.rows.length === 0) {
          throw new ApiError(401, "Invalid credentials");
        }

        const user = result.rows[0] as Record<string, unknown>;
        const hash = user.password_hash as string | undefined;
        if (!hash) {
          throw new ApiError(401, "Invalid credentials");
        }

        const match = await comparePassword(password, hash);
        if (!match) {
          throw new ApiError(401, "Invalid credentials");
        }

        const role = normalizeRole(user.role ?? "donor");
        const token = signToken({ id: String(user.id), role });

        const { password_hash, ...safeUser } = user;

        // Ensure ID is a string for the response (fix for SecureStore error)
        // Map full_name -> name to match frontend expectations
        const userForResponse = {
          id: String(safeUser.id),
          role: safeUser.role,
          name: safeUser.full_name,
          contact_number: safeUser.contact_number,
          email: safeUser.email,
          avatar_url: safeUser.avatar_url ?? null
        };

        return jsonSuccess({
          access_token: token,
          refresh_token: "", // No refresh token in this implementation
          token_type: "bearer",
          user: userForResponse
        });
      } catch (error) {
        console.error("SQL ERROR in email login:", error);
        console.log("SQL QUERY: SELECT * FROM users WHERE email = ?", [emailString]);
        console.log("SQL ARGS:", [emailString]);
        throw error;
      }
    }

    const { full_name, contact_number } = body;

    const fullNameString = String(full_name);
    const contactNumberString = String(contact_number).replace(/\D/g, '');

    let user: Record<string, unknown> | undefined;

    try {
      const existing = await db.execute("SELECT * FROM users WHERE full_name = ? AND contact_number = ?", [fullNameString, contactNumberString]);
      user = existing.rows[0] as Record<string, unknown> | undefined;

      if (!user) {
        const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM users");
        const maxId = Number((result.rows[0] as any)?.max_id ?? 0);
        const id = maxId + 1;
        const created_at = new Date().toISOString();
        const role = "donor";

        await db.execute("INSERT INTO users (id, full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?, ?)", [id, fullNameString, contactNumberString, role, created_at]);

        const created = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
        user = created.rows[0] as Record<string, unknown> | undefined;
      }
    } catch (error) {
      console.error("SQL ERROR in contact login:", error);
      throw error;
    }

    if (!user) {
      throw new ApiError(500, "Unable to create user");
    }

    const role = normalizeRole(user.role ?? "donor");
    const token = signToken({ id: String(user.id), role });
    const { password_hash: _password_hash, ...safeUser } = user;

    // Ensure ID is a string for the response (fix for SecureStore error)
    // Map full_name -> name to match frontend expectations
    const userForResponse = {
      id: String(safeUser.id),
      role: safeUser.role,
      name: safeUser.full_name,
      contact_number: safeUser.contact_number,
      email: safeUser.email,
      avatar_url: safeUser.avatar_url ?? null
    };

    return jsonSuccess({
      access_token: token,
      refresh_token: "", // No refresh token in this implementation
      token_type: "bearer",
      user: userForResponse
    });
  } catch (error) {
    return handleApiError(error);
  }
}

