import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { dataSchema } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const createSchema = z.object({
  data: dataSchema,
});

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);

    const result = await db.execute({
      sql: "SELECT * FROM blood_requests ORDER BY created_at DESC",
      args: [],
    });

    return jsonSuccess(result.rows);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ["admin", "hospital_staff"]);

    const body = createSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No data provided");
    }

    if (!data.id) {
      data.id = randomUUID();
    }
    if (!data.status) {
      data.status = "pending";
    }

    Object.keys(data).forEach(assertSafeIdentifier);
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");

    await db.execute({
      sql: `INSERT INTO blood_requests (${keys.join(", ")}) VALUES (${placeholders})`,
      args: keys.map((key) => data[key]),
    });

    const created = await db.execute({
      sql: "SELECT * FROM blood_requests WHERE id = ?",
      args: [data.id],
    });

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create blood request");
    }

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
