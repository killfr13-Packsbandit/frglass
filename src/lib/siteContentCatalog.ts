import "server-only";

import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import type { SiteContentMap } from "../app/siteContent";

const CATALOG_PREFIX = "cms/site-content/catalog/";

export function isSiteContentStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function catalogBlobs() {
  const result = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
  return result.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

export async function getSiteContent(): Promise<SiteContentMap> {
  if (!isSiteContentStorageConfigured()) return {};

  try {
    const blobs = await catalogBlobs();
    const latest = blobs[0];
    if (!latest) return {};

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) return {};
    const data = (await response.json()) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};

    const content: SiteContentMap = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (typeof value === "string") content[key] = value;
    }
    return content;
  } catch (error) {
    console.error("Could not load site content", error);
    return {};
  }
}

export async function saveSiteContent(content: SiteContentMap) {
  if (!isSiteContentStorageConfigured()) {
    throw new Error("Vercel Blob is not configured yet.");
  }

  const previous = await catalogBlobs();

  await put(
    `${CATALOG_PREFIX}${Date.now()}-${randomUUID()}.json`,
    JSON.stringify(content),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    },
  );

  if (previous.length) {
    await del(previous.map((blob) => blob.url));
  }

  return content;
}
