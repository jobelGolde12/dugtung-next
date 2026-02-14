import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const result = await db.execute("SELECT * FROM users WHERE id = ?", [auth.id]);

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
