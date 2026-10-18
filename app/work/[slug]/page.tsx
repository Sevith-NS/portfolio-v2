import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data";
import { getCase, type Block, type Step } from "@/data/work";
import { stack, webp } from "@/lib/work";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import { Copy } from "@/components/ui/Copy";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { ZoomImage } from "@/components/ui/ZoomImage";
import { dev, live, Prompt } from "@/components/ui/Prompt";
import { Torn } from "@/components/edit/Torn";
import Contact from "@/components/Contact";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

// Next 15: route params arrive as a Promise.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.outcome } : {};
}

// Drafted, unconfirmed copy is tagged in development only, so it can be reviewed before shipping.
const Text = ({ b, className }: { b: Block; className?: string }) => (
  <span className={className}>
    <Copy text={b.text} />
    {dev && b.draft && <span className="ml-2 inline-block border border-dashed border-blood px-1.5 align-middle text-[0.625rem] font-semibold">confirm</span>}
  </span>
);

const Bullets = ({ blocks }: { blocks: Block[] }) => (
  <ul className="space-y-4">
    {blocks.map((b) =>
      b.todo ? (
        <Prompt key={b.text} b={b} />
      ) : (
        <li key={b.text} className="flex gap-4 text-[1rem] leading-relaxed">
          <span aria-hidden className="mt-[0.65em] size-1.5 shrink-0 bg-blood" />
          <Text b={b} />
        </li>
      )
    )}
  </ul>
);

// A scene of the case: its slate on the left, the substance on the right.
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Reveal className="grid gap-5 border-t border-line py-14 md:grid-cols-12 md:gap-8 md:py-20">
    <h2 className="title text-[clamp(2rem,3.4vw,3rem)] md:col-span-4">{label}</h2>
    <div className="md:col-span-8">{children}</div>
  </Reveal>
);

// A monitor around a clip or screenshot: a thin frame with its timecode.
function Monitor({ children, tc }: { children: React.ReactNode; tc: string }) {
  return (
    <div className="border-2 border-fg">
      <div className="hud flex justify-between border-b-2 border-fg px-3 py-1.5 text-fg">
        <span>monitor</span>
        <span>{tc}</span>
      </div>
      {children}
    </div>
  );
}

// One walkthrough step. Steps alternate sides, so the page zig-zags down.
function WalkStep({ step, index }: { step: Step; index: number }) {
  const flip = index % 2 === 1;
  return (
    <Reveal as="li" className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
      <div className={cn("md:col-span-4", flip && "md:order-2 md:col-start-9")}>
        <p className="hud">shot {String(index + 1).padStart(2, "0")}</p>
        <h3 className="title mt-3 text-[clamp(1.9rem,3vw,2.8rem)]">{step.title}</h3>
        <p className="mt-4 leading-relaxed">{step.text}</p>
      </div>
      <figure className={cn("md:col-span-8", flip && "md:order-1 md:col-start-1")}>
        <Monitor tc={`00:00:${String(index * 7 + 4).padStart(2, "0")}:00`}>
          {step.media.kind === "video" ? <DemoVideo src={step.media.src} poster={step.media.poster} label={step.media.label} /> : <ZoomImage src={step.media.src} alt={step.media.alt} />}
        </Monitor>
        {step.aside && <figcaption className="hud mt-3">{step.aside.toLowerCase()}</figcaption>}
      </figure>
    </Reveal>
  );
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const p = projects[index];
  const c = getCase(slug);
  if (!p || !c) notFound();
  const next = projects[(index + 1) % projects.length];
  const isCode = p.link.includes("github.com");
  const img = webp(p.img);
  const tape = String(index + 1).padStart(2, "0");

  const process = live(c.process);
  const insights = live(c.insights);
  const wins = live(c.wins);
  const misses = live(c.misses);
  const why = live([c.why]);

  return (
    <main id="main" className="relative">
      {/* The slate. */}
      <section data-scene="Slate" className="tone-void px-4 pb-20 pt-28 md:px-6 md:pt-36">
        <div className="mx-auto max-w-page">
          <TransitionLink href="/#work" label="Work" className="cutlink hud text-bone">
            back to the tapes
          </TransitionLink>
          <Reveal className="mt-10">
            <p className="hud">
              tape {tape} of {String(projects.length).padStart(2, "0")}, director&apos;s cut
            </p>
            <h1 className="title mt-4 text-[clamp(4rem,14vw,14rem)]">{p.title}</h1>
            <div className="mt-8 grid gap-8 md:grid-cols-12">
              <p className="text-[1.125rem] font-medium leading-snug md:col-span-7 md:text-[1.3rem]">{p.outcome}</p>
              <div className="flex flex-col items-start gap-5 md:col-span-4 md:col-start-9">
                <p className="hud">{[c.status, p.year].filter(Boolean).join(", ").toLowerCase()}</p>
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
                  {isCode ? "View the code" : "Visit the live site"}
                </a>
              </div>
            </div>
          </Reveal>
          {img && (
            <Reveal className="film mt-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${p.title} screenshot`} className="cut-img block h-auto w-full" />
            </Reveal>
          )}
        </div>
      </section>

      {/* The brief, on a bone page. */}
      <article data-scene="Brief" className="tone-bone relative px-4 py-16 md:px-6 md:py-24">
        <Torn side="top" tone="bone" seed={31} />
        <Torn side="bottom" tone="bone" seed={37} />
        <div className="mx-auto max-w-page">
          <Reveal>
            <dl className="grid gap-6 pb-12 sm:grid-cols-2">
              <div>
                <dt className="hud">stack</dt>
                <dd className="mt-2 text-[1.0625rem] font-medium">{stack(p.iconLists).join(", ")}</dd>
              </div>
              <div>
                <dt className="hud">role</dt>
                <dd className="mt-2 text-[1.0625rem] font-medium">{c.role}</dd>
              </div>
            </dl>
          </Reveal>
          <Row label="The problem">
            <p className="max-w-[58ch] text-[1.25rem] font-medium leading-snug md:text-[1.4rem]">
              <Text b={c.problem} />
            </p>
          </Row>
          {process.length > 0 && (
            <Row label="How I worked">
              <Bullets blocks={process} />
            </Row>
          )}
          <Row label="What I built">
            <Bullets blocks={c.approach} />
          </Row>
        </div>
      </article>

      {/* The product, working. */}
      {c.walkthrough && c.walkthrough.length > 0 && (
        <section data-scene="Walkthrough" className="tone-void px-4 py-24 md:px-6 md:py-36">
          <div className="mx-auto max-w-page">
            <Reveal>
              <h2 className="title text-[clamp(3rem,9vw,9rem)]">See it work.</h2>
            </Reveal>
            <ol className="mt-16 space-y-24 md:mt-24 md:space-y-32">
              {c.walkthrough.map((s, i) => (
                <WalkStep key={s.title} step={s} index={i} />
              ))}
            </ol>
          </div>
        </section>
      )}

      <article data-scene="Verdict" className="tone-void px-4 pb-24 md:px-6 md:pb-32">
        <div className="mx-auto max-w-page">
          {insights.length > 0 && (
            <Row label="What changed the design">
              <Bullets blocks={insights} />
            </Row>
          )}
          <Row label="Decisions">
            <Bullets blocks={c.decisions} />
          </Row>
          {wins.length + misses.length > 0 && (
            <Row label="Wins and misses">
              <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
                {wins.length > 0 && (
                  <div>
                    <p className="hud mb-5">what worked</p>
                    <Bullets blocks={wins} />
                  </div>
                )}
                {misses.length > 0 && (
                  <div>
                    <p className="hud mb-5">what didn&apos;t</p>
                    <Bullets blocks={misses} />
                  </div>
                )}
              </div>
            </Row>
          )}
          <Row label="Where it landed">
            <p className="max-w-[58ch] text-[1.25rem] font-medium leading-snug md:text-[1.4rem]">
              <Text b={c.outcome} />
            </p>
            {why.length > 0 && (
              <div className="mt-8 max-w-[60ch]">
                <p className="hud mb-3">why this was the right answer</p>
                {c.why.todo ? (
                  <Prompt b={c.why} as="div" />
                ) : (
                  <p className="leading-relaxed">
                    <Text b={c.why} />
                  </p>
                )}
              </div>
            )}
          </Row>

          <Reveal>
            <TransitionLink href={`/work/${next.slug}`} label={next.title} data-cursor="next tape" className="group mt-12 block border-2 border-bone p-8 hover:border-blood hover:bg-blood md:p-12">
              <p className="hud text-bone">next tape</p>
              <p className="title mt-4 text-[clamp(3rem,9vw,8rem)]">{next.title}</p>
            </TransitionLink>
          </Reveal>
        </div>
      </article>

      <Contact />
    </main>
  );
}
