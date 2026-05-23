import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AdminUser } from "@/types/site";

const cookieName = "exportforge_admin_session";
const sessionMaxAge = 60 * 60 * 8;

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-exportforge-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt:${salt}:${key}`;
}

export function verifyPasswordHash(password: string, passwordHash?: string) {
  if (!passwordHash) return false;
  const [scheme, salt, expected] = passwordHash.split(":");
  if (scheme !== "scrypt" || !salt || !expected) return false;

  const actual = scryptSync(password, salt, 64).toString("base64url");
  return safeEqual(actual, expected);
}

export function verifyAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "change-me";
  return email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;
}

export function verifyAdminUserPassword(user: AdminUser, password: string) {
  if (user.passwordHash) return verifyPasswordHash(password, user.passwordHash);
  return verifyAdminCredentials(user.email, password);
}

export function createSessionValue(email: string) {
  const payload = JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + sessionMaxAge
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSessionEmail(session?: string) {
  if (!session) return null;
  const [encoded, signature] = session.split(".");
  if (!encoded || !signature || !safeEqual(sign(encoded), signature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      email: string;
      exp: number;
    };
    if (!payload.email || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.email;
  } catch {
    return null;
  }
}

export async function getAdminSessionEmail() {
  const cookieStore = await cookies();
  return readSessionEmail(cookieStore.get(cookieName)?.value);
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, createSessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAge,
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
