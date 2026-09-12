import "server-only";

import { products as legacyProducts } from "../app/products";
import type { ProductRecord } from "../app/productTypes";
import { isR2Configured, mediaBucket, mediaKeyFromUrl, readJson, writeJson } from "./r2Storage";

const CATALOG_KEY = "cms/products/catalog.json";
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
  return isR2Configured();
}

export function isProductMediaUrl(value: string) {
  return Boolean(mediaKeyFromUrl(value));
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

export async function getProductCatalog(): Promise<ProductRecord[]> {
  if (!isProductStorageConfigured()) return fallbackCatalog();

  try {
    const data = await readJson<unknown>(CATALOG_KEY);
    return Array.isArray(data)
      ? (data as ProductRecord[]).map(withProductDefaults)
      : fallbackCatalog();
  } catch (error) {
    console.error("Could not load product catalog", error);
    return fallbackCatalog();
  }
}

function mediaKeys(products: ProductRecord[]) {
  return new Set(
    products
      .flatMap((product) => product.images)
      .map(mediaKeyFromUrl)
      .filter((key): key is string => Boolean(key)),
  );
}

export async function saveProductCatalog(products: ProductRecord[]) {
  if (!isProductStorageConfigured()) {
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  const previousProducts = await getProductCatalog();
  const previousMedia = mediaKeys(previousProducts);
  const nextProducts = products.map(withProductDefaults);
  const nextMedia = mediaKeys(nextProducts);

  await writeJson(CATALOG_KEY, nextProducts);

  const removedMedia = [...previousMedia].filter((key) => !nextMedia.has(key));
  if (removedMedia.length) {
    await mediaBucket().delete(removedMedia);
  }

  return nextProducts;
}
