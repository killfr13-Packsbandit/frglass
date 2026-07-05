import Link from "next/link";

const posts = [
  {
    title: "New Pieces From The Flame",
    category: "New Work",
    image: "/jewelry/leaf1.jpg",
    excerpt:
      "A look at recent borosilicate pieces, colors and forms coming out of the flame.",
  },
  {
    title: "Behind The Scenes",
    category: "Process",
    image: "/workshop/me1.png",
    excerpt:
      "Small moments from the bench: fire, glass, tools and the process behind handmade pieces.",
    href: "/journal/behind-the-scenes",
  },
  {
    title: "Future Art Workshop",
    category: "Future Vision",
    image: "/workshop/me2.jpg",
    excerpt:
      "A slowly growing idea for exchange, creative process and small personal sessions in the future.",
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
          Process Notes
        </h1>

        <p className="mx-auto mt-6 mb-16 max-w-2xl text-center text-neutral-300">
          Notes from the flame — new pieces, process shots, quiet experiments
          and ideas around handmade borosilicate glass art.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post) => {
            const Card = (
              <article className="h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-500 hover:-translate-y-2 hover:border-orange-300/60">
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

                  {post.href && (
                    <p className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
                      Read More
                    </p>
                  )}
                </div>
              </article>
            );

            if (post.href) {
              return (
                <Link key={post.title} href={post.href}>
                  {Card}
                </Link>
              );
            }

            return <div key={post.title}>{Card}</div>;
          })}
        </div>
      </section>
    </main>
  );
}