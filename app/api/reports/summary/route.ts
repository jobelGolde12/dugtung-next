import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["admin", "health_officer"]);

    try {
      const totalDonors = await db.execute({
        sql: "SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0",
        args: [],
      });
      const availableDonors = await db.execute({
        sql: "SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0 AND availability_status = 'Available'",
        args: [],
      });
      const requestsThisMonth = await db.execute({
        sql: "SELECT COUNT(*) as count FROM blood_requests WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
        args: [],
      });
      const totalDonations = await db.execute({
        sql: "SELECT COUNT(*) as count FROM donations",
        args: [],
      });

      return jsonSuccess({
        totalDonors: Number((totalDonors.rows[0] as any)?.count ?? 0),
        availableDonors: Number((availableDonors.rows[0] as any)?.count ?? 0),
        bloodRequestsThisMonth: Number((requestsThisMonth.rows[0] as any)?.count ?? 0),
        totalDonations: Number((totalDonations.rows[0] as any)?.count ?? 0),
      });
    } catch (dbError) {
      console.error("Database error in reports/summary:", dbError);
      return jsonSuccess({
        totalDonors: 0,
        availableDonors: 0,
        bloodRequestsThisMonth: 0,
        totalDonations: 0,
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
