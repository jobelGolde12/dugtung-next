import { z } from "zod";
import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { hashPassword, isPrivilegedRole, requireAuth } from "@/lib/auth";
import { dataSchema } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const updateSchema = z.object({
  data: dataSchema,
});

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const requestedId = req.nextUrl.searchParams.get("id");
    const userId = requestedId ?? auth.id;

    if (requestedId && !isPrivilegedRole(auth.role)) {
      throw new ApiError(403, "Forbidden");
    }

    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) {
      throw new ApiError(404, "User not found");
    }

    const user = result.rows[0] as Record<string, unknown>;
    const { password_hash, ...safeUser } = user;

    return jsonSuccess(safeUser);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const requestedId = req.nextUrl.searchParams.get("id");
    const userId = requestedId ?? auth.id;

    if (requestedId && !isPrivilegedRole(auth.role)) {
      throw new ApiError(403, "Forbidden");
    }

    const body = updateSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    delete data.id;
    delete data.password_hash;
    delete data.created_at;

    if (!isPrivilegedRole(auth.role) && data.role) {
      throw new ApiError(403, "Forbidden");
    }

    if (data.password) {
      const hashed = await hashPassword(String(data.password));
      delete data.password;
      data.password_hash = hashed;
    }

    data.updated_at = new Date().toISOString();

    const keys = Object.keys(data).filter((key) => data[key] !== undefined);
    if (keys.length === 0) {
      throw new ApiError(400, "No updatable fields provided");
    }

    keys.forEach(assertSafeIdentifier);
    const setSql = keys.map((key) => `${key} = ?`).join(", ");
    const values = keys.map((key) => data[key]);

    await db.execute({
      sql: `UPDATE users SET ${setSql} WHERE id = ?`,
      args: [...values, userId],
    });

    const updated = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId],
    });

    const user = updated.rows[0] as Record<string, unknown> | undefined;
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { password_hash, ...safeUser } = user;

    return jsonSuccess(safeUser);
  } catch (error) {
    return handleApiError(error);
  }
}
