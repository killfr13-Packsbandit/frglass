import type { MetadataRoute } from "next";
import { products } from "./products";

const baseUrl = "https://frglass.at";

export default function sitemap(): MetadataRoute.Sitemap {
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
      lastModified: new Date(),
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
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
