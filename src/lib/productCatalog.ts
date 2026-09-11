import "server-only";

import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import { products as legacyProducts } from "../app/products";
import type { ProductRecord } from "../app/productTypes";

const CATALOG_PREFIX = "cms/products/catalog/";
const DEFAULT_SIZE = "30 × 30 mm";
const PENDANT_CATEGORY_ID = "pendants";
const PENDANT_CATEGORY = "Pendants";
const PENDANT_CATEGORY_DE = "Anhänger";
const LEGACY_SIZE_VALUES = new Set([
  "",
  "Size details coming soon",
  "Größenangaben folgen",
]);

export function isProductStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isProductMediaUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.includes("/products/media/")
    );
  } catch {
    return false;
  }
}

function isLegacyPendantCategory(product: ProductRecord) {
  return (
    !product.categoryId ||
    product.categoryId === "jewelry" ||
    product.categoryId === "borosilicate-glass-jewelry" ||
    product.categoryId === "borosilicate-glass-pendant" ||
    product.category === "Jewelry" ||
    product.categoryDe === "Schmuck" ||
    product.category === "Borosilicate Glass Jewelry" ||
    product.categoryDe === "Borosilikatglas-Schmuck" ||
    product.category === "Borosilicate Glass Suncatcher" ||
    product.categoryDe === "Borosilikatglas-Suncatcher" ||
    product.category === "Borosilicate Glass Pendant" ||
    product.categoryDe === "Borosilikatglas-Anhänger"
  );
}

function withProductDefaults(product: ProductRecord): ProductRecord {
  const pendant = isLegacyPendantCategory(product);

  return {
    ...product,
    images: [...product.images],
    size: LEGACY_SIZE_VALUES.has(product.size?.trim?.() ?? "") ? DEFAULT_SIZE : product.size,
    sizeDe: LEGACY_SIZE_VALUES.has(product.sizeDe?.trim?.() ?? "") ? DEFAULT_SIZE : product.sizeDe,
    categoryId: pendant ? PENDANT_CATEGORY_ID : product.categoryId,
    category: pendant ? PENDANT_CATEGORY : product.category,
    categoryDe: pendant ? PENDANT_CATEGORY_DE : product.categoryDe,
  };
}

function fallbackCatalog(): ProductRecord[] {
  return (legacyProducts as unknown as ProductRecord[]).map(withProductDefaults);
}

async function catalogBlobs() {
  const result = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
  return result.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

export async function getProductCatalog(): Promise<ProductRecord[]> {
  if (!isProductStorageConfigured()) return fallbackCatalog();

  try {
    const blobs = await catalogBlobs();
    const latest = blobs[0];
    if (!latest) return fallbackCatalog();

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) return fallbackCatalog();
    const data = (await response.json()) as unknown;
    return Array.isArray(data)
      ? (data as ProductRecord[]).map(withProductDefaults)
      : fallbackCatalog();
  } catch (error) {
    console.error("Could not load product catalog", error);
    return fallbackCatalog();
  }
}

function mediaUrls(products: ProductRecord[]) {
  return new Set(
    products.flatMap((product) => product.images).filter(isProductMediaUrl),
  );
}

export async function saveProductCatalog(products: ProductRecord[]) {
  if (!isProductStorageConfigured()) {
    throw new Error("Vercel Blob is not configured yet.");
  }

  const previousProducts = await getProductCatalog();
  const previousMedia = mediaUrls(previousProducts);
  const nextProducts = products.map(withProductDefaults);
  const nextMedia = mediaUrls(nextProducts);
  const previousCatalogBlobs = await catalogBlobs();

  await put(
    `${CATALOG_PREFIX}${Date.now()}-${randomUUID()}.json`,
    JSON.stringify(nextProducts),
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

  return nextProducts;
}
