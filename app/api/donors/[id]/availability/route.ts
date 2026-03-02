import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { parseIdParam } from "@/lib/validation";

const availabilitySchema = z.object({
  availability_status: z.string().min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // DEBUG: Skip auth entirely for now to isolate the issue
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);
    console.log("Updating availability for donor id:", id);
    
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
