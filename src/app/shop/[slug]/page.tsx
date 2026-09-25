import { notFound } from "next/navigation";
import { getProductCatalog } from "../../../lib/productCatalog";
import ProductPageClient from "./ProductPageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProductCatalog();
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  return <ProductPageClient key={product.slug} product={product} products={products} />;
}
