"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import ImageFocusEditor from "../ImageFocusEditor";
import type { GalleryMediaItem, MediaFit } from "../../galleryMediaTypes";

type Session = { authenticated: boolean };

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
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  async function uploadFile(file: File, prefix: string) {
    const isVideo = file.type.startsWith("video/");
    const prepared = isVideo ? file : await optimizeImage(file);
    const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const blob = await upload(`gallery/media/${Date.now()}-${prefix}-${safeName}`, prepared, {
      access: "public",
      handleUploadUrl: "/api/gallery-media/upload",
    });
    return { blob, file: prepared, isVideo };
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
        const { blob, file, isVideo } = await uploadFile(files[index], String(index));
        added.push({
          id: crypto.randomUUID(),
          mediaUrl: blob.url,
          mediaType: isVideo ? "video" : "image",
          contentType: file.type,
          description: "",
          descriptionEn: "",
          createdAt: new Date().toISOString(),
          fit: "cover",
          position: "center",
          zoom: 1,
          focusX: 50,
          focusY: 50,
        });
      }
      await persist([...added, ...items], "Hochgeladen ✓");
    } catch {
      setError("Upload hat nicht geklappt. Videos dürfen maximal 100 MB groß sein.");
    } finally {
      setUploading(false);
    }
  }

  async function replaceMedia(item: GalleryMediaItem, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReplacingId(item.id);
    setError("");
    setMessage("");
    try {
      const { blob, file: prepared, isVideo } = await uploadFile(file, `replace-${item.id}`);
      const next = items.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              mediaUrl: blob.url,
              mediaType: isVideo ? ("video" as const) : ("image" as const),
              contentType: prepared.type,
              fit: "cover" as const,
              position: "center" as const,
              zoom: 1,
              focusX: 50,
              focusY: 50,
            }
          : entry,
      );
      await persist(next, "Medium ersetzt ✓");
    } catch {
      setError("Medium konnte nicht ersetzt werden.");
    } finally {
      setReplacingId(null);
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
  if (!session?.authenticated) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black uppercase">Galerie</h1>
          <p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p>
          <Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6 sm:py-28">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
            <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">Galerie</h1>
            <p className="mt-4 max-w-2xl leading-7 text-neutral-400">Nur noch ein Editor pro Medium: direkt verschieben, zoomen, ersetzen, beschreiben und speichern.</p>
          </div>
          <label className="cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-black">
            {uploading ? "Upload …" : "+ Bild / Video"}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm" onChange={uploadMedia} disabled={uploading || saving} className="hidden" />
          </label>
        </div>

        {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {dirty && (
          <div className="sticky top-16 z-30 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-orange-300/30 bg-black/95 p-3 shadow-2xl backdrop-blur sm:p-4">
            <p className="text-sm text-neutral-300">Noch nicht gespeichert.</p>
            <button onClick={() => persist(items)} disabled={saving} className="rounded-full bg-orange-300 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-black disabled:opacity-50">
              {saving ? "Speichert …" : "Speichern"}
            </button>
          </div>
        )}

        <div className="mt-7 grid gap-6 md:grid-cols-2">
          {items.map((item, index) => {
            const fit: MediaFit = item.fit ?? "cover";
            const zoom = item.zoom ?? 1;
            const focusX = item.focusX ?? 50;
            const focusY = item.focusY ?? 50;

            return (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                <div className="p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Position {index + 1}</span>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-full border border-white/15 px-3 py-1.5 text-sm disabled:opacity-25">↑</button>
                      <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="rounded-full border border-white/15 px-3 py-1.5 text-sm disabled:opacity-25">↓</button>
                    </div>
                  </div>

                  <ImageFocusEditor
                    src={item.mediaUrl}
                    mediaType={item.mediaType}
                    zoom={zoom}
                    focusX={focusX}
                    focusY={focusY}
                    aspectClass="aspect-[1/1.18]"
                    onChange={(next) => updateItem(item.id, { ...next, fit: "cover", position: "center" })}
                  />

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer items-center justify-center rounded-xl bg-white px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-black">
                      {replacingId === item.id ? "Lädt …" : "Medium ersetzen"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm" onChange={(event) => replaceMedia(item, event)} disabled={Boolean(replacingId) || saving} className="hidden" />
                    </label>
                    <button type="button" onClick={() => remove(item)} disabled={saving} className="rounded-xl border border-red-400/30 px-3 py-3 text-xs font-bold uppercase tracking-wider text-red-300">Löschen</button>
                  </div>

                  {item.mediaType === "image" && (
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, { fit: fit === "contain" ? "cover" : "contain", zoom: fit === "cover" ? 1 : zoom, position: "center" })}
                      className="mt-2 w-full rounded-xl border border-white/15 px-3 py-3 text-xs font-bold text-neutral-300"
                    >
                      {fit === "contain" ? "Rahmen füllen" : "Ganzes Bild anzeigen"}
                    </button>
                  )}

                  <label className="mt-5 grid gap-2">
                    <span className="text-sm font-bold">Beschreibung DE</span>
                    <textarea value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value.slice(0, 220) })} rows={2} maxLength={220} placeholder="Optional" className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" />
                  </label>
                  <label className="mt-4 grid gap-2">
                    <span className="text-sm font-bold">Description EN</span>
                    <textarea value={item.descriptionEn} onChange={(event) => updateItem(item.id, { descriptionEn: event.target.value.slice(0, 220) })} rows={2} maxLength={220} placeholder="Optional" className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" />
                  </label>
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
