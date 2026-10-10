import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { interests, navItems } from "@/data";
import { cats, chapters, craft, credentials, notable, opening, passions, portrait, short, signoff } from "@/data/story";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal } from "@/components/motion/Reveal";
import { Copy } from "@/components/ui/Copy";
import { Scribble } from "@/components/ui/Scribble";
import { live, Prompt } from "@/components/ui/Prompt";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "My story",
  description:
    "The long version: how Sevith Sadashiva got from a BCA at Christ University to owning docs for an enterprise GenAI launch, and building AI products on the side.",
};

const Band = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Reveal className="grid gap-4 border-t border-rule py-12 md:grid-cols-12 md:gap-8 md:py-16">
    <h2 className="font-serif text-2xl tracking-[-0.02em] text-ink md:col-span-4 md:text-3xl">{label}</h2>
    <div className="md:col-span-8">{children}</div>
  </Reveal>
);

export default function StoryPage() {
  const certs = live(credentials);
  const chapterList = live(chapters.map((c) => ({ ...c, todo: c.body.todo })));
  const catList = live(cats);

  return (
    <main id="main" className="relative">
      <FloatingNav navItems={navItems} />

      {/* The opening: portrait on the left when there is one, the statement always. */}
      <section className="mx-auto max-w-page px-4 pb-10 pt-32 md:px-8 md:pt-40">
        <div className="grid items-end gap-10 md:grid-cols-12 md:gap-8">
          {portrait.src && (
            <Reveal className="md:col-span-5">
              <figure className="relative overflow-hidden rounded-[1.75rem] bg-tint-lapis">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portrait.src} alt={portrait.alt} className="aspect-[4/5] w-full object-cover" />
              </figure>
              <figcaption className="note mt-3">{portrait.caption}</figcaption>
            </Reveal>
          )}

          <Reveal className={portrait.src ? "md:col-span-7" : "md:col-span-10"}>
            <p className="label text-accent">{opening.kicker}</p>
            <h1 className="section-title mt-4">{opening.headline}</h1>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-ink-2">
              <Copy text={opening.standfirst} />
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {opening.words.map((w) => (
                <li key={w} className="chip">
                  {w}
                </li>
              ))}
            </ul>
            <Scribble className="mt-6 -rotate-2 text-[2.5rem] md:text-[3.25rem]">{opening.scribble}</Scribble>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-page px-4 md:px-8">
        {/* For the recruiter with forty seconds. */}
        <Reveal>
          <div className="rounded-[1.75rem] bg-sheet p-7 md:p-10">
            <p className="label text-ink-3">The short version</p>
            <ul className="mt-5 space-y-4">
              {short.map((b) => (
                <li key={b.text} className="flex gap-4 text-lg leading-relaxed text-ink-2">
                  <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-accent" />
                  <Copy text={b.text} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Band label="How I got here">
          <ol className="space-y-0">
            {chapterList.map((c) => (
              <li key={c.title} className="grid gap-2 border-b border-rule py-7 first:pt-0 last:border-0 sm:grid-cols-4 sm:gap-6">
                <p className="note sm:pt-1">{c.when}</p>
                <div className="sm:col-span-3">
                  <h3 className="text-xl font-semibold tracking-[-0.015em] text-ink">{c.title}</h3>
                  {c.body.todo ? (
                    <div className="mt-3">
                      <Prompt b={c.body} as="div" />
                    </div>
                  ) : (
                    <p className="mt-2.5 max-w-[62ch] leading-relaxed text-ink-2">
                      <Copy text={c.body.text} />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Band>

        <Band label="What I actually do">
          <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {craft.map((c) => (
              <li key={c.title}>
                <h3 className="font-serif text-[1.75rem] italic tracking-[-0.02em] text-ink">{c.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
                  <Copy text={c.body} />
                </p>
                <Scribble className="mt-4 -rotate-2 text-[1.5rem]">{c.note}</Scribble>
              </li>
            ))}
          </ul>
        </Band>

        <Band label="Credentials">
          <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {certs.map((c) => (
              <div key={c.value}>
                <dt className="note">{c.label}</dt>
                {c.todo ? (
                  <>
                    <dd className="mt-1 text-lg leading-snug text-ink">{c.value}</dd>
                    <dd className="mt-3">
                      <Prompt b={{ text: c.detail }} as="div" />
                    </dd>
                  </>
                ) : (
                  <dd className="mt-1">
                    {c.link ? (
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-lg leading-snug text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
                      >
                        {c.value}
                        <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <span className="text-lg leading-snug text-ink">{c.value}</span>
                    )}
                    <p className="note mt-1">{c.detail}</p>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </Band>

        <Band label="Notable projects">
          <ul className="border-t border-rule">
            {notable.map((n) => {
              const inner = (
                <>
                  <p className="flex items-center gap-3 font-serif text-[1.9rem] italic tracking-[-0.02em] text-ink md:text-[2.4rem]">
                    {n.title}
                    {n.external ? (
                      <ArrowUpRight className="size-5 shrink-0 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:size-6" />
                    ) : (
                      <ArrowRight className="size-5 shrink-0 text-ink-3 transition-transform duration-300 group-hover:translate-x-1.5 md:size-6" />
                    )}
                  </p>
                  <p className="mt-2 max-w-[62ch] leading-relaxed text-ink-2">
                    <Copy text={n.line} />
                  </p>
                </>
              );
              return (
                <li key={n.title} className="border-b border-rule">
                  {n.external ? (
                    <a href={n.href} target="_blank" rel="noopener noreferrer" className="group block py-7">
                      {inner}
                    </a>
                  ) : (
                    <TransitionLink href={n.href} label={n.title} data-cursor="View case" className="group block py-7">
                      {inner}
                    </TransitionLink>
                  )}
                </li>
              );
            })}
          </ul>
        </Band>

        <Band label="Passions">
          <h3 className="max-w-[28ch] font-serif text-[1.9rem] leading-[1.18] tracking-[-0.015em] text-ink md:text-[2.4rem]">
            {passions.headline}
          </h3>
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-ink-2">
            <Copy text={passions.body} />
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {interests.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
          <Scribble className="mt-6 -rotate-2 text-[1.75rem] md:text-[2.25rem]">{passions.scribble}</Scribble>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <p className="label text-ink-3">Also: four cats, one bed, no personal space</p>
              <ul className="mt-5 space-y-5">
                {catList.map((c) =>
                  c.todo ? (
                    <Prompt key={c.who} b={{ text: c.line }} />
                  ) : (
                    <li key={c.who}>
                      <p className="text-[0.9375rem] font-semibold text-ink">{c.who}</p>
                      <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-ink-2">{c.line}</p>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* A door into the 3D studio, same as the home page offers. */}
            <TransitionLink
              href="/studio"
              label="Studio"
              className="group flex h-fit items-center justify-between gap-6 rounded-[1.75rem] bg-accent p-6 text-on-hl md:p-8"
            >
              <div>
                <p className="font-serif text-3xl font-normal tracking-[-0.02em]">See all of it, in a room</p>
                <p className="mt-1.5 max-w-[34ch] text-on-hl/80">
                  The studio is a little 3D version of everything above. The cats are in there too.
                </p>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-on-hl text-accent transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={20} />
              </span>
            </TransitionLink>
          </div>
        </Band>

        <Reveal className="border-t border-rule py-14 md:py-20">
          <p className="mx-auto max-w-[34ch] text-center font-serif text-[1.9rem] leading-[1.2] tracking-[-0.015em] text-ink md:max-w-[44ch] md:text-[2.75rem]">
            {signoff.line}
          </p>
          <div className="mt-8 text-center">
            <Scribble className="-rotate-2 text-[2.25rem] md:text-[3rem]">{signoff.scribble}</Scribble>
          </div>
        </Reveal>
      </div>

      <Footer />
    </main>
  );
}
