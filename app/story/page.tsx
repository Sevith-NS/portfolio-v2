import type { Metadata } from "next";
import { cats, chapters, hello, history, learning, offClock, opening, short, signoff } from "@/data/story";
import { Reveal } from "@/components/motion/Reveal";
import { Copy } from "@/components/ui/Copy";
import { live, Prompt } from "@/components/ui/Prompt";
import { Specimen } from "@/components/ui/Specimen";
import { Xerox } from "@/components/edit/Xerox";
import { TrackBox } from "@/components/edit/TrackBox";
import { Torn } from "@/components/edit/Torn";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "My story",
  description: "The long version: a self-taught designer and product engineer in Bangalore, his work, his habits, and his four cats.",
};

// The B-roll. Black scenes and bone pages alternate like a zine; the photos
// are prints, photocopied and taped down; the page ends on rolling credits.

const scene = "relative px-4 py-24 md:px-6 md:py-36";

function Heading({ title, body }: { title: string; body?: string }) {
  return (
    <div className="max-w-[46rem]">
      <h2 className="title text-[clamp(2.8rem,7vw,6.5rem)]">{title}</h2>
      {body && (
        <p className="mt-6 max-w-[52ch] text-[1rem]">
          <Copy text={body} />
        </p>
      )}
    </div>
  );
}

// A photo as a taped, photocopied print with its caption written under it.
function Print({ src, alt, caption, tilt = 0, fx = "mono", ratio = "aspect-[4/5]" }: { src: string; alt: string; caption?: string; tilt?: number; fx?: "mono" | "neg" | "raw"; ratio?: string }) {
  return (
    <figure className="print relative text-void" style={{ transform: `rotate(${tilt}deg)` }}>
      <span className="tape -top-3 left-1/2 -translate-x-1/2" style={{ transform: `translateX(-50%) rotate(${-tilt * 2}deg)` }} />
      <div className={`relative ${ratio} overflow-hidden`}>
        <Xerox src={src} alt={alt} fx={fx} pos="50% 40%" />
      </div>
      {caption && <figcaption className="hud mt-3 text-grit">{caption.toLowerCase()}</figcaption>}
    </figure>
  );
}

export default function StoryPage() {
  const chapterList = live(chapters.map((c) => ({ ...c, todo: c.body.todo })));
  const credentials = live(history.credentials);

  return (
    <main id="main" className="relative">
      {/* Opening: the hooded frame from the esdee cut, in blood duotone, tracked. */}
      <section data-scene={opening.kicker} className="tone-void relative isolate flex min-h-[100svh] items-end overflow-hidden px-4 pb-16 md:px-6 md:pb-24">
        <div className="absolute inset-0 -z-10">
          <Xerox src={opening.photo.src} alt={opening.photo.alt} fx="duo" pos="50% 35%" eager />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
          <TrackBox x={512} y={188} label="subject: sevith" className="left-[42%] top-[22%] h-[34%] w-[16%] text-bone" />
        </div>
        <Reveal className="mx-auto w-full max-w-page">
          <h1 className="title text-[clamp(4rem,15vw,15rem)]">{opening.headline}</h1>
          <p className="mt-6 max-w-[44ch] text-[1.0625rem]">{opening.standfirst}</p>
        </Reveal>
      </section>

      {/* Hello, on a bone page. */}
      <section data-scene="Hello" className={`tone-bone ${scene}`}>
        <Torn side="top" tone="bone" seed={5} />
        <Torn side="bottom" tone="bone" seed={17} />
        <div className="mx-auto grid max-w-page items-center gap-16 md:grid-cols-12 md:gap-10">
          <Reveal className="mx-auto w-full max-w-[22rem] md:col-span-5 md:mx-0 md:max-w-[26rem]">
            <Print {...hello.photo} tilt={-2} />
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-6 md:col-start-7">
            <h2 className="title text-[clamp(3rem,7vw,6.5rem)]">{hello.headline}</h2>
            <p className="mt-7 max-w-[50ch] text-[1rem]">
              <Copy text={hello.body} />
            </p>
            <div className="tone-void mt-12 p-6 md:p-7">
              <p className="hud text-bone">for the recruiter with forty seconds</p>
              <ul className="mt-4 space-y-3">
                {short.map((b) => (
                  <li key={b.text} className="flex gap-3 text-[0.9375rem]">
                    <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-blood" />
                    <Copy text={b.text} />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How I got here: the chapters as clips on a track. */}
      <section data-scene="How I got here" className={`tone-void ${scene}`}>
        <div className="mx-auto max-w-page">
          <Reveal>
            <Heading title="From 'wow' to shipping." />
          </Reveal>
          <ol className="relative mt-16 border-l-2 border-soot md:ml-[25%] md:mt-24">
            {chapterList.map((c) => (
              <Reveal as="li" key={c.title} className="relative pb-14 pl-8 last:pb-0 md:pl-12">
                <span aria-hidden className="absolute -left-[7px] top-1.5 h-3 w-3 bg-blood" />
                <p className="hud md:absolute md:-left-[calc(33.33%+2rem)] md:top-1 md:w-[calc(33.33%)] md:text-right">{c.when.toLowerCase()}</p>
                <h3 className="title mt-2 text-[clamp(1.9rem,3.4vw,3rem)] md:mt-0">{c.title}</h3>
                {c.body.todo ? (
                  <div className="mt-4 max-w-[60ch]">
                    <Prompt b={c.body} as="div" />
                  </div>
                ) : (
                  <p className="mt-3 max-w-[60ch]">
                    <Copy text={c.body.text} />
                  </p>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Still learning, with the actual notes. */}
      <section data-scene={learning.kicker} className={`tone-void ${scene} pt-0 md:pt-0`}>
        <div className="mx-auto grid max-w-page items-center gap-14 md:grid-cols-12 md:gap-10">
          <Reveal className="order-2 md:order-1 md:col-span-6">
            <Heading title={learning.headline} body={learning.body} />
          </Reveal>
          <Reveal delay={0.08} className="order-1 mx-auto w-full max-w-[22rem] md:order-2 md:col-span-5 md:col-start-8 md:max-w-none">
            <Print src={learning.photo.src} alt={learning.photo.alt} tilt={3} fx="raw" ratio="aspect-[4/3]" />
          </Reveal>
        </div>
      </section>

      {/* Off the clock: a contact sheet of prints, taped down off the grid. */}
      <section data-scene={offClock.kicker} className={`tone-bone ${scene}`}>
        <Torn side="top" tone="bone" seed={23} />
        <Torn side="bottom" tone="bone" seed={29} />
        <div className="mx-auto max-w-page">
          <Reveal>
            <Heading title={offClock.headline} body={offClock.body} />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-20 md:mt-24 lg:grid-cols-4 lg:gap-8">
            {offClock.photos.map((p, i) => (
              <Reveal key={p.src} delay={i * 0.05} className={i % 2 ? "lg:mt-20" : ""}>
                <Print {...p} tilt={[-2.5, 2, -1.5, 3][i]} fx={i === 2 ? "neg" : "mono"} />
              </Reveal>
            ))}
          </div>
          <div className="mt-24 grid items-center gap-14 md:grid-cols-12">
            <Reveal className="relative md:col-span-7">
              <p className="title text-[clamp(2.2rem,4.6vw,4.4rem)]">
                <Copy text={offClock.kitchen} />
              </p>
            </Reveal>
            <Reveal delay={0.08} className="mx-auto w-full max-w-[24rem] md:col-span-4 md:col-start-9">
              <Print {...offClock.memes} tilt={-2} fx="raw" ratio="aspect-square" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* The crew. */}
      <section id="cats" data-scene="The crew" className={`tone-void ${scene}`}>
        <div className="mx-auto max-w-page">
          <Reveal>
            <Heading title={cats.headline} body={cats.body} />
          </Reveal>
          <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 lg:grid-cols-4 lg:gap-6">
            {cats.members.map((c, i) => (
              <Reveal as="li" key={c.name} delay={i * 0.06}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Xerox src={c.src} alt={c.alt} fx={i === 1 ? "neg" : "mono"} pos="50% 35%" />
                </div>
                <p className="title mt-4 text-[clamp(2rem,4vw,3.4rem)]">{c.name}</p>
                <p className="mt-2 text-[0.875rem] text-smoke">{c.line}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Two typefaces, no more. */}
      <section id="type" data-scene="Type" className={`tone-void ${scene} pt-0 md:pt-0`}>
        <div className="mx-auto max-w-page">
          <Reveal>
            <Heading title="Every font on this site." body="Both of them. Type anything." />
          </Reveal>
          <Reveal className="mt-12">
            <Specimen />
          </Reveal>
        </div>
      </section>

      {/* Rolling credits: the resume bit, the sign-off, the motto. */}
      <section data-scene="Credits" className={`tone-void ${scene} border-t border-soot text-center`}>
        <div className="mx-auto max-w-[44rem]">
          <Reveal>
            <p className="hud">{history.headline.toLowerCase()}</p>
          </Reveal>
          <dl className="mt-14 space-y-12">
            {credentials.map((c) => (
              <Reveal key={c.value}>
                <dt className="hud">{c.label.toLowerCase()}</dt>
                <dd className="title mt-2 text-[clamp(1.8rem,3.6vw,3rem)]">{c.value}</dd>
                {c.todo ? (
                  <dd className="mx-auto mt-3 max-w-[40ch] text-left">
                    <Prompt b={{ text: c.detail }} as="div" />
                  </dd>
                ) : (
                  <dd className="mt-1 text-[0.875rem] text-smoke">{c.detail}</dd>
                )}
              </Reveal>
            ))}
          </dl>
          <Reveal className="mt-28">
            <p className="text-[1.25rem] font-medium leading-snug md:text-[1.5rem]">
              <Copy text={signoff.line} />
            </p>
            <p className="hud mt-16">the motto</p>
            <p className="title mt-3 text-[clamp(2.4rem,6vw,5rem)] text-blood">{signoff.motto}</p>
          </Reveal>
        </div>
      </section>

      <Contact />
    </main>
  );
}
