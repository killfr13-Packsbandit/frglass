export type ProductRecord = {
  slug: string;
  name: string;
  nameDe: string;
  categoryId?: string;
  category: string;
  categoryDe: string;
  price: string;
  priceDe: string;
  status: string;
  statusDe: string;
  image: string;
  images: string[];
  material: string;
  materialDe: string;
  colors: string;
  colorsDe: string;
  size: string;
  sizeDe: string;
  year: string;
  description: string;
  descriptionDe: string;
  story: string;
  storyDe: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  nameDe: string;
  visible: boolean;
  homeEyebrow?: string;
  homeEyebrowDe?: string;
  homeTitle?: string;
  homeTitleDe?: string;
  homeIntro?: string;
  homeIntroDe?: string;
};

export const PRODUCT_STATUS = {
  Available: "Verfügbar",
  "Gallery only": "Nur Galerie",
  Sold: "Verkauft",
} as const;

export function productStatusDe(status: string) {
  return PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] ?? status;
}

export function categoryIdFromName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function formatProductPrice(value: string) {
  const price = value.trim();
  if (!price) return "";
  return price.startsWith("€") ? price : `€${price}`;
}
