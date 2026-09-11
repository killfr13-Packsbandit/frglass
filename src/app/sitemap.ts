import type { MetadataRoute } from "next";
import { getProductCatalog } from "../lib/productCatalog";

const baseUrl = "https://frglass.at";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductCatalog();
  const staticRoutes = [
    { path: "", priority: 1, frequency: "weekly" as const },
    { path: "/shop", priority: 0.95, frequency: "weekly" as const },
    { path: "/gallery", priority: 0.9, frequency: "weekly" as const },
    { path: "/about", priority: 0.8, frequency: "monthly" as const },
    { path: "/studio", priority: 0.8, frequency: "monthly" as const },
    { path: "/journal", priority: 0.75, frequency: "monthly" as const },
    { path: "/journal/behind-the-scenes", priority: 0.7, frequency: "monthly" as const },
    { path: "/community", priority: 0.7, frequency: "weekly" as const },
    { path: "/contact", priority: 0.7, frequency: "monthly" as const },
    { path: "/impressum", priority: 0.2, frequency: "yearly" as const },
    { path: "/datenschutz", priority: 0.2, frequency: "yearly" as const },
  ];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route.path}`, changeFrequency: route.frequency, priority: route.priority })),
    ...products.map((product) => ({ url: `${baseUrl}/shop/${product.slug}`, changeFrequency: product.status === "Available" ? ("weekly" as const) : ("monthly" as const), priority: product.status === "Available" ? 0.9 : 0.65 })),
  ];
}
