import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Avoid /_next/image requests exceeding the Workers Free CPU budget.
  // Uploads are compressed in the admin. Static images are compressed in the
  // deployment assets by scripts/optimize-web-images.mjs, not at request time.
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.frglass.at",
          },
        ],
        destination: "https://frglass.at/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
