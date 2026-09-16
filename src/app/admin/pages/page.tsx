"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import ImageFocusEditor from "../ImageFocusEditor";
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
type TextField = { kind: "text" | "textarea"; key: string; label: string; language: EditorLanguage; section: string };
type MediaField = { kind: "media"; key: string; typeKey: string; label: string; section: string };
type Field = TextField | MediaField;
type Placement = { value: string; label: string };
type PageDefinition = {
  id: FlexibleTextPage;
  label: string;
  description: string;
  fields: Field[];
  placements: Placement[];
  mediaManager?: "studio" | "gallery";
};

const MAX_BLOCKS = 30;

const localized = (base: string, label: string, section: string, kind: "text" | "textarea" = "text"): Field[] => [
  { kind, key: `${base}.de`, label, language: "de", section },
  { kind, key: `${base}.en`, label, language: "en", section },
];

const media = (base: string, label: string, section: string): MediaField => ({
  kind: "media",
  key: `${base}.url`,
  typeKey: `${base}.type`,
  label,
  section,
});

const pages: PageDefinition[] = [
  {
    id: "home",
    label: "Startseite",
    description: "Feste Inhalte der Startseite bearbeiten. Unten kannst du mit + Inhalt zusätzliche Texte, Bilder oder Videos anlegen und an eine passende Stelle setzen.",
    placements: [
      { value: "afterHero", label: "Nach dem Headerbild" },
      { value: "afterProducts", label: "Nach den Produkten" },
      { value: "afterWorkshop", label: "Nach der Werkstatt" },
      { value: "bottom", label: "Ganz unten" },
    ],
    fields: [
      ...localized("home.hero.subtitle", "Untertitel", "Hero"),
      ...localized("home.hero.text", "Einleitung", "Hero", "textarea"),
      ...localized("home.hero.tag1", "Begriff 1", "Hero"),
      ...localized("home.hero.tag2", "Begriff 2", "Hero"),
      ...localized("home.hero.tag3", "Begriff 3", "Hero"),
      ...localized("home.hero.cta", "Button", "Hero"),
      media("home.hero.media", "Hero Bild / Video", "Hero"),

      ...localized("home.workshop.eyebrow", "Kleine Überschrift", "Werkstatt"),
      ...localized("home.workshop.title", "Überschrift", "Werkstatt"),
      ...localized("home.workshop.text", "Text 1", "Werkstatt", "textarea"),
      ...localized("home.workshop.text2", "Text 2", "Werkstatt", "textarea"),
      ...localized("home.workshop.button", "Button zur Werkstatt", "Werkstatt"),
      media("home.workshop.main", "Großes Bild / Video", "Werkstatt"),
      media("home.workshop.media1", "Kleines Medium 1", "Werkstatt"),
      media("home.workshop.media2", "Kleines Medium 2", "Werkstatt"),

      ...localized("home.studio.title", "Zwischenüberschrift", "Werkstatt – Arbeitsplatz"),
      ...localized("home.studio.text", "Text", "Werkstatt – Arbeitsplatz", "textarea"),

      ...localized("home.reviews.eyebrow", "Kleine Überschrift", "Bewertungen"),
      ...localized("home.reviews.title", "Überschrift", "Bewertungen"),
      ...localized("home.reviews.button", "Button", "Bewertungen"),
    ],
  },
  {
    id: "about",
    label: "Über mich",
    description: "Biografie und das große Bild bzw. Video. Zusätzliche Inhalte kannst du direkt unten ergänzen.",
    placements: [
      { value: "beforeBiography", label: "Vor der Biografie" },
      { value: "afterBiography", label: "Nach der Biografie" },
    ],
    fields: [
      ...localized("about.eyebrow", "Kleine Überschrift", "Kopfbereich"),
      ...localized("about.p1", "Absatz 1", "Biografie", "textarea"),
      ...localized("about.p2", "Absatz 2", "Biografie", "textarea"),
      ...localized("about.p3", "Absatz 3", "Biografie", "textarea"),
      ...localized("about.p4", "Absatz 4", "Biografie", "textarea"),
      media("about.media", "Bild / Video", "Medien"),
    ],
  },
  {
    id: "studio",
    label: "Studio",
    description: "Alle sichtbaren Studio-Texte. Zusätzliche Inhalte lassen sich direkt zwischen den einzelnen Bereichen einfügen.",
    mediaManager: "studio",
    placements: [
      { value: "beforeStudio", label: "Ganz oben vor dem Studio" },
      { value: "afterIntro", label: "Nach Einleitung & großem Bild" },
      { value: "afterMaterial", label: "Nach „Warum Borosilikatglas?“" },
      { value: "afterProcess", label: "Nach „Am Brenner“" },
      { value: "beforePlans", label: "Vor Werkstattzeit & Workshops" },
      { value: "afterPlans", label: "Nach Werkstattzeit & Workshops" },
      { value: "beforeContact", label: "Vor dem Kontaktbereich" },
      { value: "afterStudio", label: "Ganz unten nach dem Studio" },
    ],
    fields: [
      ...localized("studio.eyebrow", "Kleine Überschrift", "Einleitung"),
      ...localized("studio.title", "Hauptüberschrift", "Einleitung"),
      ...localized("studio.intro", "Einleitungstext", "Einleitung", "textarea"),

      ...localized("studio.material.eyebrow", "Kleine Überschrift", "Material"),
      ...localized("studio.material.title", "Überschrift", "Material"),
      ...localized("studio.material.text1", "Text 1", "Material", "textarea"),
      ...localized("studio.material.text2", "Text 2", "Material", "textarea"),

      ...localized("studio.process.eyebrow", "Kleine Überschrift", "Am Brenner"),
      ...localized("studio.process.title", "Überschrift", "Am Brenner"),
      ...localized("studio.process.text1", "Text 1", "Am Brenner", "textarea"),
      ...localized("studio.process.text2", "Text 2", "Am Brenner", "textarea"),

      ...localized("studio.gallery.eyebrow", "Kleine Überschrift", "Einblicke"),
      ...localized("studio.gallery.title", "Überschrift", "Einblicke"),

      ...localized("studio.plans.eyebrow", "Kleine Überschrift", "Werkstattzeit & Workshops"),
      ...localized("studio.plans.title", "Überschrift", "Werkstattzeit & Workshops"),
      ...localized("studio.plans.intro", "Einleitung", "Werkstattzeit & Workshops", "textarea"),

      ...localized("studio.card1.title", "Brennerplatz – Titel", "Angebote"),
      ...localized("studio.card1.text", "Brennerplatz – Text", "Angebote", "textarea"),
      ...localized("studio.card2.title", "Workshops – Titel", "Angebote"),
      ...localized("studio.card2.text", "Workshops – Text", "Angebote", "textarea"),
      ...localized("studio.card3.title", "Austausch – Titel", "Angebote"),
      ...localized("studio.card3.text", "Austausch – Text", "Angebote", "textarea"),
      ...localized("studio.card4.title", "Einzel-Sessions – Titel", "Angebote"),
      ...localized("studio.card4.text", "Einzel-Sessions – Text", "Angebote", "textarea"),

      ...localized("studio.vision", "Abschlusstext", "Abschluss", "textarea"),
      ...localized("studio.contact.eyebrow", "Kleine Überschrift", "Kontakt"),
      ...localized("studio.contact.title", "Überschrift", "Kontakt"),
      ...localized("studio.contact.text", "Text", "Kontakt", "textarea"),
      ...localized("studio.contact.button", "Button", "Kontakt"),
    ],
  },
  {
    id: "shop",
    label: "Shop",
    description: "Shop-Überschrift und Einleitung. Zusätzliche Inhalte kannst du direkt unten ergänzen.",
    placements: [
      { value: "beforeShop", label: "Vor dem Shop" },
      { value: "afterShop", label: "Nach den Produkten" },
    ],
    fields: [
      ...localized("shop.eyebrow", "Kleine Überschrift", "Shop-Kopf"),
      ...localized("shop.title", "Hauptüberschrift", "Shop-Kopf"),
      ...localized("shop.intro", "Einleitung", "Shop-Kopf", "textarea"),
    ],
  },
  {
    id: "gallery",
    label: "Galerie",
    description: "Überschrift und Einleitung der Galerie. Zusätzliche Inhalte kannst du direkt unten ergänzen.",
    mediaManager: "gallery",
    placements: [
      { value: "beforeGallery", label: "Vor der Galerie" },
      { value: "afterGallery", label: "Nach der Galerie" },
    ],
    fields: [
      ...localized("gallery.eyebrow", "Kleine Überschrift", "Galerie-Kopf"),
      ...localized("gallery.intro", "Einleitung", "Galerie-Kopf", "textarea"),
    ],
  },
  {
    id: "contact",
    label: "Kontakt",
    description: "Texte der Kontaktseite und die Themenliste. Zusätzliche Inhalte kannst du direkt unten ergänzen.",
    placements: [
      { value: "beforeContact", label: "Vor dem Kontaktformular" },
      { value: "afterContact", label: "Nach dem Kontaktbereich" },
    ],
    fields: [
      ...localized("contact.eyebrow", "Kleine Überschrift", "Kopfbereich"),
      ...localized("contact.title", "Hauptüberschrift", "Kopfbereich"),
      ...localized("contact.intro", "Einleitung", "Kopfbereich", "textarea"),
      ...localized("contact.listTitle", "Überschrift Themenliste", "Themenliste"),
      ...localized("contact.item1", "Punkt 1", "Themenliste"),
      ...localized("contact.item2", "Punkt 2", "Themenliste"),
      ...localized("contact.item3", "Punkt 3", "Themenliste"),
      ...localized("contact.item4", "Punkt 4", "Themenliste"),
    ],
  },
];

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });
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
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
    mediaUrl: "",
    mediaType: "image",
    mediaZoom: 1,
    mediaFocusX: 50,
    mediaFocusY: 50,
  };
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<SiteContentMap>({ ...SITE_CONTENT_DEFAULTS });
  const [activePage, setActivePage] = useState<FlexibleTextPage>("home");
  const [editorLanguage, setEditorLanguage] = useState<EditorLanguage>("de");
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const definition = useMemo(() => pages.find((page) => page.id === activePage) ?? pages[0], [activePage]);
  const visibleFields = useMemo(() => definition.fields.filter((field) => field.kind === "media" || field.language === editorLanguage), [definition, editorLanguage]);
  const sections = useMemo(() => [...new Set(visibleFields.map((field) => field.section))], [visibleFields]);
  const blockKey = flexibleTextBlockKey(activePage);
  const blocks = useMemo(() => parseFlexibleTextBlocks(content[blockKey] ?? "[]"), [content, blockKey]);
  const languageSuffix = editorLanguage === "de" ? "De" : "En";

  function update(key: string, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function writeBlocks(next: FlexibleTextBlock[]) {
    setContent((current) => ({ ...current, [blockKey]: serializeFlexibleTextBlocks(next) }));
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

  async function prepareUpload(file: File, folder: string) {
    const prepared = file.type.startsWith("image/") ? await optimizeImage(file) : file;
    const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const blob = await upload(`${folder}/${Date.now()}-${safeName}`, prepared, {
      access: "public",
      handleUploadUrl: "/api/site-content/upload",
    });
    return { prepared, url: blob.url };
  }

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>, field: MediaField) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingKey(field.key);
    setError("");
    setMessage("");
    try {
      const { prepared, url } = await prepareUpload(file, "site/media");
      const keys = cropKeys(field);
      setContent((current) => ({
        ...current,
        [field.key]: url,
        [field.typeKey]: prepared.type.startsWith("video/") ? "video" : "image",
        [keys.zoom]: "1",
        [keys.x]: "50",
        [keys.y]: "50",
      }));
    } catch {
      setError("Upload hat nicht geklappt.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function uploadBlockMedia(event: ChangeEvent<HTMLInputElement>, block: FlexibleTextBlock) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const uploadKey = `block:${block.id}`;
    setUploadingKey(uploadKey);
    setError("");
    setMessage("");
    try {
      const { prepared, url } = await prepareUpload(file, "site/content");
      patchBlock(block.id, {
        mediaUrl: url,
        mediaType: prepared.type.startsWith("video/") ? "video" : "image",
        mediaZoom: 1,
        mediaFocusX: 50,
        mediaFocusY: 50,
      });
    } catch {
      setError("Bild oder Video konnte nicht hochgeladen werden.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await response.json().catch(() => null)) as { content?: SiteContentMap; error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
      if (data?.content) setContent(data.content);
      setMessage("Gespeichert ✓ Die Änderung ist direkt auf der Website aktiv.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  if (session === null) return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  if (!session.authenticated) return <main className="min-h-screen bg-black px-5 py-28 text-white"><section className="mx-auto max-w-4xl"><h1 className="text-4xl font-black uppercase">Website-Inhalte</h1><p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p><Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link></section></main>;

  const managerHref = definition.mediaManager === "studio" ? "/admin/studio" : definition.mediaManager === "gallery" ? "/admin/gallery" : "";
  const managerLabel = definition.mediaManager === "studio" ? "Studio-Medien verwalten" : definition.mediaManager === "gallery" ? "Galerie-Medien verwalten" : "";

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <form onSubmit={save} className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase sm:text-6xl">Website-Inhalte</h1>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-400">Seite auswählen, bestehende Inhalte ändern oder unten mit + Inhalt einen eigenen Abschnitt aus Text, Bild, Video oder einer Kombination davon hinzufügen.</p>
          </div>
          <button type="submit" disabled={saving || Boolean(uploadingKey)} className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50">{saving ? "Speichert …" : "Speichern"}</button>
        </div>

        {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pages.map((page) => (
              <button key={page.id} type="button" onClick={() => setActivePage(page.id)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${activePage === page.id ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300"}`}>{page.label}</button>
            ))}
          </div>
          <div className="flex w-fit items-center rounded-full border border-white/15 bg-black/40 p-1 text-xs font-bold">
            <button type="button" onClick={() => setEditorLanguage("de")} className={`rounded-full px-4 py-2 ${editorLanguage === "de" ? "bg-white text-black" : "text-neutral-400"}`}>DE</button>
            <button type="button" onClick={() => setEditorLanguage("en")} className={`rounded-full px-4 py-2 ${editorLanguage === "en" ? "bg-white text-black" : "text-neutral-400"}`}>EN</button>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase sm:text-3xl">{definition.label}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">{definition.description}</p>
            </div>
            {managerHref && <Link href={managerHref} className="inline-flex shrink-0 rounded-full border border-orange-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-300">{managerLabel}</Link>}
          </div>

          <div className="mt-8 space-y-6">
            {sections.map((section) => {
              const workshopLayout = activePage === "home" && section === "Werkstatt";
              return (
                <div key={section} className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">{section}</h3>
                  {workshopLayout && <p className="mt-2 text-xs leading-5 text-neutral-500">Die drei Medien sind hier wie auf der Startseite angeordnet: großes Medium links, zwei kleine rechts.</p>}
                  <div className={`mt-5 grid gap-5 ${workshopLayout ? "grid-cols-[1.12fr_.88fr] gap-3 sm:gap-5" : "sm:grid-cols-2"}`}>
                    {visibleFields.filter((field) => field.section === section).map((field) => {
                      if (field.kind === "media") {
                        const url = content[field.key] ?? "";
                        const mediaType = content[field.typeKey] ?? "image";
                        const keys = cropKeys(field);
                        const zoom = numberValue(content[keys.zoom], 1);
                        const focusX = numberValue(content[keys.x], 50);
                        const focusY = numberValue(content[keys.y], 50);
                        const workshopMain = workshopLayout && field.key.includes("workshop.main");
                        const workshopSmall = workshopLayout && field.key.includes("workshop.media");
                        const layoutClass = workshopMain ? "row-span-2 col-span-1" : workshopSmall ? "col-span-1" : "sm:col-span-2";
                        return (
                          <div key={field.key} className={`rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 ${layoutClass}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div><p className="font-bold">{field.label}</p><p className="mt-1 text-xs text-neutral-500">Medium antippen/ziehen für den Ausschnitt. Max. 100 MB.</p></div>
                              <label className="cursor-pointer rounded-full border border-orange-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-orange-300">{uploadingKey === field.key ? "Upload …" : url ? "Ersetzen" : "Hochladen"}<input type="file" accept="image/*,video/*" onChange={(event) => uploadMedia(event, field)} disabled={Boolean(uploadingKey)} className="hidden" /></label>
                            </div>
                            {url ? (
                              <div className="mt-4">
                                <ImageFocusEditor src={url} mediaType={mediaType === "video" ? "video" : "image"} zoom={zoom} focusX={focusX} focusY={focusY} aspectClass={aspectFor(field.key)} onChange={(next) => setContent((current) => ({ ...current, ...(next.zoom !== undefined ? { [keys.zoom]: String(next.zoom) } : {}), ...(next.focusX !== undefined ? { [keys.x]: String(next.focusX) } : {}), ...(next.focusY !== undefined ? { [keys.y]: String(next.focusY) } : {}) }))} />
                                <button type="button" onClick={() => setContent((current) => ({ ...current, [field.key]: "", [field.typeKey]: "image", [keys.zoom]: "1", [keys.x]: "50", [keys.y]: "50" }))} className="mt-3 text-xs font-bold uppercase tracking-wider text-red-300">Medium entfernen</button>
                              </div>
                            ) : <p className="mt-4 rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-neutral-600">Kein Medium gewählt.</p>}
                          </div>
                        );
                      }

                      const common = "rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60";
                      return (
                        <label key={field.key} className={`grid gap-2 ${workshopLayout || field.kind === "textarea" ? "col-span-2" : ""}`}>
                          <span className="text-sm font-bold">{field.label}</span>
                          {field.kind === "textarea" ? <textarea value={content[field.key] ?? ""} onChange={(event) => update(field.key, event.target.value)} rows={5} className={`${common} resize-y`} /> : <input value={content[field.key] ?? ""} onChange={(event) => update(field.key, event.target.value)} className={common} />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-orange-300/20 bg-orange-300/[0.035] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-300">Zusätzliche Inhalte</p>
              <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Eigene Inhalte</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">Ein Block kann nur Text, nur ein Bild/Video oder beides enthalten. Bilder lassen sich direkt hier skalieren und verschieben.</p>
            </div>
            <button type="button" disabled={blocks.length >= MAX_BLOCKS} onClick={() => writeBlocks([...blocks, newBlock(definition.placements[0].value)])} className="shrink-0 rounded-full bg-orange-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-black disabled:cursor-not-allowed disabled:opacity-30">+ Inhalt</button>
          </div>

          {blocks.length === 0 ? (
            <button type="button" onClick={() => writeBlocks([newBlock(definition.placements[0].value)])} className="mt-7 w-full rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500 transition hover:border-orange-300/50 hover:text-neutral-300">Noch kein eigener Inhalt. Hier tippen oder oben auf + Inhalt.</button>
          ) : (
            <div className="mt-7 space-y-5">
              {blocks.map((block, index) => {
                const eyebrowKey = `eyebrow${languageSuffix}` as keyof FlexibleTextBlock;
                const titleKey = `title${languageSuffix}` as keyof FlexibleTextBlock;
                const textKey = `text${languageSuffix}` as keyof FlexibleTextBlock;
                const blockUploadKey = `block:${block.id}`;
                return (
                  <article key={block.id} className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-neutral-400">Inhalt {index + 1}</span>
                        <select value={block.placement} onChange={(event) => patchBlock(block.id, { placement: event.target.value })} className="max-w-full rounded-full border border-white/15 bg-neutral-950 px-3 py-2 text-xs font-bold text-white outline-none">
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

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">Bild / Video</p>
                          <p className="mt-1 text-xs leading-5 text-neutral-500">Optional. Nach dem Upload kannst du Ausschnitt und Zoom genauso wie bei den anderen Seitenbildern einstellen.</p>
                        </div>
                        <label className="cursor-pointer rounded-full border border-orange-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-orange-300">{uploadingKey === blockUploadKey ? "Upload …" : block.mediaUrl ? "Ersetzen" : "+ Bild / Video"}<input type="file" accept="image/*,video/*" onChange={(event) => uploadBlockMedia(event, block)} disabled={Boolean(uploadingKey)} className="hidden" /></label>
                      </div>

                      {block.mediaUrl && (
                        <div className="mt-4">
                          <ImageFocusEditor
                            src={block.mediaUrl}
                            mediaType={block.mediaType}
                            zoom={block.mediaZoom}
                            focusX={block.mediaFocusX}
                            focusY={block.mediaFocusY}
                            aspectClass="aspect-[4/3] sm:aspect-[16/10]"
                            onChange={(next) => patchBlock(block.id, {
                              ...(next.zoom !== undefined ? { mediaZoom: next.zoom } : {}),
                              ...(next.focusX !== undefined ? { mediaFocusX: next.focusX } : {}),
                              ...(next.focusY !== undefined ? { mediaFocusY: next.focusY } : {}),
                            })}
                          />
                          <button type="button" onClick={() => patchBlock(block.id, { mediaUrl: "", mediaType: "image", mediaZoom: 1, mediaFocusX: 50, mediaFocusY: 50 })} className="mt-3 text-xs font-bold uppercase tracking-wider text-red-300">Medium entfernen</button>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2"><span className="text-sm font-bold">Kleine Überschrift</span><input value={String(block[eyebrowKey] ?? "")} onChange={(event) => patchBlock(block.id, { [eyebrowKey]: event.target.value } as Partial<FlexibleTextBlock>)} className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                      <label className="grid gap-2"><span className="text-sm font-bold">Überschrift</span><input value={String(block[titleKey] ?? "")} onChange={(event) => patchBlock(block.id, { [titleKey]: event.target.value } as Partial<FlexibleTextBlock>)} className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                      <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-bold">Text</span><textarea value={String(block[textKey] ?? "")} onChange={(event) => patchBlock(block.id, { [textKey]: event.target.value } as Partial<FlexibleTextBlock>)} rows={6} className="resize-y rounded-2xl border border-white/10 bg-black/60 px-4 py-3 leading-7 outline-none focus:border-orange-300/60" /></label>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="sticky bottom-4 mt-8 flex justify-end">
          <button type="submit" disabled={saving || Boolean(uploadingKey)} className="rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-black shadow-2xl shadow-black disabled:opacity-50">{saving ? "Speichert …" : "Änderungen speichern"}</button>
        </div>
      </form>
    </main>
  );
}
