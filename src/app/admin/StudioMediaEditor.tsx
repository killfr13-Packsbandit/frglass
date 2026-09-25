"use client";

import { upload } from "@vercel/blob/client";
import {
  ChangeEvent,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import type { MediaFit, StudioMediaItem } from "../studioMediaTypes";
import ImageFocusEditor from "./ImageFocusEditor";

export type StudioMediaEditorHandle = {
  save: () => Promise<void>;
  hasChanges: () => boolean;
  isBusy: () => boolean;
};

type StudioMediaSlotName = "hero" | "material" | "process" | "gallery";

type Props = {
  children?: ReactNode;
  onDirtyChange?: (dirty: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
};

type StudioMediaContextValue = {
  items: StudioMediaItem[];
  loading: boolean;
  busy: boolean;
  uploading: boolean;
  replacingId: string | null;
  uploadMedia: (event: ChangeEvent<HTMLInputElement>, insertAt?: number) => Promise<void>;
  replaceMedia: (item: StudioMediaItem, event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateItem: (id: string, patch: Partial<StudioMediaItem>) => void;
  move: (index: number, direction: -1 | 1) => void;
  remove: (item: StudioMediaItem) => void;
};

const StudioMediaContext = createContext<StudioMediaContextValue | null>(null);

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
  return `Einblick ${index - 2}`;
}

function roleHint(index: number) {
  if (index === 0) return "Direkt nach der Studio-Einleitung";
  if (index === 1) return "Neben „Warum Borosilikatglas?“";
  if (index === 2) return "Neben „Wie aus Glas ein Einzelstück wird“";
  return "Im Bereich „Aus der Werkstatt“";
}

function aspectFor(index: number) {
  if (index === 0) return "aspect-[16/10]";
  return "aspect-[4/3]";
}

function useStudioMedia() {
  const value = useContext(StudioMediaContext);
  if (!value) throw new Error("StudioMediaSlot must be used inside StudioMediaEditor");
  return value;
}

function StudioMediaCard({ item, index }: { item: StudioMediaItem; index: number }) {
  const { items, busy, replacingId, replaceMedia, updateItem, move, remove } = useStudioMedia();
  const fit: MediaFit = item.fit ?? "cover";
  const zoom = item.zoom ?? 1;
  const focusX = item.focusX ?? 50;
  const focusY = item.focusY ?? 50;

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-5">
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">{roleLabel(index)}</span>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{roleHint(index)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
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

      <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2">
        <label className="flex min-w-0 cursor-pointer items-center justify-center rounded-xl bg-white px-3 py-3 text-center text-xs font-black uppercase tracking-wider text-black">
          {replacingId === item.id ? "Lädt …" : "Ersetzen"}
          <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onChange={(event) => replaceMedia(item, event)} disabled={busy} className="hidden" />
        </label>
        <button type="button" onClick={() => updateItem(item.id, { fit: fit === "contain" ? "cover" : "contain", position: "center" })} disabled={busy} className="min-w-0 rounded-xl border border-white/15 px-3 py-3 text-xs font-bold text-neutral-300 disabled:opacity-30">
          {fit === "contain" ? "Rahmen füllen" : "Ganzes Bild"}
        </button>
      </div>
    </article>
  );
}

export function StudioMediaSlot({ slot }: { slot: StudioMediaSlotName }) {
  const { items, loading, busy, uploading, uploadMedia } = useStudioMedia();

  const config = useMemo(() => {
    if (slot === "hero") return { start: 0, title: "Titelbild", empty: "Noch kein Titelbild.", insertAt: 0 };
    if (slot === "material") return { start: 1, title: "Bild zum Material", empty: "Noch kein Bild für diesen Bereich.", insertAt: 1 };
    if (slot === "process") return { start: 2, title: "Bild am Brenner", empty: "Noch kein Bild für diesen Bereich.", insertAt: 2 };
    return { start: 3, title: "Einblicke aus der Werkstatt", empty: "Noch keine weiteren Studio-Bilder.", insertAt: undefined };
  }, [slot]);

  const visible = slot === "gallery"
    ? items.slice(3).map((item, offset) => ({ item, index: offset + 3 }))
    : items[config.start]
      ? [{ item: items[config.start], index: config.start }]
      : [];

  return (
    <div className="mt-6 min-w-0 border-t border-white/10 pt-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Bild / Video</p>
          <p className="mt-1 text-sm font-bold text-white">{config.title}</p>
        </div>
        {(slot === "gallery" || visible.length === 0) && (
          <label className="inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center rounded-full border border-orange-300 px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider text-orange-300">
            {uploading ? "Upload …" : "+ Bild / Video"}
            <input
              type="file"
              multiple={slot === "gallery"}
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={(event) => uploadMedia(event, config.insertAt)}
              disabled={busy}
              className="hidden"
            />
          </label>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-neutral-500">Studio-Bilder werden geladen …</p>
      ) : visible.length > 0 ? (
        <div className="mt-4 space-y-4">
          {visible.map(({ item, index }) => <StudioMediaCard key={item.id} item={item} index={index} />)}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-neutral-500">{config.empty}</div>
      )}
    </div>
  );
}

const StudioMediaEditor = forwardRef<StudioMediaEditorHandle, Props>(function StudioMediaEditor(
  { children, onDirtyChange, onBusyChange },
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

  async function uploadMedia(event: ChangeEvent<HTMLInputElement>, insertAt?: number) {
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
      const next = [...items];
      if (insertAt === undefined) next.push(...added);
      else next.splice(Math.min(insertAt, next.length), 0, ...added);
      markDirty(next);
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

  const contextValue: StudioMediaContextValue = {
    items,
    loading,
    busy,
    uploading,
    replacingId,
    uploadMedia,
    replaceMedia,
    updateItem,
    move,
    remove,
  };

  return (
    <StudioMediaContext.Provider value={contextValue}>
      {dirty && <p className="mb-5 rounded-2xl border border-orange-300/20 bg-orange-300/[0.05] px-4 py-3 text-sm text-orange-100">Studio-Bilder geändert – der normale „Änderungen speichern“-Button speichert sie gleich mit.</p>}
      {message && <p className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
      {error && <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      {children}
    </StudioMediaContext.Provider>
  );
});

export default StudioMediaEditor;
