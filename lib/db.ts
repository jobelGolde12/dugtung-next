import { ApiError } from "./http";
import { db } from "./turso";

const identifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function assertSafeIdentifier(name: string) {
  if (!identifierPattern.test(name)) {
    throw new ApiError(400, "Invalid field name");
  }
}

export function sanitizeData(data: Record<string, unknown>) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    throw new ApiError(400, "No data provided");
  }
  const keys = entries.map(([key]) => {
    assertSafeIdentifier(key);
    return key;
  });
  const values = entries.map(([, value]) => value);
  return { keys, values };
}

export function buildInsert(table: string, data: Record<string, unknown>) {
  assertSafeIdentifier(table);
  const { keys, values } = sanitizeData(data);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  return { sql, values };
}

export function buildUpdate(
  table: string,
  data: Record<string, unknown>,
  whereSql: string,
  whereValues: unknown[]
) {
  assertSafeIdentifier(table);
  const { keys, values } = sanitizeData(data);
  const setSql = keys.map((key) => `${key} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${setSql} ${whereSql}`;
  return { sql, values: [...values, ...whereValues] };
}

export async function insertRow(table: string, data: Record<string, unknown>) {
  const { sql, values } = buildInsert(table, data);
  await db.execute({ sql, args: values });
}

export async function updateRow(
  table: string,
  data: Record<string, unknown>,
  whereSql: string,
  whereValues: unknown[]
) {
  const { sql, values } = buildUpdate(table, data, whereSql, whereValues);
  await db.execute({ sql, args: values });
}
