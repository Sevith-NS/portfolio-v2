import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp"; // ships with Next
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { navItems, projects } from "@/data";
import { getCase, type Block, type Step } from "@/data/work";
import { stack, webp } from "@/lib/work";
import { cn } from "@/lib/utils";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import { Copy } from "@/components/ui/Copy";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { ZoomImage } from "@/components/ui/ZoomImage";
import { dev, live, Prompt } from "@/components/ui/Prompt";
import Footer from "@/components/Footer";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

// Next 15: route params arrive as a Promise.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.outcome } : {};
}

const kicker = "font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent";

// A picture's own size, read at build time. Without it the lazy process frames load in at full
// height as you scroll, the page grows by thousands of pixels, and a jump link stops short.
// From a buffer: a file sharp keeps open blocks re-exports on Windows.
const size = async (src: string) => {
  const { width, height } = await sharp(readFileSync(path.join(process.cwd(), "public", src))).metadata();
  return { w: width, h: height };
};

// Drafted, unconfirmed copy is tagged in development only, so it can be reviewed before shipping.
const Text = ({ b, className }: { b: Block; className?: string }) => (
  <span className={className}>
    <Copy text={b.text} />
    {dev && b.draft && (
      <span className="ml-2 inline-block rounded-full border border-dashed border-accent px-2 align-middle text-[0.625rem] font-semibold text-accent">
        confirm
      </span>
    )}
  </span>
);

const Bullets = ({ blocks, mark = "bg-ink-3" }: { blocks: Block[]; mark?: string }) => (
  <ul className="space-y-5">
    {blocks.map((b) =>
      b.todo ? (
        <Prompt key={b.text} b={b} />
      ) : (
        <li key={b.text} className="flex gap-4 text-lg leading-relaxed text-ink-2">
          <span aria-hidden className={cn("mt-[0.8em] h-px w-5 shrink-0", mark)} />
          <Text b={b} />
        </li>
      )
    )}
  </ul>
);

// Where an "On this page" link lands, focusable so the browser can hand it focus. Lenis
// glides there 88px short, clear of the floating nav; without Lenis (reduced motion) the browser
// jumps, so the margin does that job instead.
// Sized to its words, so the focus ring a keyboard jump leaves around it hugs the heading.
const JUMP = "w-fit self-start motion-reduce:scroll-mt-[88px]";

// A chapter of the case: its name in mono on the left, the substance on the right.
const Row = ({ label, id, children }: { label: string; id?: string; children: React.ReactNode }) => (
  <Reveal className="grid gap-4 border-t border-rule py-12 md:grid-cols-12 md:gap-8 md:py-16">
    <h2 id={id} tabIndex={id ? -1 : undefined} className={cn("font-wide text-lg font-semibold uppercase tracking-[-0.005em] text-ink md:col-span-4 md:text-xl", JUMP)}>{label}</h2>
    <div className="md:col-span-8">{children}</div>
  </Reveal>
);

// One walkthrough step. Steps alternate sides, so the page zig-zags down rather
// than stacking identical blocks (Q75, off-grid). The work comes first in the markup,
// so on a phone you see the thing before you read about it.
async function WalkStep({ step, index, url }: { step: Step; index: number; url: string }) {
  const flip = index % 2 === 1;
  const m = step.media;
  // Board frames can run tall, so their text stays in view beside them.
  const board = m.kind === "board";
  const text = (
    <div className={cn("md:col-span-4", flip ? "md:col-start-9" : "md:order-1", board && "md:sticky md:top-28")}>
      <p className="font-mono text-[0.75rem] tracking-[0.14em] text-ink-3">{String(index + 1).padStart(2, "0")}</p>
      <h3 className="mt-3 font-wide text-xl font-semibold uppercase leading-tight text-ink md:text-2xl">{step.title}</h3>
      <p className="mt-4 leading-relaxed text-ink-2">{step.text}</p>
    </div>
  );
  return (
    <Reveal as="li" className={cn("grid gap-8 md:grid-cols-12 md:gap-12", board ? "items-start" : "items-center")}>
      <figure className={cn("md:col-span-8", flip ? "md:col-start-1 md:row-start-1" : "md:order-2")}>
        {m.kind === "board" ? (
          // One image per theme. The other sits in a display:none box and both are lazy, so it is never fetched.
          <div className="overflow-hidden rounded-xl border border-rule">
            <div className="dark:hidden"><ZoomImage src={m.src} alt={m.alt} {...await size(m.src)} /></div>
            <div className="hidden dark:block"><ZoomImage src={m.dark} alt={m.alt} {...await size(m.dark)} /></div>
          </div>
        ) : (
          <BrowserFrame url={url}>
            {m.kind === "video" ? (
              <DemoVideo src={m.src} poster={m.poster} label={m.label} />
            ) : (
              <ZoomImage src={m.src} alt={m.alt} {...await size(m.src)} />
            )}
          </BrowserFrame>
        )}
      </figure>
      {text}
    </Reveal>
  );
}

// A full-width run of steps: the walkthrough, and the process board frame by frame.
const Steps = ({ label, title, id, steps, url }: { label: string; title: string; id: string; steps?: Step[]; url: string }) =>
  steps && steps.length > 0 ? (
    <section className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-28">
      <Reveal className="mx-auto max-w-[44rem] text-center">
        <p className={kicker}>{label}</p>
        <h2 id={id} tabIndex={-1} className={`${JUMP} mx-auto mt-5 font-wide text-[clamp(2rem,5vw,4rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink`}>{title}</h2>
      </Reveal>
      <ol className="mt-16 space-y-24 md:mt-24 md:space-y-32">
        {steps.map((s, i) => (
          <WalkStep key={s.title} step={s} index={i} url={url} />
        ))}
      </ol>
    </section>
  ) : null;

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const p = projects[index];
  const c = getCase(slug);
  if (!p || !c) notFound();
  const next = projects[(index + 1) % projects.length];
  const isCode = p.link.includes("github.com");
  const img = webp(p.img);

  const process = live(c.process);
  const insights = live(c.insights);
  const wins = live(c.wins);
  const misses = live(c.misses);
  const why = live([c.why]);
  // On this page: only the sections this case has, in page order, each named exactly as its heading.
  const jumps: [string, string][] = [
    ...(c.walkthrough?.length ? [["walkthrough", "The walkthrough"] as [string, string]] : []),
    ["problem", "The problem"],
    ...(c.board?.length ? [["process", "The process"] as [string, string]] : []),
    ["results", "Results"],
  ];

  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />

      <section className="relative isolate overflow-x-clip">

        <div className="mx-auto max-w-[64rem] px-4 pt-24 text-center md:px-8 md:pt-28">
          <TransitionLink href="/#projects" label="Work" className="inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-3 hover:text-ink">
            <ArrowLeft size={14} /> All work
          </TransitionLink>
          <p className={cn(kicker, "mt-6")}>
            Case study {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <h1 className="mt-4 font-wide text-[clamp(2.4rem,6.5vw,5.25rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-ink">{p.title}</h1>

          {/* The work first: the product right under its name, then one line on what it is. */}
          <Reveal className="mx-auto mt-8 max-w-[60rem]">
            <BrowserFrame url={p.link}>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={`${p.title} screenshot`} className="block h-auto w-full" />
              ) : (
                <div className="flex aspect-[16/9] flex-col items-center justify-center gap-5 px-6">
                  <p className="font-wide text-4xl font-semibold uppercase text-ink md:text-6xl">{p.title}</p>
                  <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-3">Screenshot coming soon</p>
                </div>
              )}
            </BrowserFrame>
          </Reveal>

          <p className="mx-auto mt-10 max-w-[34ch] text-[1.35rem] font-medium leading-[1.25] tracking-[-0.02em] text-ink-2 [text-wrap:balance] md:text-[1.7rem]">{p.outcome}</p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-3">
            {[c.status, ...(p.year ? [p.year] : [])].map((f, k) => (
              <li key={f} className="flex items-center gap-3">
                {k > 0 && <span aria-hidden className="text-ink-3/60">/</span>}
                {f}
              </li>
            ))}
          </ul>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-9">
            {isCode ? "View code" : "Visit live site"} <ArrowUpRight size={16} />
          </a>

          {/* Plain links: Lenis glides to each heading (anchors in SmoothScroll), and the browser moves focus there. */}
          <nav aria-label="On this page" className="mt-8">
            <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.12em]">
              {jumps.map(([id, name], k) => (
                <li key={id} className="flex items-center gap-3">
                  {k > 0 && <span aria-hidden className="text-ink-3/60">·</span>}
                  <a href={`#${id}`} className="text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* The product, working, straight after the first look. The story of how it got here comes after. */}
      <Steps label="See it work" title="The walkthrough." id="walkthrough" steps={c.walkthrough} url={p.link} />

      <article className="mx-auto max-w-page px-4 pt-14 md:px-8">
        <Reveal>
          <dl className="grid grid-cols-1 gap-6 pb-10 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Stack</dt>
              <dd className="mt-2 text-lg text-ink">{stack(p.iconLists).join(", ")}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Role</dt>
              <dd className="mt-2 text-lg text-ink">{c.role}</dd>
            </div>
          </dl>
        </Reveal>

        <Row label="The problem" id="problem">
          <p className="max-w-[60ch] text-xl font-medium leading-[1.4] tracking-[-0.015em] text-ink [text-wrap:pretty] md:text-[1.5rem]">
            <Text b={c.problem} />
          </p>
        </Row>

        {process.length > 0 && (
          <Row label="How I worked">
            <Bullets blocks={process} />
          </Row>
        )}
      </article>

      <Steps label="From the process board" title="The process." id="process" steps={c.board} url={p.link} />

      <article className="mx-auto max-w-page px-4 md:px-8">
        <Row label="What I built">
          <Bullets blocks={c.approach} />
        </Row>
      </article>

      <article className="mx-auto max-w-page px-4 md:px-8">
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
                  <p className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">What worked</p>
                  <Bullets blocks={wins} />
                </div>
              )}
              {misses.length > 0 && (
                <div>
                  <p className="mb-5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">What didn&apos;t</p>
                  <Bullets blocks={misses} mark="bg-ink-3" />
                </div>
              )}
            </div>
          </Row>
        )}

        <Row label="Results" id="results">
          <p className="max-w-[60ch] text-xl font-medium leading-[1.4] tracking-[-0.015em] text-ink [text-wrap:pretty] md:text-[1.5rem]">
            <Text b={c.outcome} />
          </p>
          {why.length > 0 && (
            <div className="mt-8 max-w-[60ch]">
              <p className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Why this was the right answer</p>
              {c.why.todo ? (
                <Prompt b={c.why} as="div" />
              ) : (
                <p className="text-lg leading-relaxed text-ink-2">
                  <Text b={c.why} />
                </p>
              )}
            </div>
          )}
        </Row>

        <Reveal>
          <TransitionLink
            href={`/work/${next.slug}`}
            label={next.title}
            data-cursor="Next case"
            className="group relative isolate mt-10 block overflow-hidden rounded-[1.75rem] border border-rule bg-sheet p-8 md:p-14"
          >
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">Next case study</p>
            <p className="mt-4 flex items-center gap-4 font-wide text-4xl font-semibold uppercase tracking-[-0.01em] text-ink md:text-6xl">
              {next.title}
              <ArrowRight className="size-8 shrink-0 transition-transform duration-300 group-hover:translate-x-2 md:size-11" />
            </p>
          </TransitionLink>
        </Reveal>
      </article>

      <Footer />
    </main>
  );
}
