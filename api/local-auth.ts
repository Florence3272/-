import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

// Use APP_SECRET as JWT secret, fallback to a default for dev
const SECRET_KEY = new TextEncoder().encode(
  process.env.APP_SECRET || "local-auth-secret-key-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, { clockTolerance: 60 });
    const userId = payload.sub ? parseInt(payload.sub) : null;
    return userId;
  } catch {
    return null;
  }
}

export async function authenticateUser(token: string) {
  const userId = await verifyToken(token);
  if (!userId) return null;

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user || null;
}
