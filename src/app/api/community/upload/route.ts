import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isR2Configured, mediaBucket, mediaUrlForKey } from "../../../../lib/r2Storage";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_UPLOADS_PER_DAY = 10;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function dailyRatePrefix(request: Request) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.BEHIND_SCENES_ADMIN_PASSWORD || "frglass-community";
  const hash = createHash("sha256").update(`${salt}:${clientIp(request)}`).digest("hex").slice(0, 24);
  return `community/rate/v2/uploads/${day}/${hash}/`;
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "community.webp";
}

async function reserveUploadSlot(request: Request) {
  const prefix = dailyRatePrefix(request);
  const result = await mediaBucket().list({ prefix, limit: MAX_UPLOADS_PER_DAY + 1 });
  if (result.objects.length >= MAX_UPLOADS_PER_DAY) throw new Error("Upload limit reached for today.");
  await mediaBucket().put(`${prefix}${Date.now()}-${randomUUID()}.txt`, "1", {
    httpMetadata: { contentType: "text/plain", cacheControl: "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isR2Configured()) {
    return NextResponse.json({ error: "Cloudflare R2 is not configured yet." }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No image received." }, { status: 400 });
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed." }, { status: 415 });
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Image is too large." }, { status: 413 });

    await reserveUploadSlot(request);
    const key = `community/media/${Date.now()}-${randomUUID()}-${safeName(file.name)}`;
    await mediaBucket().put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    return NextResponse.json({ url: mediaUrlForKey(key) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
