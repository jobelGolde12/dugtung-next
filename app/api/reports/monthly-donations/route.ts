import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["admin", "health_officer"]);

    const result = await db.execute({
      sql: "SELECT strftime('%Y-%m', donation_date) as month, COUNT(*) as donations FROM donations GROUP BY month ORDER BY month",
      args: [],
    });

    return jsonSuccess(result.rows);
  } catch (error) {
    return handleApiError(error);
  }
}
