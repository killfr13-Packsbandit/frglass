"use client";
import type { ProductRecord } from "../productTypes";
import { publicData, arrayField } from "./publicData";
import { usePublicData } from "./usePublicData";
const resource = publicData("/api/products", (value) => arrayField<ProductRecord>(value, "products"));
const empty: ProductRecord[] = [];
export function useProducts() {
  const { data, ...state } = usePublicData(resource);
  return { products: data ?? empty, ...state };
}
