"use client";
import type { ProductCategory } from "../productTypes";
import { publicData, arrayField } from "./publicData";
import { usePublicData } from "./usePublicData";
const resource = publicData("/api/product-categories", (value) => arrayField<ProductCategory>(value, "categories"));
const empty: ProductCategory[] = [];
export function useProductCategories() {
  const { data, ...state } = usePublicData(resource);
  return { categories: data ?? empty, ...state };
}
