"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { categoryIdFromName, type ProductCategory, type ProductRecord } from "../../productTypes";

type Session = { authenticated: boolean };

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const [categoryResponse, productResponse] = await Promise.all([
      fetch("/api/product-categories", { cache: "no-store" }),
      fetch("/api/products", { cache: "no-store" }),
    ]);
    if (!categoryResponse.ok || !productResponse.ok) throw new Error();
    const categoryData = (await categoryResponse.json()) as { categories?: ProductCategory[] };
    const productData = (await productResponse.json()) as { products?: ProductRecord[] };
    setCategories(Array.isArray(categoryData.categories) ? categoryData.categories : []);
    setProducts(Array.isArray(productData.products) ? productData.products : []);
  }

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await response.json()) as Session;
        setSession(data);
        if (data.authenticated) await loadData();
      } catch {
        setError("Kategorien konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      const id = product.categoryId || categoryIdFromName(product.category) || "jewelry";
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [products]);

  function update(index: number, patch: Partial<ProductCategory>) {
    setCategories((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addCategory() {
    setCategories((current) => [
      ...current,
      { id: "", name: "", nameDe: "", visible: true },
    ]);
    setMessage("");
    setError("");
  }

  function move(index: number, direction: -1 | 1) {
    setCategories((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    const category = categories[index];
    const id = category.id || categoryIdFromName(category.name);
    if (id && (counts.get(id) ?? 0) > 0) {
      setError("Diese Kategorie enthält noch Produkte. Weise sie zuerst einer anderen Kategorie zu.");
      return;
    }
    setCategories((current) => current.filter((_, i) => i !== index));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/product-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      const data = (await response.json().catch(() => null)) as { categories?: ProductCategory[]; error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
      if (Array.isArray(data?.categories)) setCategories(data.categories);
      setMessage("Kategorien gespeichert ✓ Die Shop-Unterteilungen sind sofort aktiv.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-black px-5 py-28 text-white">Laden …</main>;
  if (!session?.authenticated) {
    return (
      <main className="min-h-screen bg-black px-5 py-28 text-white">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black uppercase">Kategorien</h1>
          <p className="mt-6 text-neutral-400">Bitte zuerst im Adminbereich einloggen.</p>
          <Link href="/admin" className="mt-6 inline-block rounded-full border border-orange-300 px-5 py-3 font-bold text-orange-300">Zum Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-28">
      <section className="mx-auto max-w-4xl">
        <Link href="/admin" className="text-sm text-neutral-500 transition hover:text-white">← Admin</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.4em] text-orange-300">FRGLASS CMS</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase sm:text-6xl">Kategorien</h1>
            <p className="mt-4 max-w-2xl leading-7 text-neutral-400">Diese Punkte erscheinen als Unterteilungen im Shop. Du kannst jederzeit neue Bereiche wie Vasen, Skulpturen oder Cups anlegen.</p>
          </div>
          <button type="button" onClick={addCategory} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-black">+ Kategorie</button>
        </div>

        {message && <p className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <form onSubmit={save} className="mt-8 grid gap-4">
          {categories.map((category, index) => {
            const id = category.id || categoryIdFromName(category.name);
            const count = counts.get(id) ?? 0;
            return (
              <article key={`${category.id}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2"><span className="text-sm font-bold">Name EN</span><input required value={category.name} onChange={(e) => update(index, { name: e.target.value })} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" placeholder="Vases" /></label>
                  <label className="grid gap-2"><span className="text-sm font-bold">Name DE</span><input value={category.nameDe} onChange={(e) => update(index, { nameDe: e.target.value })} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none focus:border-orange-300/60" placeholder="Vasen" /></label>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => update(index, { visible: !category.visible })} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${category.visible ? "border-orange-300/50 text-orange-300" : "border-white/15 text-neutral-500"}`}>{category.visible ? "Im Shop sichtbar" : "Ausgeblendet"}</button>
                    <span className="text-xs text-neutral-600">{count} Produkt{count === 1 ? "" : "e"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-full border border-white/10 px-3 py-2 text-sm disabled:opacity-20">↑</button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === categories.length - 1} className="rounded-full border border-white/10 px-3 py-2 text-sm disabled:opacity-20">↓</button>
                    <button type="button" onClick={() => remove(index)} className="rounded-full border border-red-400/20 px-3 py-2 text-xs font-bold text-red-300">Löschen</button>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving || categories.length === 0} className="rounded-full bg-white px-6 py-4 font-black uppercase tracking-wider text-black disabled:opacity-40">{saving ? "Speichert …" : "Kategorien speichern"}</button>
            <Link href="/admin/products" className="rounded-full border border-white/15 px-6 py-4 text-center font-bold text-neutral-300">Zu den Produkten</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
