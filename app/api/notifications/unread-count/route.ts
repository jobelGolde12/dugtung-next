import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const result = await db.execute({
      sql: isPrivilegedRole(auth.role)
        ? "SELECT COUNT(*) as count FROM notifications WHERE is_read = 0"
        : "SELECT COUNT(*) as count FROM notifications WHERE is_read = 0 AND user_id = ?",
      args: isPrivilegedRole(auth.role) ? [] : [auth.id],
    });

    const count = Number((result.rows[0] as any)?.count ?? 0);

    return jsonSuccess({ count });
  } catch (error) {
    return handleApiError(error);
  }
}
