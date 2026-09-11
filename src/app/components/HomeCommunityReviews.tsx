"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  mediaUrl?: string;
  createdAt: string;
};

function stars(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
}

export default function HomeCommunityReviews() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const [reviews, setReviews] = useState<Review[]>([]);
  const lang = language === "de" ? "de" : "en";

  useEffect(() => {
    fetch("/api/community/reviews", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : []))
      .catch(() => setReviews([]));
  }, []);

  const visibleReviews = reviews.slice(0, 3);
  const average = useMemo(() => {
    if (!reviews.length) return null;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  if (!visibleReviews.length) return null;

  const eyebrow = get(`home.reviews.eyebrow.${lang}`, "Community");
  const title = get(
    `home.reviews.title.${lang}`,
    language === "de" ? "Was andere sagen" : "What others say",
  );
  const button = get(
    `home.reviews.button.${lang}`,
    language === "de" ? "Alle ansehen" : "View all",
  );

  return (
    <section className="bg-black px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-sm sm:tracking-[0.4em]">
              {eyebrow}
            </p>
            <h2 className="mt-4 break-normal text-3xl font-black uppercase leading-tight sm:text-5xl">
              {title}
            </h2>
            {average !== null && (
              <p className="mt-4 text-sm text-neutral-400">
                <span className="mr-2 text-orange-300">★★★★★</span>
                {average.toFixed(1)} · {reviews.length}{" "}
                {language === "de" ? "Bewertungen" : "reviews"}
              </p>
            )}
          </div>

          <Link
            href="/community"
            className="inline-flex w-fit shrink-0 rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-widest transition hover:border-orange-300 hover:text-orange-300"
          >
            {button}
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleReviews.map((review) => (
            <article
              key={review.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] sm:rounded-3xl"
            >
              {review.mediaUrl && (
                <div className="aspect-[4/3] overflow-hidden bg-neutral-950">
                  <img
                    src={review.mediaUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-bold">{review.name}</p>
                  <span className="whitespace-nowrap text-sm tracking-wider text-orange-300">
                    {stars(review.rating)}
                  </span>
                </div>
                <p className="mt-4 line-clamp-4 leading-7 text-neutral-300">
                  {review.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
