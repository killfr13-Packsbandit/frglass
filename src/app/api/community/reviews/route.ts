import { createHash, randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/adminAuth";

export const dynamic = "force-dynamic";

const PENDING_PREFIX = "community/reviews/pending/";
const APPROVED_PREFIX = "community/reviews/approved/";
const MAX_SUBMISSIONS_PER_DAY = 10;

export type CommunityReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  mediaUrl?: string;
  contentType?: string;
  createdAt: string;
  status: "pending" | "approved";
  recordUrl?: string;
};

function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function dailyRatePrefix(request: Request) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.BEHIND_SCENES_ADMIN_PASSWORD || "frglass-community";
  const hash = createHash("sha256").update(`${salt}:${clientIp(request)}`).digest("hex").slice(0, 24);
  return `community/rate/v2/submissions/${day}/${hash}/`;
}

async function reserveSubmissionSlot(request: Request) {
  const prefix = dailyRatePrefix(request);
  const { blobs } = await list({ prefix, limit: MAX_SUBMISSIONS_PER_DAY + 1 });
  if (blobs.length >= MAX_SUBMISSIONS_PER_DAY) throw new Error("Submission limit reached for today.");
  await put(`${prefix}${Date.now()}-${randomUUID()}.txt`, "1", { access: "public", addRandomSuffix: false, contentType: "text/plain" });
}

function isCommunityMediaUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com") && url.pathname.includes("/community/media/");
  } catch {
    return false;
  }
}

function isReviewRecordUrl(value: string, pendingOnly = false) {
  try {
    const url = new URL(value);
    const validHost = url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
    const validPath = pendingOnly ? url.pathname.includes(`/${PENDING_PREFIX}`) : url.pathname.includes(`/${PENDING_PREFIX}`) || url.pathname.includes(`/${APPROVED_PREFIX}`);
    return validHost && validPath;
  } catch {
    return false;
  }
}

async function readReview(recordUrl: string): Promise<CommunityReview | null> {
  try {
    const response = await fetch(recordUrl, { cache: "no-store" });
    if (!response.ok) return null;
    const review = (await response.json()) as CommunityReview;
    if (!review?.id || !review?.name || !review?.createdAt) return null;
    return { ...review, text: typeof review.text === "string" ? review.text : "", recordUrl };
  } catch {
    return null;
  }
}

async function readPrefix(prefix: string) {
  const { blobs } = await list({ prefix, limit: 1000 });
  return (await Promise.all(blobs.map((blob) => readReview(blob.url))))
    .filter((review): review is CommunityReview => Boolean(review))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function GET(request: Request) {
  if (!storageConfigured()) return NextResponse.json({ reviews: [], pending: [], configured: false });
  try {
    const url = new URL(request.url);
    const wantsAdmin = url.searchParams.get("admin") === "1";
    if (wantsAdmin) {
      if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
      const [reviews, pending] = await Promise.all([readPrefix(APPROVED_PREFIX), readPrefix(PENDING_PREFIX)]);
      return NextResponse.json({ reviews, pending, configured: true });
    }
    const reviews = await readPrefix(APPROVED_PREFIX);
    return NextResponse.json({ reviews, configured: true });
  } catch (error) {
    console.error("Could not load community reviews", error);
    return NextResponse.json({ reviews: [], configured: true }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!storageConfigured()) return NextResponse.json({ error: "Vercel Blob is not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { name?: unknown; rating?: unknown; text?: unknown; mediaUrl?: unknown; contentType?: unknown; consent?: unknown } | null;
  const name = cleanText(body?.name, 60);
  const text = cleanText(body?.text, 700);
  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  const contentType = cleanText(body?.contentType, 120).toLowerCase();
  const rating = Number(body?.rating);

  if (!name || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Please enter your name and rating." }, { status: 400 });
  if (body?.consent !== true) return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  if (mediaUrl && !isCommunityMediaUrl(mediaUrl)) return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });

  try {
    await reserveSubmissionSlot(request);
    const review: CommunityReview = { id: randomUUID(), name, rating, text, mediaUrl: mediaUrl || undefined, contentType: mediaUrl ? contentType || "image/webp" : undefined, createdAt: new Date().toISOString(), status: "pending" };
    const record = await put(`${PENDING_PREFIX}${Date.now()}-${review.id}.json`, JSON.stringify(review), { access: "public", addRandomSuffix: false, contentType: "application/json" });
    return NextResponse.json({ ok: true, review: { ...review, recordUrl: record.url } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { recordUrl?: unknown; action?: unknown } | null;
  const recordUrl = cleanText(body?.recordUrl, 2000);
  if (body?.action !== "approve" || !isReviewRecordUrl(recordUrl, true)) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  const review = await readReview(recordUrl);
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  const approved: CommunityReview = { ...review, status: "approved" };
  delete approved.recordUrl;
  try {
    const record = await put(`${APPROVED_PREFIX}${Date.now()}-${approved.id}.json`, JSON.stringify(approved), { access: "public", addRandomSuffix: false, contentType: "application/json" });
    await del(recordUrl);
    return NextResponse.json({ review: { ...approved, recordUrl: record.url } });
  } catch (error) {
    console.error("Could not approve community review", error);
    return NextResponse.json({ error: "Could not approve review." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { recordUrl?: unknown; mediaUrl?: unknown } | null;
  const recordUrl = cleanText(body?.recordUrl, 2000);
  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  if (!isReviewRecordUrl(recordUrl) || (mediaUrl && !isCommunityMediaUrl(mediaUrl))) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  try {
    await del(mediaUrl ? [recordUrl, mediaUrl] : [recordUrl]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete community review", error);
    return NextResponse.json({ error: "Could not delete review." }, { status: 500 });
  }
}
