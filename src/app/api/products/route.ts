import { NextResponse } from "next/server";
import { isAdmin } from "../../../lib/adminAuth";
import {
  getProductCatalog,
  isProductMediaUrl,
  isProductStorageConfigured,
  saveProductCatalog,
} from "../../../lib/productCatalog";
import type { ProductRecord } from "../../productTypes";
import { productStatusDe } from "../../productTypes";

export const dynamic = "force-dynamic";

function text(value: unknown, maxLength = 4000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function normalizePrice(value: unknown) {
  const price = text(value, 40).replace(/^€\s*/, "").trim();
  return price ? `€${price}` : "";
}

function validImage(value: string) {
  return value.startsWith("/") || isProductMediaUrl(value);
}

function normalizeProduct(value: unknown): ProductRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const name = text(raw.name, 120);
  const nameDe = text(raw.nameDe, 120) || name;
  const slug = slugify(text(raw.slug, 120) || name);
  const price = normalizePrice(raw.price);
  const status = text(raw.status, 40) || "Available";
  const suppliedImages = Array.isArray(raw.images) ? raw.images : [];
  const images = [...new Set(
    suppliedImages
      .map((item) => text(item, 2000))
      .filter((item) => item && validImage(item)),
  )].slice(0, 24);

  const explicitMain = text(raw.image, 2000);
  if (explicitMain && validImage(explicitMain)) {
    const existing = images.indexOf(explicitMain);
    if (existing > 0) {
      images.splice(existing, 1);
      images.unshift(explicitMain);
    } else if (existing === -1) {
      images.unshift(explicitMain);
    }
  }

  if (!name || !slug || !price || images.length === 0) return null;

  return {
    slug,
    name,
    nameDe,
    category: text(raw.category, 80) || "Jewelry",
    categoryDe: text(raw.categoryDe, 80) || "Schmuck",
    price,
    priceDe: normalizePrice(raw.priceDe) || price,
    status,
    statusDe: text(raw.statusDe, 60) || productStatusDe(status),
    image: images[0],
    images,
    material: text(raw.material, 160) || "Borosilicate glass",
    materialDe: text(raw.materialDe, 160) || "Borosilikatglas",
    colors: text(raw.colors, 200),
    colorsDe: text(raw.colorsDe, 200),
    size: text(raw.size, 120),
    sizeDe: text(raw.sizeDe, 120),
    year: text(raw.year, 20) || String(new Date().getFullYear()),
    description: text(raw.description, 2500),
    descriptionDe: text(raw.descriptionDe, 2500),
    story: text(raw.story, 2500),
    storyDe: text(raw.storyDe, 2500),
  };
}

export async function GET() {
  const products = await getProductCatalog();
  return NextResponse.json(
    { products, configured: isProductStorageConfigured() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (!isProductStorageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { products?: unknown }
    | null;

  if (!Array.isArray(body?.products) || body.products.length > 200) {
    return NextResponse.json({ error: "Invalid product list." }, { status: 400 });
  }

  const products = body.products
    .map(normalizeProduct)
    .filter((product): product is ProductRecord => Boolean(product));

  if (products.length !== body.products.length) {
    return NextResponse.json(
      { error: "Every product needs a name, price and at least one image." },
      { status: 400 },
    );
  }

  const slugs = products.map((product) => product.slug);
  if (new Set(slugs).size !== slugs.length) {
    return NextResponse.json({ error: "Product slugs must be unique." }, { status: 400 });
  }

  try {
    await saveProductCatalog(products);
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    console.error("Could not save product catalog", error);
    return NextResponse.json({ error: "Could not save products." }, { status: 500 });
  }
}
