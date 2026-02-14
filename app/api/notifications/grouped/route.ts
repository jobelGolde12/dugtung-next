import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const whereSql = isPrivilegedRole(auth.role) ? "" : "WHERE user_id = ?";
    const args = isPrivilegedRole(auth.role) ? [] : [auth.id];

    const result = await db.execute({
      sql: `SELECT * FROM notifications ${whereSql} ORDER BY created_at DESC`,
      args,
    });

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const grouped = {
      today: [] as typeof result.rows,
      yesterday: [] as typeof result.rows,
      earlier: [] as typeof result.rows,
    };

    for (const row of result.rows) {
      const createdAtRaw = (row as any).created_at as string | null | undefined;
      const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

      if (createdAt && isSameDay(createdAt, now)) {
        grouped.today.push(row);
      } else if (createdAt && isSameDay(createdAt, yesterday)) {
        grouped.yesterday.push(row);
      } else {
        grouped.earlier.push(row);
      }
    }

    return jsonSuccess(grouped);
  } catch (error) {
    return handleApiError(error);
  }
}
