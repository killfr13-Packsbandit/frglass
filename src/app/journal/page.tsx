const posts = [
  {
    title: "New Pieces From The Flame",
    category: "Studio Update",
    image: "/jewelry/leaf1.jpg",
    excerpt:
      "A look at recent borosilicate pieces, colors and forms coming out of the FRGLASS studio.",
  },
  {
    title: "Behind The Scenes",
    category: "Workshop",
    image: "/workshop/me1.png",
    excerpt:
      "Small moments from the bench: flame, glass, tools and the process behind each piece.",
  },
  {
    title: "Open Studio Coming Soon",
    category: "Studio",
    image: "/workshop/me2.jpg",
    excerpt:
      "FRGLASS will grow into a place for torch rental, small workshops and creative exchange.",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <section className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
          Journal
        </p>

        <h1 className="text-center text-6xl font-black uppercase">
          Studio Notes
        </h1>

        <p className="mx-auto mt-6 mb-16 max-w-2xl text-center text-neutral-300">
          Updates from the FRGLASS studio — new pieces, process shots, workshop
          news and thoughts from the flame.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300/60"
            >
              <img
                src={post.image}
                alt={post.title}
                className="h-[360px] w-full object-cover"
              />

              <div className="p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
                  {post.category}
                </p>

                <h2 className="text-2xl font-black uppercase">
                  {post.title}
                </h2>

                <p className="mt-4 text-neutral-300">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}