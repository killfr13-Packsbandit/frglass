import type { MetadataRoute } from "next";
import { getProductCatalog } from "../lib/productCatalog";

const baseUrl = "https://frglass.at";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductCatalog();
  const now = new Date();
  const staticRoutes = [
    "",
    "/gallery",
    "/studio",
    "/shop",
    "/journal",
    "/journal/behind-the-scenes",
    "/community",
    "/about",
    "/contact",
    "/impressum",
    "/datenschutz",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency:
        route === "" || route === "/shop" || route === "/community"
          ? ("weekly" as const)
          : ("monthly" as const),
      priority:
        route === ""
          ? 1
          : route === "/shop"
            ? 0.9
            : route === "/community"
              ? 0.8
              : route === "/impressum" || route === "/datenschutz"
                ? 0.3
                : 0.7,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: now,
      changeFrequency: product.status === "Available" ? ("weekly" as const) : ("monthly" as const),
      priority: product.status === "Available" ? 0.85 : 0.7,
    })),
  ];
}
