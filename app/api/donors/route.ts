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
    // Allow admin, hospital_staff, health_officer, and donors to access
    requireRole(req, ["admin", "hospital_staff", "health_officer", "donor"]);

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

      // Fetch avatars and emails for all donors
      const itemsWithDetails = await Promise.all(
        list.rows.map(async (donor: any) => {
          const avatarResult = await db.execute({
            sql: "SELECT avatar_data, mime_type FROM donor_avatars WHERE donor_id = ? ORDER BY created_at DESC LIMIT 1",
            args: [donor.id]
          });
          const emailResult = await db.execute({
            sql: "SELECT email FROM donor_emails WHERE donor_id = ? ORDER BY created_at DESC LIMIT 1",
            args: [donor.id]
          });
          
          return {
            ...donor,
            avatar_data: avatarResult.rows[0]?.avatar_data,
            avatar_mime_type: avatarResult.rows[0]?.mime_type,
            email: emailResult.rows[0]?.email,
          };
        })
      );

      const count = await db.execute({
        sql: `SELECT COUNT(*) as count FROM donors ${whereSql}`,
        args: args as any[],
      });

      const total = Number((count.rows[0] as any)?.count ?? 0);

      return jsonSuccess({
        items: itemsWithDetails,
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

    console.log("📥 Received donor data:", JSON.stringify(data, null, 2));

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

    // Get next ID from database
    const maxIdResult = await db.execute({
      sql: "SELECT MAX(CAST(id AS INTEGER)) as max_id FROM donors",
      args: []
    });
    const maxId = Number(maxIdResult.rows[0]?.max_id ?? 0);
    data.id = maxId + 1;

    if (data.is_deleted === undefined) {
      data.is_deleted = 0;
    }
    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }

    Object.keys(data).forEach(assertSafeIdentifier);

    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");

    const values = keys.map((key) => data[key]) as any[];
    
    console.log("📤 Inserting with SQL:", `INSERT INTO donors (${keys.join(", ")}) VALUES (${placeholders})`);
    console.log("📤 Values:", values);

    await db.execute({
      sql: `INSERT INTO donors (${keys.join(", ")}) VALUES (${placeholders})`,
      args: values,
    });

    const donorId = Number(data.id);
    
    // Insert avatar if provided
    if (avatarData && avatarMimeType) {
      await db.execute({
        sql: "INSERT INTO donor_avatars (donor_id, avatar_data, mime_type) VALUES (?, ?, ?)",
        args: [donorId, avatarData, avatarMimeType]
      });
    }
    
    // Insert email if provided
    if (email) {
      await db.execute({
        sql: "INSERT INTO donor_emails (donor_id, email) VALUES (?, ?)",
        args: [donorId, email]
      });
    }

    const createdId = String(data.id);
    const created = await db.execute({
      sql: "SELECT * FROM donors WHERE id = ?",
      args: [createdId],
    });

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to create donor");
    }

    console.log("✅ Donor created successfully:", created.rows[0]);

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    console.error("❌ Error creating donor:", error);
    return handleApiError(error);
  }
}
