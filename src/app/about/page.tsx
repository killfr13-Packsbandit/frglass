export default function Page() {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
            About
          </p>

          <h1 className="text-6xl font-black uppercase leading-tight">
            FRGLASS is born from fire.
          </h1>

          <p className="mt-8 text-lg leading-8 text-neutral-300">
  FRGLASS is my borosilicate glass studio in Austria — a place where fire,
  color and patience come together. Every piece is shaped by hand directly in
  the flame.
</p>

<p className="mt-6 text-lg leading-8 text-neutral-300">
  I create wearable glass art, pendants, marbles, decorative objects and
  experimental pieces. No mass production, no copies — every object is a
  one-of-a-kind piece.
</p>

<p className="mt-6 text-lg leading-8 text-neutral-300">
  The studio is also a place for exchange, learning and community. Whether it is
  open studio time, small workshops or simply sharing ideas at the flame,
  FRGLASS is built around handmade glass and the people who love it.
</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <img
            src="/workshop/me1.png"
            alt="FRGLASS studio"
            className="h-[720px] w-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}