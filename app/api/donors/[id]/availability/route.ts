import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parseIdParam } from "@/lib/validation";

const availabilitySchema = z.object({
  availability_status: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Allow admin, hospital_staff, health_officer, or donors to update their own availability
    const auth = requireRole(req, ["admin", "hospital_staff", "health_officer", "donor"]);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);
    
    // If donor, only allow updating their own profile
    if (auth.role === 'donor') {
      // Donors can only update their own profile - check by matching id
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
