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

    // Fetch avatars and emails for all registrations
    const itemsWithDetails = await Promise.all(
      list.rows.map(async (reg: any) => {
        const avatarResult = await db.execute(
          "SELECT avatar_data, mime_type FROM donor_registration_avatars WHERE registration_id = ? ORDER BY created_at DESC LIMIT 1",
          [reg.id]
        );
        const emailResult = await db.execute(
          "SELECT email FROM donor_registration_emails WHERE registration_id = ? ORDER BY created_at DESC LIMIT 1",
          [reg.id]
        );
        
        return {
          ...reg,
          avatar_data: avatarResult.rows[0]?.avatar_data,
          avatar_mime_type: avatarResult.rows[0]?.mime_type,
          email: emailResult.rows[0]?.email,
        };
      })
    );

    const count = await db.execute(`SELECT COUNT(*) as count FROM donor_registrations ${whereSql}`, args as any[]);

    const total = Number((count.rows[0] as any)?.count ?? 0);

    return jsonSuccess({
      items: itemsWithDetails,
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

    // Extract avatar and email data
    const avatarData = data.avatar_data as string | undefined;
    const avatarMimeType = data.avatar_mime_type as string | undefined;
    const email = data.email as string | undefined;
    
    // Remove from main data object
    delete data.avatar_data;
    delete data.avatar_mime_type;
    delete data.email;

    if (data.availability_status) {
      data.availability = data.availability_status;
      delete data.availability_status;
    }

    if (data.age) {
      const parsedAge = parseInt(String(data.age), 10);
      if (isNaN(parsedAge)) {
        throw new ApiError(400, "Invalid age value");
      }
      data.age = parsedAge;
    }

    // Keep sex field - do not delete it

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
    
    // Insert avatar if provided
    if (avatarData && avatarMimeType) {
      await db.execute(
        "INSERT INTO donor_registration_avatars (registration_id, avatar_data, mime_type) VALUES (?, ?, ?)",
        [createdId, avatarData, avatarMimeType]
      );
    }
    
    // Insert email if provided
    if (email) {
      await db.execute(
        "INSERT INTO donor_registration_emails (registration_id, email) VALUES (?, ?)",
        [createdId, email]
      );
    }

    const created = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [createdId]);

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create donor registration");
    }

    const createdUser = created.rows[0] as Record<string, unknown>;

    // Normalize response for frontend (SecureStore compatibility)
    const userForResponse = {
      id: String(createdUser.id),
      name: createdUser.full_name, // Map full_name -> name
      contact_number: createdUser.contact_number,
      municipality: createdUser.municipality,
      blood_type: createdUser.blood_type,
      age: createdUser.age,
      status: createdUser.status,
      availability: createdUser.availability,
      created_at: createdUser.created_at
    };

    return jsonSuccess({ registration: userForResponse }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
