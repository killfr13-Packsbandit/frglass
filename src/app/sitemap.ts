import type { MetadataRoute } from "next";
import { getProductCatalog } from "../lib/productCatalog";

const baseUrl = "https://frglass.at";

// Keep the sitemap dynamic so newly added products can appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1, frequency: "weekly" as const },
    { path: "/shop", priority: 0.95, frequency: "weekly" as const },
    { path: "/gallery", priority: 0.9, frequency: "weekly" as const },
    { path: "/about", priority: 0.8, frequency: "monthly" as const },
    { path: "/studio", priority: 0.8, frequency: "monthly" as const },
    { path: "/community", priority: 0.7, frequency: "weekly" as const },
    { path: "/contact", priority: 0.7, frequency: "monthly" as const },
    { path: "/impressum", priority: 0.2, frequency: "yearly" as const },
    { path: "/datenschutz", priority: 0.2, frequency: "yearly" as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.frequency,
    priority: route.priority,
  }));

  try {
    const products = await getProductCatalog();
    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      changeFrequency: product.status === "Available" ? ("weekly" as const) : ("monthly" as const),
      priority: product.status === "Available" ? 0.9 : 0.65,
    }));

    return [...staticEntries, ...productEntries];
  } catch (error) {
    console.error("Sitemap product catalog unavailable; serving static routes only.", error);
    return staticEntries;
  }
}
