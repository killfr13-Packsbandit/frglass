"use client";

import { useCallback, useEffect, useState } from "react";
import { products as fallbackProducts } from "../products";
import type { ProductRecord } from "../productTypes";

const initialProducts = fallbackProducts as unknown as ProductRecord[];

// Coalesce simultaneous consumers, but never retain stale catalog results.
let pendingProducts: Promise<{ products?: ProductRecord[] }> | null = null;
function fetchProducts() {
  if (!pendingProducts) {
    pendingProducts = fetch("/api/products", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Products could not be loaded");
        return response.json() as Promise<{ products?: ProductRecord[] }>;
      })
      .finally(() => { pendingProducts = null; });
  }
  return pendingProducts;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchProducts();
      if (Array.isArray(data.products)) setProducts(data.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  return { products, loading, refresh };
}
