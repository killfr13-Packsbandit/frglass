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
  embedded = false,
}: {
  page: FlexibleTextPage;
  placement: string;
  topOffset?: boolean;
  embedded?: boolean;
}) {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const blocks = parseFlexibleTextBlocks(get(flexibleTextBlockKey(page), "[]"))
    .filter((block) => block.enabled && block.placement === placement);

  if (!blocks.length) return null;

  const content = (
    <div className={embedded ? "space-y-12 sm:space-y-16" : "mx-auto max-w-7xl space-y-14 sm:space-y-20"}>
      {blocks.map((block) => {
        const eyebrow = language === "de" ? block.eyebrowDe : block.eyebrowEn;
        const title = language === "de" ? block.titleDe : block.titleEn;
        const body = language === "de" ? block.textDe : block.textEn;
        const hasText = Boolean(eyebrow || title || body);
        const hasMedia = Boolean(block.mediaUrl);
        if (!hasText && !hasMedia) return null;

        const mediaStyle = {
          objectFit: block.mediaZoom < 1 ? "contain" : "cover",
          objectPosition: `${block.mediaFocusX}% ${block.mediaFocusY}%`,
          transform: `scale(${block.mediaZoom})`,
          transformOrigin: `${block.mediaFocusX}% ${block.mediaFocusY}%`,
        } as const;

        return (
          <article key={block.id} className={`${hasMedia ? "max-w-5xl" : "max-w-3xl"} border-t border-white/10 pt-8 sm:pt-10`}>
            {hasMedia && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 sm:mb-10 sm:rounded-3xl">
                <div className="aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                  {block.mediaType === "video" ? (
                    <video src={block.mediaUrl} controls playsInline preload="metadata" className="h-full w-full" style={mediaStyle} />
                  ) : (
                    <img
                      src={block.mediaUrl}
                      alt={title || eyebrow || (language === "de" ? "FRGLASS Bild" : "FRGLASS image")}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full"
                      style={mediaStyle}
                    />
                  )}
                </div>
              </div>
            )}

            {hasText && (
              <div className="max-w-3xl">
                {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-300 sm:text-sm sm:tracking-[0.46em]">{eyebrow}</p>}
                {title && <h2 className="mt-4 text-3xl font-black uppercase leading-tight tracking-[-0.025em] sm:text-5xl">{title}</h2>}
                {body && <p className="mt-6 whitespace-pre-line text-base leading-8 text-neutral-300 sm:text-lg sm:leading-9">{body}</p>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );

  if (embedded) {
    return <div className="my-16 text-white sm:my-24">{content}</div>;
  }

  return (
    <section className={`bg-black px-4 text-white sm:px-6 ${topOffset ? "pb-14 pt-28 sm:pb-20 sm:pt-32" : "py-14 sm:py-20"}`}>
      {content}
    </section>
  );
}
