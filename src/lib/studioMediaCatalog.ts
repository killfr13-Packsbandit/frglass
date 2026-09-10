import "server-only";

import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import {
  DEFAULT_STUDIO_MEDIA,
  type StudioMediaItem,
} from "../app/studioMediaTypes";

const CATALOG_PREFIX = "cms/studio/catalog/";

export function isStudioMediaStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isStudioMediaUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.includes("/studio/media/")
    );
  } catch {
    return false;
  }
}

function fallbackCatalog(): StudioMediaItem[] {
  return DEFAULT_STUDIO_MEDIA.map((item) => ({ ...item }));
}

async function catalogBlobs() {
  const result = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
  return result.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

export async function getStudioMediaCatalog(): Promise<StudioMediaItem[]> {
  if (!isStudioMediaStorageConfigured()) return fallbackCatalog();

  try {
    const blobs = await catalogBlobs();
    const latest = blobs[0];
    if (!latest) return fallbackCatalog();

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) return fallbackCatalog();
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as StudioMediaItem[]) : fallbackCatalog();
  } catch (error) {
    console.error("Could not load studio media catalog", error);
    return fallbackCatalog();
  }
}

function remoteMediaUrls(items: StudioMediaItem[]) {
  return new Set(items.map((item) => item.mediaUrl).filter(isStudioMediaUrl));
}

export async function saveStudioMediaCatalog(items: StudioMediaItem[]) {
  if (!isStudioMediaStorageConfigured()) {
    throw new Error("Vercel Blob is not configured yet.");
  }

  const previousItems = await getStudioMediaCatalog();
  const previousMedia = remoteMediaUrls(previousItems);
  const nextMedia = remoteMediaUrls(items);
  const previousCatalogBlobs = await catalogBlobs();

  await put(
    `${CATALOG_PREFIX}${Date.now()}-${randomUUID()}.json`,
    JSON.stringify(items),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    },
  );

  if (previousCatalogBlobs.length) {
    await del(previousCatalogBlobs.map((blob) => blob.url));
  }

  const removedMedia = [...previousMedia].filter((url) => !nextMedia.has(url));
  if (removedMedia.length) {
    await del(removedMedia);
  }

  return items;
}
