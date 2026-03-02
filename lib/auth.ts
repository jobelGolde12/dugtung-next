import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { requireEnv } from "./env";
import { ApiError } from "./http";

const jwtSecret = requireEnv("JWT_SECRET");

export type Role = "admin" | "user" | "donor" | "hospital_staff" | "health_officer";

export type AuthUser = {
  id: string;
  role: Role;
};

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, jwtSecret) as AuthUser;
}

export function getAuthFromRequest(req: NextRequest): AuthUser | null {
  const header = req.headers.get("authorization") || "";
  const [, token] = header.split(" ");
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): AuthUser {
  const user = getAuthFromRequest(req);
  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  return user;
}

export function requireRole(req: NextRequest, roles: Role[]) {
  const user = requireAuth(req);
  if (!roles.includes(user.role)) {
    console.log("Role check failed:", { userRole: user.role, allowedRoles: roles });
    throw new ApiError(403, `Forbidden: role '${user.role}' not in allowed roles`);
  }
  return user;
}

export const privilegedRoles: Role[] = ["admin", "hospital_staff", "health_officer"];

export function isPrivilegedRole(role: Role) {
  return privilegedRoles.includes(role);
}

export const allRoles: Role[] = [
  "admin",
  "user",
  "donor",
  "hospital_staff",
  "health_officer",
];

export function normalizeRole(value: unknown): Role {
  if (typeof value === "string" && allRoles.includes(value as Role)) {
    return value as Role;
  }
  return "user";
}
