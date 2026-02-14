import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);

    if (!isPrivilegedRole(auth.role)) {
      const existing = await db.execute({
        sql: "SELECT * FROM notifications WHERE id = ?",
        args: [id],
      });
      const notification = existing.rows[0] as Record<string, unknown> | undefined;
      if (!notification) {
        throw new ApiError(404, "Notification not found");
      }
      if (String(notification.user_id ?? "") !== auth.id) {
        throw new ApiError(403, "Forbidden");
      }
    }

    await db.execute({
      sql: "UPDATE notifications SET is_read = 1 WHERE id = ?",
      args: [id],
    });

    const updated = await db.execute({
      sql: "SELECT * FROM notifications WHERE id = ?",
      args: [id],
    });

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Notification not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
