import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { intro } from "@/data";
import { Reveal } from "./motion/Reveal";
import { TransitionLink } from "./transition/TransitionLink";
import { Copy } from "./ui/Copy";

// Who I am, short. The hero was centred; this section breaks off the grid on
// purpose (Q75): a print laid down at an angle on the left, lit by the same lamp
// that spills down from the hero, the words to its right. Hovering squares it up.
export default function Intro() {
  return (
    <section id="intro" className="relative mx-auto max-w-page overflow-x-clip px-4 py-24 md:px-8 md:py-36">
      <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
        <Reveal className="relative mx-auto w-full max-w-[22rem] md:col-span-5 md:mx-0 md:max-w-none md:pl-6">
          <figure className="group">
            <div className="overflow-hidden rounded-[1.25rem] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.7)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:rotate(-3deg)] group-hover:[transform:rotate(0deg)_scale(1.02)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={intro.photo.src} alt={intro.photo.alt} loading="lazy" className="aspect-square w-full object-cover object-[56%_50%]" />
            </div>
            <figcaption className="mt-5 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-3">{intro.photo.caption}</figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.08} className="text-center md:col-span-6 md:col-start-7 md:text-left">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">{intro.kicker}</p>
          <h2 className="mt-5 font-wide text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold uppercase leading-[1.04] tracking-[-0.01em] text-ink [text-wrap:balance]">
            {intro.headline}
          </h2>
          <p className="mx-auto mt-7 max-w-[46ch] text-lg leading-relaxed text-ink-2 md:mx-0">
            <Copy text={intro.body} />
          </p>
          <p className="mt-8 text-[1.35rem] font-medium leading-snug tracking-[-0.02em] text-ink-2 [text-wrap:balance] md:text-[1.6rem]">{intro.aside}</p>
          <TransitionLink
            href="/story"
            label="Story"
            className="group mt-10 inline-flex items-center gap-2 font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-ink hover:text-accent"
          >
            {intro.more}
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </TransitionLink>
        </Reveal>
      </div>
    </section>
  );
}
