// Heading on the left, a margin note on the right: the notebook's spread.
// The highlighter is reserved for decisions, so section titles stay in plain ink.
export function SectionHeader({ title, note }: { title: string; note: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-8">
      <h2 className="section-title md:col-span-8">{title}</h2>
      <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-2 md:col-span-3 md:col-start-10">{note}</p>
    </div>
  );
}
