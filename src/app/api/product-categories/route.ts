import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/adminAuth";
import { getProductCatalog, saveProductCatalog } from "../../../lib/productCatalog";
import { getProductCategories, isCategoryStorageConfigured, saveProductCategories } from "../../../lib/productCategories";
import { categoryIdFromName, type ProductCategory } from "../../productTypes";

export const dynamic = "force-dynamic";

function text(value: unknown, maxLength = 120) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeCategory(value: unknown): ProductCategory | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const name = text(raw.name);
  const nameDe = text(raw.nameDe) || name;
  const id = categoryIdFromName(text(raw.id, 80) || name);
  if (!name || !id) return null;
  return {
    id, name, nameDe, visible: raw.visible !== false,
    homeEyebrow: text(raw.homeEyebrow, 80), homeEyebrowDe: text(raw.homeEyebrowDe, 80),
    homeTitle: text(raw.homeTitle, 120), homeTitleDe: text(raw.homeTitleDe, 120),
    homeIntro: text(raw.homeIntro, 400), homeIntroDe: text(raw.homeIntroDe, 400),
  };
}

export async function GET() {
  const categories = await getProductCategories();
  return NextResponse.json({ categories, configured: isCategoryStorageConfigured() }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (!isCategoryStorageConfigured()) return NextResponse.json({ error: "Cloudflare R2 is not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { categories?: unknown } | null;
  if (!Array.isArray(body?.categories) || body.categories.length === 0 || body.categories.length > 30) return NextResponse.json({ error: "Invalid category list." }, { status: 400 });
  const categories = body.categories.map(normalizeCategory).filter((category): category is ProductCategory => Boolean(category));
  if (categories.length !== body.categories.length) return NextResponse.json({ error: "Every category needs a name." }, { status: 400 });
  if (new Set(categories.map((category) => category.id)).size !== categories.length) return NextResponse.json({ error: "Category names must be unique." }, { status: 400 });

  const products = await getProductCatalog();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const usedIds = products.map((product) => product.categoryId || categoryIdFromName(product.category) || "jewelry");
  const missing = usedIds.find((id) => !categoryMap.has(id));
  if (missing) return NextResponse.json({ error: "Diese Kategorie wird noch von Produkten verwendet. Weise die Produkte zuerst einer anderen Kategorie zu." }, { status: 400 });
  const updatedProducts = products.map((product) => {
    const categoryId = product.categoryId || categoryIdFromName(product.category) || "jewelry";
    const category = categoryMap.get(categoryId)!;
    return { ...product, categoryId, category: category.name, categoryDe: category.nameDe };
  });
  try {
    await saveProductCategories(categories);
    await saveProductCatalog(updatedProducts);
    return NextResponse.json({ ok: true, categories });
  } catch (error) {
    console.error("Could not save product categories", error);
    return NextResponse.json({ error: "Kategorien konnten nicht gespeichert werden." }, { status: 500 });
  }
}
