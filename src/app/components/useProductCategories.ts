"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductCategory } from "../productTypes";

const fallback: ProductCategory[] = [
  { id: "jewelry", name: "Jewelry", nameDe: "Schmuck", visible: true },
];

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>(fallback);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/product-categories", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { categories?: ProductCategory[] };
      if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  return { categories, loading, refresh };
}
