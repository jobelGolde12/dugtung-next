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
    const bloodType = req.nextUrl.searchParams.get("bloodType");
    const municipality = req.nextUrl.searchParams.get("municipality");
    const availability = req.nextUrl.searchParams.get("availability");
    const q = req.nextUrl.searchParams.get("q");

    const whereParts: string[] = ["is_deleted = 0"];
    const args: unknown[] = [];

    if (bloodType) {
      whereParts.push("blood_type = ?");
      args.push(bloodType);
    }

    if (municipality) {
      whereParts.push("municipality = ?");
      args.push(municipality);
    }

    if (availability) {
      whereParts.push("availability_status = ?");
      args.push(availability);
    }

    if (q) {
      whereParts.push(
        "(full_name LIKE ? OR contact_number LIKE ? OR municipality LIKE ? OR barangay LIKE ?)"
      );
      const like = `%${q}%`;
      args.push(like, like, like, like);
    }

    const whereSql = `WHERE ${whereParts.join(" AND ")}`;

    try {
      const listArgs = [...args, pageSize, (page - 1) * pageSize] as any[];
      const list = await db.execute({
        sql: `SELECT * FROM donors ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        args: listArgs,
      });

      const count = await db.execute({
        sql: `SELECT COUNT(*) as count FROM donors ${whereSql}`,
        args: args as any[],
      });

      const total = Number((count.rows[0] as any)?.count ?? 0);

      return jsonSuccess({
        items: list.rows,
        total,
        page,
        pageSize,
      });
    } catch (dbError) {
      console.error("Database error in donors:", dbError);
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
    requireRole(req, ["admin", "hospital_staff"]);

    const body = createSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No data provided");
    }

    if (!data.id) {
      data.id = randomUUID();
    }
    if (data.is_deleted === undefined) {
      data.is_deleted = 0;
    }

    Object.keys(data).forEach(assertSafeIdentifier);

    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");

    const values = keys.map((key) => data[key]) as any[];
    await db.execute({
      sql: `INSERT INTO donors (${keys.join(", ")}) VALUES (${placeholders})`,
      args: values,
    });

    const createdId = String(data.id);
    const created = await db.execute({
      sql: "SELECT * FROM donors WHERE id = ?",
      args: [createdId],
    });

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create donor");
    }

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
