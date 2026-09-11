import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/adminAuth";
import {
  getGalleryMediaCatalog,
  isAllowedGalleryMediaUrl,
  isGalleryMediaStorageConfigured,
  saveGalleryMediaCatalog,
} from "../../../lib/galleryMediaCatalog";
import type { GalleryMediaItem, MediaFit, MediaPosition } from "../../galleryMediaTypes";

export const dynamic = "force-dynamic";

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizeItem(value: unknown): GalleryMediaItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const mediaUrl = text(raw.mediaUrl, 2000);
  if (!mediaUrl || !isAllowedGalleryMediaUrl(mediaUrl)) return null;

  const contentType = text(raw.contentType, 120).toLowerCase();
  const rawType = text(raw.mediaType, 20);
  const mediaType: "image" | "video" =
    rawType === "video" || contentType.startsWith("video/") ? "video" : "image";
  const createdAtText = text(raw.createdAt, 80);
  const createdAt = Number.isNaN(Date.parse(createdAtText))
    ? new Date().toISOString()
    : createdAtText;
  const rawFit = text(raw.fit, 20);
  const fit: MediaFit = rawFit === "cover" ? "cover" : "contain";
  const rawPosition = text(raw.position, 20);
  const position: MediaPosition = ["top", "bottom", "left", "right"].includes(rawPosition)
    ? (rawPosition as MediaPosition)
    : "center";

  return {
    id: text(raw.id, 120) || randomUUID(),
    mediaUrl,
    mediaType,
    contentType,
    description: text(raw.description, 220),
    descriptionEn: text(raw.descriptionEn, 220),
    createdAt,
    fit,
    position,
    zoom: clampNumber(raw.zoom, 0.5, 2.5, 1),
    focusX: clampNumber(raw.focusX, 0, 100, 50),
    focusY: clampNumber(raw.focusY, 0, 100, 50),
  };
}

export async function GET() {
  const items = await getGalleryMediaCatalog();
  return NextResponse.json(
    { items, configured: isGalleryMediaStorageConfigured() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (!isGalleryMediaStorageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { items?: unknown }
    | null;
  if (!Array.isArray(body?.items) || body.items.length > 250) {
    return NextResponse.json({ error: "Invalid media list." }, { status: 400 });
  }

  const items = body.items
    .map(normalizeItem)
    .filter((item): item is GalleryMediaItem => Boolean(item));
  if (items.length !== body.items.length) {
    return NextResponse.json({ error: "Invalid media item." }, { status: 400 });
  }

  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "Media IDs must be unique." }, { status: 400 });
  }

  try {
    await saveGalleryMediaCatalog(items);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("Could not save gallery media", error);
    return NextResponse.json({ error: "Could not save gallery media." }, { status: 500 });
  }
}
