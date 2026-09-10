"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  SITE_CONTENT_DEFAULTS,
  type SiteContentMap,
} from "../../siteContent";

type Session = { authenticated: boolean };

type TextField = {
  kind: "text" | "textarea";
  key: string;
  label: string;
};

type MediaField = {
  kind: "media";
  key: string;
  typeKey: string;
  label: string;
};

type Field = TextField | MediaField;

type PageDefinition = {
  id: string;
  label: string;
  description: string;
  fields: Field[];
  studioMedia?: boolean;
};

const localized = (
  base: string,
  label: string,
  kind: "text" | "textarea" = "text",
): Field[] => [
  { kind, key: `${base}.de`, label: `${label} DE` },
  { kind, key: `${base}.en`, label: `${label} EN` },
];

const media = (base: string, label: string): MediaField => ({
  kind: "media",
  key: `${base}.url`,
  typeKey: `${base}.type`,
  label,
});

const galleryMedia: Field[] = Array.from({ length: 10 }, (_, index) =>
  media(`gallery.media${index + 1}`, `Galerie Medium ${index + 1}`),
);

const pages: PageDefinition[] = [
  {
    id: "home",
    label: "Startseite",
    description:
      "Hero, „Glas zum Tragen“, Werkstatt-Block, Reviews-Titel und Studio-Teaser.",
    fields: [
      ...localized("home.hero.subtitle", "Hero Untertitel"),
      ...localized("home.hero.text", "Hero Text", "textarea"),
      ...localized("home.hero.cta", "Hero Button"),
      media("home.hero.media", "Hero Bild / Video"),
      ...localized("home.jewelry.eyebrow", "Schmuck kleine Überschrift"),
      ...localized("home.jewelry.title", "Schmuck Hauptüberschrift"),
      ...localized("home.jewelry.intro", "Schmuck Kurztext", "textarea"),
      ...localized("home.workshop.eyebrow", "Werkstatt kleine Überschrift"),
      ...localized("home.workshop.title", "Werkstatt Überschrift"),
      ...localized("home.workshop.text", "Werkstatt Text", "textarea"),
      media("home.workshop.main", "Werkstatt großes Bild / Video"),
      media("home.workshop.media1", "Werkstatt kleines Medium 1"),
      media("home.workshop.media2", "Werkstatt kleines Medium 2"),
      ...localized("home.reviews.eyebrow", "Reviews kleine Überschrift"),
      ...localized("home.reviews.title", "Reviews Überschrift"),
      ...localized("home.reviews.button", "Reviews Button"),
      ...localized("home.studio.eyebrow", "Studio-Teaser kleine Überschrift"),
      ...localized("home.studio.title", "Studio-Teaser Überschrift"),
      ...localized("home.studio.text", "Studio-Teaser Text", "textarea"),
      ...localized("home.studio.button", "Studio-Teaser Button"),
      media("home.studio.media", "Studio-Teaser Bild / Video"),
    ],
  },
  {
    id: "studio",
    label: "Studio",
    description:
      "Alle Texte der Studio-Seite. Die sortierbare Foto-/Video-Galerie bleibt direkt daneben im Studio-Medieneditor.",
    studioMedia: true,
    fields: [
      ...localized("studio.eyebrow", "Kleine Überschrift"),
      ...localized("studio.title", "Hauptüberschrift"),
      ...localized("studio.intro", "Einleitung", "textarea"),
      ...localized("studio.card1.title", "Karte 1 Titel"),
      ...localized("studio.card1.text", "Karte 1 Text", "textarea"),
      ...localized("studio.card2.title", "Karte 2 Titel"),
      ...localized("studio.card2.text", "Karte 2 Text", "textarea"),
      ...localized("studio.card3.title", "Karte 3 Titel"),
      ...localized("studio.card3.text", "Karte 3 Text", "textarea"),
      ...localized("studio.card4.title", "Karte 4 Titel"),
      ...localized("studio.card4.text", "Karte 4 Text", "textarea"),
      ...localized("studio.vision", "Abschlusstext", "textarea"),
      ...localized("studio.contact.eyebrow", "Kontakt kleine Überschrift"),
      ...localized("studio.contact.title", "Kontakt Überschrift"),
      ...localized("studio.contact.text", "Kontakt Text", "textarea"),
      ...localized("studio.contact.button", "Kontakt Button"),
    ],
  },
  {
    id: "about",
    label: "Über mich",
    description: "Biografie und das große Bild bzw. Video auf der Über-mich-Seite.",
    fields: [
      ...localized("about.eyebrow", "Kleine Überschrift"),
      ...localized("about.p1", "Absatz 1", "textarea"),
      ...localized("about.p2", "Absatz 2", "textarea"),
      ...localized("about.p3", "Absatz 3", "textarea"),
      ...localized("about.p4", "Absatz 4", "textarea"),
      media("about.media", "Über-mich Bild / Video"),
    ],
  },
  {
    id: "shop",
    label: "Shop",
    description:
      "Überschrift und Einleitung. Produkte und Kategorien verwaltest du weiterhin in ihren eigenen Bereichen.",
    fields: [
      ...localized("shop.eyebrow", "Kleine Überschrift"),
      ...localized("shop.title", "Hauptüberschrift"),
      ...localized("shop.intro", "Einleitung", "textarea"),
    ],
  },
  {
    id: "gallery",
    label: "Galerie",
    description:
      "Galerie-Text und die zehn Medienplätze. Jeder Platz kann Bild oder Video sein.",
    fields: [
      ...localized("gallery.eyebrow", "Kleine Überschrift"),
      ...localized("gallery.intro", "Einleitung", "textarea"),
      ...galleryMedia,
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

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.88),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "site-image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<SiteContentMap>({
    ...SITE_CONTENT_DEFAULTS,
  });
  const [activePage, setActivePage] = useState("home");
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const sessionResponse = await fetch("/api/admin/session", {
          cache: "no-store",
        });
        const sessionData = (await sessionResponse.json()) as Session;
        setSession(sessionData);
        if (!sessionData.authenticated) return;

        const response = await fetch("/api/site-content", { cache: "no-store" });
        if (!response.ok) throw new Error("Seiteninhalte konnten nicht geladen werden.");
        const data = (await response.json()) as { content?: SiteContentMap };
        setContent({
          ...SITE_CONTENT_DEFAULTS,
          ...(data.content ?? {}),
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Seiteninhalte konnten nicht geladen werden.",
        );
      }
    }
    load();
  }, []);

  const definition = useMemo(
    () => pages.find((page) => page.id === activePage) ?? pages[0],
    [activePage],
  );

  function update(key: string, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function uploadMedia(
    event: ChangeEvent<HTMLInputElement>,
    field: MediaField,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingKey(field.key);
    setError("");
    setMessage("");

    try {
      const prepared = file.type.startsWith("image/")
        ? await optimizeImage(file)
        : file;
      const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const blob = await upload(
        `site/media/${Date.now()}-${safeName}`,
        prepared,
        {
          access: "public",
          handleUploadUrl: "/api/site-content/upload",
        },
      );

      update(field.key, blob.url);
      update(
        field.typeKey,
        prepared.type.startsWith("video/") ? "video" : "image",
      );
    } catch {
      setError("Upload hat nicht geklappt.");
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
      const data = (await response.json().catch(() => null)) as
        | { content?: SiteContentMap; error?: string }
        | null;
      if (!response.ok) {
        throw new Error(data?.error || "Speichern fehlgeschlagen.");
      }
      if (data?.content) setContent(data.content);
      setMessage("Gespeichert ✓ Die Änderung ist direkt auf der Website aktiv.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (session === null) {
    return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  }

  if (!session.authenticated) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <section className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black uppercase">Seiten</h1>
          <p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p>
          <Link
            href="/admin"
            className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300"
          >
            Zum Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <form onSubmit={save} className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">
          ← Admin
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">
          FRGLASS CMS
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase sm:text-6xl">Seiten bearbeiten</h1>
            <p className="mt-4 max-w-3xl leading-7 text-neutral-400">
              Texte und normale Seitenmedien ändern, ohne GitHub oder neuen Deploy.
              Layout, Navigation und rechtlich wichtige Formulartexte bleiben geschützt.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving || Boolean(uploadingKey)}
            className="rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50"
          >
            {saving ? "Speichert …" : "Alles speichern"}
          </button>
        </div>

        {message && (
          <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePage(page.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activePage === page.id
                  ? "border-orange-300 bg-orange-300 text-black"
                  : "border-white/15 text-neutral-300"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <h2 className="text-2xl font-black uppercase sm:text-3xl">{definition.label}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
            {definition.description}
          </p>

          {definition.studioMedia && (
            <Link
              href="/admin/studio"
              className="mt-5 inline-flex rounded-full border border-orange-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-300"
            >
              Studio Fotos & Videos sortieren →
            </Link>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {definition.fields.map((field) => {
              if (field.kind === "media") {
                const url = content[field.key] ?? "";
                const mediaType = content[field.typeKey] ?? "image";
                return (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:col-span-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{field.label}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          JPG/PNG/WebP/GIF oder MP4/MOV/WebM, max. 100 MB.
                        </p>
                      </div>
                      <label className="cursor-pointer rounded-full border border-orange-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-300">
                        {uploadingKey === field.key ? "Upload …" : url ? "Ersetzen" : "Hochladen"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                          onChange={(event) => uploadMedia(event, field)}
                          disabled={Boolean(uploadingKey)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {url ? (
                      <div className="mt-4">
                        <div className="overflow-hidden rounded-xl bg-neutral-950">
                          {mediaType === "video" ? (
                            <video
                              src={url}
                              controls
                              playsInline
                              className="max-h-[420px] w-full object-contain"
                            />
                          ) : (
                            <img
                              src={url}
                              alt=""
                              className="max-h-[420px] w-full object-contain"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            update(field.key, "");
                            update(field.typeKey, "image");
                          }}
                          className="mt-3 text-xs font-bold uppercase tracking-wider text-red-300"
                        >
                          Medium entfernen
                        </button>
                      </div>
                    ) : (
                      <p className="mt-4 rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-neutral-600">
                        Dieser Medienplatz ist leer.
                      </p>
                    )}
                  </div>
                );
              }

              const common =
                "rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60";

              return (
                <label
                  key={field.key}
                  className={`grid gap-2 ${field.kind === "textarea" ? "sm:col-span-2" : ""}`}
                >
                  <span className="text-sm font-bold">{field.label}</span>
                  {field.kind === "textarea" ? (
                    <textarea
                      value={content[field.key] ?? ""}
                      onChange={(event) => update(field.key, event.target.value)}
                      rows={5}
                      className={`${common} resize-y`}
                    />
                  ) : (
                    <input
                      value={content[field.key] ?? ""}
                      onChange={(event) => update(field.key, event.target.value)}
                      className={common}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </section>

        <div className="sticky bottom-4 mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving || Boolean(uploadingKey)}
            className="rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-black shadow-2xl shadow-black disabled:opacity-50"
          >
            {saving ? "Speichert …" : "Änderungen speichern"}
          </button>
        </div>
      </form>
    </main>
  );
}
