import { intro } from "@/data";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Copy } from "@/components/ui/Copy";
import { Xerox } from "@/components/edit/Xerox";
import { TrackBox } from "@/components/edit/TrackBox";
import { Marker } from "@/components/edit/Marker";
import { Torn } from "@/components/edit/Torn";

// Who I am, on a bone page: the negative of the black scenes around it, torn
// in at both edges like a page from a zine. Simba gets photocopied, tracked,
// then circled in marker.
export default function Who() {
  return (
    <section id="who" data-scene="Who" className="tone-bone relative px-4 py-24 md:px-6 md:py-36">
      <Torn side="top" tone="bone" seed={3} />
      <Torn side="bottom" tone="bone" seed={11} />
      <div className="mx-auto grid max-w-page items-center gap-16 md:grid-cols-12 md:gap-10">
        <Reveal className="relative mx-auto w-full max-w-[24rem] md:col-span-5 md:mx-0 md:max-w-[28rem]">
          <figure className="print relative rotate-[-3deg]">
            <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[4deg]" />
            <div className="relative aspect-square overflow-hidden">
              <Xerox src={intro.photo.src} alt={intro.photo.alt} fx="mono" pos="62% 40%" />
              <TrackBox x={612} y={208} label="subject locked" className="cut-hud left-[42%] top-[12%] h-[44%] w-[46%] text-blood" />
              <Marker shape="circle" delay={1100} className="left-[36%] top-[6%] h-[56%] w-[58%]" />
            </div>
            <figcaption className="hud mt-3 text-grit">{intro.photo.caption}</figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.08} className="md:col-span-6 md:col-start-7">
          <h2 className="title text-[clamp(2.8rem,6.4vw,6rem)]">{intro.headline}</h2>
          <p className="mt-8 max-w-[52ch] text-[1rem]">
            <Copy text={intro.body} />
          </p>
          <p className="title mt-10 text-[clamp(1.6rem,2.6vw,2.4rem)] text-blood">{intro.aside}</p>
          <TransitionLink href="/story" label="Story" className="cutlink mt-10 inline-block font-medium" data-cursor="b-roll">
            {intro.more}
          </TransitionLink>
        </Reveal>
      </div>
    </section>
  );
}
