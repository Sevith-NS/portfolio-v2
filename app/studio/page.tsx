import type { Metadata } from "next";
import { navItems } from "@/data";
import { FloatingNav } from "@/components/ui/FloatingNav";
import StudioView from "@/components/StudioView";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Studio",
  description: "A small 3D room of what Sevith is up to, changing every five minutes.",
};

export default function StudioPage() {
  return (
    <main id="main" className="relative z-[1]">
      <FloatingNav navItems={navItems} />
      <section className="mx-auto max-w-page px-4 pb-10 pt-28 md:px-8 md:pt-36">
        <div className="mb-10 grid gap-4 md:grid-cols-12 md:items-end">
          <h1 className="section-title md:col-span-8">The studio.</h1>
          <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-2 md:col-span-4">
            A tiny room of what I&apos;m up to when I&apos;m not shipping. It changes scene every five minutes, so come back later.
          </p>
        </div>
        <StudioView />
      </section>
      <Footer />
    </main>
  );
}
