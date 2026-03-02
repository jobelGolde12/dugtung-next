import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole, requireAuth } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

const availabilitySchema = z.object({
  availability_status: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // DEBUG: Just check if user is authenticated, bypass role check
    const auth = requireAuth(req);
    console.log("DEBUG - User authenticated:", { role: auth.role, id: auth.id });
    
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);
    console.log("Updating availability for donor id:", id);
    
    // If donor, verify the donor profile exists
    if (auth.role === 'donor') {
      const result = await db.execute({
        sql: "SELECT * FROM donors WHERE id = ? AND is_deleted = 0",
        args: [id],
      });
      
      if (result.rows.length === 0) {
        throw new ApiError(404, "Donor not found");
      }
    }
    
    const body = availabilitySchema.parse(await req.json());

    await db.execute({
      sql: "UPDATE donors SET availability_status = ? WHERE id = ? AND is_deleted = 0",
      args: [body.availability_status, id],
    });

    const updated = await db.execute({
      sql: "SELECT * FROM donors WHERE id = ? AND is_deleted = 0",
      args: [id],
    });

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Donor not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
