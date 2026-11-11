import { navItems } from "@/data";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { TransitionLink } from "@/components/transition/TransitionLink";

export default function NotFound() {
  return (
    <main id="main" className="relative z-[1] mx-auto flex min-h-[100dvh] max-w-page flex-col justify-center px-4 md:px-8">
      <FloatingNav navItems={navItems} />
      <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">404 · Not found</p>
      <h1 className="mt-5 max-w-[14ch] text-balance font-wide text-[clamp(2.25rem,6.5vw,5.5rem)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-ink">This page is not available.</h1>
      <p className="mt-4 text-lg text-ink-2">Cut in the edit, probably.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <TransitionLink href="/" label="Home" className="btn btn-primary">
          Back to the start
        </TransitionLink>
        <TransitionLink href="/#projects" label="Work" className="btn btn-ghost">
          See the work
        </TransitionLink>
      </div>
    </main>
  );
}
