import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parsePagination, dataSchema } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const createSchema = z.object({
  data: dataSchema,
});

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);

    const { page, pageSize } = parsePagination(req.nextUrl.searchParams);

    try {
      const list = await db.execute("SELECT * FROM alerts ORDER BY created_at DESC LIMIT ? OFFSET ?", [pageSize, (page - 1) * pageSize]);

      const count = await db.execute("SELECT COUNT(*) as count FROM alerts", []);

      const total = Number((count.rows[0] as any)?.count ?? 0);

      return jsonSuccess({
        items: list.rows,
        total,
        page,
        pageSize,
      });
    } catch (dbError) {
      console.error("Database error in alerts:", dbError);
      return jsonSuccess({
        items: [],
        total: 0,
        page,
        pageSize,
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);

    const body = createSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No data provided");
    }

    if (!data.id) {
      data.id = randomUUID();
    }

    Object.keys(data).forEach(assertSafeIdentifier);
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");

    const values = keys.map((key) => data[key]) as any[];
    
    try {
      await db.execute(`INSERT INTO alerts (${keys.join(", ")}) VALUES (${placeholders})`, values);
    } catch (dbError: any) {
      console.error("Database error inserting alert:", dbError);
      console.error("SQL:", `INSERT INTO alerts (${keys.join(", ")}) VALUES (${placeholders})`);
      console.error("Values:", values);
      throw new ApiError(500, `Database error: ${dbError.message || 'Unknown error'}`);
    }

    const createdId = String(data.id);
    const created = await db.execute("SELECT * FROM alerts WHERE id = ?", [createdId]);

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create alert");
    }

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
