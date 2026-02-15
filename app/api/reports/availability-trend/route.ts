import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["admin", "health_officer"]);

    try {
      const result = await db.execute({
        sql: "SELECT date(created_at) as date, SUM(CASE WHEN availability_status = 'Available' THEN 1 ELSE 0 END) as availableCount, SUM(CASE WHEN availability_status != 'Available' THEN 1 ELSE 0 END) as unavailableCount FROM donors WHERE is_deleted = 0 AND date(created_at) >= date('now', '-30 day') GROUP BY date(created_at) ORDER BY date(created_at)",
        args: [],
      });

      return jsonSuccess(result.rows);
    } catch (dbError) {
      console.error("Database error in availability-trend:", dbError);
      return jsonSuccess([]);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
