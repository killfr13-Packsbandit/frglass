"use client";

import Image from "next/image";
import { useLanguage } from "../components/LanguageProvider";

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

export default function Page() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6 sm:py-32">
      <h1 className="sr-only">{language === "de" ? "Über mich" : "About FRGLASS"}</h1>

      <section className="mx-auto grid max-w-7xl gap-10 sm:gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-orange-300 sm:mb-8 sm:text-sm sm:tracking-[0.5em]">
            {t.eyebrow}
          </p>

          <p className="text-base leading-7 text-neutral-300 sm:text-lg sm:leading-8">{t.p1}</p>
          <p className="mt-5 text-base leading-7 text-neutral-300 sm:mt-6 sm:text-lg sm:leading-8">{t.p2}</p>
          <p className="mt-5 text-base leading-7 text-neutral-300 sm:mt-6 sm:text-lg sm:leading-8">{t.p3}</p>
          <p className="mt-5 text-base leading-7 text-neutral-300 sm:mt-6 sm:text-lg sm:leading-8">{t.p4}</p>
        </div>

        <div className="relative h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:h-[600px] sm:rounded-3xl md:h-[720px]">
          <Image
            src="/workshop/me1.png"
            alt={language === "de" ? "Arbeit am Glasbrenner" : "Working at the glass torch"}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
}
