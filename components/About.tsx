import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { gridItems, heroNotes, ledger } from "@/data";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./motion/Reveal";
import { TransitionLink } from "./transition/TransitionLink";

const item = (id: number) => gridItems.find((g) => g.id === id)!;

const About = () => {
  const role = item(1);
  const interest = item(4);
  const building = item(5);
  const begin = item(6);

  return (
    <section id="about" className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-28">
      <SectionHeader
        title="Product judgment, backed by shipping."
        note="Technical writer by title, product person by habit. Docs taught me to start from the customer's confusion and work back to the fix."
      />

      <Reveal>
        <p className="mt-14 max-w-[30ch] font-serif text-[1.9rem] leading-[1.2] tracking-[-0.015em] text-ink md:text-[2.6rem]">
          {role.title}.
        </p>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-2">
          {role.description}. {interest.title} {building.title}. Currently pursuing a Product Management certification.
        </p>
      </Reveal>

      {/* The timeline, oldest first, ending at what's next. */}
      <Reveal delay={0.05}>
        <ol aria-label="Timeline" className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-rule pt-6 sm:grid-cols-3 lg:grid-cols-5">
          {heroNotes.map((n) => (
            <li key={n.when + n.what} className="flex gap-2.5">
              <span
                aria-hidden
                className={`mt-[7px] size-[7px] shrink-0 rounded-full ${n.highlight ? "bg-accent ring-4 ring-accent/15" : "border border-ink-3"}`}
              />
              <div>
                <p className="note">{n.when}</p>
                <p className={`mt-0.5 text-[0.9375rem] leading-snug ${n.highlight ? "font-semibold text-accent" : "text-ink"}`}>{n.what}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* The ledger: resume numbers, nothing rounded up. */}
      <Reveal delay={0.08}>
        <dl className="mt-10 grid grid-cols-2 border-t border-rule md:grid-cols-4">
          {ledger.map((l, i) => (
            <div
              key={l.label}
              className={`flex flex-col gap-1 border-rule py-6 pr-4 ${i % 2 === 1 ? "border-l pl-4" : ""} ${
                i > 1 ? "border-t md:border-t-0" : ""
              } ${i === 2 ? "md:border-l md:pl-4" : ""}`}
            >
              <dt className="order-2 text-sm leading-snug text-ink-2">{l.label}</dt>
              <dd className="order-1 font-serif text-5xl tracking-[-0.02em] text-ink tabular">{l.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col gap-5 rounded-[1.75rem] bg-sheet p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <p className="font-serif text-2xl italic text-ink md:text-3xl">{begin.title}</p>
          <TransitionLink href="#contact" className="btn btn-primary self-start md:self-auto">
            Send a note <ArrowRight size={16} />
          </TransitionLink>
        </div>
      </Reveal>
    </section>
  );
};

export default About;
