import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Avoid /_next/image requests exceeding the Workers Free CPU budget.
  // Uploaded product images are already compressed in the admin; legacy assets
  // are served directly until pre-generated variants are available.
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
