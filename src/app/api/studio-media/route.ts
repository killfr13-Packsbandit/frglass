import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/adminAuth";
import {
  getStudioMediaCatalog,
  isStudioMediaStorageConfigured,
  isStudioMediaUrl,
  saveStudioMediaCatalog,
} from "../../../lib/studioMediaCatalog";
import type { MediaFit, MediaPosition, StudioMediaItem } from "../../studioMediaTypes";

export const dynamic = "force-dynamic";

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function numberInRange(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function validMediaUrl(value: string) {
  return value.startsWith("/") || isStudioMediaUrl(value);
}

function normalizeItem(value: unknown): StudioMediaItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const mediaUrl = text(raw.mediaUrl, 2000);
  if (!mediaUrl || !validMediaUrl(mediaUrl)) return null;

  const contentType = text(raw.contentType, 120).toLowerCase();
  const rawType = text(raw.mediaType, 20);
  const mediaType: "image" | "video" =
    rawType === "video" || contentType.startsWith("video/") ? "video" : "image";
  const createdAtText = text(raw.createdAt, 80);
  const createdAt = Number.isNaN(Date.parse(createdAtText))
    ? new Date().toISOString()
    : createdAtText;
  const rawFit = text(raw.fit, 20);
  const fit: MediaFit = rawFit === "contain" ? "contain" : "cover";
  const rawPosition = text(raw.position, 20);
  const position: MediaPosition = ["top", "bottom", "left", "right"].includes(rawPosition)
    ? (rawPosition as MediaPosition)
    : "center";
  const zoom = numberInRange(raw.zoom, 0.5, 2.5, 1);
  const focusX = numberInRange(raw.focusX, 0, 100, 50);
  const focusY = numberInRange(raw.focusY, 0, 100, 50);

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
    zoom,
    focusX,
    focusY,
  };
}

export async function GET() {
  const items = await getStudioMediaCatalog();
  return NextResponse.json(
    { items, configured: isStudioMediaStorageConfigured() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (!isStudioMediaStorageConfigured()) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { items?: unknown }
    | null;
  if (!Array.isArray(body?.items) || body.items.length > 100) {
    return NextResponse.json({ error: "Invalid media list." }, { status: 400 });
  }

  const items = body.items
    .map(normalizeItem)
    .filter((item): item is StudioMediaItem => Boolean(item));
  if (items.length !== body.items.length) {
    return NextResponse.json({ error: "Invalid media item." }, { status: 400 });
  }

  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "Media IDs must be unique." }, { status: 400 });
  }

  try {
    await saveStudioMediaCatalog(items);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("Could not save studio media", error);
    return NextResponse.json({ error: "Could not save studio media." }, { status: 500 });
  }
}
