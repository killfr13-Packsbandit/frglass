import "server-only";

import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import {
  DEFAULT_GALLERY_MEDIA,
  type GalleryMediaItem,
} from "../app/galleryMediaTypes";
import { getSiteContent } from "./siteContentCatalog";

const CATALOG_PREFIX = "cms/gallery/catalog/";

export function isGalleryMediaStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isGalleryMediaUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.includes("/gallery/media/")
    );
  } catch {
    return false;
  }
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
      return {
        ...item,
        mediaUrl,
        mediaType: rawType === "video" ? "video" : "image",
      };
    }).filter((item) => item.mediaUrl);
  } catch {
    return DEFAULT_GALLERY_MEDIA.map((item) => ({ ...item }));
  }
}

async function catalogBlobs() {
  const result = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
  return result.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

export async function getGalleryMediaCatalog(): Promise<GalleryMediaItem[]> {
  if (!isGalleryMediaStorageConfigured()) return fallbackCatalog();

  try {
    const blobs = await catalogBlobs();
    const latest = blobs[0];
    if (!latest) return fallbackCatalog();

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) return fallbackCatalog();
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as GalleryMediaItem[]) : fallbackCatalog();
  } catch (error) {
    console.error("Could not load gallery media catalog", error);
    return fallbackCatalog();
  }
}

function remoteMediaUrls(items: GalleryMediaItem[]) {
  return new Set(items.map((item) => item.mediaUrl).filter(isGalleryMediaUrl));
}

export async function saveGalleryMediaCatalog(items: GalleryMediaItem[]) {
  if (!isGalleryMediaStorageConfigured()) {
    throw new Error("Vercel Blob is not configured yet.");
  }

  const previousItems = await getGalleryMediaCatalog();
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
