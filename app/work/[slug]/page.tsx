import type { Metadata } from "next";
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

// A chapter of the case: its name in mono on the left, the substance on the right.
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Reveal className="grid gap-4 border-t border-rule py-12 md:grid-cols-12 md:gap-8 md:py-16">
    <h2 className="font-wide text-lg font-semibold uppercase tracking-[-0.005em] text-ink md:col-span-4 md:text-xl">{label}</h2>
    <div className="md:col-span-8">{children}</div>
  </Reveal>
);

// One walkthrough step. Steps alternate sides, so the page zig-zags down rather
// than stacking identical blocks (Q75, off-grid).
function WalkStep({ step, index, url }: { step: Step; index: number; url: string }) {
  const flip = index % 2 === 1;
  return (
    <Reveal as="li" className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
      <div className={cn("md:col-span-4", flip && "md:order-2 md:col-start-9")}>
        <p className="font-mono text-[0.75rem] tracking-[0.14em] text-ink-3">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-3 font-wide text-xl font-semibold uppercase leading-tight text-ink md:text-2xl">{step.title}</h3>
        <p className="mt-4 leading-relaxed text-ink-2">{step.text}</p>
      </div>
      <figure className={cn("md:col-span-8", flip && "md:order-1 md:col-start-1")}>
        <BrowserFrame url={url}>
          {step.media.kind === "video" ? (
            <DemoVideo src={step.media.src} poster={step.media.poster} label={step.media.label} />
          ) : (
            <ZoomImage src={step.media.src} alt={step.media.alt} />
          )}
        </BrowserFrame>
        {step.aside && <figcaption className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">{step.aside}</figcaption>}
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

  const process = live(c.process);
  const insights = live(c.insights);
  const wins = live(c.wins);
  const misses = live(c.misses);
  const why = live([c.why]);

  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />

      <section className="relative isolate overflow-x-clip">

        <div className="mx-auto max-w-[64rem] px-4 pt-32 text-center md:px-8 md:pt-40">
          <TransitionLink href="/#projects" label="Work" className="inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-3 hover:text-ink">
            <ArrowLeft size={14} /> All work
          </TransitionLink>
          <p className={cn(kicker, "mt-10")}>
            Case study {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
          <h1 className="mt-5 font-wide text-[clamp(2.6rem,8vw,6.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-ink">{p.title}</h1>
          <p className="mx-auto mt-7 max-w-[34ch] text-[1.35rem] font-medium leading-[1.25] tracking-[-0.02em] text-ink-2 [text-wrap:balance] md:text-[1.7rem]">{p.outcome}</p>
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

          <Reveal className="mx-auto mt-16 max-w-[60rem]">
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
        </div>
      </section>

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

        <Row label="The problem">
          <p className="max-w-[60ch] text-xl font-medium leading-[1.4] tracking-[-0.015em] text-ink [text-wrap:pretty] md:text-[1.5rem]">
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
      </article>

      {/* The product, working. Full width, because this is the part people came for. */}
      {c.walkthrough && c.walkthrough.length > 0 && (
        <section className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-28">
          <Reveal className="mx-auto max-w-[44rem] text-center">
            <p className={kicker}>See it work</p>
            <h2 className="mt-5 font-wide text-[clamp(2rem,5vw,4rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink">The walkthrough.</h2>
          </Reveal>
          <ol className="mt-16 space-y-24 md:mt-24 md:space-y-32">
            {c.walkthrough.map((s, i) => (
              <WalkStep key={s.title} step={s} index={i} url={p.link} />
            ))}
          </ol>
        </section>
      )}

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

        <Row label="Where it landed">
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
