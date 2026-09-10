import { NextResponse } from "next/server";
import {
  isAdminConfigured,
  setAdminSession,
  verifyAdminPassword,
} from "../../../../lib/adminAuth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { password?: string }
    | null;
  const password = body?.password ?? "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
