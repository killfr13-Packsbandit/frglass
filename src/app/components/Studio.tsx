import { siteConfig } from "../siteConfig";
const studioImages = [
  "/workshop/me1.png",
  "/workshop/me2.jpg",
];

export default function Studio() {
  return (
    <section className="bg-neutral-950 px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">

        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
  Studio
</p>

<h2 className="text-center text-5xl font-black uppercase">
  Work. Learn. Create.
</h2>

<p className="mx-auto mt-8 mb-16 max-w-3xl text-center text-lg text-neutral-300 leading-8">
  FRGLASS is an open borosilicate glass studio where artists can create,
  rent a torch, learn new techniques and share ideas in a relaxed atmosphere.
</p>

        <div className="grid gap-8 md:grid-cols-2">

          {studioImages.map((src) => (

            <div
              key={src}
              className="overflow-hidden rounded-3xl border border-white/10"
            >

              <img
                src={src}
                className="h-[520px] w-full object-cover"
              />

            </div>
            

          ))}

        </div>
<div className="mt-16 grid gap-6 md:grid-cols-4">

  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">🔥 Torch Rental</h3>
    <p className="text-neutral-300">
      Rent a professional workstation and work independently.
    </p>
  </div>


  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">🎓 Workshops</h3>
    <p className="text-neutral-300">
      Small classes with personal guidance.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">🤝 Community</h3>
    <p className="text-neutral-300">
      Meet other lampworkers and exchange techniques.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">✨ Private Sessions</h3>
    <p className="text-neutral-300">
      Individual coaching tailored to your level.
    </p>
  </div>

</div>
        <div className="mx-auto mt-16 max-w-3xl text-center">

          <p className="text-xl leading-9 text-neutral-300">

            FRGLASS is more than handmade borosilicate art.

            This studio is a place where artists meet, rent a torch,
            exchange knowledge and learn together through small,
            personal workshops.

          </p>

         

        </div>

      </div>
      <div
  id="contact"
  className="mx-auto mt-24 max-w-4xl rounded-3xl border border-orange-300/30 bg-orange-300/10 p-10 text-center"
>
  <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
    Book A Spot
  </p>

  <h2 className="text-4xl font-black uppercase">
    Ready to work at the flame?
  </h2>

  <p className="mx-auto mt-6 max-w-2xl text-neutral-300">
    Interested in torch rental, open studio time or a small workshop?
    Send a message and we will find a date that works.
  </p>

  <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
    <a
      href={`mailto:${siteConfig.email}?subject=Studio%20Booking`}
      className="rounded-full bg-orange-300 px-8 py-4 font-bold uppercase tracking-widest text-black transition hover:bg-white"
    >
      Send Request
    </a>

    <a
      href={siteConfig.instagram}
      className="rounded-full border border-white/20 px-8 py-4 font-bold uppercase tracking-widest text-white transition hover:border-orange-300 hover:text-orange-300"
    >
      Instagram
    </a>
  </div>
</div>
    </section>
  );
}