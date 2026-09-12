import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

interface R2ObjectBody {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
}

interface R2ListedObject {
  key: string;
}

interface R2BucketBinding {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ objects: R2ListedObject[] }>;
}

type FrglassEnv = { FRGLASS_MEDIA?: R2BucketBinding };

async function boundBucket() {
  const context = await getCloudflareContext({ async: true });
  const bucket = (context.env as unknown as FrglassEnv).FRGLASS_MEDIA;
  if (!bucket) throw new Error("Cloudflare R2 binding FRGLASS_MEDIA is not configured.");
  return bucket;
}

const lazyBucket: R2BucketBinding = {
  async get(key) {
    return (await boundBucket()).get(key);
  },
  async put(key, value, options) {
    return (await boundBucket()).put(key, value, options);
  },
  async delete(key) {
    return (await boundBucket()).delete(key);
  },
  async list(options) {
    return (await boundBucket()).list(options);
  },
};

export function mediaBucket() {
  return lazyBucket;
}

export async function isR2Configured() {
  try {
    await boundBucket();
    return true;
  } catch {
    return false;
  }
}

function pathnameFromMediaValue(value: string) {
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).pathname;
    } catch {
      return value;
    }
  }
  return value;
}

export function mediaKeyFromUrl(value: string) {
  const prefix = "/api/media/";
  const pathname = pathnameFromMediaValue(value);
  if (!pathname.startsWith(prefix)) return null;
  const rawKey = pathname.slice(prefix.length);
  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

export function mediaUrlForKey(key: string) {
  const encodedPath = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/media/${encodedPath}`;
}

export function normalizeMediaUrl(value: string) {
  if (!value) return value;
  const key = mediaKeyFromUrl(value);
  return key ? mediaUrlForKey(key) : value;
}

function normalizeStoredValue(value: unknown): unknown {
  if (typeof value === "string") return normalizeMediaUrl(value);
  if (Array.isArray(value)) return value.map(normalizeStoredValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        normalizeStoredValue(nested),
      ]),
    );
  }
  return value;
}

export async function readJson<T>(key: string): Promise<T | null> {
  const object = await mediaBucket().get(key);
  if (!object) return null;
  const parsed = JSON.parse(await object.text()) as unknown;
  return normalizeStoredValue(parsed) as T;
}

export async function writeJson(key: string, value: unknown) {
  await mediaBucket().put(key, JSON.stringify(normalizeStoredValue(value)), {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl: "no-store",
    },
  });
}
