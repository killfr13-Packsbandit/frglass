"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Session = { authenticated: boolean };

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  productName: string;
  productSlug: string;
  language: "de" | "en";
  createdAt: string;
  emailDelivered: boolean;
  handled: boolean;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function replyHref(inquiry: Inquiry) {
  const subject = inquiry.productName
    ? `Re: FRGLASS Anfrage – ${inquiry.productName}`
    : "Re: FRGLASS Anfrage";
  const greeting = inquiry.language === "de" ? `Hallo ${inquiry.name},` : `Hi ${inquiry.name},`;
  const body = `${greeting}\n\n\n\n—\nFRGLASS`;
  return `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
    const sessionData = (await sessionResponse.json()) as Session;
    setSession(sessionData);
    if (!sessionData.authenticated) return;

    const response = await fetch("/api/inquiries", { cache: "no-store" });
    const data = (await response.json().catch(() => null)) as
      | { inquiries?: Inquiry[]; emailConfigured?: boolean; error?: string }
      | null;
    if (!response.ok) throw new Error(data?.error || "Anfragen konnten nicht geladen werden.");
    setItems(Array.isArray(data?.inquiries) ? data.inquiries : []);
    setEmailConfigured(Boolean(data?.emailConfigured));
  }

  useEffect(() => {
    load()
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Anfragen konnten nicht geladen werden."),
      )
      .finally(() => setLoading(false));
  }, []);

  const open = useMemo(() => items.filter((item) => !item.handled), [items]);
  const handled = useMemo(() => items.filter((item) => item.handled), [items]);

  async function setHandled(inquiry: Inquiry, nextHandled: boolean) {
    setBusy(inquiry.id);
    setError("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiry.id, handled: nextHandled }),
      });
      if (!response.ok) throw new Error("Änderung konnte nicht gespeichert werden.");
      setItems((current) =>
        current.map((item) =>
          item.id === inquiry.id ? { ...item, handled: nextHandled } : item,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Änderung fehlgeschlagen.");
    } finally {
      setBusy("");
    }
  }

  async function remove(inquiry: Inquiry) {
    if (!window.confirm(`Anfrage von ${inquiry.name} wirklich löschen?`)) return;
    setBusy(inquiry.id);
    setError("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiry.id }),
      });
      if (!response.ok) throw new Error("Anfrage konnte nicht gelöscht werden.");
      setItems((current) => current.filter((item) => item.id !== inquiry.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Löschen fehlgeschlagen.");
    } finally {
      setBusy("");
    }
  }

  function Card({ inquiry }: { inquiry: Inquiry }) {
    return (
      <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">
              {inquiry.productName || "Allgemeine Anfrage"}
            </p>
            <h2 className="mt-2 text-xl font-black">{inquiry.name}</h2>
            <a href={`mailto:${inquiry.email}`} className="mt-1 block text-sm text-neutral-400 hover:text-white">
              {inquiry.email}
            </a>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">{dateLabel(inquiry.createdAt)}</p>
            <p className={`mt-2 text-xs font-bold ${inquiry.emailDelivered ? "text-emerald-300" : "text-orange-200"}`}>
              {inquiry.emailDelivered ? "E-Mail zugestellt" : "Im Admin gespeichert"}
            </p>
          </div>
        </div>

        <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/40 p-4 leading-7 text-neutral-200">
          {inquiry.message}
        </p>

        {inquiry.productSlug && (
          <Link
            href={`/shop/${inquiry.productSlug}`}
            className="mt-4 inline-block text-sm font-bold text-orange-300 hover:underline"
          >
            Produkt ansehen →
          </Link>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={replyHref(inquiry)}
            className="rounded-full bg-white px-4 py-2 text-sm font-black text-black"
          >
            Antworten
          </a>
          <button
            type="button"
            onClick={() => setHandled(inquiry, !inquiry.handled)}
            disabled={busy === inquiry.id}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-neutral-300 disabled:opacity-50"
          >
            {inquiry.handled ? "Wieder öffnen" : "Erledigt"}
          </button>
          <button
            type="button"
            onClick={() => remove(inquiry)}
            disabled={busy === inquiry.id}
            className="rounded-full border border-red-400/25 px-4 py-2 text-sm font-bold text-red-300 disabled:opacity-50"
          >
            Löschen
          </button>
        </div>
      </article>
    );
  }

  if (loading) {
    return <main className="min-h-screen bg-black px-5 py-28 text-neutral-500">Laden …</main>;
  }

  if (!session?.authenticated) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <section className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black uppercase">Anfragen</h1>
          <p className="mt-5 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p>
          <Link href="/admin" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-bold text-black">
            Zum Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <section className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-neutral-500 hover:text-white">← Admin</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase sm:text-6xl">Anfragen</h1>
            <p className="mt-4 max-w-2xl leading-7 text-neutral-400">
              Jede Website-Anfrage wird hier gespeichert. Du kannst direkt per E-Mail antworten und sie danach als erledigt markieren.
            </p>
          </div>
          <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-400">
            {emailConfigured ? "E-Mail-Benachrichtigung aktiv" : "E-Mail-Benachrichtigung noch nicht verbunden"}
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-10">
          <h2 className="text-2xl font-black uppercase">Offen <span className="text-orange-300">{open.length}</span></h2>
          {open.length ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">{open.map((item) => <Card key={item.id} inquiry={item} />)}</div>
          ) : (
            <p className="mt-4 text-neutral-500">Gerade keine offenen Anfragen.</p>
          )}
        </div>

        {handled.length > 0 && (
          <div className="mt-14 border-t border-white/10 pt-10">
            <h2 className="text-2xl font-black uppercase">Erledigt <span className="text-neutral-500">{handled.length}</span></h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">{handled.map((item) => <Card key={item.id} inquiry={item} />)}</div>
          </div>
        )}
      </section>
    </main>
  );
}
