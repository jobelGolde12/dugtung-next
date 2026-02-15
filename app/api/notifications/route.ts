import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";
import { parsePagination } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { page, pageSize } = parsePagination(req.nextUrl.searchParams);

    const userId = req.nextUrl.searchParams.get("userId");
    const isRead = req.nextUrl.searchParams.get("isRead");

    const baseWhereParts: string[] = [];
    const baseArgs: unknown[] = [];

    if (!isPrivilegedRole(auth.role)) {
      baseWhereParts.push("user_id = ?");
      baseArgs.push(auth.id);
    } else if (userId) {
      baseWhereParts.push("user_id = ?");
      baseArgs.push(userId);
    }

    const whereParts = [...baseWhereParts];
    const args = [...baseArgs];

    if (isRead === "true") {
      whereParts.push("is_read = 1");
    } else if (isRead === "false") {
      whereParts.push("is_read = 0");
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    try {
      const listArgs = [...args, pageSize, (page - 1) * pageSize] as any[];
      const list = await db.execute({
        sql: `SELECT * FROM notifications ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        args: listArgs,
      });

      const count = await db.execute({
        sql: `SELECT COUNT(*) as count FROM notifications ${whereSql}`,
        args: args as any[],
      });

      const baseWhereSql = baseWhereParts.length ? `WHERE ${baseWhereParts.join(" AND ")}` : "";
      const unreadCountQuery = await db.execute({
        sql: `SELECT COUNT(*) as count FROM notifications ${baseWhereSql}${baseWhereSql ? " AND" : "WHERE"} is_read = 0`,
        args: baseArgs as any[],
      });

      const total = Number((count.rows[0] as any)?.count ?? 0);
      const unread = Number((unreadCountQuery.rows[0] as any)?.count ?? 0);

      return jsonSuccess({
        items: list.rows,
        total,
        unread,
        page,
        pageSize,
      });
    } catch (dbError) {
      // If table doesn't exist, return empty result
      console.error("Database error in notifications:", dbError);
      return jsonSuccess({
        items: [],
        total: 0,
        unread: 0,
        page,
        pageSize,
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
