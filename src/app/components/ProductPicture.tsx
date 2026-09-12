"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function ProductPicture({
  src,
  alt,
  sizes,
  className = "object-contain",
  priority = false,
}: Props) {
  if (!src) return null;

  const isRemote = /^https:\/\//i.test(src);
  const isR2Media = src.startsWith("/api/media/");

  // R2 uploads are already resized/compressed to WebP in the admin. Serving them
  // directly avoids an unnecessary second image-transformation request and keeps
  // Cloudflare usage predictable.
  if (isRemote || isR2Media) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 block h-full w-full ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
