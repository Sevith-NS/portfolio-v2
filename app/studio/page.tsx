import type { Metadata } from "next";
import { navItems } from "@/data";
import { FloatingNav } from "@/components/ui/FloatingNav";
import { Reveal } from "@/components/motion/Reveal";
import StudioView from "@/components/StudioView";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Studio",
  description: "Sevith's room at 2am: the desk, the lamp, and four cats doing what they do.",
};

export default function StudioPage() {
  return (
    <main id="main" className="relative z-[1]">
      <FloatingNav navItems={navItems} />
      <section className="mx-auto max-w-page px-4 pb-10 pt-28 md:px-8 md:pt-36">
        <Reveal className="mb-10 grid gap-5 md:mb-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-accent">The studio</p>
            <h1 className="mt-5 font-wide text-[clamp(2.4rem,6vw,5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.01em] text-ink">
              2am, most nights.
            </h1>
          </div>
          <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-2 md:col-span-4">
            Where the after-hours building happens. Point at things. Click the lamp. Leave Cream alone, if you can.
          </p>
        </Reveal>
        <StudioView />
      </section>
      <Footer />
    </main>
  );
}
