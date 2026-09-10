import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

const POST_PREFIX = "behind-scenes/posts/";

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

function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isBlobMediaUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.includes("/behind-scenes/media/")
    );
  } catch {
    return false;
  }
}

async function readPost(recordUrl: string): Promise<BehindScenesPost | null> {
  try {
    const response = await fetch(recordUrl, { cache: "no-store" });
    if (!response.ok) return null;

    const post = (await response.json()) as BehindScenesPost;
    if (!post?.id || !post?.mediaUrl || !post?.createdAt) return null;

    return { ...post, recordUrl };
  } catch {
    return null;
  }
}

export async function GET() {
  if (!storageConfigured()) {
    return NextResponse.json({ posts: [], configured: false });
  }

  try {
    const { blobs } = await list({ prefix: POST_PREFIX, limit: 1000 });
    const posts = (
      await Promise.all(blobs.map((blob) => readPost(blob.url)))
    )
      .filter((post): post is BehindScenesPost => Boolean(post))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

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

  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        title?: unknown;
        text?: unknown;
        mediaUrl?: unknown;
        contentType?: unknown;
      }
    | null;

  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  const contentType = cleanText(body?.contentType, 120).toLowerCase();

  if (!isBlobMediaUrl(mediaUrl)) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  const mediaType: "image" | "video" = contentType.startsWith("video/")
    ? "video"
    : "image";

  const post: BehindScenesPost = {
    id: randomUUID(),
    title: cleanText(body?.title, 100),
    text: cleanText(body?.text, 700),
    mediaUrl,
    mediaType,
    contentType,
    createdAt: new Date().toISOString(),
  };

  try {
    const record = await put(
      `${POST_PREFIX}${Date.now()}-${post.id}.json`,
      JSON.stringify(post),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      },
    );

    return NextResponse.json({ post: { ...post, recordUrl: record.url } });
  } catch (error) {
    console.error("Could not save behind-the-scenes post", error);
    return NextResponse.json({ error: "Could not save the post." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (!storageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob is not configured yet." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { recordUrl?: unknown; mediaUrl?: unknown }
    | null;
  const recordUrl = cleanText(body?.recordUrl, 2000);
  const mediaUrl = cleanText(body?.mediaUrl, 2000);

  if (!recordUrl || !mediaUrl || !isBlobMediaUrl(mediaUrl)) {
    return NextResponse.json({ error: "Invalid post." }, { status: 400 });
  }

  try {
    await Promise.all([del(recordUrl), del(mediaUrl)]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete behind-the-scenes post", error);
    return NextResponse.json({ error: "Could not delete the post." }, { status: 500 });
  }
}
