import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/adminAuth";
import {
  getSiteContent,
  isSiteContentStorageConfigured,
  saveSiteContent,
} from "../../../lib/siteContentCatalog";
import type { SiteContentMap } from "../../siteContent";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(
    { content, configured: isSiteContentStorageConfigured() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (!isSiteContentStorageConfigured()) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { content?: unknown }
    | null;

  if (
    !body?.content ||
    typeof body.content !== "object" ||
    Array.isArray(body.content)
  ) {
    return NextResponse.json({ error: "Invalid site content." }, { status: 400 });
  }

  const entries = Object.entries(body.content as Record<string, unknown>);
  if (entries.length > 400) {
    return NextResponse.json({ error: "Too many content fields." }, { status: 400 });
  }

  const content: SiteContentMap = {};
  for (const [key, value] of entries) {
    if (
      typeof key !== "string" ||
      key.length > 160 ||
      typeof value !== "string" ||
      value.length > 10000
    ) {
      return NextResponse.json({ error: "Invalid content field." }, { status: 400 });
    }
    content[key] = value;
  }

  if (JSON.stringify(content).length > 350000) {
    return NextResponse.json({ error: "Site content is too large." }, { status: 400 });
  }

  try {
    await saveSiteContent(content);
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    console.error("Could not save site content", error);
    return NextResponse.json({ error: "Could not save site content." }, { status: 500 });
  }
}
