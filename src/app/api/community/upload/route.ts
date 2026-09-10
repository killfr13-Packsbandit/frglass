import { createHash, randomUUID } from "node:crypto";
import { list, put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_UPLOADS_PER_DAY = 3;

function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function dailyRatePrefix(request: Request) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.BEHIND_SCENES_ADMIN_PASSWORD || "frglass-community";
  const hash = createHash("sha256")
    .update(`${salt}:${clientIp(request)}`)
    .digest("hex")
    .slice(0, 24);
  return `community/rate/uploads/${day}/${hash}/`;
}

async function reserveUploadSlot(request: Request) {
  const prefix = dailyRatePrefix(request);
  const { blobs } = await list({ prefix, limit: MAX_UPLOADS_PER_DAY + 1 });

  if (blobs.length >= MAX_UPLOADS_PER_DAY) {
    throw new Error("Upload limit reached for today.");
  }

  await put(`${prefix}${Date.now()}-${randomUUID()}.txt`, "1", {
    access: "public",
    addRandomSuffix: false,
    contentType: "text/plain",
  });
}

export async function POST(request: Request) {
  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await reserveUploadSlot(request);

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ source: "frglass-community" }),
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
