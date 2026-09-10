import "server-only";

import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "frglass-behind-scenes-admin";
const SESSION_LABEL = "frglass-behind-scenes-session";

function adminPassword() {
  return process.env.BEHIND_SCENES_ADMIN_PASSWORD?.trim() ?? "";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function sessionToken() {
  const password = adminPassword();
  if (!password) return "";

  return createHmac("sha256", password).update(SESSION_LABEL).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(adminPassword());
}

export function verifyAdminPassword(password: string) {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function isAdmin() {
  const expected = sessionToken();
  if (!expected) return false;

  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_COOKIE)?.value ?? "";
  if (!actual) return false;

  return safeEqual(actual, expected);
}

export async function setAdminSession() {
  const token = sessionToken();
  if (!token) throw new Error("Admin access is not configured.");

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
