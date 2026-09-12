import "server-only";

import { products as legacyProducts } from "../app/products";
import { categoryIdFromName, type ProductCategory, type ProductRecord } from "../app/productTypes";
import { isR2Configured, readJson, writeJson } from "./r2Storage";

const CATEGORY_KEY = "cms/products/categories.json";
const PENDANT_CATEGORY: ProductCategory = {
  id: "pendants",
  name: "Pendants",
  nameDe: "Anhänger",
  visible: true,
};

export function isCategoryStorageConfigured() {
  return isR2Configured();
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

export async function getProductCategories(): Promise<ProductCategory[]> {
  if (!isCategoryStorageConfigured()) return fallbackCategories();

  try {
    const data = await readJson<unknown>(CATEGORY_KEY);
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
    throw new Error("Cloudflare R2 is not configured yet.");
  }

  const nextCategories = normalizeCategories(categories);
  await writeJson(CATEGORY_KEY, nextCategories);
  return nextCategories;
}
