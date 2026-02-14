import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { dataSchema, parseIdParam } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const updateSchema = z.object({
  data: dataSchema,
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);
    const id = parseIdParam(params);

    const result = await db.execute({
      sql: "SELECT * FROM donors WHERE id = ? AND is_deleted = 0",
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new ApiError(404, "Donor not found");
    }

    return jsonSuccess(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ["admin", "hospital_staff"]);
    const id = parseIdParam(params);
    const body = updateSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    delete data.id;
    delete data.is_deleted;

    data.updated_at = new Date().toISOString();

    const keys = Object.keys(data).filter((key) => data[key] !== undefined);
    if (keys.length === 0) {
      throw new ApiError(400, "No updatable fields provided");
    }

    keys.forEach(assertSafeIdentifier);
    const setSql = keys.map((key) => `${key} = ?`).join(", ");

    await db.execute({
      sql: `UPDATE donors SET ${setSql} WHERE id = ? AND is_deleted = 0`,
      args: [...keys.map((key) => data[key]), id],
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ["admin", "hospital_staff"]);
    const id = parseIdParam(params);

    await db.execute({
      sql: "UPDATE donors SET is_deleted = 1 WHERE id = ?",
      args: [id],
    });

    return jsonSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
