import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/adminAuth";
import { isR2Configured, mediaBucket, mediaKeyFromUrl, readJson, writeJson } from "../../../../lib/r2Storage";

export const dynamic = "force-dynamic";

const CATALOG_KEY = "community/reviews/catalog.json";
const MEDIA_PREFIX = "community/media/";
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

type ReviewCatalog = { pending: CommunityReview[]; approved: CommunityReview[] };

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
  const result = await mediaBucket().list({ prefix, limit: MAX_SUBMISSIONS_PER_DAY + 1 });
  if (result.objects.length >= MAX_SUBMISSIONS_PER_DAY) throw new Error("Submission limit reached for today.");
  await mediaBucket().put(`${prefix}${Date.now()}-${randomUUID()}.txt`, "1", {
    httpMetadata: { contentType: "text/plain", cacheControl: "no-store" },
  });
}

function validMediaUrl(value: string) {
  if (!value) return true;
  const key = mediaKeyFromUrl(value);
  return Boolean(key && key.startsWith(MEDIA_PREFIX));
}

async function readCatalog(): Promise<ReviewCatalog> {
  return (await readJson<ReviewCatalog>(CATALOG_KEY)) ?? { pending: [], approved: [] };
}

function withRecordUrl(review: CommunityReview) {
  return { ...review, recordUrl: `community/reviews/${review.status}/${review.id}` };
}

function parseRecordUrl(value: string) {
  const match = /^community\/reviews\/(pending|approved)\/([a-zA-Z0-9-]+)$/.exec(value);
  return match ? { status: match[1] as "pending" | "approved", id: match[2] } : null;
}

export async function GET(request: Request) {
  if (!isR2Configured()) return NextResponse.json({ reviews: [], pending: [], configured: false });
  try {
    const catalog = await readCatalog();
    const sortByNewest = (items: CommunityReview[]) => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(withRecordUrl);
    const url = new URL(request.url);
    if (url.searchParams.get("admin") === "1") {
      if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
      return NextResponse.json({ reviews: sortByNewest(catalog.approved), pending: sortByNewest(catalog.pending), configured: true });
    }
    return NextResponse.json({ reviews: sortByNewest(catalog.approved), configured: true });
  } catch (error) {
    console.error("Could not load community reviews", error);
    return NextResponse.json({ reviews: [], configured: true }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isR2Configured()) return NextResponse.json({ error: "Cloudflare R2 is not configured yet." }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { name?: unknown; rating?: unknown; text?: unknown; mediaUrl?: unknown; contentType?: unknown; consent?: unknown } | null;
  const name = cleanText(body?.name, 60);
  const text = cleanText(body?.text, 700);
  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  const contentType = cleanText(body?.contentType, 120).toLowerCase();
  const rating = Number(body?.rating);

  if (!name || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Please enter your name and rating." }, { status: 400 });
  if (body?.consent !== true) return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  if (!validMediaUrl(mediaUrl)) return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });

  try {
    await reserveSubmissionSlot(request);
    const review: CommunityReview = {
      id: randomUUID(), name, rating, text,
      mediaUrl: mediaUrl || undefined,
      contentType: mediaUrl ? contentType || "image/webp" : undefined,
      createdAt: new Date().toISOString(), status: "pending",
    };
    const catalog = await readCatalog();
    catalog.pending = [review, ...catalog.pending].slice(0, 500);
    await writeJson(CATALOG_KEY, catalog);
    return NextResponse.json({ ok: true, review: withRecordUrl(review) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { recordUrl?: unknown; action?: unknown } | null;
  const parsed = parseRecordUrl(cleanText(body?.recordUrl, 2000));
  if (body?.action !== "approve" || !parsed || parsed.status !== "pending") return NextResponse.json({ error: "Invalid review." }, { status: 400 });

  try {
    const catalog = await readCatalog();
    const index = catalog.pending.findIndex((review) => review.id === parsed.id);
    if (index < 0) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    const [pending] = catalog.pending.splice(index, 1);
    const approved: CommunityReview = { ...pending, status: "approved" };
    catalog.approved = [approved, ...catalog.approved].slice(0, 500);
    await writeJson(CATALOG_KEY, catalog);
    return NextResponse.json({ review: withRecordUrl(approved) });
  } catch (error) {
    console.error("Could not approve community review", error);
    return NextResponse.json({ error: "Could not approve review." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { recordUrl?: unknown; mediaUrl?: unknown } | null;
  const parsed = parseRecordUrl(cleanText(body?.recordUrl, 2000));
  const mediaUrl = cleanText(body?.mediaUrl, 2000);
  if (!parsed || !validMediaUrl(mediaUrl)) return NextResponse.json({ error: "Invalid review." }, { status: 400 });

  try {
    const catalog = await readCatalog();
    const source = parsed.status === "pending" ? catalog.pending : catalog.approved;
    const target = source.find((review) => review.id === parsed.id);
    if (parsed.status === "pending") catalog.pending = source.filter((review) => review.id !== parsed.id);
    else catalog.approved = source.filter((review) => review.id !== parsed.id);
    await writeJson(CATALOG_KEY, catalog);
    const mediaKey = mediaKeyFromUrl(mediaUrl || target?.mediaUrl || "");
    if (mediaKey?.startsWith(MEDIA_PREFIX)) await mediaBucket().delete(mediaKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete community review", error);
    return NextResponse.json({ error: "Could not delete review." }, { status: 500 });
  }
}
