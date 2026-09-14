"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductRecord } from "../productTypes";

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
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setError(false);
    try {
      const data = await fetchProducts();
      if (Array.isArray(data.products)) setProducts(data.products);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  return { products, loading, error, refresh };
}
