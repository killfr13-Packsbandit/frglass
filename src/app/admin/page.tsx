"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Session = { authenticated: boolean; authConfigured: boolean };

function Card({ href, icon, title, text, accent = false }: { href: string; icon: string; title: string; text: string; accent?: boolean }) {
  return <Link href={href} className={`rounded-3xl border p-6 transition sm:p-7 ${accent ? "border-orange-300/30 bg-orange-300/[0.07] hover:border-orange-300/60 hover:bg-orange-300/[0.11]" : "border-white/10 bg-white/[0.04] hover:border-orange-300/35 hover:bg-white/[0.06]"}`}>
    <span className="text-3xl" aria-hidden="true">{icon}</span><h2 className="mt-5 text-xl font-black uppercase">{title}</h2><p className="mt-2 text-sm leading-6 text-neutral-400">{text}</p>
  </Link>;
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshSession() { const response = await fetch("/api/admin/session", { cache: "no-store" }); setSession((await response.json()) as Session); }
  useEffect(() => { refreshSession().catch(() => setSession({ authenticated: false, authConfigured: false })); }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (!response.ok) { setError("Passwort stimmt nicht."); return; }
      setPassword(""); await refreshSession();
    } catch { setError("Login konnte nicht geladen werden."); } finally { setLoading(false); }
  }

  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); await refreshSession(); }

  return <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-8 sm:py-28"><section className="mx-auto max-w-5xl">
    <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS</p><h1 className="mt-4 text-4xl font-black uppercase sm:text-6xl">Admin</h1>
    {session === null && <p className="mt-8 text-neutral-500">Laden …</p>}
    {session && !session.authenticated && <form onSubmit={login} className="mt-10 max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"><h2 className="text-xl font-black">Login</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Verwaltung für Produkte, Website-Inhalte, Medien und Bewertungen.</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Passwort" required className="mt-6 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" />{error && <p className="mt-3 text-sm text-red-300">{error}</p>}<button type="submit" disabled={loading} className="mt-5 w-full rounded-full bg-white px-5 py-3 font-black uppercase tracking-wider text-black disabled:opacity-50">{loading ? "Login …" : "Einloggen"}</button></form>}
    {session?.authenticated && <div className="mt-10"><p className="max-w-2xl leading-7 text-neutral-400">Die Bereiche, die du für die Website wirklich brauchst.</p><div className="mt-8 grid gap-5 sm:grid-cols-2">
      <Card href="/admin/products" icon="◆" title="Produkte" text="Zuerst Kategorie wählen, danach die passenden Stücke anlegen und bearbeiten." accent />
      <Card href="/admin/pages" icon="✎" title="Website-Inhalte" text="Texte und feste Bilder der Startseite, Über-mich-Seite, Studio-Seite, Shop- und Galerie-Einleitung." />
      <Card href="/admin/gallery" icon="▧" title="Bilder & Videos" text="Galerie und Studio-Medien verwalten." />
      <Card href="/admin/community" icon="★" title="Bewertungen" text="Community-Bewertungen ansehen, freigeben und löschen." />
    </div><button onClick={logout} className="mt-8 text-sm text-neutral-500 transition hover:text-white">Ausloggen</button></div>}
  </section></main>;
}
