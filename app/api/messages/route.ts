import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/turso";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/http";
import { isPrivilegedRole, requireAuth } from "@/lib/auth";
import { parsePagination, dataSchema } from "@/lib/validation";
import { assertSafeIdentifier } from "@/lib/db";

const createSchema = z.object({
  data: dataSchema,
});

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { page, pageSize } = parsePagination(req.nextUrl.searchParams);

    const senderId = req.nextUrl.searchParams.get("senderId");
    const recipientId = req.nextUrl.searchParams.get("recipientId");
    const isClosed = req.nextUrl.searchParams.get("isClosed");

    const whereParts: string[] = [];
    const args: unknown[] = [];

    if (!isPrivilegedRole(auth.role)) {
      whereParts.push("m.sender_id = ?");
      args.push(auth.id);
    } else {
      if (senderId) {
        whereParts.push("m.sender_id = ?");
        args.push(senderId);
      }
      if (recipientId) {
        whereParts.push("m.recipient_id = ?");
        args.push(recipientId);
      }
    }

    if (isClosed === "true") {
      whereParts.push("m.is_closed = 1");
    } else if (isClosed === "false") {
      whereParts.push("m.is_closed = 0");
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const listArgs = [...args, pageSize, (page - 1) * pageSize] as any[];
    const list = await db.execute(`SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number FROM messages m LEFT JOIN users u ON u.id = m.sender_id ${whereSql} ORDER BY m.created_at DESC LIMIT ? OFFSET ?`, listArgs);

    const count = await db.execute(`SELECT COUNT(*) as count FROM messages m ${whereSql}`, args as any[]);

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
    const auth = requireAuth(req);
    const body = createSchema.parse(await req.json());
    const data = { ...body.data } as Record<string, unknown>;

    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "No data provided");
    }

    // For messages, don't set id - let it be auto-incremented
    // Remove any id that might have been passed
    delete data.id;

    if (!isPrivilegedRole(auth.role)) {
      data.sender_id = auth.id;
    }

    Object.keys(data).forEach(assertSafeIdentifier);
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");

    const values = keys.map((key) => data[key]) as any[];
    await db.execute(`INSERT INTO messages (${keys.join(", ")}) VALUES (${placeholders})`, values);

    // Get the last inserted id
    const lastId = await db.execute("SELECT last_insert_rowid() as id");
    const createdId = (lastId.rows[0] as any).id;
    const created = await db.execute("SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.id = ?", [createdId]);

    if (created.rows.length === 0) {
      throw new ApiError(500, "Failed to send message");
    }

    return jsonSuccess(created.rows[0], 201);
  } catch (error) {
    return handleApiError(error);
  }
}
