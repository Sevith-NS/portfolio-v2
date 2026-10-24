import { intro } from "@/data";
import { Reveal } from "./motion/Reveal";
import { WordReveal } from "./motion/WordReveal";

// Who I am. The hero was centred; this section breaks off the grid on purpose
// (Q75): one paragraph that lights up word by word as you scroll, beside a print
// laid down at an angle. Hovering squares it up.
export default function Intro() {
  return (
    <section id="intro" className="relative mx-auto max-w-page overflow-x-clip px-4 py-24 md:px-8 md:py-36">
      <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">{intro.kicker}</p>
          <WordReveal
            text={intro.text}
            className="mt-6 text-[clamp(1.45rem,2.4vw,2.2rem)] font-medium leading-[1.3] tracking-[-0.02em] text-ink [text-wrap:pretty]"
          />
        </div>

        <Reveal className="relative mx-auto w-full max-w-[22rem] md:col-span-4 md:col-start-9 md:mx-0 md:max-w-none">
          <figure className="group">
            <div className="overflow-hidden rounded-[1.25rem] shadow-[0_40px_80px_-40px_rgb(var(--shade)/0.7)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:rotate(3deg)] group-hover:[transform:rotate(0deg)_scale(1.02)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={intro.photo.src} alt={intro.photo.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </div>
            <figcaption className="mt-5 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-3">{intro.photo.caption}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
