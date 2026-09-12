import "server-only";

import { env } from "cloudflare:workers";

interface R2ObjectBody {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
}

interface R2BucketBinding {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  delete(key: string | string[]): Promise<void>;
}

type FrglassEnv = { FRGLASS_MEDIA?: R2BucketBinding };

export function mediaBucket() {
  const bucket = (env as unknown as FrglassEnv).FRGLASS_MEDIA;
  if (!bucket) throw new Error("Cloudflare R2 binding FRGLASS_MEDIA is not configured.");
  return bucket;
}

export function isR2Configured() {
  return Boolean((env as unknown as FrglassEnv).FRGLASS_MEDIA);
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
