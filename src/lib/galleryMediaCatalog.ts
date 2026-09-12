import "server-only";

import {
  DEFAULT_GALLERY_MEDIA,
  type GalleryMediaItem,
} from "../app/galleryMediaTypes";
import { getSiteContent } from "./siteContentCatalog";
import { isR2Configured, mediaBucket, mediaKeyFromUrl, readJson, writeJson } from "./r2Storage";

const CATALOG_KEY = "cms/gallery/catalog.json";

export function isGalleryMediaStorageConfigured() {
  return isR2Configured();
}

export function isGalleryMediaUrl(value: string) {
  return Boolean(mediaKeyFromUrl(value));
}

function isLegacySiteMediaUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.includes("/site/media/")
    );
  } catch {
    return false;
  }
}

export function isAllowedGalleryMediaUrl(value: string) {
  return value.startsWith("/") || isGalleryMediaUrl(value) || isLegacySiteMediaUrl(value);
}

async function fallbackCatalog(): Promise<GalleryMediaItem[]> {
  if (!isGalleryMediaStorageConfigured()) {
    return DEFAULT_GALLERY_MEDIA.map((item) => ({ ...item }));
  }

  try {
    const siteContent = await getSiteContent();
    return DEFAULT_GALLERY_MEDIA.map((item, index) => {
      const number = index + 1;
      const mediaUrl = siteContent[`gallery.media${number}.url`] || item.mediaUrl;
      const rawType = siteContent[`gallery.media${number}.type`] || item.mediaType;
      const mediaType: "image" | "video" = rawType === "video" ? "video" : "image";
      return {
        ...item,
        mediaUrl,
        mediaType,
      };
    }).filter((item) => item.mediaUrl);
  } catch {
    return DEFAULT_GALLERY_MEDIA.map((item) => ({ ...item }));
  }
}

export async function getGalleryMediaCatalog(): Promise<GalleryMediaItem[]> {
  if (!isGalleryMediaStorageConfigured()) return fallbackCatalog();

  try {
    const data = await readJson<unknown>(CATALOG_KEY);
    return Array.isArray(data) ? (data as GalleryMediaItem[]) : fallbackCatalog();
  } catch (error) {
    console.error("Could not load gallery media catalog", error);
    return fallbackCatalog();
  }
}

function remoteMediaKeys(items: GalleryMediaItem[]) {
  return new Set(
    items
      .map((item) => mediaKeyFromUrl(item.mediaUrl))
      .filter((key): key is string => Boolean(key)),
  );
}

export async function saveGalleryMediaCatalog(items: GalleryMediaItem[]) {
  if (!isGalleryMediaStorageConfigured()) {
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  const previousItems = await getGalleryMediaCatalog();
  const previousMedia = remoteMediaKeys(previousItems);
  const nextMedia = remoteMediaKeys(items);

  await writeJson(CATALOG_KEY, items);

  const removedMedia = [...previousMedia].filter((key) => !nextMedia.has(key));
  if (removedMedia.length) {
    await mediaBucket().delete(removedMedia);
  }

  return items;
}
