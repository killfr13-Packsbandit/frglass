import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/adminAuth";
import { isR2Configured, mediaBucket, mediaKeyFromUrl, readJson, writeJson } from "../../../../lib/r2Storage";

export const dynamic = "force-dynamic";

const CATALOG_KEY = "behind-scenes/posts/catalog.json";
const MEDIA_PREFIX = "behind-scenes/media/";

export type BehindScenesPost = {
  id: string;
  title: string;
  text: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  contentType: string;
  createdAt: string;
  recordUrl?: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidMediaUrl(value: string) {
  const key = mediaKeyFromUrl(value);
  return Boolean(key && key.startsWith(MEDIA_PREFIX));
}

async function readPosts() {
  return (await readJson<BehindScenesPost[]>(CATALOG_KEY)) ?? [];
}

function withRecordUrl(post: BehindScenesPost): BehindScenesPost {
  return { ...post, recordUrl: `behind-scenes/posts/${post.id}` };
}

export async function GET() {
  if (!isR2Configured()) {
    return NextResponse.json({ posts: [], configured: false });
  }

  try {
    const posts = (await readPosts())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(withRecordUrl);
    return NextResponse.json({ posts, configured: true });
  } catch (error) {
    console.error("Could not load behind-the-scenes posts", error);
    return NextResponse.json({ posts: [], configured: true }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json({ error: "Cloudflare R2 is not configured yet." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { title?: unknown; text?: unknown; mediaUrl?: unknown; contentType?: unknown }
    | null;
  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  const contentType = cleanText(body?.contentType, 120).toLowerCase();
  if (!isValidMediaUrl(mediaUrl)) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  const post: BehindScenesPost = {
    id: randomUUID(),
    title: cleanText(body?.title, 100),
    text: cleanText(body?.text, 700),
    mediaUrl,
    mediaType: "image",
    contentType: contentType || "image/webp",
    createdAt: new Date().toISOString(),
  };

  try {
    const posts = await readPosts();
    await writeJson(CATALOG_KEY, [post, ...posts].slice(0, 250));
    return NextResponse.json({ post: withRecordUrl(post) });
  } catch (error) {
    console.error("Could not save behind-the-scenes post", error);
    return NextResponse.json({ error: "Could not save the post." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json({ error: "Cloudflare R2 is not configured yet." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { recordUrl?: unknown; mediaUrl?: unknown }
    | null;
  const recordUrl = cleanText(body?.recordUrl, 2000);
  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  const id = recordUrl.startsWith("behind-scenes/posts/") ? recordUrl.slice("behind-scenes/posts/".length) : "";
  const mediaKey = mediaKeyFromUrl(mediaUrl);
  if (!id || !mediaKey?.startsWith(MEDIA_PREFIX)) {
    return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  }

  try {
    const posts = await readPosts();
    await writeJson(CATALOG_KEY, posts.filter((post) => post.id !== id));
    await mediaBucket().delete(mediaKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete behind-the-scenes post", error);
    return NextResponse.json({ error: "Could not delete the post." }, { status: 500 });
  }
}
