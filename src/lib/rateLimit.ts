import "server-only";

import { createHash } from "node:crypto";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type RateLimitBinding = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

type RateLimitName = "INQUIRY_RATE_LIMITER" | "ADMIN_LOGIN_RATE_LIMITER";

type FrglassEnv = Partial<Record<RateLimitName, RateLimitBinding>>;

export function requestRateLimitKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address =
    request.headers.get("cf-connecting-ip")?.trim() ||
    forwarded ||
    request.headers.get("user-agent")?.slice(0, 160) ||
    "unknown";

  return createHash("sha256").update(address).digest("hex");
}

export async function consumeRateLimit(name: RateLimitName, key: string) {
  try {
    const context = await getCloudflareContext({ async: true });
    const limiter = (context.env as unknown as FrglassEnv)[name];
    if (!limiter) return true;
    const result = await limiter.limit({ key });
    return result.success;
  } catch (error) {
    // Keep the website usable during local development or a temporary binding issue.
    console.error(
      `Rate limiter ${name} is unavailable`,
      error instanceof Error ? error.message : "unknown error",
    );
    return true;
  }
}
