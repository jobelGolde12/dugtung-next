import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["admin", "health_officer"]);

    const result = await db.execute({
      sql: "SELECT blood_type as bloodType, COUNT(*) as count FROM donors WHERE is_deleted = 0 GROUP BY blood_type",
      args: [],
    });

    return jsonSuccess(result.rows);
  } catch (error) {
    return handleApiError(error);
  }
}
