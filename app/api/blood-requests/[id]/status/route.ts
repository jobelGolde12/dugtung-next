import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

const statusSchema = z.object({
  status: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);
    const body = statusSchema.parse(await req.json());

    await db.execute({
      sql: "UPDATE blood_requests SET status = ? WHERE id = ?",
      args: [body.status, id],
    });

    const updated = await db.execute({
      sql: "SELECT * FROM blood_requests WHERE id = ?",
      args: [id],
    });

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Blood request not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
