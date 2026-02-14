import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { dataSchema } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const updateSchema = z.object({
  data: dataSchema,
});

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    await db.execute({
      sql: "INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)",
      args: [auth.id],
    });

    const result = await db.execute({
      sql: "SELECT * FROM user_preferences WHERE user_id = ?",
      args: [auth.id],
    });

    if (result.rows.length === 0) {
      throw new ApiError(404, "Preferences not found");
    }

    return jsonSuccess(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = updateSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    delete data.user_id;
    delete data.created_at;

    const keys = Object.keys(data).filter((key) => data[key] !== undefined);
    if (keys.length === 0) {
      throw new ApiError(400, "No updatable fields provided");
    }

    keys.forEach(assertSafeIdentifier);
    const setSql = keys.map((key) => `${key} = ?`).join(", ");
    const values = keys.map((key) => data[key]);

    await db.execute({
      sql: "INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)",
      args: [auth.id],
    });

    await db.execute({
      sql: `UPDATE user_preferences SET ${setSql} WHERE user_id = ?`,
      args: [...values, auth.id],
    });

    const updated = await db.execute({
      sql: "SELECT * FROM user_preferences WHERE user_id = ?",
      args: [auth.id],
    });

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Preferences not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
