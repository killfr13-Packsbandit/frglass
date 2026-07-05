export default function Page() {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
  About
</p>

<h1 className="text-6xl font-black uppercase leading-tight">
  Shaped by flame.
  <br />
  Made by hand.
</h1>

<p className="mt-8 text-lg leading-8 text-neutral-300">
  This is a place for handmade borosilicate glass art — shaped by fire, color
  and patience. Every piece is made by hand directly in the flame.
</p>

<p className="mt-6 text-lg leading-8 text-neutral-300">
  The work includes wearable glass art, marbles, decorative objects and
  experimental pieces. No mass production — every object is a one-of-a-kind
  piece.
</p>

<p className="mt-6 text-lg leading-8 text-neutral-300">
  Over time, this space may grow into an art workshop for creative process,
  exchange and small personal sessions. For now, the focus is simple: handmade
  glass art, honest work and pieces born from the flame.
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