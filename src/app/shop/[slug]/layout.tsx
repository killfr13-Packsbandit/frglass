import type { Metadata } from "next";
import { products } from "../../products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Piece not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} | FRGLASS`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
