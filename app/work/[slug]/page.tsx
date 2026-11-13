import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight, CaretDoubleRight } from "@phosphor-icons/react/dist/ssr";
import { projects } from "@/data";
import { getCase, type Block, type Step } from "@/data/work";
import { webp } from "@/lib/work";
import { cn } from "@/lib/utils";
import { size } from "@/lib/size";
import { caseTheme } from "@/lib/theme";
import { Header } from "@/components/ui/Header";
import { Rise } from "@/components/motion/Rise";
import { Copy } from "@/components/ui/Copy";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { ZoomImage } from "@/components/ui/ZoomImage";
import { dev, live, Prompt } from "@/components/ui/Prompt";
import { CaseStrip } from "@/components/case/CaseStrip";
import { CaseColours } from "@/components/case/CaseColours";
import { NextProject } from "@/components/NextProject";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

// Next 15: route params arrive as a Promise.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.outcome } : {};
}

// Small caps in the case's accent, like Lusion's SERVICES.
const LABEL = "font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent";
const CHAPTER = "font-wide text-[clamp(1.6rem,2.6vw,2.6rem)] font-semibold uppercase leading-none tracking-[-0.01em] text-ink";

// Drafted, unconfirmed copy is tagged in development only, so it can be reviewed before shipping.
const Text = ({ b }: { b: Block }) => (
  <>
    <Copy text={b.text} />
    {dev && b.draft && (
      <span className="ml-2 inline-block rounded-full border border-dashed border-accent px-2 align-middle text-[0.625rem] font-semibold text-accent">confirm</span>
    )}
  </>
);

// A picture in its rounded panel, held at its own shape; `[data-drift]` drifts inside it (CaseStrip).
const Panel = ({ w, h, tall, children }: { w: number; h: number; tall?: boolean; children: React.ReactNode }) => (
  <div className={cn("relative w-full shrink-0 overflow-hidden rounded-2xl bg-sheet lg:w-auto", tall ? "lg:h-[68vh]" : "lg:h-[58vh]")} style={{ aspectRatio: `${w} / ${h}` }}>
    <div data-drift className="h-full w-full">
      {children}
    </div>
  </div>
);

// A clip or a process frame, its words beside it as a narrow column. Board frames are the
// dark exports: case pages are dark in both themes.
async function Shot({ step, n }: { step: Step; n: number }) {
  const m = step.media;
  const src = m.kind === "board" ? m.dark : m.kind === "video" ? m.poster : m.src;
  const { w, h } = await size(src);
  return (
    <figure className="flex shrink-0 flex-col gap-6 lg:flex-row lg:items-end lg:gap-[2.5vw]">
      <Panel w={w} h={h} tall={m.kind === "board"}>
        {m.kind === "video" ? (
          <DemoVideo src={m.src} poster={m.poster} label={m.label} className="block h-full w-full object-cover" />
        ) : (
          <ZoomImage src={src} alt={m.alt} w={w} h={h} />
        )}
      </Panel>
      <figcaption className="max-w-[24rem] lg:w-[17rem] lg:max-w-none">
        <p className="font-mono text-[0.75rem] tracking-[0.14em] text-accent">{String(n).padStart(2, "0")}</p>
        <h3 className="mt-3 font-wide text-lg font-semibold uppercase leading-tight text-ink">{step.title}</h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{step.text}</p>
      </figcaption>
    </figure>
  );
}

// A chapter in words: its name, then its points flowing into narrow columns, two rows deep
// when there are many, so it reads across like the rest of the strip.
function Words({ label, blocks }: { label: string; blocks: Block[] }) {
  if (!blocks.length) return null;
  return (
    <section className="shrink-0">
      <h2 className={CHAPTER}>{label}</h2>
      <ul className={cn("mt-8 grid gap-x-10 gap-y-8 lg:mt-6 lg:grid-flow-col lg:auto-cols-[22rem] lg:gap-y-6", blocks.length > 3 ? "lg:grid-rows-2" : "lg:grid-rows-1")}>
        {blocks.map((b) =>
          b.todo ? (
            <Prompt key={b.text} b={b} />
          ) : (
            <li key={b.text} className="max-w-[34rem] text-[0.95rem] leading-[1.6] text-ink-2">
              <span aria-hidden className="mb-3 block h-px w-6 bg-ink-3" />
              <Text b={b} />
            </li>
          ),
        )}
      </ul>
    </section>
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
  const theme = caseTheme(slug);
  // The palette as CSS variables; React spells the one plain property colorScheme.
  const css = (vars: Record<string, string>) => {
    const { "color-scheme": colorScheme, ...rest } = vars;
    return { ...rest, colorScheme } as CSSProperties;
  };
  const style = css(theme.vars());
  // The title a word a line, sized so its longest word fits the column (a wide cap is about 0.83em, with room to spare).
  const fit = Math.min(3.8, 25 / (0.9 * Math.max(...p.title.split(" ").map((w) => w.length)))).toFixed(2);
  const walk = c.walkthrough ?? [];
  const board = c.board ?? [];
  // A case without footage leads with its screenshot instead.
  const shot = walk.length ? "" : webp(p.img);
  const shotSize = shot ? await size(shot) : null;
  const wins = live(c.wins), misses = live(c.misses), why = live([c.why]);
  const sides: [string, Block[]][] = [
    ["What worked", wins],
    ["What didn't", misses],
  ];

  return (
    // Its own colours, whatever the site theme, and dark under the header so the header goes light.
    <main id="main" data-header="dark" className="relative min-h-screen bg-paper text-ink" style={style}>
      <CaseColours vars={theme.vars()} />
      <Header back accent={theme.hex("accent")} turned={css(theme.turn().vars())} />

      <CaseStrip
        hint={
          <p className={cn(LABEL, "flex items-center gap-2")}>
            Scroll to explore <CaretDoubleRight size={13} weight="bold" aria-hidden />
          </p>
        }
      >
        {/* First screen: the name, what it is, the way in, and the role, like Lusion's. */}
        <div className="flex shrink-0 flex-col gap-10 lg:w-[38vw] lg:flex-row lg:items-center lg:gap-[3.5vw]">
          <div className="lg:w-[25vw]">
            <h1 style={{ fontSize: `clamp(2.4rem, ${fit}vw, 4.6rem)` }} className="font-wide font-semibold uppercase leading-[0.92] tracking-[-0.01em] text-ink">
              <Rise lines={p.title.split(" ")} />
            </h1>
            <div className="mt-8 max-w-[30rem] space-y-4 text-[0.98rem] leading-relaxed text-ink-2">
              <p>
                <Text b={c.problem} />
              </p>
              <p>{p.outcome}</p>
            </div>
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-9 inline-flex h-12 items-center gap-3 rounded-full bg-ink px-6 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-paper transition-opacity duration-300 hover:opacity-90"
            >
              <span aria-hidden className="size-[0.35rem] rounded-full bg-current transition-transform duration-300 group-hover:scale-150" />
              {isCode ? "View code" : "Launch project"}
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
          <div className="lg:w-[9vw]">
            <p className={LABEL}>Role</p>
            <ul className="mt-4 space-y-1 text-[0.98rem] text-ink">
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* The product working, from the first screen on. */}
        {walk.map((s, i) => (
          <Shot key={s.title} step={s} n={i + 1} />
        ))}
        {shot && shotSize && (
          <Panel {...shotSize}>
            <ZoomImage src={shot} alt={`${p.title} screenshot`} {...shotSize} />
          </Panel>
        )}

        <Words label="How I worked" blocks={live(c.process)} />

        {board.length > 0 && (
          <div className="shrink-0">
            <p className={LABEL}>From the process board</p>
            <h2 className="mt-5 font-wide text-[clamp(2.6rem,7vw,7.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.01em] text-ink">
              The
              <br />
              process.
            </h2>
          </div>
        )}
        {board.map((s, i) => (
          <Shot key={s.title} step={s} n={i + 1} />
        ))}

        <Words label="What I built" blocks={c.approach} />
        <Words label="What changed the design" blocks={live(c.insights)} />
        <Words label="Decisions" blocks={c.decisions} />

        {wins.length + misses.length > 0 && (
          <section className="shrink-0">
            <h2 className={CHAPTER}>Wins and misses</h2>
            <div className="mt-8 grid gap-10 lg:grid-flow-col lg:auto-cols-[19rem] lg:gap-x-10">
              {sides.map(([name, list]) =>
                list.length ? (
                  <div key={name}>
                    <p className={LABEL}>{name}</p>
                    <ul className="mt-5 space-y-6">
                      {list.map((b) => (
                        <li key={b.text} className="max-w-[34rem] text-[0.98rem] leading-relaxed text-ink-2">
                          <Text b={b} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          </section>
        )}

        <section className="shrink-0 lg:w-[40rem]">
          <h2 className={CHAPTER}>Results</h2>
          <p className="mt-8 max-w-[36rem] text-[clamp(1.35rem,2vw,2rem)] font-medium leading-[1.3] tracking-[-0.015em] text-ink">
            <Text b={c.outcome} />
          </p>
          {why.length > 0 && (
            <div className="mt-8 max-w-[34rem]">
              <p className={LABEL}>Why this was the right answer</p>
              {c.why.todo ? (
                <Prompt b={c.why} as="div" />
              ) : (
                <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">
                  <Text b={c.why} />
                </p>
              )}
            </div>
          )}
        </section>

        <NextProject slug={next.slug} title={next.title} />
      </CaseStrip>
    </main>
  );
}
