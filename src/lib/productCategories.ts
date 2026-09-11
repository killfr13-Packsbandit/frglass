import "server-only";

import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import { products as legacyProducts } from "../app/products";
import { categoryIdFromName, type ProductCategory, type ProductRecord } from "../app/productTypes";

const CATEGORY_PREFIX = "cms/products/categories/";
const PENDANT_CATEGORY: ProductCategory = {
  id: "pendants",
  name: "Pendants",
  nameDe: "Anhänger",
  visible: true,
};

export function isCategoryStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeCategories(categories: ProductCategory[]) {
  const result: ProductCategory[] = [];
  let hasPendants = false;

  for (const category of categories) {
    const legacyPendant =
      category.id === "jewelry" ||
      category.id === "borosilicate-glass-jewelry" ||
      category.id === "borosilicate-glass-pendant" ||
      category.name === "Jewelry" ||
      category.nameDe === "Schmuck" ||
      category.name === "Borosilicate Glass Jewelry" ||
      category.nameDe === "Borosilikatglas-Schmuck" ||
      category.name === "Borosilicate Glass Pendant" ||
      category.nameDe === "Borosilikatglas-Anhänger";

    if (legacyPendant) {
      if (!hasPendants) result.push(PENDANT_CATEGORY);
      hasPendants = true;
      continue;
    }

    if (category.id === PENDANT_CATEGORY.id) hasPendants = true;
    result.push(category);
  }

  if (!hasPendants) result.unshift(PENDANT_CATEGORY);
  return result;
}

function fallbackCategories(): ProductCategory[] {
  const seen = new Set<string>();
  const categories: ProductCategory[] = [];

  for (const product of legacyProducts as unknown as ProductRecord[]) {
    const id = product.categoryId || categoryIdFromName(product.category) || "jewelry";
    if (seen.has(id)) continue;
    seen.add(id);
    categories.push({
      id,
      name: product.category || "Jewelry",
      nameDe: product.categoryDe || product.category || "Schmuck",
      visible: true,
    });
  }

  return normalizeCategories(categories);
}

async function categoryBlobs() {
  const result = await list({ prefix: CATEGORY_PREFIX, limit: 1000 });
  return result.blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  if (!isCategoryStorageConfigured()) return fallbackCategories();

  try {
    const blobs = await categoryBlobs();
    const latest = blobs[0];
    if (!latest) return fallbackCategories();

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) return fallbackCategories();
    const data = (await response.json()) as unknown;
    return Array.isArray(data)
      ? normalizeCategories(data as ProductCategory[])
      : fallbackCategories();
  } catch (error) {
    console.error("Could not load product categories", error);
    return fallbackCategories();
  }
}

export async function saveProductCategories(categories: ProductCategory[]) {
  if (!isCategoryStorageConfigured()) {
    throw new Error("Vercel Blob is not configured yet.");
  }

  const nextCategories = normalizeCategories(categories);
  const previous = await categoryBlobs();
  await put(
    `${CATEGORY_PREFIX}${Date.now()}-${randomUUID()}.json`,
    JSON.stringify(nextCategories),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    },
  );

  if (previous.length) await del(previous.map((blob) => blob.url));
  return nextCategories;
}
