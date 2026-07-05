export default function Page() {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          Process
        </p>

        <h1 className="max-w-4xl text-6xl font-black uppercase leading-tight">
          Behind the scenes.
          <br />
          Fire, glass and time.
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-300">
          A quiet look into the process behind handmade borosilicate glass art:
          the flame, the tools, the colors and the slow decisions that shape
          every piece.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src="/workshop/me1.png"
              alt="Working at the flame"
              className="h-[560px] w-full object-cover"
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src="/workshop/me2.jpg"
              alt="Borosilicate glass process"
              className="h-[560px] w-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-4xl font-black uppercase">
            Made slowly.
          </h2>

          <p className="mt-6 text-lg leading-8 text-neutral-300">
            Borosilicate glass is shaped directly in the flame. Heat, timing
            and movement decide the final form. Some pieces start with a clear
            idea, others grow through the process.
          </p>

          <p className="mt-6 text-lg leading-8 text-neutral-300">
            This page will collect moments from the bench — experiments, new
            pieces, color tests, tools and the small details that usually stay
            behind the finished object.
          </p>
        </div>
      </section>
    </main>
  );
}