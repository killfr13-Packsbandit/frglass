"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import ImageFocusEditor from "../ImageFocusEditor";
import { SITE_CONTENT_DEFAULTS, type SiteContentMap } from "../../siteContent";

type Session = { authenticated: boolean };
type EditorLanguage = "de" | "en";
type TextField = { kind: "text" | "textarea"; key: string; label: string; language: EditorLanguage; section: string };
type MediaField = { kind: "media"; key: string; typeKey: string; label: string; section: string };
type Field = TextField | MediaField;
type PageDefinition = { id: string; label: string; description: string; fields: Field[]; mediaManager?: "studio" | "gallery" };

const localized = (base: string, label: string, section: string, kind: "text" | "textarea" = "text"): Field[] => [
  { kind, key: `${base}.de`, label, language: "de", section },
  { kind, key: `${base}.en`, label, language: "en", section },
];
const media = (base: string, label: string, section: string): MediaField => ({ kind: "media", key: `${base}.url`, typeKey: `${base}.type`, label, section });

const pages: PageDefinition[] = [
  { id: "home", label: "Startseite", description: "Die sichtbaren Inhalte deiner Startseite, nach Bereichen sortiert.", fields: [
    ...localized("home.hero.subtitle", "Untertitel", "Hero"), ...localized("home.hero.text", "Einleitung", "Hero", "textarea"), ...localized("home.hero.cta", "Button", "Hero"), media("home.hero.media", "Hero Bild / Video", "Hero"),
    ...localized("home.jewelry.eyebrow", "Kleine Überschrift", "Anhänger"), ...localized("home.jewelry.title", "Überschrift", "Anhänger"), ...localized("home.jewelry.intro", "Kurztext", "Anhänger", "textarea"),
    ...localized("home.workshop.eyebrow", "Kleine Überschrift", "Werkstatt"), ...localized("home.workshop.title", "Überschrift", "Werkstatt"), ...localized("home.workshop.text", "Text", "Werkstatt", "textarea"), media("home.workshop.main", "Großes Bild / Video", "Werkstatt"), media("home.workshop.media1", "Kleines Medium 1", "Werkstatt"), media("home.workshop.media2", "Kleines Medium 2", "Werkstatt"),
    ...localized("home.reviews.eyebrow", "Kleine Überschrift", "Bewertungen"), ...localized("home.reviews.title", "Überschrift", "Bewertungen"), ...localized("home.reviews.button", "Button", "Bewertungen"),
    ...localized("home.studio.eyebrow", "Kleine Überschrift", "Studio-Teaser"), ...localized("home.studio.title", "Überschrift", "Studio-Teaser"), ...localized("home.studio.text", "Text", "Studio-Teaser", "textarea"), ...localized("home.studio.button", "Button", "Studio-Teaser",), media("home.studio.media", "Bild / Video", "Studio-Teaser"),
  ]},
  { id: "about", label: "Über mich", description: "Biografie und das große Bild bzw. Video auf der Über-mich-Seite.", fields: [
    ...localized("about.eyebrow", "Kleine Überschrift", "Kopfbereich"), ...localized("about.p1", "Absatz 1", "Biografie", "textarea"), ...localized("about.p2", "Absatz 2", "Biografie", "textarea"), ...localized("about.p3", "Absatz 3", "Biografie", "textarea"), ...localized("about.p4", "Absatz 4", "Biografie", "textarea"), media("about.media", "Bild / Video", "Medien"),
  ]},
  { id: "studio", label: "Studio", description: "Texte der Studio-Seite. Die freie Foto-/Video-Galerie liegt im separaten Medieneditor.", mediaManager: "studio", fields: [
    ...localized("studio.eyebrow", "Kleine Überschrift", "Einleitung"), ...localized("studio.title", "Hauptüberschrift", "Einleitung"), ...localized("studio.intro", "Einleitungstext", "Einleitung", "textarea"),
    ...localized("studio.card1.title", "Karte 1 Titel", "Angebote"), ...localized("studio.card1.text", "Karte 1 Text", "Angebote", "textarea"), ...localized("studio.card2.title", "Karte 2 Titel", "Angebote"), ...localized("studio.card2.text", "Karte 2 Text", "Angebote", "textarea"), ...localized("studio.card3.title", "Karte 3 Titel", "Angebote"), ...localized("studio.card3.text", "Karte 3 Text", "Angebote", "textarea"), ...localized("studio.card4.title", "Karte 4 Titel", "Angebote"), ...localized("studio.card4.text", "Karte 4 Text", "Angebote", "textarea"),
    ...localized("studio.vision", "Abschlusstext", "Abschluss", "textarea"), ...localized("studio.contact.eyebrow", "Kleine Überschrift", "Kontakt"), ...localized("studio.contact.title", "Überschrift", "Kontakt"), ...localized("studio.contact.text", "Text", "Kontakt", "textarea"), ...localized("studio.contact.button", "Button", "Kontakt"),
  ]},
  { id: "shop", label: "Shop", description: "Nur die allgemeine Shop-Überschrift und Einleitung. Anhänger bearbeitest du unter Produkte.", fields: [...localized("shop.eyebrow", "Kleine Überschrift", "Shop-Kopf"), ...localized("shop.title", "Hauptüberschrift", "Shop-Kopf"), ...localized("shop.intro", "Einleitung", "Shop-Kopf", "textarea")] },
  { id: "gallery", label: "Galerie", description: "Nur Überschrift und Einleitung. Bilder und Videos liegen im separaten Galerie-Editor.", mediaManager: "gallery", fields: [...localized("gallery.eyebrow", "Kleine Überschrift", "Galerie-Kopf"), ...localized("gallery.intro", "Einleitung", "Galerie-Kopf", "textarea")] },
];

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = objectUrl; });
    const maxEdge = 2000;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "site-image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally { URL.revokeObjectURL(objectUrl); }
}

function cropKeys(field: MediaField) {
  const base = field.key.replace(/\.url$/, "");
  return { zoom: `${base}.zoom`, x: `${base}.focusX`, y: `${base}.focusY` };
}
function numberValue(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function aspectFor(key: string) {
  if (key.startsWith("about.")) return "aspect-[3/4]";
  if (key.includes("workshop.main")) return "h-[390px] sm:h-[560px] xl:h-[480px]";
  if (key.includes("workshop.media")) return "h-[190px] sm:h-[270px] xl:h-[230px]";
  if (key.includes("hero.media")) return "aspect-[4/3] sm:aspect-[16/10]";
  return "aspect-[4/3]";
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<SiteContentMap>({ ...SITE_CONTENT_DEFAULTS });
  const [activePage, setActivePage] = useState("home");
  const [editorLanguage, setEditorLanguage] = useState<EditorLanguage>("de");
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
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
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Website-Inhalte konnten nicht geladen werden."); }
  })(); }, []);

  const definition = useMemo(() => pages.find((page) => page.id === activePage) ?? pages[0], [activePage]);
  const visibleFields = useMemo(() => definition.fields.filter((field) => field.kind === "media" || field.language === editorLanguage), [definition, editorLanguage]);
  const sections = useMemo(() => [...new Set(visibleFields.map((field) => field.section))], [visibleFields]);

  function update(key: string, value: string) { setContent((current) => ({ ...current, [key]: value })); setMessage(""); }

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>, field: MediaField) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    setUploadingKey(field.key); setError(""); setMessage("");
    try {
      const prepared = file.type.startsWith("image/") ? await optimizeImage(file) : file;
      const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const blob = await upload(`site/media/${Date.now()}-${safeName}`, prepared, { access: "public", handleUploadUrl: "/api/site-content/upload" });
      const keys = cropKeys(field);
      setContent((current) => ({ ...current, [field.key]: blob.url, [field.typeKey]: prepared.type.startsWith("video/") ? "video" : "image", [keys.zoom]: "1", [keys.x]: "50", [keys.y]: "50" }));
    } catch { setError("Upload hat nicht geklappt."); } finally { setUploadingKey(null); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/site-content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = (await response.json().catch(() => null)) as { content?: SiteContentMap; error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
      if (data?.content) setContent(data.content);
      setMessage("Gespeichert ✓ Die Änderung ist direkt auf der Website aktiv.");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen."); } finally { setSaving(false); }
  }

  if (session === null) return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  if (!session.authenticated) return <main className="min-h-screen bg-black px-5 py-28 text-white"><section className="mx-auto max-w-4xl"><h1 className="text-4xl font-black uppercase">Website-Inhalte</h1><p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p><Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link></section></main>;

  const managerHref = definition.mediaManager === "studio" ? "/admin/studio" : definition.mediaManager === "gallery" ? "/admin/gallery" : "";
  const managerLabel = definition.mediaManager === "studio" ? "Studio-Medien verwalten" : definition.mediaManager === "gallery" ? "Galerie-Medien verwalten" : "";

  return <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28"><form onSubmit={save} className="mx-auto max-w-6xl">
    <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link><p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
    <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-4xl font-black uppercase sm:text-6xl">Website-Inhalte</h1><p className="mt-4 max-w-3xl leading-7 text-neutral-400">Alle Seitenbilder und Videos kannst du hier direkt im echten Ausschnitt verschieben und zoomen. Das Fadenkreuz funktioniert mit Finger oder Maus.</p></div><button type="submit" disabled={saving || Boolean(uploadingKey)} className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50">{saving ? "Speichert …" : "Speichern"}</button></div>
    {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}{error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

    <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex gap-2 overflow-x-auto pb-1">{pages.map((page) => <button key={page.id} type="button" onClick={() => setActivePage(page.id)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${activePage === page.id ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300"}`}>{page.label}</button>)}</div><div className="flex w-fit items-center rounded-full border border-white/15 bg-black/40 p-1 text-xs font-bold"><button type="button" onClick={() => setEditorLanguage("de")} className={`rounded-full px-4 py-2 ${editorLanguage === "de" ? "bg-white text-black" : "text-neutral-400"}`}>DE</button><button type="button" onClick={() => setEditorLanguage("en")} className={`rounded-full px-4 py-2 ${editorLanguage === "en" ? "bg-white text-black" : "text-neutral-400"}`}>EN</button></div></div>

    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-black uppercase sm:text-3xl">{definition.label}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">{definition.description}</p></div>{managerHref && <Link href={managerHref} className="inline-flex shrink-0 rounded-full border border-orange-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-300">{managerLabel}</Link>}</div>
      <div className="mt-8 space-y-6">{sections.map((section) => {
        const workshopLayout = activePage === "home" && section === "Werkstatt";
        return <div key={section} className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-6"><h3 className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">{section}</h3>{workshopLayout && <p className="mt-2 text-xs leading-5 text-neutral-500">Die drei Medien sind hier wie auf der Startseite angeordnet: großes Medium links, zwei kleine rechts.</p>}<div className={`mt-5 grid gap-5 ${workshopLayout ? "grid-cols-[1.12fr_.88fr] gap-3 sm:gap-5" : "sm:grid-cols-2"}`}>{visibleFields.filter((field) => field.section === section).map((field) => {
        if (field.kind === "media") {
          const url = content[field.key] ?? ""; const mediaType = content[field.typeKey] ?? "image"; const keys = cropKeys(field); const zoom = numberValue(content[keys.zoom], 1); const focusX = numberValue(content[keys.x], 50); const focusY = numberValue(content[keys.y], 50);
          const workshopMain = workshopLayout && field.key.includes("workshop.main");
          const workshopSmall = workshopLayout && field.key.includes("workshop.media");
          const layoutClass = workshopMain ? "row-span-2 col-span-1" : workshopSmall ? "col-span-1" : "sm:col-span-2";
          return <div key={field.key} className={`rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 ${layoutClass}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">{field.label}</p><p className="mt-1 text-xs text-neutral-500">Medium antippen/ziehen für den Ausschnitt. Max. 100 MB.</p></div><label className="cursor-pointer rounded-full border border-orange-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-orange-300">{uploadingKey === field.key ? "Upload …" : url ? "Ersetzen" : "Hochladen"}<input type="file" accept="image/*,video/*" onChange={(event) => uploadMedia(event, field)} disabled={Boolean(uploadingKey)} className="hidden" /></label></div>
            {url ? <div className="mt-4"><ImageFocusEditor src={url} mediaType={mediaType === "video" ? "video" : "image"} zoom={zoom} focusX={focusX} focusY={focusY} aspectClass={aspectFor(field.key)} onChange={(next) => setContent((current) => ({ ...current, ...(next.zoom !== undefined ? { [keys.zoom]: String(next.zoom) } : {}), ...(next.focusX !== undefined ? { [keys.x]: String(next.focusX) } : {}), ...(next.focusY !== undefined ? { [keys.y]: String(next.focusY) } : {}) }))} />
              <button type="button" onClick={() => setContent((current) => ({ ...current, [field.key]: "", [field.typeKey]: "image", [keys.zoom]: "1", [keys.x]: "50", [keys.y]: "50" }))} className="mt-3 text-xs font-bold uppercase tracking-wider text-red-300">Medium entfernen</button></div> : <p className="mt-4 rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-neutral-600">Kein Medium gewählt.</p>}
          </div>;
        }
        const common = "rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60";
        return <label key={field.key} className={`grid gap-2 ${workshopLayout || field.kind === "textarea" ? "col-span-2" : ""}`}><span className="text-sm font-bold">{field.label}</span>{field.kind === "textarea" ? <textarea value={content[field.key] ?? ""} onChange={(event) => update(field.key, event.target.value)} rows={5} className={`${common} resize-y`} /> : <input value={content[field.key] ?? ""} onChange={(event) => update(field.key, event.target.value)} className={common} />}</label>;
      })}</div></div>;
      })}</div>
    </section>
    <div className="sticky bottom-4 mt-8 flex justify-end"><button type="submit" disabled={saving || Boolean(uploadingKey)} className="rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-black shadow-2xl shadow-black disabled:opacity-50">{saving ? "Speichert …" : "Änderungen speichern"}</button></div>
  </form></main>;
}
