import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { dataSchema, parseIdParam } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const updateSchema = z.object({
  status: z.string().optional(),
  data: dataSchema.optional(),
  donorData: dataSchema.optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ["admin", "hospital_staff", "health_officer"]);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);

    const result = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [id]);

    if (result.rows.length === 0) {
      throw new ApiError(404, "Registration not found");
    }

    return jsonSuccess(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(req, ["admin", "hospital_staff"]);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);
    const body = updateSchema.parse(await req.json());

    if (body.status || body.data) {
      const updateData = { ...(body.data ?? {}) } as Record<string, unknown>;
      if (body.status) {
        updateData.status = body.status;
        updateData.reviewed_at = new Date().toISOString();
        updateData.reviewed_by = parseInt(user.id, 10);
      }
      updateData.updated_at = new Date().toISOString();

      const keys = Object.keys(updateData).filter((key) => updateData[key] !== undefined);
      if (keys.length > 0) {
        keys.forEach(assertSafeIdentifier);
        const setSql = keys.map((key) => `${key} = ?`).join(", ");
        const values = keys.map((key) => updateData[key]) as any[];
        await db.execute(`UPDATE donor_registrations SET ${setSql} WHERE id = ?`, [...values, id]);
      }
    }

    if (body.status === "approved") {
      let donorPayload = body.donorData as Record<string, unknown> | undefined;

      if (!donorPayload) {
        const regResult = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [id]);
        const reg = regResult.rows[0] as Record<string, unknown> | undefined;
        if (!reg) {
          throw new ApiError(404, "Registration not found");
        }
        
        // Map donor_registrations columns to donors columns
        donorPayload = {
          full_name: reg.full_name,
          age: reg.age,
          sex: reg.sex,
          blood_type: reg.blood_type,
          contact_number: reg.contact_number,
          municipality: reg.municipality,
          availability_status: reg.availability,
          last_donation_date: null,
          notes: null,
          created_at: new Date().toISOString(),
          is_deleted: 0,
          avatar_url: reg.avatar_url,
          email: reg.email,
        };
      }

      if (donorPayload.is_deleted === undefined) {
        donorPayload.is_deleted = 0;
      }

      const keys = Object.keys(donorPayload);
      const placeholders = keys.map(() => "?").join(", ");
      const values = keys.map((key) => donorPayload[key]) as any[];
      await db.execute(`INSERT INTO donors (${keys.join(", ")}) VALUES (${placeholders})`, values);
      
      const donorIdResult = await db.execute("SELECT last_insert_rowid() as id");
      const donorId = donorIdResult.rows[0] as any;
      
      // Copy avatar from donor_registration_avatars to donor_avatars
      const avatarResult = await db.execute(
        "SELECT avatar_data, mime_type FROM donor_registration_avatars WHERE registration_id = ? ORDER BY created_at DESC LIMIT 1",
        [id]
      );
      if (avatarResult.rows.length > 0) {
        const row = avatarResult.rows[0] as any;
        await db.execute(
          "INSERT INTO donor_avatars (donor_id, avatar_data, mime_type) VALUES (?, ?, ?)",
          [donorId.id, row.avatar_data, row.mime_type]
        );
      }
      
      // Copy email from donor_registration_emails to donor_emails
      const emailResult = await db.execute(
        "SELECT email FROM donor_registration_emails WHERE registration_id = ? ORDER BY created_at DESC LIMIT 1",
        [id]
      );
      if (emailResult.rows.length > 0) {
        const row = emailResult.rows[0] as any;
        await db.execute(
          "INSERT INTO donor_emails (donor_id, email) VALUES (?, ?)",
          [donorId.id, row.email]
        );
      }
    }

    const updated = await db.execute("SELECT * FROM donor_registrations WHERE id = ?", [id]);

    if (updated.rows.length === 0) {
      throw new ApiError(404, "Registration not found");
    }

    return jsonSuccess(updated.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ["admin"]);
    const resolvedParams = await params;
    const id = parseIdParam(resolvedParams);

    await db.execute("DELETE FROM donor_registrations WHERE id = ?", [id]);

    return jsonSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
