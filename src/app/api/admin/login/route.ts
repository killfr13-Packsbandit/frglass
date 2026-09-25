import { NextResponse } from "next/server";
import {
  isAdminConfigured,
  setAdminSession,
  verifyAdminPassword,
} from "../../../../lib/adminAuth";
import {
  consumeRateLimit,
  requestRateLimitKey,
} from "../../../../lib/rateLimit";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured yet." },
      { status: 503 },
    );
  }

  const allowed = await consumeRateLimit(
    "ADMIN_LOGIN_RATE_LIMITER",
    requestRateLimitKey(request),
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait one minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { password?: unknown }
    | null;
  const password =
    typeof body?.password === "string" ? body.password.slice(0, 256) : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
