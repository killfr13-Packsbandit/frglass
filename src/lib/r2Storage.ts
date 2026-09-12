import "server-only";

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

let bucketPromise: Promise<R2BucketBinding> | null = null;

async function boundBucket() {
  if (!bucketPromise) {
    bucketPromise = import("cloudflare:workers").then((runtime) => {
      const bucket = (runtime.env as unknown as FrglassEnv).FRGLASS_MEDIA;
      if (!bucket) throw new Error("Cloudflare R2 binding FRGLASS_MEDIA is not configured.");
      return bucket;
    });
  }
  return bucketPromise;
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

export function isR2Configured() {
  return true;
}

export async function readJson<T>(key: string): Promise<T | null> {
  const object = await mediaBucket().get(key);
  if (!object) return null;
  return JSON.parse(await object.text()) as T;
}

export async function writeJson(key: string, value: unknown) {
  await mediaBucket().put(key, JSON.stringify(value), {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl: "no-store",
    },
  });
}

export function mediaKeyFromUrl(value: string) {
  const prefix = "/api/media/";
  if (!value.startsWith(prefix)) return null;
  try {
    return decodeURIComponent(value.slice(prefix.length));
  } catch {
    return null;
  }
}

export function mediaUrlForKey(key: string) {
  return `/api/media/${encodeURIComponent(key)}`;
}
