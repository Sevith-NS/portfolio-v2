import { navItems } from "@/data";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Scribble } from "@/components/ui/Scribble";

export default function NotFound() {
  return (
    <main id="main" className="relative z-[1] mx-auto flex min-h-[100dvh] max-w-page flex-col justify-center px-4 md:px-8">
      <FloatingNav navItems={navItems} />
      <p className="note">404 · Not found</p>
      <h1 className="mt-3 font-serif text-6xl font-normal tracking-[-0.02em] text-ink md:text-8xl">This frame is missing.</h1>
      <Scribble className="mt-4 -rotate-2 text-3xl">cut in the edit, probably</Scribble>
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
