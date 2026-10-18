import { email } from "@/data";
import { Marker } from "@/components/edit/Marker";
import { HeroVideo } from "./HeroVideo";

// The title card. The reel plays underneath, photocopied and pushed back, and
// the claim lands on top in three slammed lines. The one red mark on the page
// goes round the word that matters.
export default function Title() {
  return (
    <section id="top" data-scene="Title" className="tone-void relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden px-4 pb-12 pt-24 md:px-6 md:pb-16">
      <HeroVideo />
      <div className="mx-auto w-full max-w-page">
        <p data-cut="in" className="hud text-bone">
          sevith_sadashiva, product engineer, bangalore
        </p>
        <h1 data-cut="in" data-cut-v="slam" style={{ animationDelay: "0.12s" }} className="cut-stagger title mt-5 text-[clamp(2.6rem,12.4vw,13.5rem)]">
          <span className="block">I design it,</span>
          <span className="block">
            then I{" "}
            <span className="relative inline-block">
              actually
              <Marker shape="circle" delay={900} className="-left-[7%] -top-[16%] h-[132%] w-[114%]" />
            </span>
          </span>
          <span className="block">build it.</span>
        </h1>
        <div data-cut="in" data-cut-v="slice" style={{ animationDelay: "0.6s" }} className="mt-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[46ch] text-[1rem] md:text-[1.0625rem]">
            Product engineer. I design the interface, make the product calls and write the code. One person, no handoff, no excuses.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#work" className="btn btn-solid" data-cursor="roll the tapes">
              See the work
            </a>
            <a href={`mailto:${email}`} className="btn">
              Email me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
