"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Session = {
  authenticated: boolean;
  authConfigured: boolean;
};

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshSession() {
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    const data = (await response.json()) as Session;
    setSession(data);
  }

  useEffect(() => {
    refreshSession().catch(() => setSession({ authenticated: false, authConfigured: false }));
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Passwort stimmt nicht.");
        return;
      }
      setPassword("");
      await refreshSession();
    } catch {
      setError("Login konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    await refreshSession();
  }

  return (
    <main className="min-h-screen bg-black px-5 py-28 text-white sm:px-8">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS</p>
        <h1 className="mt-4 text-4xl font-black uppercase sm:text-6xl">Admin</h1>

        {session === null && <p className="mt-8 text-neutral-500">Laden …</p>}

        {session && !session.authenticated && (
          <form onSubmit={login} className="mt-10 max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h2 className="text-xl font-black">Login</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">Dein FRGLASS-Adminbereich für Seiten, Produkte, Kategorien, Galerie, Studio und Community-Bewertungen.</p>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Passwort" required className="mt-6 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" />
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={loading} className="mt-5 w-full rounded-full bg-white px-5 py-3 font-black uppercase tracking-wider text-black disabled:opacity-50">{loading ? "Login …" : "Einloggen"}</button>
          </form>
        )}

        {session?.authenticated && (
          <div className="mt-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/pages" className="rounded-3xl border border-orange-300/25 bg-orange-300/[0.06] p-6 transition hover:border-orange-300/55 hover:bg-orange-300/[0.1]"><span className="text-3xl">✎</span><h2 className="mt-5 text-xl font-black uppercase">Seiten</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Überschriften, Texte und feste Seitenmedien auf Startseite, Studio, Über mich, Shop und Galerie bearbeiten.</p></Link>
              <Link href="/admin/products" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-300/40 hover:bg-white/[0.06]"><span className="text-3xl">◆</span><h2 className="mt-5 text-xl font-black uppercase">Produkte</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Produkte anlegen, Preise, Texte, Bilder und Status verwalten.</p></Link>
              <Link href="/admin/categories" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-300/40 hover:bg-white/[0.06]"><span className="text-3xl">▦</span><h2 className="mt-5 text-xl font-black uppercase">Kategorien</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Shop-Unterteilungen wie Schmuck, Vasen oder Skulpturen anlegen und sortieren.</p></Link>
              <Link href="/admin/gallery" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-300/40 hover:bg-white/[0.06]"><span className="text-3xl">▧</span><h2 className="mt-5 text-xl font-black uppercase">Galerie</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Beliebig viele Galerie-Bilder und Videos hinzufügen, sortieren, beschreiben oder löschen.</p></Link>
              <Link href="/admin/studio" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-300/40 hover:bg-white/[0.06]"><span className="text-3xl">🔥</span><h2 className="mt-5 text-xl font-black uppercase">Studio-Medien</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Die Foto-/Video-Galerie auf der Studio-Seite hochladen, sortieren und kurz beschreiben.</p></Link>
              <Link href="/admin/community" className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-300/40 hover:bg-white/[0.06]"><span className="text-3xl">★</span><h2 className="mt-5 text-xl font-black uppercase">Community</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Neue Bewertungen ansehen, freigeben oder löschen.</p></Link>
            </div>
            <button onClick={logout} className="mt-8 text-sm text-neutral-500 transition hover:text-white">Ausloggen</button>
          </div>
        )}
      </section>
    </main>
  );
}
