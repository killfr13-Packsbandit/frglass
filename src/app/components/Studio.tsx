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
  Work.Create. Learn. 
</h2>

<p className="mx-auto mt-8 mb-16 max-w-3xl text-center text-lg text-neutral-300 leading-8">
  My plan is currently growing into an open borosilicate glass studio. The focus is on handmade glass art first — with the idea of offering open studio time, torch rental and small personal sessions in the future.
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
    <h3 className="mb-3 text-xl font-bold">🔥 Future Torch Rental</h3>
    <p className="text-neutral-300">
      Planned: a professional workstation for independent flameworkers.
    </p>
  </div>


  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">🎓 Future Workshops</h3>
    <p className="text-neutral-300">
      Small personal learning sessions may become available later.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">🤝 Studio Community</h3>
    <p className="text-neutral-300">
      A place for exchange, ideas and shared passion around glass and all kinds of art
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
    <h3 className="mb-3 text-xl font-bold">✨ Personal Guidance</h3>
    <p className="text-neutral-300">
      Possible one-on-one guidance in the future, depending on time and setup.
    </p>
  </div>

</div>
        <div className="mx-auto mt-16 max-w-3xl text-center">

          <p className="text-xl leading-9 text-neutral-300">

            The future vision is to slowly grow this space into an open studio for exchange, learning and shared time at the flame — with possible torch rental and small personal sessions later on.
          </p>

         

        </div>

      </div>
      <div
  id="contact"
  className="mx-auto mt-24 max-w-4xl rounded-3xl border border-orange-300/30 bg-orange-300/10 p-10 text-center"
>
  <p className="mb-4 text-sm font-bold uppercase tracking-[0.5em] text-orange-300">
    Future Studio
  </p>

  <h2 className="text-4xl font-black uppercase">
    INTERESTED IN THE FUTURE STUDIO??
  </h2>

  <p className="mx-auto mt-6 max-w-2xl text-neutral-300">
    Open studio time, torch rental and small sessions are planned for the future. If you are interested, send a message and we can stay in touch.
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