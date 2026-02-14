import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { parsePagination } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
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

    const listArgs = [...args, pageSize, (page - 1) * pageSize] as any[];
    const list = await db.execute(`SELECT * FROM donor_registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`, listArgs);

    const count = await db.execute(`SELECT COUNT(*) as count FROM donor_registrations ${whereSql}`, args as any[]);

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
    const body = await req.json();

    const data = { ...body } as Record<string, unknown>;
    
    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No data provided");
    }

    if (data.availability_status) {
      data.availability = data.availability_status;
      delete data.availability_status;
    }

    if (data.sex) {
      delete data.sex;
    }

    if (data.age) {
      const parsedAge = parseInt(String(data.age), 10);
      if (isNaN(parsedAge)) {
        throw new ApiError(400, "Invalid age value");
      }
      data.age = parsedAge;
    }

    if (!data.id) {
      const result = await db.execute("SELECT MAX(CAST(id AS INTEGER)) as max_id FROM donor_registrations");
      const maxId = Number((result.rows[0] as any)?.max_id ?? 0);
      data.id = maxId + 1;
    }
    if (!data.status) {
      data.status = "pending";
    }

    Object.keys(data).forEach(assertSafeIdentifier);
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");

    const values = keys.map((key) => data[key]) as any[];
    
    await db.execute(`INSERT INTO donor_registrations (${keys.join(", ")}) VALUES (${placeholders})`, values);

    const createdId = Number(data.id);
    const created = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [createdId]);

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create donor registration");
    }

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
