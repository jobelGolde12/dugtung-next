import { NextRequest } from "next/server";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);
    const updated_at = new Date().toISOString();

    await db.execute({
      sql: "UPDATE messages SET is_closed = 1, updated_at = ? WHERE id = ?",
      args: [updated_at, id],
    });

    const updated = await db.execute({
      sql: "SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.id = ?",
      args: [id],
    });

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Message not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
