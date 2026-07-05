import { siteConfig } from "../siteConfig";

export default function Page() {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
            Contact
          </p>

          <h1 className="text-6xl font-black uppercase leading-tight">
            Let&apos;s talk glass.
          </h1>

          <p className="mt-8 text-lg leading-8 text-neutral-300">
            Interested in a piece, a custom idea, studio updates or the future
            open studio concept? Send a message and we can talk personally.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <a
              href={`mailto:${siteConfig.email}?subject=FRGLASS%20Inquiry`}
              className="inline-block w-fit rounded-full bg-orange-300 px-8 py-4 font-bold uppercase tracking-widest text-black transition hover:bg-white"
            >
              Send Email
            </a>

            <a
              href={siteConfig.instagram}
              target="_blank"
              className="inline-block w-fit rounded-full border border-white/20 px-8 py-4 font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <h2 className="text-3xl font-black uppercase">
            Future Studio Vision
          </h2>

          <div className="mt-8 grid gap-5 text-neutral-300">
            <p>💎 Available pieces and custom inquiries</p>
            <p>🔥 Future open studio time</p>
            <p>🎓 Possible small personal sessions later on</p>
            <p>💛 Community and exchange around glass</p>
          </div>

          <p className="mt-8 text-neutral-400">
            FRGLASS is based in Austria. The studio concept is growing step by
            step — handmade glass comes first.
          </p>
        </div>
      </section>
    </main>
  );
}