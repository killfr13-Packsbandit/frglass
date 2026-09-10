"use client";

import { upload } from "@vercel/blob/client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../components/LanguageProvider";

type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  mediaUrl?: string;
  createdAt: string;
};

const copy = {
  de: {
    eyebrow: "Community",
    title: "Eure Stücke. Eure Eindrücke.",
    intro: "Du hast ein FRGLASS-Stück, warst bei mir in der Werkstatt oder möchtest einfach deine Erfahrung teilen? Hinterlass eine Bewertung und gern auch ein Foto.",
    average: "Durchschnitt",
    noReviews: "Noch keine freigegebenen Beiträge. Vielleicht machst du den Anfang.",
    formTitle: "Deine Bewertung teilen",
    formText: "Bewertungen werden vor der Veröffentlichung kurz von mir freigegeben.",
    name: "Name",
    namePlaceholder: "Dein Name oder Vorname",
    rating: "Bewertung",
    message: "Dein Text (optional)",
    messagePlaceholder: "Wenn du möchtest: ein paar Worte zu deinem Stück oder deiner Erfahrung.",
    photo: "Foto (optional)",
    photoHint: "JPG, PNG, WebP oder ein normales iPhone-Foto. Das Bild wird vor dem Upload automatisch verkleinert.",
    consent: "Ich bin damit einverstanden, dass Name, Bewertung, Text und optionales Foto nach Freigabe öffentlich auf frglass.at erscheinen. Ich habe die Rechte am hochgeladenen Bild.",
    submit: "Bewertung senden",
    sending: "Wird gesendet …",
    success: "Danke! Deine Bewertung wartet jetzt auf Freigabe.",
    validationName: "Bitte gib deinen Namen ein.",
    validationConsent: "Bitte bestätige die Zustimmung zur Veröffentlichung.",
    photoError: "Das Foto konnte nicht verarbeitet oder hochgeladen werden. Versuch es ohne Foto oder als JPG/PNG.",
    limit: "Von diesem Gerät wurden heute schon mehrere Beiträge gesendet. Versuch es bitte morgen wieder.",
    error: "Die Bewertung konnte gerade nicht gespeichert werden. Bitte versuch es noch einmal.",
    google: "Auch auf Google bewerten",
  },
  en: {
    eyebrow: "Community",
    title: "Your pieces. Your impressions.",
    intro: "Own a FRGLASS piece, visited the studio, or simply want to share your experience? Leave a rating and, if you like, a photo.",
    average: "Average",
    noReviews: "No approved posts yet. You could be the first.",
    formTitle: "Share your review",
    formText: "Reviews are briefly checked by me before they appear publicly.",
    name: "Name",
    namePlaceholder: "Your name or first name",
    rating: "Rating",
    message: "Your text (optional)",
    messagePlaceholder: "If you like, add a few words about your piece or experience.",
    photo: "Photo (optional)",
    photoHint: "JPG, PNG, WebP or a normal iPhone photo. Images are resized in your browser before upload.",
    consent: "I agree that my name, rating, text and optional photo may appear publicly on frglass.at after approval. I have the rights to the uploaded image.",
    submit: "Send review",
    sending: "Sending …",
    success: "Thank you! Your review is now waiting for approval.",
    validationName: "Please enter your name.",
    validationConsent: "Please confirm your consent to publication.",
    photoError: "The photo could not be processed or uploaded. Try again without a photo or use JPG/PNG.",
    limit: "Several posts have already been sent from this device today. Please try again tomorrow.",
    error: "The review could not be saved right now. Please try again.",
    google: "Review on Google too",
  },
} as const;

function stars(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
}

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("unsupported-image");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("image-canvas");
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
    if (!blob) throw new Error("image-conversion");
    const baseName = file.name.replace(/\.[^.]+$/, "") || "review-photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const googleReviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? "";

  useEffect(() => {
    fetch("/api/community/reviews", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const average = useMemo(() => {
    if (!reviews.length) return null;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!name.trim()) {
      setStatus("error");
      setErrorMessage(t.validationName);
      return;
    }
    if (!consent) {
      setStatus("error");
      setErrorMessage(t.validationConsent);
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl = "";
      let contentType = "";
      if (file) {
        let optimized: File;
        try {
          optimized = await optimizeImage(file);
        } catch {
          throw new Error(t.photoError);
        }
        try {
          const safeName = optimized.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
          const blob = await upload(`community/media/${Date.now()}-${safeName}`, optimized, {
            access: "public",
            handleUploadUrl: "/api/community/upload",
          });
          mediaUrl = blob.url;
          contentType = optimized.type;
        } catch {
          throw new Error(t.photoError);
        }
      }

      const response = await fetch("/api/community/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, text, mediaUrl, contentType, consent: true }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        const serverError = data?.error ?? "";
        if (serverError.toLowerCase().includes("limit")) throw new Error(t.limit);
        throw new Error(serverError || t.error);
      }

      setName("");
      setRating(5);
      setText("");
      setFile(null);
      setConsent(false);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : t.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-24 text-white sm:px-8 sm:py-32">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:text-sm">{t.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-6 text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">{t.intro}</p>
        </div>

        {average !== null && <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3"><span className="text-orange-300">★★★★★</span><span className="font-bold">{average.toFixed(1)}</span><span className="text-sm text-neutral-400">{t.average} · {reviews.length}</span></div>}

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!loading && reviews.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-neutral-400 md:col-span-2 xl:col-span-3">{t.noReviews}</div>}
          {reviews.map((review) => (
            <article key={review.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              {review.mediaUrl && <div className="aspect-[4/3] overflow-hidden bg-neutral-950"><img src={review.mediaUrl} alt="" loading="lazy" className="h-full w-full object-cover" /></div>}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="font-bold text-white">{review.name}</p><p className="mt-1 text-xs text-neutral-500">{new Intl.DateTimeFormat(language === "de" ? "de-AT" : "en-GB", { dateStyle: "medium" }).format(new Date(review.createdAt))}</p></div>
                  <span className="whitespace-nowrap text-sm tracking-wider text-orange-300">{stars(review.rating)}</span>
                </div>
                {review.text && <p className="mt-5 whitespace-pre-wrap leading-7 text-neutral-300">{review.text}</p>}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <h2 className="text-2xl font-black uppercase sm:text-3xl">{t.formTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">{t.formText}</p>
            <div className="mt-8 grid gap-6">
              <label className="grid gap-2"><span className="text-sm font-bold">{t.name}</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required placeholder={t.namePlaceholder} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60" /></label>
              <div><span className="text-sm font-bold">{t.rating}</span><div className="mt-2 flex gap-1" aria-label={t.rating}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`text-3xl transition ${value <= rating ? "text-orange-300" : "text-neutral-700 hover:text-neutral-500"}`} aria-label={`${value} / 5`}>★</button>)}</div></div>
              <label className="grid gap-2"><span className="text-sm font-bold">{t.message}</span><textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={700} rows={5} placeholder={t.messagePlaceholder} className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60" /><span className="text-right text-xs text-neutral-600">{text.length}/700</span></label>
              <label className="grid gap-2"><span className="text-sm font-bold">{t.photo}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setStatus("idle"); setErrorMessage(""); }} className="block w-full rounded-2xl border border-dashed border-white/15 bg-black/40 p-4 text-sm text-neutral-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-black" /><span className="text-xs leading-5 text-neutral-500">{t.photoHint}</span></label>
              <label className="flex items-start gap-3 text-sm leading-6 text-neutral-400"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 h-4 w-4 accent-orange-300" /><span>{t.consent}</span></label>
              {status === "success" && <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{t.success}</p>}
              {status === "error" && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage || t.error}</p>}
              <button type="submit" disabled={submitting} className="rounded-full bg-white px-6 py-3 font-black uppercase tracking-wider text-black transition hover:bg-orange-200 disabled:cursor-wait disabled:opacity-50">{submitting ? t.sending : t.submit}</button>
            </div>
          </form>

          <aside className="rounded-[2rem] border border-orange-300/15 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.10),transparent_55%)] p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-300">FRGLASS</p>
            <p className="mt-5 text-2xl font-black leading-tight sm:text-3xl">{language === "de" ? "Ein Stück Glas lebt anders weiter, sobald es die Werkstatt verlässt." : "A piece of glass starts a different life once it leaves the studio."}</p>
            <p className="mt-5 leading-7 text-neutral-400">{language === "de" ? "Genau deshalb mag ich Bilder und Rückmeldungen von euch – sie zeigen die Arbeiten außerhalb meiner eigenen Werkbank." : "That is why I like seeing your photos and feedback — they show the work beyond my own bench."}</p>
            {googleReviewUrl && <a href={googleReviewUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-bold transition hover:border-orange-300/50 hover:text-orange-200">{t.google}</a>}
          </aside>
        </div>
      </section>
    </main>
  );
}
