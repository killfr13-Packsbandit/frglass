"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SITE_CONTENT_DEFAULTS, type SiteContentMap } from "../../siteContent";
import {
  flexibleTextBlockKey,
  parseFlexibleTextBlocks,
  serializeFlexibleTextBlocks,
  type FlexibleTextBlock,
  type FlexibleTextPage,
} from "../../textBlocks";

type Session = { authenticated: boolean };
type EditorLanguage = "de" | "en";

type PageOption = {
  id: FlexibleTextPage;
  label: string;
  placements: { value: string; label: string }[];
};

const MAX_BLOCKS = 30;

const pages: PageOption[] = [
  { id: "home", label: "Startseite", placements: [
    { value: "afterHero", label: "Nach dem Headerbild" },
    { value: "afterProducts", label: "Nach den Produkten" },
    { value: "afterWorkshop", label: "Nach der Werkstatt" },
    { value: "bottom", label: "Ganz unten" },
  ] },
  { id: "about", label: "Über mich", placements: [
    { value: "beforeBiography", label: "Vor der Biografie" },
    { value: "afterBiography", label: "Nach der Biografie" },
  ] },
  { id: "studio", label: "Studio", placements: [
    { value: "beforeStudio", label: "Ganz oben vor dem Studio" },
    { value: "afterIntro", label: "Nach Einleitung & großem Bild" },
    { value: "afterMaterial", label: "Nach „Warum Borosilikatglas?“" },
    { value: "afterProcess", label: "Nach „Am Brenner“" },
    { value: "beforePlans", label: "Vor Werkstattzeit & Workshops" },
    { value: "afterPlans", label: "Nach Werkstattzeit & Workshops" },
    { value: "beforeContact", label: "Vor dem Kontaktbereich" },
    { value: "afterStudio", label: "Ganz unten nach dem Studio" },
  ] },
  { id: "shop", label: "Shop", placements: [
    { value: "beforeShop", label: "Vor dem Shop" },
    { value: "afterShop", label: "Nach den Produkten" },
  ] },
  { id: "gallery", label: "Galerie", placements: [
    { value: "beforeGallery", label: "Vor der Galerie" },
    { value: "afterGallery", label: "Nach der Galerie" },
  ] },
  { id: "contact", label: "Kontakt", placements: [
    { value: "beforeContact", label: "Vor dem Kontaktformular" },
    { value: "afterContact", label: "Nach dem Kontaktbereich" },
  ] },
];

function newBlock(placement: string): FlexibleTextBlock {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    placement,
    enabled: true,
    eyebrowDe: "",
    eyebrowEn: "",
    titleDe: "",
    titleEn: "",
    textDe: "",
    textEn: "",
  };
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<SiteContentMap>({ ...SITE_CONTENT_DEFAULTS });
  const [activePage, setActivePage] = useState<FlexibleTextPage>("home");
  const [editorLanguage, setEditorLanguage] = useState<EditorLanguage>("de");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { (async () => {
    try {
      const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
      const sessionData = (await sessionResponse.json()) as Session;
      setSession(sessionData);
      if (!sessionData.authenticated) return;
      const response = await fetch("/api/site-content", { cache: "no-store" });
      if (!response.ok) throw new Error("Website-Inhalte konnten nicht geladen werden.");
      const data = (await response.json()) as { content?: SiteContentMap };
      setContent({ ...SITE_CONTENT_DEFAULTS, ...(data.content ?? {}) });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Website-Inhalte konnten nicht geladen werden.");
    }
  })(); }, []);

  const definition = useMemo(() => pages.find((page) => page.id === activePage) ?? pages[0], [activePage]);
  const key = flexibleTextBlockKey(activePage);
  const blocks = useMemo(() => parseFlexibleTextBlocks(content[key] ?? "[]"), [content, key]);

  function writeBlocks(next: FlexibleTextBlock[]) {
    setContent((current) => ({ ...current, [key]: serializeFlexibleTextBlocks(next) }));
    setMessage("");
  }

  function patchBlock(id: string, patch: Partial<FlexibleTextBlock>) {
    writeBlocks(blocks.map((block) => block.id === id ? { ...block, ...patch } : block));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    writeBlocks(next);
  }

  function duplicateBlock(block: FlexibleTextBlock, index: number) {
    if (blocks.length >= MAX_BLOCKS) return;
    const duplicate = { ...block, id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    const next = [...blocks];
    next.splice(index + 1, 0, duplicate);
    writeBlocks(next);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await response.json().catch(() => null)) as { content?: SiteContentMap; error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
      if (data?.content) setContent(data.content);
      setMessage("Gespeichert ✓ Die Textblöcke sind direkt auf der Website aktiv.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  if (session === null) return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  if (!session.authenticated) return <main className="min-h-screen bg-black px-5 py-28 text-white"><section className="mx-auto max-w-4xl"><h1 className="text-4xl font-black uppercase">Freie Textblöcke</h1><p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p><Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link></section></main>;

  const languageSuffix = editorLanguage === "de" ? "De" : "En";

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <form onSubmit={save} className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase sm:text-6xl">Freie Textblöcke</h1>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-400">Zusätzliche Textbereiche anlegen, ihre Position wählen und mit den Pfeilen die Reihenfolge ändern. Bestehende feste Seitentexte bleiben im Bereich „Website-Inhalte“.</p>
          </div>
          <button type="submit" disabled={saving} className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50">{saving ? "Speichert …" : "Speichern"}</button>
        </div>

        {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">{pages.map((page) => <button key={page.id} type="button" onClick={() => setActivePage(page.id)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${activePage === page.id ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300"}`}>{page.label}</button>)}</div>
          <div className="flex w-fit items-center rounded-full border border-white/15 bg-black/40 p-1 text-xs font-bold"><button type="button" onClick={() => setEditorLanguage("de")} className={`rounded-full px-4 py-2 ${editorLanguage === "de" ? "bg-white text-black" : "text-neutral-400"}`}>DE</button><button type="button" onClick={() => setEditorLanguage("en")} className={`rounded-full px-4 py-2 ${editorLanguage === "en" ? "bg-white text-black" : "text-neutral-400"}`}>EN</button></div>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-2xl font-black uppercase sm:text-3xl">{definition.label}</h2><p className="mt-2 text-sm leading-6 text-neutral-400">Bis zu {MAX_BLOCKS} freie Textblöcke pro Seite. Auf der Studio-Seite kannst du sie auch direkt zwischen den einzelnen Bereichen einsetzen.</p></div>
            <button type="button" disabled={blocks.length >= MAX_BLOCKS} onClick={() => writeBlocks([...blocks, newBlock(definition.placements[0].value)])} className="rounded-full border border-orange-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-orange-300 disabled:cursor-not-allowed disabled:opacity-30">+ Textblock</button>
          </div>

          {blocks.length === 0 ? <p className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center text-neutral-500">Noch keine freien Textblöcke auf dieser Seite.</p> : <div className="mt-8 space-y-5">{blocks.map((block, index) => {
            const eyebrowKey = `eyebrow${languageSuffix}` as keyof FlexibleTextBlock;
            const titleKey = `title${languageSuffix}` as keyof FlexibleTextBlock;
            const textKey = `text${languageSuffix}` as keyof FlexibleTextBlock;
            return <article key={block.id} className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-neutral-400">#{index + 1}</span>
                  <select value={block.placement} onChange={(event) => patchBlock(block.id, { placement: event.target.value })} className="rounded-full border border-white/15 bg-neutral-950 px-3 py-2 text-xs font-bold text-white outline-none">
                    {definition.placements.map((placement) => <option key={placement.value} value={placement.value}>{placement.label}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-xs text-neutral-400"><input type="checkbox" checked={block.enabled} onChange={(event) => patchBlock(block.id, { enabled: event.target.checked })} /> sichtbar</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="rounded-full border border-white/15 px-3 py-2 text-xs disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="rounded-full border border-white/15 px-3 py-2 text-xs disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => duplicateBlock(block, index)} disabled={blocks.length >= MAX_BLOCKS} className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-neutral-300 disabled:opacity-30">Duplizieren</button>
                  <button type="button" onClick={() => writeBlocks(blocks.filter((item) => item.id !== block.id))} className="rounded-full border border-red-400/30 px-3 py-2 text-xs font-bold text-red-300">Löschen</button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-bold">Kleine Überschrift</span><input value={String(block[eyebrowKey] ?? "")} onChange={(event) => patchBlock(block.id, { [eyebrowKey]: event.target.value } as Partial<FlexibleTextBlock>)} className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Überschrift</span><input value={String(block[titleKey] ?? "")} onChange={(event) => patchBlock(block.id, { [titleKey]: event.target.value } as Partial<FlexibleTextBlock>)} className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-bold">Text</span><textarea value={String(block[textKey] ?? "")} onChange={(event) => patchBlock(block.id, { [textKey]: event.target.value } as Partial<FlexibleTextBlock>)} rows={6} className="resize-y rounded-2xl border border-white/10 bg-black/60 px-4 py-3 leading-7 outline-none focus:border-orange-300/60" /></label>
              </div>
            </article>;
          })}</div>}
        </section>

        <div className="sticky bottom-4 mt-8 flex justify-end"><button type="submit" disabled={saving} className="rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-black shadow-2xl shadow-black disabled:opacity-50">{saving ? "Speichert …" : "Änderungen speichern"}</button></div>
      </form>
    </main>
  );
}
