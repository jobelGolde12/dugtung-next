import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    const id = parseIdParam(params);

    const result = await db.execute({
      sql: "SELECT * FROM notifications WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new ApiError(404, "Notification not found");
    }

    const notification = result.rows[0] as Record<string, unknown>;
    if (!isPrivilegedRole(auth.role) && String(notification.user_id ?? "") !== auth.id) {
      throw new ApiError(403, "Forbidden");
    }

    return jsonSuccess(notification);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    const id = parseIdParam(params);

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
      sql: "DELETE FROM notifications WHERE id = ?",
      args: [id],
    });

    return jsonSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
