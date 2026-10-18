import { projects } from "@/data";
import { stack, webp } from "@/lib/work";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { TrackBox } from "@/components/edit/TrackBox";

// The work as tapes: each project a still in a strip of film, its tape number
// outlined beside it. Cut in on scroll (negative, photocopy, colour, with a
// tracker blinking on); hover re-cuts the still.
function Tape({ p, index }: { p: (typeof projects)[number]; index: number }) {
  const img = webp(p.img);
  const meta = [p.year, ...stack(p.iconLists).slice(0, 3)].filter(Boolean).join(", ").toLowerCase();
  return (
    <Reveal as="li" className="grid gap-4 md:grid-cols-12 md:gap-8">
      <p aria-hidden className="numeral text-[clamp(4.5rem,9vw,9rem)] md:col-span-2">
        {String(index + 1).padStart(2, "0")}
      </p>
      <TransitionLink href={`/work/${p.slug}`} label={p.title} data-cursor="play tape" className="clip-link group block md:col-span-10">
        <div className="film">
          <div className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`${p.title} screenshot`} loading={index === 0 ? "eager" : "lazy"} className="cut-img clip-img block h-auto w-full" />
            <div className="cut-hud absolute" style={{ left: `${16 + ((index * 23) % 44)}%`, top: `${22 + ((index * 17) % 34)}%`, width: "26%", height: "32%" }}>
              <TrackBox x={(402 + index * 137) % 960} y={(254 + index * 89) % 540} label={p.title.toLowerCase()} className="inset-0 text-blood" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h3 className="title text-[clamp(2.4rem,5vw,4.5rem)] group-hover:text-blood">{p.title}</h3>
          <p className="hud">{meta}</p>
        </div>
        <p className="mt-3 max-w-[60ch] text-[1.0625rem]">{p.outcome}</p>
      </TransitionLink>
    </Reveal>
  );
}

export default function Tapes() {
  return (
    <section id="work" data-scene="Work" className="tone-void px-4 py-28 md:px-6 md:py-40">
      <Reveal className="mx-auto max-w-page">
        <h2 className="title cut-stagger text-[clamp(3.5rem,11vw,11rem)]">
          <span className="block">Designed it.</span>
          <span className="block">Built it.</span>
          <span className="block text-blood">Shipped it.</span>
        </h2>
        <p className="mt-8 max-w-[44ch] text-smoke">Seven tapes, newest first. Each one opens into the director&apos;s cut: the problem, the calls, what broke.</p>
      </Reveal>
      <ol className="mx-auto mt-20 max-w-page space-y-28 md:mt-28 md:space-y-40">
        {projects.map((p, i) => (
          <Tape key={p.slug} p={p} index={i} />
        ))}
      </ol>
    </section>
  );
}
