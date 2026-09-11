"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { siteConfig } from "../siteConfig";

type Props = {
  productName?: string;
  productSlug?: string;
};

const copy = {
  de: {
    eyebrow: "Direkte Anfrage",
    title: "Schreib mir direkt.",
    product: "Anfrage zu",
    name: "Name",
    namePlaceholder: "Dein Name",
    email: "E-Mail",
    emailPlaceholder: "deine@email.at",
    message: "Nachricht",
    messagePlaceholder: "Was möchtest du wissen?",
    productMessage: (productName: string) => `Hallo Florian, ich interessiere mich für „${productName}“. Ist das Stück noch verfügbar?`,
    privacyStart: "Ich habe die",
    privacyLink: "Datenschutzerklärung",
    privacyEnd: "gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.",
    submit: "Anfrage senden",
    sending: "Wird gesendet …",
    success: "Danke! Deine Anfrage wurde gesendet. Ich melde mich per E-Mail bei dir.",
    validation: "Bitte Name, gültige E-Mail-Adresse, Nachricht und Zustimmung ausfüllen.",
    error: "Die Anfrage konnte gerade nicht gesendet werden. Bitte versuch es noch einmal.",
    notConfigured: "Der direkte E-Mail-Versand ist noch nicht fertig eingerichtet.",
    fallback: "Alternativ direkt per E-Mail schreiben",
  },
  en: {
    eyebrow: "Direct inquiry",
    title: "Send me a message.",
    product: "Inquiry about",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    message: "Message",
    messagePlaceholder: "What would you like to know?",
    productMessage: (productName: string) => `Hi Florian, I’m interested in “${productName}”. Is this piece still available?`,
    privacyStart: "I have read the",
    privacyLink: "privacy notice",
    privacyEnd: "and agree that my details may be processed to handle this inquiry.",
    submit: "Send inquiry",
    sending: "Sending …",
    success: "Thank you! Your inquiry was sent. I will reply by email.",
    validation: "Please enter your name, a valid email address, a message and give consent.",
    error: "The inquiry could not be sent right now. Please try again.",
    notConfigured: "Direct email delivery has not been fully configured yet.",
    fallback: "Alternatively send an email directly",
  },
} as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function InquiryForm({ productName, productSlug }: Props) {
  const { language } = useLanguage();
  const t = copy[language];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!productName) return;
    setMessage((current) => current.trim() ? current : copy[language].productMessage(productName));
  }, [productName, language]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!name.trim() || !isValidEmail(email) || !message.trim() || !consent) {
      setStatus("error");
      setErrorMessage(t.validation);
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          productName: productName || "",
          productSlug: productSlug || "",
          company,
          language,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(response.status === 503 ? t.notConfigured : data?.error || t.error);
      }

      setName("");
      setEmail("");
      setMessage("");
      setConsent(false);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : t.error);
    } finally {
      setSending(false);
    }
  }

  const fallbackSubject = productName
    ? `${language === "de" ? "Anfrage" : "Inquiry"} ${productName}`
    : "FRGLASS inquiry";

  return (
    <form
      onSubmit={submit}
      className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-white sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-300">{t.eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">{t.title}</h2>
      {productName && (
        <div className="mt-4 rounded-2xl border border-orange-300/20 bg-orange-300/[0.06] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">{t.product}</p>
          <p className="mt-1 font-bold text-white">{productName}</p>
        </div>
      )}

      <div className="mt-7 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-bold">{t.name}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required autoComplete="name" placeholder={t.namePlaceholder} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">{t.email}</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={160} required autoComplete="email" placeholder={t.emailPlaceholder} className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">{t.message}</span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required rows={6} placeholder={t.messagePlaceholder} className="resize-y rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none transition focus:border-orange-300/60" />
          <span className="text-right text-xs text-neutral-600">{message.length}/2000</span>
        </label>

        <label className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
          Company
          <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-neutral-400">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-1 h-4 w-4 accent-orange-300" />
          <span>{t.privacyStart}{" "}<Link href="/datenschutz" className="text-orange-300 underline-offset-4 hover:underline">{t.privacyLink}</Link>{" "}{t.privacyEnd}</span>
        </label>

        {status === "success" && <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{t.success}</p>}
        {status === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <p>{errorMessage || t.error}</p>
            <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(fallbackSubject)}`} className="mt-2 inline-block font-bold underline underline-offset-4">{t.fallback}</a>
          </div>
        )}

        <button type="submit" disabled={sending} className="rounded-full bg-orange-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-50">
          {sending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
