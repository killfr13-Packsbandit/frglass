import type { Metadata } from "next";
import { products } from "../../products";

const SITE_URL = "https://frglass.at";

function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function numericPrice(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");
  const price = Number.parseFloat(normalized);
  return Number.isFinite(price) ? price.toFixed(2) : null;
}

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
      url: `/shop/${product.slug}`,
      type: "website",
      images: product.images.length > 0 ? product.images : [product.image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | FRGLASS`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) return children;

  const price = numericPrice(product.price);
  const productUrl = `${SITE_URL}/shop/${product.slug}`;
  const images = (product.images.length > 0 ? product.images : [product.image]).map(absoluteUrl);

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    alternateName: product.nameDe || undefined,
    description: product.description,
    image: images,
    url: productUrl,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "FRGLASS",
    },
    manufacturer: {
      "@type": "Person",
      name: "Florian Robatsch",
    },
    material: product.material || "Borosilicate glass",
    color: product.colors || undefined,
    productionDate: product.year || undefined,
    category: product.category || undefined,
    additionalProperty: [
      product.size
        ? {
            "@type": "PropertyValue",
            name: "Size",
            value: product.size,
          }
        : null,
      {
        "@type": "PropertyValue",
        name: "Technique",
        value: "Lampworking",
      },
    ].filter(Boolean),
  };

  if (price && product.status !== "Gallery only") {
    structuredData.offers = {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price,
      availability:
        product.status === "Available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Person",
        name: "Florian Robatsch",
      },
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
