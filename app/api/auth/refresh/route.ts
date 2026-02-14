import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess, ApiError } from "@/lib/http";
import { normalizeRole, requireAuth, signToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const result = await db.execute("SELECT * FROM users WHERE id = ?", [auth.id]);

    if (result.rows.length === 0) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = result.rows[0] as Record<string, unknown>;
    const role = normalizeRole(user.role ?? auth.role);
    const token = signToken({ id: String(user.id), role });
    const { password_hash, ...safeUser } = user;

    return jsonSuccess({ token, user: safeUser });
  } catch (error) {
    return handleApiError(error);
  }
}
