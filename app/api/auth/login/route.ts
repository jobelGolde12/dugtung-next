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
      const result = await db.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email],
      });

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
    }

    const { full_name, contact_number } = body;
    const existing = await db.execute({
      sql: "SELECT * FROM users WHERE full_name = ? AND contact_number = ?",
      args: [full_name, contact_number],
    });

    let user = existing.rows[0] as Record<string, unknown> | undefined;

    if (!user) {
      const id = randomUUID();
      const created_at = new Date().toISOString();
      const role = "donor";

      await db.execute({
        sql: "INSERT INTO users (id, full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [id, full_name, contact_number, role, created_at],
      });

      const created = await db.execute({
        sql: "SELECT * FROM users WHERE id = ?",
        args: [id],
      });
      user = created.rows[0] as Record<string, unknown> | undefined;
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
