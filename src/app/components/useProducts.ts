"use client";

import { useCallback, useEffect, useState } from "react";
import { products as fallbackProducts } from "../products";
import type { ProductRecord } from "../productTypes";

const initialProducts = fallbackProducts as unknown as ProductRecord[];

export function useProducts() {
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { products?: ProductRecord[] };
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
