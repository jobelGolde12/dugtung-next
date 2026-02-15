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
    const { password_hash: _password_hash, ...safeUser } = user;

    // Ensure ID is a string for the response
    const userForResponse = {
      id: String(safeUser.id),
      role: safeUser.role,
      name: safeUser.full_name,
      contact_number: safeUser.contact_number,
      email: safeUser.email,
      avatar_url: safeUser.avatar_url ?? null
    };

    return jsonSuccess({ user: userForResponse });
  } catch (error) {
    return handleApiError(error);
  }
}
