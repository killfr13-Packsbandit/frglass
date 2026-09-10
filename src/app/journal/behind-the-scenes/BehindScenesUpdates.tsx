"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type Post = {
  id: string;
  title: string;
  text: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  contentType: string;
  createdAt: string;
};

const copy = {
  en: {
    eyebrow: "Fresh from the workshop",
    title: "Workshop updates",
    intro:
      "Small moments from the torch, experiments, new pieces and whatever is happening in the workshop right now.",
    close: "Close",
    open: "Open update",
  },
  de: {
    eyebrow: "Frisch aus der Werkstatt",
    title: "Werkstatt-Updates",
    intro:
      "Kleine Momente am Brenner, Tests, neue Stücke und alles, was gerade in der Werkstatt passiert.",
    close: "Schließen",
    open: "Update öffnen",
  },
} as const;

function formatDate(value: string, language: "de" | "en") {
  return new Intl.DateTimeFormat(language === "de" ? "de-AT" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function BehindScenesUpdates() {
  const { language } = useLanguage();
  const t = copy[language];
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/behind-the-scenes/posts", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return { posts: [] as Post[] };
        return (await response.json()) as { posts?: Post[] };
      })
      .then((data) => {
        if (active) setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch(() => {
        if (active) setPosts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId],
  );

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/10 pt-14 sm:mt-24 sm:pt-20">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">
        {t.eyebrow}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <h2 className="text-3xl font-black uppercase sm:text-4xl">{t.title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base sm:leading-7">
          {t.intro}
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setSelectedId(post.id)}
            aria-label={`${t.open}: ${post.title || formatDate(post.createdAt, language)}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] text-left transition duration-500 hover:-translate-y-1 hover:border-orange-300/50 hover:bg-white/[0.055] sm:rounded-3xl"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950">
              {post.mediaType === "video" ? (
                <>
                  <video
                    src={post.mediaUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  />
                  <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 pl-1 text-xl backdrop-blur">
                    ▶
                  </span>
                </>
              ) : (
                <img
                  src={post.mediaUrl}
                  alt={post.title || "FRGLASS workshop update"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
              <p className="absolute bottom-4 left-4 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-200">
                {formatDate(post.createdAt, language)}
              </p>
            </div>

            {(post.title || post.text) && (
              <div className="p-5 sm:p-6">
                {post.title && (
                  <h3 className="text-xl font-black uppercase tracking-[0.05em]">
                    {post.title}
                  </h3>
                )}
                {post.text && (
                  <p className={`${post.title ? "mt-3" : ""} leading-7 text-neutral-300`}>
                    {post.text}
                  </p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-8"
          onClick={() => setSelectedId(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label={t.close}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white transition hover:border-orange-300 hover:text-orange-300 sm:right-8 sm:top-8"
          >
            ×
          </button>

          <div
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
              {selected.mediaType === "video" ? (
                <video
                  src={selected.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[72vh] w-full object-contain"
                />
              ) : (
                <img
                  src={selected.mediaUrl}
                  alt={selected.title || "FRGLASS workshop update"}
                  className="max-h-[72vh] w-full object-contain"
                />
              )}
            </div>

            {(selected.title || selected.text) && (
              <div className="border-t border-white/10 p-5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                  {formatDate(selected.createdAt, language)}
                </p>
                {selected.title && (
                  <h3 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                    {selected.title}
                  </h3>
                )}
                {selected.text && (
                  <p className="mt-3 max-w-3xl leading-7 text-neutral-300">
                    {selected.text}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
