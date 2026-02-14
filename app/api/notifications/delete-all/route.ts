import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    if (isPrivilegedRole(auth.role)) {
      await db.execute({
        sql: "DELETE FROM notifications",
        args: [],
      });
    } else {
      await db.execute({
        sql: "DELETE FROM notifications WHERE user_id = ?",
        args: [auth.id],
      });
    }

    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
