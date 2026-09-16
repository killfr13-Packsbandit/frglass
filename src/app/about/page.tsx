"use client";

import { useLanguage } from "../components/LanguageProvider";
import { useSiteContent } from "../components/SiteContentProvider";

const copy = {
  en: {
    eyebrow: "Biography",
    p1: "Hey, my name is Florian Robatsch and I'm from Carinthia, Austria. Since 2019, I have been working with borosilicate glass and discovered my passion for lampworking – a special form of glasswork at the flame.",
    p2: "What continues to fascinate me about it is the combination of precision and creativity. With a steady hand and a lot of heat, a hard and robust material can become something light, playful and often completely unexpected.",
    p3: "My work usually develops from a mixture of intuition, ideas and the joy of experimenting. I try not to plan every detail in advance, but instead leave some space for the glass and the process itself. I especially enjoy working with organic shapes, colors and details that give my pieces a natural and sometimes dreamlike character.",
    p4: "Not every piece develops exactly the way I originally imagined – and that is part of the process for me. I still find it fascinating to create something individual from glass that feels delicate and alive at the same time.",
  },
  de: {
    eyebrow: "Biografie",
    p1: "Hey, mein Name ist Florian Robatsch und ich komme aus Kärnten, Österreich. Seit 2019 beschäftige ich mich mit Borosilikatglas und habe dabei meine Leidenschaft für das Lampworking entdeckt – eine besondere Form der Glasbearbeitung an der Flamme.",
    p2: "Was mich daran bis heute fasziniert, ist die Verbindung aus Präzision und Kreativität. Mit ruhiger Hand und viel Hitze entsteht aus einem eigentlich harten und robusten Material etwas Leichtes, Verspieltes und oft ganz Unerwartetes.",
    p3: "Meine Arbeiten entstehen meist aus einer Mischung aus Intuition, Ideen und der Freude am Experimentieren. Ich versuche dabei nicht, jedes Detail im Voraus festzulegen, sondern lasse dem Glas und dem Entstehungsprozess auch etwas Raum. Besonders gerne arbeite ich mit organischen Formen, Farben und Details, die meinen Stücken einen natürlichen und manchmal verträumten Charakter geben.",
    p4: "Nicht jedes Stück entwickelt sich genau so, wie ich es ursprünglich geplant habe – und gerade das gehört für mich dazu. Es begeistert mich immer wieder, aus Glas etwas Eigenständiges zu erschaffen, das filigran und gleichzeitig lebendig wirkt.",
  },
} as const;

function numeric(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function Page() {
  const { language } = useLanguage();
  const { get } = useSiteContent();
  const t = copy[language];
  const lang = language === "de" ? "de" : "en";
  const mediaUrl = get("about.media.url", "/workshop/me2.jpg");
  const mediaType = get("about.media.type", "image");
  const zoom = numeric(get("about.media.zoom", "1"), 1);
  const x = numeric(get("about.media.focusX", "50"), 50);
  const y = numeric(get("about.media.focusY", "50"), 50);
  const mediaStyle = {
    objectFit: zoom < 1 ? "contain" : "cover",
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  } as const;
  const facts = language === "de"
    ? [["Seit", "2019"], ["Basis", "Kärnten"], ["Material", "Borosilikat"]]
    : [["Since", "2019"], ["Based", "Carinthia"], ["Material", "Borosilicate"]];

  return (
    <main className="min-h-screen overflow-hidden bg-black px-4 pb-20 pt-28 text-white sm:px-6 sm:pb-28 sm:pt-36">
      <h1 className="sr-only">{language === "de" ? "Über mich" : "About FRGLASS"}</h1>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 border-b border-white/10 pb-8 sm:pb-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-orange-300 sm:text-sm sm:tracking-[0.5em]">{get(`about.eyebrow.${lang}`, t.eyebrow)}</p>
            <p className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-8xl">Florian<br />Robatsch</p>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-xl text-sm uppercase leading-6 tracking-[0.16em] text-neutral-500 sm:text-base sm:leading-7">
              {language === "de" ? "Glaskunst · Lampworking · Borosilikatglas" : "Glass art · Lampworking · Borosilicate glass"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-10 sm:mt-12 sm:gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-start lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-950 sm:rounded-[2rem] lg:sticky lg:top-28">
            <div className="relative h-[470px] overflow-hidden sm:h-[650px] lg:h-[760px]">
              {mediaUrl && (mediaType === "video" ? (
                <video src={mediaUrl} muted controls playsInline preload="none" poster="/workshop/me2.jpg" className="h-full w-full" style={mediaStyle} />
              ) : (
                <img src={mediaUrl} alt={language === "de" ? "Florian Robatsch bei der Arbeit am Glasbrenner" : "Florian Robatsch working at the glass torch"} loading="lazy" className="h-full w-full" style={mediaStyle} />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-orange-300 sm:text-xs">FRGLASS / PORTRAIT</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.14em] text-white/80">{language === "de" ? "Kärnten, Österreich" : "Carinthia, Austria"}</p>
                </div>
                <div className="hidden h-px w-24 bg-white/30 sm:block" />
              </div>
            </div>
          </div>

          <div className="lg:pt-4">
            <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-8 sm:gap-3 sm:pb-10">
              {facts.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-600 sm:text-[10px]">{label}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">{value}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 sm:pt-10">
              {[1, 2, 3, 4].map((number) => {
                const fallback = t[`p${number}` as keyof typeof t];
                return (
                  <div key={number} className={`${number > 1 ? "mt-8 border-t border-white/10 pt-8 sm:mt-10 sm:pt-10" : ""} grid grid-cols-[auto_1fr] gap-4 sm:gap-6`}>
                    <span className="pt-1 text-[10px] font-bold tracking-[0.24em] text-orange-300 sm:text-xs">0{number}</span>
                    <p className={`${number === 1 ? "text-lg leading-8 text-white sm:text-xl sm:leading-9" : "text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8"}`}>
                      {get(`about.p${number}.${lang}`, fallback)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10">
              <div className="h-px flex-1 bg-gradient-to-r from-orange-300/60 to-transparent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-600 sm:text-xs">FRGLASS · {language === "de" ? "Handgemacht" : "Handmade"}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
