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
    const status = req.nextUrl.searchParams.get("status");
    const municipality = req.nextUrl.searchParams.get("municipality");
    const bloodType = req.nextUrl.searchParams.get("bloodType");
    const q = req.nextUrl.searchParams.get("q");

    const whereParts: string[] = [];
    const args: unknown[] = [];

    if (status) {
      whereParts.push("status = ?");
      args.push(status);
    }
    if (municipality) {
      whereParts.push("municipality = ?");
      args.push(municipality);
    }
    if (bloodType) {
      whereParts.push("blood_type = ?");
      args.push(bloodType);
    }
    if (q) {
      whereParts.push("(full_name LIKE ? OR contact_number LIKE ? OR municipality LIKE ?)");
      const like = `%${q}%`;
      args.push(like, like, like);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const list = await db.execute({
      sql: `SELECT * FROM donor_registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, pageSize, (page - 1) * pageSize],
    });

    const count = await db.execute({
      sql: `SELECT COUNT(*) as count FROM donor_registrations ${whereSql}`,
      args,
    });

    const total = Number((count.rows[0] as any)?.count ?? 0);

    return jsonSuccess({
      items: list.rows,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
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
      sql: `INSERT INTO donor_registrations (${keys.join(", ")}) VALUES (${placeholders})`,
      args: keys.map((key) => data[key]),
    });

    const created = await db.execute({
      sql: "SELECT * FROM donor_registrations WHERE id = ?",
      args: [data.id],
    });

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create donor registration");
    }

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
