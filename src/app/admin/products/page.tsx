"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { ProductCategory, ProductRecord } from "../../productTypes";
import { categoryIdFromName, PRODUCT_STATUS, productStatusDe } from "../../productTypes";

type Session = { authenticated: boolean };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

function createProduct(category: ProductCategory): ProductRecord {
  return {
    slug: "", name: "", nameDe: "", categoryId: category.id, category: category.name, categoryDe: category.nameDe,
    price: "", priceDe: "", status: "Available", statusDe: "Verfügbar", image: "", images: [],
    material: "Borosilicate glass", materialDe: "Borosilikatglas", colors: "", colorsDe: "",
    size: "30 × 30 mm", sizeDe: "30 × 30 mm", year: String(new Date().getFullYear()),
    description: "", descriptionDe: "", story: "", storyDe: "",
  };
}

async function optimizeImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = objectUrl; });
    const maxEdge = 1800;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "product"}.webp`, { type: "image/webp" });
  } finally { URL.revokeObjectURL(objectUrl); }
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductRecord | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const [productResponse, categoryResponse] = await Promise.all([fetch("/api/products", { cache: "no-store" }), fetch("/api/product-categories", { cache: "no-store" })]);
    if (!productResponse.ok || !categoryResponse.ok) throw new Error("Daten konnten nicht geladen werden.");
    const productData = (await productResponse.json()) as { products?: ProductRecord[] };
    const categoryData = (await categoryResponse.json()) as { categories?: ProductCategory[] };
    setProducts(Array.isArray(productData.products) ? productData.products : []);
    setCategories(Array.isArray(categoryData.categories) ? categoryData.categories : []);
  }

  useEffect(() => { (async () => {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const data = (await response.json()) as Session;
      setSession(data);
      if (data.authenticated) await loadData();
    } catch { setError("Adminbereich konnte nicht geladen werden."); }
    finally { setLoading(false); }
  })(); }, []);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? null;
  const categoryProducts = useMemo(() => selectedCategoryId ? products.filter((product) => (product.categoryId || categoryIdFromName(product.category)) === selectedCategoryId) : [], [products, selectedCategoryId]);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      const id = product.categoryId || categoryIdFromName(product.category);
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [products]);

  function openCategory(id: string) { setSelectedCategoryId(id); setDraft(null); setEditingSlug(null); setMessage(""); setError(""); window.scrollTo({ top: 0 }); }
  function closeCategory() { setSelectedCategoryId(null); setDraft(null); setEditingSlug(null); setMessage(""); setError(""); }
  function update<K extends keyof ProductRecord>(key: K, value: ProductRecord[K]) { setDraft((current) => current ? { ...current, [key]: value } : current); }
  function chooseCategory(id: string) {
    const category = categories.find((item) => item.id === id); if (!category) return;
    setDraft((current) => current ? { ...current, categoryId: category.id, category: category.name, categoryDe: category.nameDe } : current);
  }
  function addProduct() { if (!selectedCategory) return; setEditingSlug(null); setDraft(createProduct(selectedCategory)); setMessage(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function edit(product: ProductRecord) { setEditingSlug(product.slug); setDraft({ ...product, images: [...product.images] }); setMessage(""); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []); event.target.value = ""; if (!files.length || !draft) return;
    setUploading(true); setError("");
    try {
      const urls: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const optimized = await optimizeImage(files[index]);
        const safeName = optimized.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
        const blob = await upload(`products/media/${Date.now()}-${index}-${safeName}`, optimized, { access: "public", handleUploadUrl: "/api/products/upload" });
        urls.push(blob.url);
      }
      setDraft((current) => current ? { ...current, images: [...current.images, ...urls].slice(0, 24), image: [...current.images, ...urls][0] ?? "" } : current);
    } catch { setError("Bild-Upload hat nicht geklappt."); }
    finally { setUploading(false); }
  }

  function makeMain(index: number) { setDraft((current) => { if (!current) return current; const images = [...current.images]; const [selected] = images.splice(index, 1); images.unshift(selected); return { ...current, images, image: images[0] ?? "" }; }); }
  function moveImage(index: number, direction: -1 | 1) { setDraft((current) => { if (!current) return current; const target = index + direction; if (target < 0 || target >= current.images.length) return current; const images = [...current.images]; [images[index], images[target]] = [images[target], images[index]]; return { ...current, images, image: images[0] ?? "" }; }); }
  function removeImage(index: number) { setDraft((current) => { if (!current) return current; const images = current.images.filter((_, i) => i !== index); return { ...current, images, image: images[0] ?? "" }; }); }

  async function persist(nextProducts: ProductRecord[]) {
    const response = await fetch("/api/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products: nextProducts }) });
    const data = (await response.json().catch(() => null)) as { products?: ProductRecord[]; error?: string } | null;
    if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
    const saved = Array.isArray(data?.products) ? data.products : nextProducts; setProducts(saved); return saved;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!draft) return; setSaving(true); setError(""); setMessage("");
    try {
      const category = categories.find((item) => item.id === draft.categoryId);
      if (!category) throw new Error("Bitte eine Kategorie wählen.");
      const slug = slugify(draft.slug || draft.name);
      const normalized: ProductRecord = { ...draft, slug, nameDe: draft.nameDe.trim() || draft.name.trim(), priceDe: draft.priceDe.trim() || draft.price.trim(), statusDe: productStatusDe(draft.status), categoryId: category.id, category: category.name, categoryDe: category.nameDe, size: draft.size.trim() || "30 × 30 mm", sizeDe: draft.size.trim() || "30 × 30 mm", image: draft.images[0] ?? "" };
      const next = editingSlug ? products.map((product) => product.slug === editingSlug ? normalized : product) : [normalized, ...products];
      await persist(next); setSelectedCategoryId(category.id); setDraft(null); setEditingSlug(null); setMessage("Gespeichert ✓");
    } catch (e) { setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); }
    finally { setSaving(false); }
  }

  async function deleteProduct(product: ProductRecord) {
    if (!window.confirm(`„${product.name}“ wirklich löschen?`)) return;
    setSaving(true); setError("");
    try { await persist(products.filter((item) => item.slug !== product.slug)); setMessage("Produkt gelöscht."); }
    catch (e) { setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen."); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  if (!session?.authenticated) return <main className="min-h-screen bg-black px-5 py-28 text-white"><section className="mx-auto max-w-3xl"><h1 className="text-4xl font-black uppercase">Produkte</h1><p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p><Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link></section></main>;

  return <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28"><section className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link><p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p><h1 className="mt-3 text-4xl font-black uppercase sm:text-6xl">Produkte</h1></div><Link href="/admin/categories" className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-neutral-300">Kategorien verwalten</Link></div>
    {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}{error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

    {!selectedCategory && <div className="mt-8"><p className="mb-5 text-sm leading-6 text-neutral-400">Wähle zuerst eine Kategorie. Danach siehst du nur die Produkte darin und kannst dort neue Stücke anlegen.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <button key={category.id} type="button" onClick={() => openCategory(category.id)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-orange-300/40 hover:bg-white/[0.06]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Kategorie</p><h2 className="mt-3 text-2xl font-black">{category.nameDe || category.name}</h2><p className="mt-1 text-sm text-neutral-500">{category.name}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400">{counts.get(category.id) ?? 0}</span></div>{!category.visible && <p className="mt-4 text-xs text-neutral-600">Im Shop ausgeblendet</p>}</button>)}</div>{categories.length === 0 && <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-neutral-500">Noch keine Kategorien. Lege zuerst eine Kategorie an.</div>}</div>}

    {selectedCategory && <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"><div><button type="button" onClick={closeCategory} className="text-sm text-neutral-500 hover:text-white">← Kategorien</button><h2 className="mt-2 text-2xl font-black uppercase">{selectedCategory.nameDe || selectedCategory.name}</h2><p className="mt-1 text-sm text-neutral-500">{categoryProducts.length} Produkt{categoryProducts.length === 1 ? "" : "e"}</p></div>{!draft && <button type="button" onClick={addProduct} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-black">+ Neues Produkt</button>}</div>

      {draft && <form onSubmit={save} className="mt-6 rounded-3xl border border-orange-300/20 bg-white/[0.04] p-5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black uppercase">{editingSlug ? "Produkt bearbeiten" : "Neues Produkt"}</h2><button type="button" onClick={() => { setDraft(null); setEditingSlug(null); }} className="text-sm text-neutral-500 hover:text-white">Abbrechen</button></div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="grid gap-2 sm:col-span-2"><span className="text-sm font-bold">Name</span><input value={draft.name} onChange={(e) => update("name", e.target.value)} required className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" /></label><label className="grid gap-2"><span className="text-sm font-bold">Name Deutsch</span><input value={draft.nameDe} onChange={(e) => update("nameDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label><label className="grid gap-2"><span className="text-sm font-bold">Preis</span><input value={draft.price} onChange={(e) => { update("price", e.target.value); update("priceDe", e.target.value); }} required className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label><label className="grid gap-2"><span className="text-sm font-bold">Maße</span><input value={draft.size} onChange={(e) => { update("size", e.target.value); update("sizeDe", e.target.value); }} placeholder="z. B. 30 × 30 mm oder 12 × 8 × 8 cm" className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" /></label><label className="grid gap-2"><span className="text-sm font-bold">Kategorie</span><select value={draft.categoryId} onChange={(e) => chooseCategory(e.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.nameDe || category.name}</option>)}</select></label><label className="grid gap-2"><span className="text-sm font-bold">Status</span><select value={draft.status} onChange={(e) => { update("status", e.target.value); update("statusDe", productStatusDe(e.target.value)); }} className="rounded-2xl border border-white/10 bg-black px-4 py-3">{Object.keys(PRODUCT_STATUS).map((status) => <option key={status} value={status}>{status === "Available" ? "Verfügbar" : status === "Sold" ? "Verkauft" : "Nur Galerie"}</option>)}</select></label><label className="grid gap-2"><span className="text-sm font-bold">Jahr</span><input value={draft.year} onChange={(e) => update("year", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2 sm:col-span-2"><span className="text-sm font-bold">Slug / Link</span><input value={draft.slug} onChange={(e) => update("slug", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm" placeholder="automatisch aus dem Namen" /></label></div>
        <div className="mt-8 border-t border-white/10 pt-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black uppercase">Bilder</h3><p className="mt-1 text-xs text-neutral-500">Das erste Bild ist das Hauptbild.</p></div><label className="cursor-pointer rounded-full border border-orange-300 px-4 py-2 text-sm font-bold text-orange-300">{uploading ? "Upload …" : "+ Bilder"}<input type="file" multiple accept="image/*" onChange={uploadImages} disabled={uploading} className="hidden" /></label></div>{draft.images.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500">Noch kein Bild.</div> : <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">{draft.images.map((src, index) => <div key={`${src}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950"><div className="relative aspect-square"><img src={src} alt="" className="absolute inset-0 h-full w-full object-contain p-2" /></div><div className="grid grid-cols-3 border-t border-white/10 text-xs"><button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="p-2 disabled:opacity-20">←</button><button type="button" onClick={() => makeMain(index)} className={`p-2 ${index === 0 ? "text-orange-300" : "text-neutral-400"}`}>★</button><button type="button" onClick={() => moveImage(index, 1)} disabled={index === draft.images.length - 1} className="p-2 disabled:opacity-20">→</button></div><button type="button" onClick={() => removeImage(index)} className="w-full border-t border-white/10 p-2 text-xs text-red-300">Entfernen</button></div>)}</div>}</div>
        <details open className="mt-8 border-t border-white/10 pt-7"><summary className="cursor-pointer text-lg font-black uppercase">Texte DE / EN</summary><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="grid gap-2"><span className="text-sm font-bold">Beschreibung EN</span><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} rows={5} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2"><span className="text-sm font-bold">Beschreibung DE</span><textarea value={draft.descriptionDe} onChange={(e) => update("descriptionDe", e.target.value)} rows={5} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2"><span className="text-sm font-bold">Story EN</span><textarea value={draft.story} onChange={(e) => update("story", e.target.value)} rows={4} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2"><span className="text-sm font-bold">Story DE</span><textarea value={draft.storyDe} onChange={(e) => update("storyDe", e.target.value)} rows={4} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label></div></details>
        <details className="mt-7 border-t border-white/10 pt-7"><summary className="cursor-pointer text-lg font-black uppercase">Details</summary><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="grid gap-2"><span className="text-sm font-bold">Material EN</span><input value={draft.material} onChange={(e) => update("material", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2"><span className="text-sm font-bold">Material DE</span><input value={draft.materialDe} onChange={(e) => update("materialDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2"><span className="text-sm font-bold">Farben EN</span><input value={draft.colors} onChange={(e) => update("colors", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label><label className="grid gap-2"><span className="text-sm font-bold">Farben DE</span><input value={draft.colorsDe} onChange={(e) => update("colorsDe", e.target.value)} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3" /></label></div></details>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button type="submit" disabled={saving || uploading} className="rounded-full bg-white px-6 py-4 font-black uppercase tracking-wider text-black disabled:opacity-50">{saving ? "Speichert …" : "Produkt speichern"}</button><button type="button" onClick={() => { setDraft(null); setEditingSlug(null); }} className="rounded-full border border-white/15 px-6 py-4 font-bold text-neutral-300">Abbrechen</button></div>
      </form>}

      {!draft && <div className="mt-6 grid gap-4">{categoryProducts.map((product) => <article key={product.slug} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:items-center"><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-950">{product.image && <img src={product.image} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />}</div><div className="min-w-0 flex-1"><p className="truncate font-black">{product.nameDe || product.name}</p><p className="mt-1 text-sm text-orange-300">{product.price} · {product.statusDe || product.status}</p><p className="mt-1 text-xs text-neutral-600">{product.sizeDe || product.size}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => edit(product)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider">Bearbeiten</button><button type="button" onClick={() => deleteProduct(product)} disabled={saving} className="rounded-full border border-red-400/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-300">Löschen</button></div></div></article>)}{categoryProducts.length === 0 && <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-neutral-500">Noch keine Produkte in dieser Kategorie.</div>}</div>}
    </>}
  </section></main>;
}