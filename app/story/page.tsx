import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { navItems } from "@/data";
import { cats, chapters, hello, history, learning, offClock, opening, short, signoff } from "@/data/story";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import { Copy } from "@/components/ui/Copy";
import { live, Prompt } from "@/components/ui/Prompt";
import { TypeSpecimen } from "@/components/TypeSpecimen";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "My story",
  description:
    "The long version: a self-taught designer and product engineer in Bangalore, his work, his habits, and his four cats.",
};

// Kicker, wide all-caps title, optional line under it. The same header every
// section on the site uses, so the long page still reads as one voice.
function Head({ kicker, title, body, align = "center" }: { kicker: string; title: string; body?: string; align?: "center" | "left" }) {
  const c = align === "center";
  return (
    <div className={c ? "mx-auto max-w-[46rem] text-center" : "max-w-[40rem]"}>
      <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">{kicker}</p>
      <h2 className="mt-5 font-wide text-[clamp(1.9rem,4.6vw,3.6rem)] font-semibold uppercase leading-[1.02] tracking-[-0.01em] text-ink [text-wrap:balance]">
        {title}
      </h2>
      {body && (
        <p className={`mt-6 max-w-[48ch] text-lg leading-relaxed text-ink-2 ${c ? "mx-auto" : ""}`}>
          <Copy text={body} />
        </p>
      )}
    </div>
  );
}

// A photo with a mono caption under it. Square corners would read as a stock
// grid; these are prints.
function Print({ src, alt, caption, className = "", tilt = 0 }: { src: string; alt: string; caption?: string; className?: string; tilt?: number }) {
  return (
    <figure className={`group ${className}`}>
      <div
        className="overflow-hidden rounded-[1.1rem] shadow-[0_30px_60px_-35px_rgb(var(--shade)/0.7)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:![transform:rotate(0deg)_scale(1.015)]"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block h-auto w-full" />
      </div>
      {caption && <figcaption className="mt-4 font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.12em] text-ink-3">{caption}</figcaption>}
    </figure>
  );
}

const section = "mx-auto max-w-page px-4 py-24 md:px-8 md:py-32";

export default function StoryPage() {
  const chapterList = live(chapters.map((c) => ({ ...c, todo: c.body.todo })));
  const credentials = live(history.credentials);

  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />

      {/* Opening: one cinematic frame, edge to edge. The page colour rises up
          from the bottom so the photo dissolves into the rest of the story. */}
      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={opening.photo.src} alt={opening.photo.alt} className="absolute inset-0 -z-20 size-full object-cover object-[50%_40%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-paper via-paper/55 to-paper/10" />
        <div className="mx-auto w-full max-w-page px-4 pb-16 text-center md:px-8 md:pb-24">
          <Reveal>
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">{opening.kicker}</p>
            <h1 className="mt-5 font-wide text-[clamp(2.6rem,9vw,7.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-ink">
              {opening.headline}
            </h1>
            <p className="mx-auto mt-6 max-w-[40ch] text-lg leading-relaxed text-ink-2">{opening.standfirst}</p>
          </Reveal>
        </div>
      </section>

      {/* Hello: the one place on the site with a proper photo of my face (Q100). */}
      <section className={section}>
        <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
          <Reveal className="mx-auto w-full max-w-[22rem] md:col-span-5 md:mx-0 md:max-w-none">
            <Print {...hello.photo} tilt={-2} />
          </Reveal>
          <Reveal delay={0.08} className="text-center md:col-span-6 md:col-start-7 md:text-left">
            <h2 className="font-wide text-[clamp(2.2rem,5vw,4rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink">{hello.headline}</h2>
            <p className="mx-auto mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-2 md:mx-0">
              <Copy text={hello.body} />
            </p>
          </Reveal>
        </div>

        {/* For the recruiter with forty seconds. */}
        <Reveal className="mx-auto mt-20 max-w-[52rem] rounded-[1.75rem] border border-rule bg-sheet p-7 md:mt-28 md:p-10">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">The short version</p>
          <ul className="mt-6 space-y-4">
            {short.map((b) => (
              <li key={b.text} className="flex gap-4 text-lg leading-relaxed text-ink-2">
                <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-ink-3" />
                <Copy text={b.text} />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* How I got here: a timeline down the middle of the page. */}
      <section className={section}>
        <Reveal>
          <Head kicker="How I got here" title="From 'wow' to shipping." />
        </Reveal>
        <ol className="mx-auto mt-16 max-w-[52rem] md:mt-20">
          {chapterList.map((c) => (
            <Reveal as="li" key={c.title} className="grid gap-2 border-t border-rule py-9 sm:grid-cols-12 sm:gap-8">
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-3 sm:col-span-3 sm:pt-1.5">{c.when}</p>
              <div className="sm:col-span-9">
                <h3 className="font-wide text-xl font-semibold uppercase tracking-[-0.005em] text-ink md:text-2xl">{c.title}</h3>
                {c.body.todo ? (
                  <div className="mt-4">
                    <Prompt b={c.body} as="div" />
                  </div>
                ) : (
                  <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-2">
                    <Copy text={c.body.text} />
                  </p>
                )}
                {c.link && (
                  <a
                    href={c.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
                  >
                    {c.link.label}
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Visibly in progress (Q8): the UX course notes, in my own handwriting. */}
      <section className={section}>
        <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
          <Reveal className="order-2 text-center md:order-1 md:col-span-6 md:text-left">
            <Head kicker={learning.kicker} title={learning.headline} body={learning.body} align="left" />
          </Reveal>
          <Reveal delay={0.08} className="relative order-1 mx-auto w-full max-w-[20rem] md:order-2 md:col-span-5 md:col-start-8 md:max-w-none">
            <Print src={learning.photo.src} alt={learning.photo.alt} tilt={3} />
          </Reveal>
        </div>
      </section>

      {/* Off the clock: a loose spread of prints, deliberately off the grid (Q75). */}
      <section className={section}>
        <Reveal>
          <Head kicker={offClock.kicker} title={offClock.headline} body={offClock.body} />
        </Reveal>
        <div className="mx-auto mt-16 grid max-w-[60rem] grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-16 md:mt-24">
          {offClock.photos.map((p, i) => (
            <Reveal key={p.src} delay={(i % 2) * 0.06} className={i % 2 === 1 ? "sm:mt-24" : ""}>
              <Print {...p} tilt={i % 2 === 0 ? -1.5 : 1.5} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mx-auto mt-20 max-w-[40rem] text-center">
          <p className="text-[1.45rem] font-medium leading-[1.3] tracking-[-0.02em] text-ink [text-wrap:balance] md:text-[1.85rem]">
            <Copy text={offClock.kitchen} />
          </p>
        </Reveal>
        <Reveal className="mx-auto mt-20 max-w-[30rem]">
          <Print {...offClock.memes} tilt={-1} />
        </Reveal>
      </section>

      {/* The cats. Simba and Cream lead: they're the two I'm most like. */}
      <section id="cats" className={section}>
        <Reveal>
          <Head kicker={cats.kicker} title={cats.headline} body={cats.body} />
        </Reveal>
        <ul className="mx-auto mt-16 grid max-w-[64rem] grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:mt-20">
          {cats.members.map((c, i) => (
            <Reveal as="li" key={c.name} delay={i * 0.05}>
              <figure className="group" data-cream={c.name === "Cream" ? "" : undefined}>
                <div className="overflow-hidden rounded-[1.1rem] shadow-[0_30px_60px_-35px_rgb(var(--shade)/0.7)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.src}
                    alt={c.alt}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-5">
                  <p className="font-wide text-xl font-semibold uppercase text-ink">{c.name}</p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{c.line}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Certified type nerd. The specimen survives (Q80). */}
      <section id="type" className={section}>
        <Reveal>
          <Head kicker="Certified type nerd" title="Every font on this site." body="Type anything. These are the five voices this site is set in, and what each one is for." />
        </Reveal>
        <Reveal className="mx-auto mt-14 max-w-[60rem]">
          <TypeSpecimen />
        </Reveal>
      </section>

      {/* The resume bit, kept quiet on purpose (Q106). */}
      <section className={section}>
        <Reveal>
          <Head kicker={history.kicker} title={history.headline} />
        </Reveal>
        <dl className="mx-auto mt-14 grid max-w-[52rem] gap-x-10 gap-y-8 sm:grid-cols-2">
          {credentials.map((c) => (
            <Reveal key={c.value} className="border-t border-rule pt-5">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">{c.label}</dt>
              <dd className="mt-2 text-lg text-ink">{c.value}</dd>
              {c.todo ? (
                <dd className="mt-3">
                  <Prompt b={{ text: c.detail }} as="div" />
                </dd>
              ) : (
                <dd className="mt-1 text-[0.9375rem] text-ink-2">{c.detail}</dd>
              )}
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Sign-off, then a door into the studio. */}
      <section className={section}>
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <p className="text-[1.6rem] font-medium leading-[1.2] tracking-[-0.025em] text-ink [text-wrap:balance] md:text-[2.2rem]">
            <Copy text={signoff.line} />
          </p>
          {/* The motto, said plainly. */}
          <p className="mt-10 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">The motto</p>
          <p className="mt-3 font-wide text-[1.35rem] font-semibold uppercase leading-[1.1] tracking-[-0.01em] text-ink [text-wrap:balance] md:text-[1.9rem]">
            {signoff.motto}
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-20 max-w-[44rem]">
          <TransitionLink
            href="/studio"
            label="Studio"
            className="group flex items-center justify-between gap-6 rounded-[1.75rem] border border-rule bg-sheet p-6 hover:border-ink md:p-8"
          >
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-accent">The studio</p>
              <p className="mt-2 font-wide text-2xl font-semibold uppercase text-ink">See all of it, in a room</p>
              <p className="mt-1.5 max-w-[38ch] text-ink-2">A little 3D version of the above. The cats are in there too.</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition-colors duration-300 group-hover:bg-ink-2">
              <ArrowRight size={20} />
            </span>
          </TransitionLink>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
