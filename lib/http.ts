import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return jsonError(issue?.message ?? "Invalid input", 400);
  }
  if (error instanceof SyntaxError) {
    return jsonError("Invalid JSON body", 400);
  }

  console.error("Unhandled API error", error);
  return jsonError("Internal server error", 500);
}
