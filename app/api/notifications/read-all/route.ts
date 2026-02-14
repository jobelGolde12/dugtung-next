import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    if (isPrivilegedRole(auth.role)) {
      await db.execute({
        sql: "UPDATE notifications SET is_read = 1",
        args: [],
      });
    } else {
      await db.execute({
        sql: "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
        args: [auth.id],
      });
    }

    return jsonSuccess({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
