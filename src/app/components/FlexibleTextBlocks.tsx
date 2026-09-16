"use client";

import { useLanguage } from "./LanguageProvider";
import { useSiteContent } from "./SiteContentProvider";
import {
  flexibleTextBlockKey,
  parseFlexibleTextBlocks,
  type FlexibleTextPage,
} from "../textBlocks";

export default function FlexibleTextBlocks({
  page,
  placement,
  topOffset = false,
}: {
  page: FlexibleTextPage;
  placement: string;
  topOffset?: boolean;
}) {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const blocks = parseFlexibleTextBlocks(get(flexibleTextBlockKey(page), "[]"))
    .filter((block) => block.enabled && block.placement === placement);

  if (!blocks.length) return null;

  return (
    <section className={`bg-black px-4 text-white sm:px-6 ${topOffset ? "pb-14 pt-28 sm:pb-20 sm:pt-32" : "py-14 sm:py-20"}`}>
      <div className="mx-auto max-w-7xl space-y-14 sm:space-y-20">
        {blocks.map((block) => {
          const eyebrow = language === "de" ? block.eyebrowDe : block.eyebrowEn;
          const title = language === "de" ? block.titleDe : block.titleEn;
          const body = language === "de" ? block.textDe : block.textEn;
          if (!eyebrow && !title && !body) return null;
          return (
            <article key={block.id} className="max-w-3xl border-t border-white/10 pt-8 sm:pt-10">
              {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-300 sm:text-sm sm:tracking-[0.46em]">{eyebrow}</p>}
              {title && <h2 className="mt-4 text-3xl font-black uppercase leading-tight tracking-[-0.025em] sm:text-5xl">{title}</h2>}
              {body && <p className="mt-6 whitespace-pre-line text-base leading-8 text-neutral-300 sm:text-lg sm:leading-9">{body}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
