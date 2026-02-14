import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);
    const id = parseIdParam(params);

    const result = await db.execute({
      sql: "SELECT * FROM alerts WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new ApiError(404, "Alert not found");
    }

    return jsonSuccess(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
