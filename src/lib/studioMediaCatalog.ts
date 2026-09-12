import "server-only";

import {
  DEFAULT_STUDIO_MEDIA,
  type StudioMediaItem,
} from "../app/studioMediaTypes";
import { isR2Configured, mediaBucket, mediaKeyFromUrl, readJson, writeJson } from "./r2Storage";

const CATALOG_KEY = "cms/studio/catalog.json";

export function isStudioMediaStorageConfigured() {
  return isR2Configured();
}

export function isStudioMediaUrl(value: string) {
  return Boolean(mediaKeyFromUrl(value));
}

function fallbackCatalog(): StudioMediaItem[] {
  return DEFAULT_STUDIO_MEDIA.map((item) => ({ ...item }));
}

export async function getStudioMediaCatalog(): Promise<StudioMediaItem[]> {
  if (!isStudioMediaStorageConfigured()) return fallbackCatalog();

  try {
    const data = await readJson<unknown>(CATALOG_KEY);
    return Array.isArray(data) ? (data as StudioMediaItem[]) : fallbackCatalog();
  } catch (error) {
    console.error("Could not load studio media catalog", error);
    return fallbackCatalog();
  }
}

function remoteMediaKeys(items: StudioMediaItem[]) {
  return new Set(
    items
      .map((item) => mediaKeyFromUrl(item.mediaUrl))
      .filter((key): key is string => Boolean(key)),
  );
}

export async function saveStudioMediaCatalog(items: StudioMediaItem[]) {
  if (!isStudioMediaStorageConfigured()) {
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  const previousItems = await getStudioMediaCatalog();
  const previousMedia = remoteMediaKeys(previousItems);
  const nextMedia = remoteMediaKeys(items);

  await writeJson(CATALOG_KEY, items);

  const removedMedia = [...previousMedia].filter((key) => !nextMedia.has(key));
  if (removedMedia.length) {
    await mediaBucket().delete(removedMedia);
  }

  return items;
}
