import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

const sendSchema = z.object({
  status: z.string().min(1).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ["admin", "health_officer"]);
    const id = parseIdParam(params);
    const body = sendSchema.parse(await req.json().catch(() => ({})));

    const status = body.status ?? "sent";
    const sent_at = new Date().toISOString();
    const updated_at = sent_at;

    await db.execute({
      sql: "UPDATE alerts SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?",
      args: [status, sent_at, updated_at, id],
    });

    const updated = await db.execute({
      sql: "SELECT * FROM alerts WHERE id = ?",
      args: [id],
    });

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Alert not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
