"use client";

import { upload } from "@vercel/blob/client";
import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { MediaFit, StudioMediaItem } from "../studioMediaTypes";
import ImageFocusEditor from "./ImageFocusEditor";

export type StudioMediaEditorHandle = {
  save: () => Promise<void>;
  hasChanges: () => boolean;
  isBusy: () => boolean;
};

type Props = {
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
};

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
    const baseName = file.name.replace(/\.[^.]+$/, "") || "studio";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function roleLabel(index: number) {
  if (index === 0) return "Titelbild";
  if (index === 1) return "Material";
  if (index === 2) return "Am Brenner";
  return `Einblicke ${index - 2}`;
}

function aspectFor(index: number) {
  if (index === 0) return "aspect-[16/10]";
  return "aspect-[4/3]";
}

const StudioMediaEditor = forwardRef<StudioMediaEditorHandle, Props>(function StudioMediaEditor(
  { onDirtyChange, onBusyChange },
  ref,
) {
  const [items, setItems] = useState<StudioMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const busy = uploading || replacingId !== null || saving;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/studio-media", { cache: "no-store" });
        if (!response.ok) throw new Error("Studio-Bilder konnten nicht geladen werden.");
        const data = (await response.json()) as { items?: StudioMediaItem[] };
        if (active) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Studio-Bilder konnten nicht geladen werden.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function markDirty(nextItems: StudioMediaItem[]) {
    setItems(nextItems);
    setDirty(true);
    setMessage("");
    setError("");
  }

  async function persist() {
    if (!dirty) return;
    if (uploading || replacingId !== null) throw new Error("Bitte warte, bis der Bild-Upload fertig ist.");
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/studio-media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = (await response.json().catch(() => null)) as { items?: StudioMediaItem[]; error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Studio-Bilder konnten nicht gespeichert werden.");
      if (Array.isArray(data?.items)) setItems(data.items);
      setDirty(false);
      setMessage("Studio-Bilder gespeichert ✓");
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : "Studio-Bilder konnten nicht gespeichert werden.";
      setError(text);
      throw new Error(text);
    } finally {
      setSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({
    save: persist,
    hasChanges: () => dirty,
    isBusy: () => busy,
  }));

  async function uploadOne(file: File, prefix: string) {
    const isVideo = file.type.startsWith("video/");
    const prepared = isVideo ? file : await optimizeImage(file);
    const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const blob = await upload(`studio/media/${Date.now()}-${prefix}-${safeName}`, prepared, {
      access: "public",
      handleUploadUrl: "/api/studio-media/upload",
    });
    return { prepared, url: blob.url, isVideo };
  }

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const added: StudioMediaItem[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const { prepared, url, isVideo } = await uploadOne(files[index], String(index));
        added.push({
          id: crypto.randomUUID(),
          mediaUrl: url,
          mediaType: isVideo ? "video" : "image",
          contentType: prepared.type,
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
      // Neue Bilder kommen ans Ende und ersetzen dadurch nicht unabsichtlich Titelbild/Material/Prozess.
      markDirty([...items, ...added]);
    } catch {
      setError("Upload hat nicht geklappt. Videos dürfen maximal 100 MB groß sein.");
    } finally {
      setUploading(false);
    }
  }

  async function replaceMedia(item: StudioMediaItem, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReplacingId(item.id);
    setError("");
    setMessage("");
    try {
      const { prepared, url, isVideo } = await uploadOne(file, `replace-${item.id}`);
      markDirty(items.map((entry) => entry.id === item.id ? {
        ...entry,
        mediaUrl: url,
        mediaType: isVideo ? "video" : "image",
        contentType: prepared.type,
        fit: "cover",
        position: "center",
        zoom: 1,
        focusX: 50,
        focusY: 50,
      } : entry));
    } catch {
      setError("Austauschen hat nicht geklappt.");
    } finally {
      setReplacingId(null);
    }
  }

  function updateItem(id: string, patch: Partial<StudioMediaItem>) {
    markDirty(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    markDirty(next);
  }

  function remove(item: StudioMediaItem) {
    if (!window.confirm("Dieses Bild/Video wirklich von der Studio-Seite entfernen?")) return;
    markDirty(items.filter((entry) => entry.id !== item.id));
  }

  return (
    <section className="mt-6 rounded-3xl border border-orange-300/20 bg-orange-300/[0.025] p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-300">Studio</p>
          <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">Bilder & Videos</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">Alles direkt hier: hochladen, ersetzen, Reihenfolge ändern sowie Ausschnitt und Zoom mit dem Finger einstellen. Position 1 ist das große Titelbild, danach folgen Material, Am Brenner und die weiteren Einblicke.</p>
        </div>
        <label className="shrink-0 cursor-pointer rounded-full bg-orange-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50">
          {uploading ? "Upload …" : "+ Bild / Video"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onChange={uploadMedia} disabled={busy} className="hidden" />
        </label>
      </div>

      {dirty && <p className="mt-5 rounded-2xl border border-orange-300/20 bg-orange-300/[0.05] px-4 py-3 text-sm text-orange-100">Noch nicht gespeichert – der normale „Änderungen speichern“-Button speichert diese Studio-Bilder gleich mit.</p>}
      {message && <p className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
      {error && <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      {loading ? <p className="mt-7 text-sm text-neutral-500">Studio-Bilder werden geladen …</p> : (
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {items.map((item, index) => {
            const fit: MediaFit = item.fit ?? "cover";
            const zoom = item.zoom ?? 1;
            const focusX = item.focusX ?? 50;
            const focusY = item.focusY ?? 50;
            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">{roleLabel(index)}</span>
                    <p className="mt-1 text-xs text-neutral-600">Position {index + 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || busy} className="rounded-full border border-white/15 px-3 py-2 text-sm disabled:opacity-25">↑</button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1 || busy} className="rounded-full border border-white/15 px-3 py-2 text-sm disabled:opacity-25">↓</button>
                    <button type="button" onClick={() => remove(item)} disabled={busy} className="rounded-full border border-red-400/30 px-3 py-2 text-sm text-red-300 disabled:opacity-30">Löschen</button>
                  </div>
                </div>

                <ImageFocusEditor
                  src={item.mediaUrl}
                  mediaType={item.mediaType}
                  fit={fit}
                  zoom={zoom}
                  focusX={focusX}
                  focusY={focusY}
                  aspectClass={aspectFor(index)}
                  onChange={(patch) => updateItem(item.id, { ...patch, position: "center" })}
                />

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-center rounded-xl bg-white px-3 py-3 text-xs font-black uppercase tracking-wider text-black">
                    {replacingId === item.id ? "Lädt …" : "Ersetzen"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onChange={(event) => replaceMedia(item, event)} disabled={busy} className="hidden" />
                  </label>
                  <button type="button" onClick={() => updateItem(item.id, { fit: fit === "contain" ? "cover" : "contain", position: "center" })} disabled={busy} className="rounded-xl border border-white/15 px-3 py-3 text-xs font-bold text-neutral-300 disabled:opacity-30">
                    {fit === "contain" ? "Rahmen füllen" : "Ganzes Bild"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && items.length === 0 && <div className="mt-7 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500">Noch keine Studio-Bilder.</div>}
    </section>
  );
});

export default StudioMediaEditor;
