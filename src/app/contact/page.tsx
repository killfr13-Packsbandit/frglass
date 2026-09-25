import ContactPageClient from "./ContactPageClient";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[]; slug?: string | string[] }>;
}) {
  const params = await searchParams;
  const product = typeof params.product === "string" ? params.product.slice(0, 160) : "";
  const slug = typeof params.slug === "string" ? params.slug.slice(0, 180) : "";

  return (
    <ContactPageClient
      productName={product || undefined}
      productSlug={slug || undefined}
    />
  );
}
