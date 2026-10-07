import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { navItems, projects } from "@/data";
import { getCase, type Block } from "@/data/work";
import { stack, tintClass, webp } from "@/lib/work";
import { cn } from "@/lib/utils";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import Footer from "@/components/Footer";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = projects.find((x) => x.slug === params.slug);
  return p ? { title: p.title, description: p.outcome } : {};
}

// Drafted, unconfirmed copy is tagged in development only, so it can be reviewed before shipping.
const dev = process.env.NODE_ENV === "development";
const Text = ({ b, className }: { b: Block; className?: string }) => (
  <span className={className}>
    {b.text}
    {dev && b.draft && (
      <span className="ml-2 inline-block rounded-full border border-dashed border-accent px-2 align-middle text-[0.625rem] font-semibold text-accent">
        confirm
      </span>
    )}
  </span>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Reveal className="grid gap-3 border-t border-rule py-10 md:grid-cols-12 md:gap-8 md:py-16">
    <h2 className="font-serif text-2xl tracking-[-0.02em] text-ink md:col-span-4 md:text-3xl">{label}</h2>
    <div className="md:col-span-8">{children}</div>
  </Reveal>
);

// The colour field behind each case opening: the project's tint, softly blurred, with grain.
const field: Record<string, string> = {
  lapis: "bg-tint-lapis", sage: "bg-tint-sage", stone: "bg-tint-stone", butter: "bg-tint-butter",
  blush: "bg-tint-blush", mint: "bg-tint-mint", rose: "bg-tint-rose",
  amber: "bg-tint-amber", garnet: "bg-tint-garnet", clover: "bg-tint-clover",
};

export default function CasePage({ params }: { params: { slug: string } }) {
  const index = projects.findIndex((p) => p.slug === params.slug);
  const p = projects[index];
  const c = getCase(params.slug);
  if (!p || !c) notFound();
  const next = projects[(index + 1) % projects.length];
  const live = p.link.includes("github.com") ? "View code" : "Visit live site";
  const facts = [p.title, c.status, ...(p.year ? [p.year] : [])];

  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />

      <section className="grain relative isolate overflow-hidden">
        <div aria-hidden className={cn("absolute inset-0 -z-10", field[p.tint])} />
        <div aria-hidden className="absolute -left-40 top-10 -z-10 size-[36rem] rounded-full bg-accent/20 blur-[120px]" />
        <div aria-hidden className="absolute -right-32 top-40 -z-10 size-[30rem] rounded-full bg-paper/70 blur-[100px]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-paper" />

        <div className="mx-auto max-w-[64rem] px-4 pt-32 text-center md:px-8 md:pt-40">
          <TransitionLink href="/#projects" label="Work" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
            <ArrowLeft size={14} /> All work
          </TransitionLink>
          <h1 className="mx-auto mt-6 max-w-[22ch] font-serif text-[2.4rem] italic leading-[1.1] tracking-[-0.015em] text-ink sm:text-5xl md:text-[3.6rem]">
            {p.outcome}
          </h1>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.9375rem] font-medium text-ink-2">
            {facts.map((f, k) => (
              <li key={f} className="flex items-center gap-3">
                {k > 0 && <span aria-hidden>•</span>}
                {f}
              </li>
            ))}
          </ul>
          <a href={p.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8">
            {live} <ArrowUpRight size={16} />
          </a>

          <div className="relative mx-auto mt-14 aspect-[16/10] max-w-[60rem] overflow-hidden rounded-t-[1.5rem] border border-b-0 border-white/40 bg-paper/40 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.45)] backdrop-blur-sm md:aspect-[16/9]">
            {p.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={webp(p.img)} alt={`${p.title} screenshot`} className="size-full object-cover object-top" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-6 p-8">
                <p className="font-serif text-6xl tracking-[-0.02em] text-accent md:text-8xl">{p.title}</p>
                <ul className="flex flex-wrap justify-center gap-2">
                  {(p.parts ?? []).map((part) => (
                    <li key={part} className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink shadow-[0_10px_30px_-18px_rgb(0_0_0/0.4)]">
                      {part}
                    </li>
                  ))}
                </ul>
                <p className="note">Screenshot coming soon</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-page px-4 pt-6 md:px-8">
        <Reveal>
          <dl className="grid grid-cols-1 gap-6 py-10 sm:grid-cols-2">
            <div>
              <dt className="note">Stack</dt>
              <dd className="mt-1 text-lg text-ink">{stack(p.iconLists).join(", ")}</dd>
            </div>
            <div>
              <dt className="note">Role</dt>
              <dd className="mt-1 text-lg text-ink">{c.role}</dd>
            </div>
          </dl>
        </Reveal>

        <Row label="The problem">
          <p className="max-w-[60ch] font-serif text-2xl leading-snug text-ink md:text-[1.75rem]">
            <Text b={c.problem} />
          </p>
        </Row>
        <Row label="What I built">
          <ul className="space-y-5">
            {c.approach.map((b) => (
              <li key={b.text} className="flex gap-4 text-lg leading-relaxed text-ink-2">
                <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-accent" />
                <Text b={b} />
              </li>
            ))}
          </ul>
        </Row>
        <Row label="Decisions">
          <ul className="space-y-5">
            {c.decisions.map((b) => (
              <li key={b.text} className="flex gap-4 text-lg leading-relaxed text-ink-2">
                <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-accent" />
                <Text b={b} />
              </li>
            ))}
          </ul>
        </Row>
        <Row label="Outcome">
          <p className="max-w-[60ch] font-serif text-2xl leading-snug text-ink md:text-[1.75rem]">
            <Text b={c.outcome} />
          </p>
        </Row>

        <Reveal>
          <TransitionLink
            href={`/work/${next.slug}`}
            label={next.title}
            data-cursor="Next case"
            className={cn("group mt-10 block overflow-hidden rounded-[1.75rem] p-8 md:p-14", tintClass[next.tint])}
          >
            <p className="flex items-center gap-4 font-serif text-5xl italic tracking-[-0.02em] text-ink md:text-7xl">
              {next.title}
              <ArrowRight className="size-8 transition-transform duration-300 group-hover:translate-x-2 md:size-12" />
            </p>
            <p className="note mt-3">Next case study</p>
          </TransitionLink>
        </Reveal>
      </article>

      <Footer />
    </main>
  );
}
