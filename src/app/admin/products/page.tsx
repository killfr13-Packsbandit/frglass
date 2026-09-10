"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { ProductRecord } from "../../productTypes";
import { PRODUCT_STATUS, productStatusDe } from "../../productTypes";

type Session = { authenticated: boolean };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function newProduct(): ProductRecord {
  return {
    slug: "",
    name: "",
    nameDe: "",
    category: "Jewelry",
    categoryDe: "Schmuck",
    price: "",
    priceDe: "",
    status: "Available",
    statusDe: "Verfügbar",
    image: "",
    images: [],
    material: "Borosilicate glass",
    materialDe: "Borosilikatglas",
    colors: "",
    colorsDe: "",
    size: "",
    sizeDe: "",
    year: String(new Date().getFullYear()),
    description: "",
    descriptionDe: "",
    story: "",
    storyDe: "",
  };
}

async function optimizeImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxEdge = 1800;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.88),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "product";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [draft, setDraft] = useState<ProductRecord | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) throw new Error("Produkte konnten nicht geladen werden.");
    const data = (await response.json()) as { products?: ProductRecord[] };
    setProducts(Array.isArray(data.products) ? data.products : []);
  }

  useEffect(() => {
    async function load() {
      try {
        const sessionResponse = await fetch("/api/admin/session", { cache: "no-store" });
        const sessionData = (await sessionResponse.json()) as Session;
        setSession(sessionData);
        if (sessionData.authenticated) await loadProducts();
      } catch {
        setError("Adminbereich konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function edit(product: ProductRecord) {
    setEditingSlug(product.slug);
    setDraft({ ...product, images: [...product.images] });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addProduct() {
    setEditingSlug(null);
    setDraft(newProduct());
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function update<K extends keyof ProductRecord>(key: K, value: ProductRecord[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || !draft) return;

    setUploading(true);
    setError("");

    try {
      const urls: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const optimized = await optimizeImage(files[index]);
        const safeName = optimized.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
        const blob = await upload(
          `products/media/${Date.now()}-${index}-${safeName}`,
          optimized,
          {
            access: "public",
            handleUploadUrl: "/api/products/upload",
          },
        );
        urls.push(blob.url);
      }

      setDraft((current) => {
        if (!current) return current;
        const images = [...current.images, ...urls].slice(0, 24);
        return { ...current, images, image: images[0] ?? "" };
      });
    } catch {
      setError("Bild-Upload hat nicht geklappt.");
    } finally {
      setUploading(false);
    }
  }

  function makeMain(index: number) {
    setDraft((current) => {
      if (!current) return current;
      const images = [...current.images];
      const [selected] = images.splice(index, 1);
      images.unshift(selected);
      return { ...current, images, image: images[0] ?? "" };
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setDraft((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return current;
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images, image: images[0] ?? "" };
    });
  }

  function removeImage(index: number) {
    setDraft((current) => {
      if (!current) return current;
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...current, images, image: images[0] ?? "" };
    });
  }

  async function persist(nextProducts: ProductRecord[]) {
    const response = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: nextProducts }),
    });
    const data = (await response.json().catch(() => null)) as
      | { products?: ProductRecord[]; error?: string }
      | null;
    if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
    const saved = Array.isArray(data?.products) ? data.products : nextProducts;
    setProducts(saved);
    return saved;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const slug = slugify(draft.slug || draft.name);
      const normalized: ProductRecord = {
        ...draft,
        slug,
        nameDe: draft.nameDe.trim() || draft.name.trim(),
        priceDe: draft.priceDe.trim() || draft.price.trim(),
        statusDe: productStatusDe(draft.status),
        image: draft.images[0] ?? "",
      };

      const nextProducts = editingSlug
        ? products.map((product) => (product.slug === editingSlug ? normalized : product))
        : [normalized, ...products];

      await persist(nextProducts);
      setDraft(null);
      setEditingSlug(null);
      setMessage("Gespeichert ✓ Die Änderung ist sofort im Shop aktiv.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: ProductRecord) {
    if (!window.confirm(`„${product.name}“ wirklich löschen?`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await persist(products.filter((item) => item.slug !== product.slug));
      if (editingSlug === product.slug) {
        setDraft(null);
        setEditingSlug(null);
      }
      setMessage("Produkt gelöscht.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Löschen fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  }

  if (!session?.authenticated) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black uppercase">Produkte</h1>
          <p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p>
          <Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">
            Zum Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
            <h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">Produkte</h1>
          </div>
          {!draft && (
            <button onClick={addProduct} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-black">
              + Neues Produkt
            </button>
          )}
        </div>

        {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        {draft && (
          <form onSubmit={save} className="mt-8 rounded-3xl border border-orange-300/20 bg-white/[0.04] p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black uppercase">{editingSlug ? "Produkt bearbeiten" : "Neues Produkt"}</h2>
              <button type="button" onClick={() => { setDraft(null); setEditingSlug(null); }} className="text-sm text-neutral-500 hover:text-white">Abbrechen</button>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-bold">Name</span><input value={draft.name} onChange={(e) => update("name", e.target.value)} required className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" placeholder="z.B. Moonstone Leaf" /></label>
              <label className="grid gap-2"><span className="text-sm font-bold">Name Deutsch</span><input value={draft.nameDe} onChange={(e) => update("nameDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" placeholder="leer = gleicher Name" /></label>
              <label className="grid gap-2"><span className="text-sm font-bold">Preis</span><input value={draft.price} onChange={(e) => { update("price", e.target.value); update("priceDe", e.target.value); }} required className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" placeholder="80 oder €80" /></label>
              <label className="grid gap-2"><span className="text-sm font-bold">Status</span><select value={draft.status} onChange={(e) => { update("status", e.target.value); update("statusDe", productStatusDe(e.target.value)); }} className="rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-300/60">{Object.keys(PRODUCT_STATUS).map((status) => <option key={status} value={status}>{status === "Available" ? "Verfügbar" : status === "Sold" ? "Verkauft" : "Nur Galerie"}</option>)}</select></label>
              <label className="grid gap-2"><span className="text-sm font-bold">Jahr</span><input value={draft.year} onChange={(e) => update("year", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
              <label className="grid gap-2 sm:col-span-2"><span className="text-sm font-bold">Slug / Link</span><input value={draft.slug} onChange={(e) => update("slug", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm outline-none focus:border-orange-300/60" placeholder="wird automatisch aus dem Namen erzeugt" /><span className="text-xs text-neutral-600">Bei bestehenden Produkten nur ändern, wenn du wirklich eine neue URL willst.</span></label>
            </div>

            <div className="mt-8 border-t border-white/10 pt-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-lg font-black uppercase">Bilder</h3><p className="mt-1 text-xs text-neutral-500">Das erste Bild ist das Hauptbild. Maximal 24 Bilder.</p></div>
                <label className="cursor-pointer rounded-full border border-orange-300 px-4 py-2 text-sm font-bold text-orange-300">
                  {uploading ? "Upload …" : "+ Bilder hochladen"}
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={uploadImages} disabled={uploading} className="hidden" />
                </label>
              </div>

              {draft.images.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500">Noch kein Bild. Lade mindestens eines hoch.</div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {draft.images.map((src, index) => (
                    <div key={`${src}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
                      <div className="relative aspect-square"><img src={src} alt="" className="absolute inset-0 h-full w-full object-contain p-2" /></div>
                      <div className="grid grid-cols-3 border-t border-white/10 text-xs">
                        <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="p-2 disabled:opacity-20">←</button>
                        <button type="button" onClick={() => makeMain(index)} className={`p-2 ${index === 0 ? "text-orange-300" : "text-neutral-400"}`} title="Als Hauptbild">★</button>
                        <button type="button" onClick={() => moveImage(index, 1)} disabled={index === draft.images.length - 1} className="p-2 disabled:opacity-20">→</button>
                      </div>
                      <button type="button" onClick={() => removeImage(index)} className="w-full border-t border-white/10 p-2 text-xs text-red-300">Entfernen</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <details open className="mt-8 border-t border-white/10 pt-7">
              <summary className="cursor-pointer text-lg font-black uppercase">Texte DE / EN</summary>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-bold">Beschreibung EN</span><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} rows={6} className="resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Beschreibung DE</span><textarea value={draft.descriptionDe} onChange={(e) => update("descriptionDe", e.target.value)} rows={6} className="resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Story / Catchline EN</span><textarea value={draft.story} onChange={(e) => update("story", e.target.value)} rows={5} className="resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Story / Catchline DE</span><textarea value={draft.storyDe} onChange={(e) => update("storyDe", e.target.value)} rows={5} className="resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label>
              </div>
            </details>

            <details className="mt-7 border-t border-white/10 pt-7">
              <summary className="cursor-pointer text-lg font-black uppercase">Details</summary>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-sm font-bold">Kategorie EN</span><input value={draft.category} onChange={(e) => update("category", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Kategorie DE</span><input value={draft.categoryDe} onChange={(e) => update("categoryDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Material EN</span><input value={draft.material} onChange={(e) => update("material", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Material DE</span><input value={draft.materialDe} onChange={(e) => update("materialDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Farben EN</span><input value={draft.colors} onChange={(e) => update("colors", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label>
                <label className="grid gap-2"><span className="text-sm font-bold">Farben DE</span><input value={draft.colorsDe} onChange={(e) => update("colorsDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label>
              </div>
            </details>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving || uploading} className="rounded-full bg-white px-6 py-4 font-black uppercase tracking-wider text-black disabled:opacity-50">{saving ? "Speichert …" : "Produkt speichern"}</button>
              <button type="button" onClick={() => { setDraft(null); setEditingSlug(null); }} className="rounded-full border border-white/15 px-6 py-4 font-bold text-neutral-300">Abbrechen</button>
            </div>
          </form>
        )}

        <div className="mt-10 grid gap-4">
          {products.map((product) => (
            <article key={product.slug} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-950"><img src={product.image} alt="" className="absolute inset-0 h-full w-full object-contain p-1" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{product.name}</p>
                <p className="mt-1 text-sm text-orange-300">{product.price} · {product.statusDe || product.status}</p>
                <p className="mt-1 truncate text-xs text-neutral-600">/shop/{product.slug}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => edit(product)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider">Bearbeiten</button>
                  <button onClick={() => deleteProduct(product)} disabled={saving} className="rounded-full border border-red-400/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-300">Löschen</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
