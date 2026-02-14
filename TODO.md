OBJECTIVE:
Convert this fresh Next.js project into the backend API server
for my React Native blood donation app.

This backend will:

- Connect to Turso database
- Implement all database interactions
- Implement role-based access control (RBAC)
- Follow API definitions written in routes.md
- Be production-ready
- Secure
- Not expose Turso directly to frontend

=========================================================
PHASE 1 — INSTALL REQUIRED DEPENDENCIES
=========================================================

Install:

npm install @libsql/client
npm install jsonwebtoken
npm install bcryptjs
npm install zod
npm install dotenv

=========================================================
PHASE 2 — SETUP TURSO CONNECTION
=========================================================

Create:
lib/turso.ts

---------------------------------------------------------

import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

---------------------------------------------------------

Fail if env missing.

Add to .env.local:

TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token_here
JWT_SECRET=your_secret_here

=========================================================
PHASE 3 — AUTHENTICATION SYSTEM (JWT)
=========================================================

Create:
lib/auth.ts

Features:
- Hash passwords with bcrypt
- Generate JWT tokens
- Verify JWT tokens
- Attach user to request
- Enforce roles

JWT payload:
{
  id: string,
  role: "admin" | "user"
}

=========================================================
PHASE 4 — IMPLEMENT ROUTES BASED ON routes.md
=========================================================

Read routes.md.

For each endpoint:

1. Create API route under:

app/api/{route}/route.ts

2. Implement:
   - Input validation using zod
   - Role-based guard
   - Turso query
   - Proper error handling
   - Proper HTTP status codes

Example — Register:

POST /api/auth/register

- Validate input
- Check duplicate email
- Hash password
- Insert into users table
- Return JWT

Example — Login:

POST /api/auth/login

- Validate
- Compare password
- Return JWT

=========================================================
PHASE 5 — ROLE-BASED ACCESS CONTROL
=========================================================

Implement middleware:

- Require authentication
- Require specific role
- Reject unauthorized users

Example:

requireRole("admin")

=========================================================
PHASE 6 — SECURE DESIGN RULES
=========================================================

- Never return password
- Never expose Turso credentials
- Never expose raw SQL errors
- Always validate input
- Always return JSON responses

Standard response format:

{
  success: boolean,
  data?: any,
  error?: string
}

=========================================================
PHASE 7 — TEST ALL ENDPOINTS
=========================================================

Ensure working:

- Register
- Login
- Create donor
- Get donors
- Create blood request
- Update status
- Messaging
- Notifications

=========================================================
FINAL REQUIREMENT
=========================================================

This backend must be production-ready and serve as the ONLY
layer interacting with Turso.

React Native must never access Turso directly.
