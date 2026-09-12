import "server-only";

import { NextResponse } from "next/server";
import { isAdmin } from "./adminAuth";
import { mediaBucket, mediaUrlForKey } from "./r2Storage";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function safeName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "image.webp";
}

export async function handleR2ImageUpload(request: Request, prefix: string) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image received." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed." },
        { status: 415 },
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum is 8 MB after compression." },
        { status: 413 },
      );
    }

    const key = `${prefix}${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}`;
    await mediaBucket().put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    return NextResponse.json({ url: mediaUrlForKey(key) });
  } catch (error) {
    console.error("R2 upload failed", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
