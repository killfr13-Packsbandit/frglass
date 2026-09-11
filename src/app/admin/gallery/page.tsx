"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import type { GalleryMediaItem, MediaFit, MediaPosition } from "../../galleryMediaTypes";

type Session = { authenticated: boolean };
type PreviewMode = "desktop" | "mobile";

const positions: { value: MediaPosition; label: string }[] = [
  { value: "center", label: "Mitte" },
  { value: "top", label: "Oben" },
  { value: "bottom", label: "Unten" },
  { value: "left", label: "Links" },
  { value: "right", label: "Rechts" },
];

async function optimizeImage(file: File) {
  if (file.type === "image/gif") return file;
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
    const baseName = file.name.replace(/\.[^.]+$/, "") || "gallery";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  async function loadItems() {
    const response = await fetch("/api/gallery-media", { cache: "no-store" });
    if (!response.ok) throw new Error("Galerie konnte nicht geladen werden.");
    const data = (await response.json()) as { items?: GalleryMediaItem[] };
    setItems(Array.isArray(data.items) ? data.items : []);
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await response.json()) as Session;
        setSession(data);
        if (data.authenticated) await loadItems();
      } catch {
        setError("Adminbereich konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(nextItems: GalleryMediaItem[], successMessage = "Gespeichert ✓") {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/gallery-media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: nextItems }),
      });
      const data = (await response.json().catch(() => null)) as { items?: GalleryMediaItem[]; error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
      setItems(Array.isArray(data?.items) ? data.items : nextItems);
      setDirty(false);
      setMessage(successMessage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const added: GalleryMediaItem[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const original = files[index];
        const isVideo = original.type.startsWith("video/");
        const file = isVideo ? original : await optimizeImage(original);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
        const blob = await upload(`gallery/media/${Date.now()}-${index}-${safeName}`, file, {
          access: "public",
          handleUploadUrl: "/api/gallery-media/upload",
        });
        added.push({
          id: crypto.randomUUID(),
          mediaUrl: blob.url,
          mediaType: isVideo ? "video" : "image",
          contentType: file.type,
          description: "",
          descriptionEn: "",
          createdAt: new Date().toISOString(),
          fit: "contain",
          position: "center",
        });
      }
      await persist([...added, ...items], "Hochgeladen ✓ Neue Medien stehen jetzt automatisch oben.");
    } catch {
      setError("Upload hat nicht geklappt. Videos dürfen maximal 100 MB groß sein.");
    } finally {
      setUploading(false);
    }
  }

  function updateItem(id: string, patch: Partial<GalleryMediaItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setDirty(true);
    setMessage("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setDirty(true);
    setMessage("");
  }

  async function remove(item: GalleryMediaItem) {
    if (!window.confirm("Dieses Bild/Video wirklich aus der Galerie entfernen?")) return;
    await persist(items.filter((entry) => entry.id !== item.id), "Medium entfernt.");
  }

  if (loading) return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  if (!session?.authenticated) return <main className="min-h-screen bg-black px-5 py-28 text-white"><section className="mx-auto max-w-3xl"><h1 className="text-4xl font-black uppercase">Galerie</h1><p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p><Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link></section></main>;

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
            <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">Galerie</h1>
            <p className="mt-4 max-w-2xl leading-7 text-neutral-400">Neue Bilder kommen automatisch ganz nach oben. Mit „Ganzes Bild“ wird nichts abgeschnitten, mit „Rahmen füllen“ kannst du den Ausschnitt und die Ausrichtung bestimmen.</p>
          </div>
          <label className="cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-black">
            {uploading ? "Upload …" : "+ Bild / Video"}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm" onChange={uploadMedia} disabled={uploading || saving} className="hidden" />
          </label>
        </div>

        {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {dirty && <div className="sticky top-20 z-20 mt-6 flex items-center justify-between gap-4 rounded-2xl border border-orange-300/30 bg-black/95 p-4 shadow-2xl backdrop-blur"><p className="text-sm text-neutral-300">Änderungen noch nicht gespeichert.</p><button onClick={() => persist(items)} disabled={saving} className="rounded-full bg-orange-300 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50">{saving ? "Speichert …" : "Speichern"}</button></div>}

        <section className="mt-8 overflow-hidden rounded-3xl border border-orange-300/20 bg-white/[0.035]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300">Live-Vorschau</p>
              <h2 className="mt-1 text-lg font-black">So sieht es auf der Website aus</h2>
              <p className="mt-1 text-sm text-neutral-500">Änderungen an Bildausschnitt, Reihenfolge und Beschreibung siehst du hier sofort – auch vor dem Speichern.</p>
            </div>
            <div className="flex rounded-full border border-white/10 bg-black p-1">
              <button type="button" onClick={() => setPreviewMode("desktop")} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${previewMode === "desktop" ? "bg-white text-black" : "text-neutral-400"}`}>Desktop</button>
              <button type="button" onClick={() => setPreviewMode("mobile")} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${previewMode === "mobile" ? "bg-white text-black" : "text-neutral-400"}`}>Handy</button>
            </div>
          </div>

          <div className="overflow-x-auto bg-black p-4 sm:p-6">
            <div className={`mx-auto rounded-2xl border border-white/10 bg-black px-4 py-10 transition-all sm:px-6 ${previewMode === "mobile" ? "max-w-[390px]" : "max-w-[1100px]"}`}>
              <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-6 sm:text-sm sm:tracking-[0.5em]">Galerie</p>
              <p className="mx-auto mb-10 max-w-2xl text-center text-base leading-7 text-neutral-300">Eine Auswahl an Schmuck, Objekten und Experimenten aus der Werkstatt.</p>

              <div className={previewMode === "mobile" ? "grid gap-4" : "grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"}>
                {items.map((item) => {
                  const caption = item.description || item.descriptionEn;
                  return (
                    <div key={`preview-${item.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 text-left sm:rounded-3xl">
                      <div className={`relative flex items-center justify-center p-2 sm:p-3 ${previewMode === "mobile" ? "h-[330px]" : "h-[360px] lg:h-[410px]"}`}>
                        {item.mediaType === "video" ? (
                          <>
                            <video src={item.mediaUrl} muted playsInline preload="metadata" className="h-full w-full object-contain" />
                            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Video</span>
                          </>
                        ) : (
                          <img src={item.mediaUrl} alt={caption || "Galerie-Vorschau"} className="h-full w-full p-2 sm:p-3" style={{ objectFit: item.fit ?? "contain", objectPosition: item.position ?? "center" }} />
                        )}
                      </div>
                      {caption && <p className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-neutral-400">{caption}</p>}
                    </div>
                  );
                })}
              </div>
              {items.length === 0 && <p className="py-14 text-center text-sm text-neutral-600">Noch keine Bilder in der Galerie.</p>}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {items.map((item, index) => {
            const fit: MediaFit = item.fit ?? "contain";
            const position: MediaPosition = item.position ?? "center";
            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                <div className="h-[300px] bg-neutral-950 sm:h-[380px]">
                  {item.mediaType === "video" ? <video src={item.mediaUrl} controls playsInline preload="metadata" className="h-full w-full object-contain" /> : <img src={item.mediaUrl} alt="Galerie" className="h-full w-full" style={{ objectFit: fit, objectPosition: position }} />}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">Position {index + 1}</span>
                    <div className="flex gap-2"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-full border border-white/15 px-3 py-2 text-sm disabled:opacity-25">↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="rounded-full border border-white/15 px-3 py-2 text-sm disabled:opacity-25">↓</button><button type="button" onClick={() => remove(item)} disabled={saving} className="rounded-full border border-red-400/30 px-3 py-2 text-sm text-red-300">Löschen</button></div>
                  </div>

                  {item.mediaType === "image" && <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-sm font-bold">Bilddarstellung</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => updateItem(item.id, { fit: "contain" })} className={`rounded-full border px-3 py-2 text-xs font-bold ${fit === "contain" ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300"}`}>Ganzes Bild</button><button type="button" onClick={() => updateItem(item.id, { fit: "cover" })} className={`rounded-full border px-3 py-2 text-xs font-bold ${fit === "cover" ? "border-orange-300 bg-orange-300 text-black" : "border-white/15 text-neutral-300"}`}>Rahmen füllen</button></div>{fit === "cover" && <div className="mt-4"><p className="mb-2 text-xs text-neutral-500">Ausschnitt ausrichten</p><div className="flex flex-wrap gap-2">{positions.map((entry) => <button key={entry.value} type="button" onClick={() => updateItem(item.id, { position: entry.value })} className={`rounded-full border px-3 py-2 text-xs ${position === entry.value ? "border-white bg-white text-black" : "border-white/15 text-neutral-300"}`}>{entry.label}</button>)}</div></div>}</div>}

                  <label className="mt-5 grid gap-2"><span className="text-sm font-bold">Kurze Beschreibung DE</span><textarea value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value.slice(0, 220) })} rows={2} maxLength={220} placeholder="Optional – ein kurzer Satz reicht." className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                  <label className="mt-4 grid gap-2"><span className="text-sm font-bold">Short description EN</span><textarea value={item.descriptionEn} onChange={(event) => updateItem(item.id, { descriptionEn: event.target.value.slice(0, 220) })} rows={2} maxLength={220} placeholder="Optional – leer = deutscher Text als Fallback." className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                </div>
              </article>
            );
          })}
        </div>
        {items.length === 0 && <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-10 text-center text-neutral-500">Noch keine Galerie-Medien.</div>}
      </section>
    </main>
  );
}
