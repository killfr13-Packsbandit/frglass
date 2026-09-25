"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  mediaUrl?: string;
  createdAt: string;
  status: "pending" | "approved";
  recordUrl?: string;
};

function ReviewCard({
  review,
  pendingReview,
  busy,
  onApprove,
  onRemove,
}: {
  review: Review;
  pendingReview: boolean;
  busy: string;
  onApprove: (review: Review) => void;
  onRemove: (review: Review) => void;
}) {
  const actionRunning = Boolean(busy);
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      {review.mediaUrl && (
        <div className="aspect-[4/3] overflow-hidden bg-neutral-950">
          <img src={review.mediaUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-black">{review.name}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {new Date(review.createdAt).toLocaleString("de-AT")}
            </p>
          </div>
          <span className="text-orange-300">
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </span>
        </div>
        {review.text && (
          <p className="mt-4 whitespace-pre-wrap leading-7 text-neutral-300">{review.text}</p>
        )}
        <div className="mt-5 flex gap-3">
          {pendingReview && (
            <button
              onClick={() => onApprove(review)}
              disabled={actionRunning}
              className="rounded-full bg-white px-4 py-2 text-sm font-black text-black disabled:opacity-50"
            >
              {busy === review.id ? "Freigabe …" : "Freigeben"}
            </button>
          )}
          <button
            onClick={() => onRemove(review)}
            disabled={actionRunning}
            className="rounded-full border border-red-400/25 px-4 py-2 text-sm font-bold text-red-300 disabled:opacity-50"
          >
            {busy === review.id ? "Bitte warten …" : "Löschen"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Page() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [pending, setPending] = useState<Review[]>([]);
  const [approved, setApproved] = useState<Review[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
    if (!sessionResponse.ok) throw new Error("Admin-Session konnte nicht geladen werden.");
    const session = await sessionResponse.json();
    setAuthenticated(Boolean(session.authenticated));
    if (!session.authenticated) return;

    const response = await fetch("/api/community/reviews?admin=1", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "Bewertungen konnten nicht geladen werden.");
    setPending(Array.isArray(data?.pending) ? data.pending : []);
    setApproved(Array.isArray(data?.reviews) ? data.reviews : []);
  }

  useEffect(() => {
    // Fetching the remote moderation state is the synchronization purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Bewertungen konnten nicht geladen werden.");
      setAuthenticated(false);
    });
  }, []);

  async function approve(review: Review) {
    if (!review.recordUrl || busy) return;
    setBusy(review.id);
    setError("");
    try {
      const response = await fetch("/api/community/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", recordUrl: review.recordUrl }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Freigeben fehlgeschlagen.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Freigeben fehlgeschlagen.");
    } finally {
      setBusy("");
    }
  }

  async function remove(review: Review) {
    if (!review.recordUrl || busy) return;
    if (!window.confirm("Diesen Beitrag wirklich löschen?")) return;
    setBusy(review.id);
    setError("");
    try {
      const response = await fetch("/api/community/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordUrl: review.recordUrl, mediaUrl: review.mediaUrl ?? "" }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Löschen fehlgeschlagen.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Löschen fehlgeschlagen.");
    } finally {
      setBusy("");
    }
  }

  if (authenticated === null) {
    return <main className="min-h-screen bg-black px-5 py-28 text-neutral-500">Laden …</main>;
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black uppercase">Community Reviews</h1>
          {error && <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <p className="mt-5 text-neutral-400">Du bist nicht eingeloggt.</p>
          <Link href="/admin" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-bold text-black">Zum Admin-Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-24 text-white sm:px-8 sm:py-28">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link href="/admin" className="text-sm text-neutral-500 hover:text-white">← Admin</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">Moderation</p>
            <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">Community Reviews</h1>
          </div>
          <Link href="/community" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold hover:border-orange-300/40">Öffentliche Seite</Link>
        </div>

        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="mt-12">
          <h2 className="text-2xl font-black uppercase">Wartet auf Freigabe <span className="text-orange-300">{pending.length}</span></h2>
          {pending.length === 0 ? (
            <p className="mt-5 text-neutral-500">Gerade nichts offen.</p>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pending.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  pendingReview
                  busy={busy}
                  onApprove={approve}
                  onRemove={remove}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 border-t border-white/10 pt-12">
          <h2 className="text-2xl font-black uppercase">Veröffentlicht <span className="text-neutral-500">{approved.length}</span></h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {approved.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                pendingReview={false}
                busy={busy}
                onApprove={approve}
                onRemove={remove}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
