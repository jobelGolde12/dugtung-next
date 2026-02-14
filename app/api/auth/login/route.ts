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
      
      // Log the types of the values being passed to the query
      console.log("LOGIN BY EMAIL - ARG TYPES:", {
        email: { value: email, type: typeof email }
      });
      
      try {
        const result = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

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

        const role = normalizeRole(user.role);
        const token = signToken({ id: String(user.id), role });

        const { password_hash, ...safeUser } = user;
        return jsonSuccess({ token, user: safeUser });
      } catch (error) {
        console.error("SQL ERROR in email login:", error);
        console.log("SQL QUERY: SELECT * FROM users WHERE email = ?", [email]);
        console.log("SQL ARGS:", [email]);
        throw error;
      }
    }

    const { full_name, contact_number } = body;
    
    // Log the types of the values being passed to the query
    console.log("LOGIN BY CONTACT - ARG TYPES:", {
      full_name: { value: full_name, type: typeof full_name },
      contact_number: { value: contact_number, type: typeof contact_number }
    });
    
    let user: Record<string, unknown> | undefined;

    try {
      const existing = await db.execute("SELECT * FROM users WHERE full_name = ? AND contact_number = ?", [full_name, contact_number]);
      user = existing.rows[0] as Record<string, unknown> | undefined;

      if (!user) {
        const id = randomUUID();
        const created_at = new Date().toISOString();
        const role = "donor";

        console.log("INSERT USER - ARG TYPES:", {
          id: { value: id, type: typeof id },
          full_name: { value: full_name, type: typeof full_name },
          contact_number: { value: contact_number, type: typeof contact_number },
          role: { value: role, type: typeof role },
          created_at: { value: created_at, type: typeof created_at }
        });

        try {
          await db.execute("INSERT INTO users (id, full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?, ?)", [id, full_name, contact_number, role, created_at]);
        } catch (error) {
          console.error("SQL ERROR in user creation:", error);
          console.log("SQL QUERY: INSERT INTO users (id, full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?, ?)");
          console.log("SQL ARGS:", [id, full_name, contact_number, role, created_at]);
          throw error;
        }

        try {
          const created = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
          user = created.rows[0] as Record<string, unknown> | undefined;
        } catch (error) {
          console.error("SQL ERROR in user retrieval after creation:", error);
          console.log("SQL QUERY: SELECT * FROM users WHERE id = ?", [id]);
          console.log("SQL ARGS:", [id]);
          throw error;
        }
      }
    } catch (error) {
      console.error("SQL ERROR in contact login:", error);
      console.log("SQL QUERY: SELECT * FROM users WHERE full_name = ? AND contact_number = ?", [full_name, contact_number]);
      console.log("SQL ARGS:", [full_name, contact_number]);
      throw error;
    }

    if (!user) {
      throw new ApiError(500, "Unable to create user");
    }

    const role = normalizeRole(user.role ?? "donor");
    const token = signToken({ id: String(user.id), role });
    const { password_hash, ...safeUser } = user;

    return jsonSuccess({ token, user: safeUser });
  } catch (error) {
    return handleApiError(error);
  }
}
