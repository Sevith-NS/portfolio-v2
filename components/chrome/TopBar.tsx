"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { cn } from "@/lib/utils";
import { Sound } from "./Sound";

const links = [
  { name: "work", href: "/#work", label: "Work", match: (p: string) => p.startsWith("/work") },
  { name: "story", href: "/story", label: "Story", match: (p: string) => p === "/story" },
  { name: "contact", href: "#contact", label: "Contact", match: () => false },
];

// The top letterbox bar: solid black like the timeline bar at the bottom, so
// every page sits inside a cinema frame and the nav reads on any scene.
export function TopBar() {
  const pathname = usePathname();
  return (
    <header className="tone-void fixed inset-x-0 top-0 z-[58] border-b border-soot">
      <div className="flex h-12 items-center justify-between px-4 md:px-6">
        <TransitionLink href="/" label="Sevith" className="title text-[1.6rem] leading-none" data-cursor="home">
          Sevith
        </TransitionLink>
        <nav aria-label="Main" className="flex items-center gap-3 text-[0.75rem] sm:gap-4 sm:text-[0.8125rem] md:gap-7">
          {links.map((l) => (
            <TransitionLink
              key={l.name}
              href={l.href}
              label={l.label}
              aria-current={l.match(pathname) ? "page" : undefined}
              className={cn("underline-offset-[0.35em] hover:underline", l.match(pathname) && "underline decoration-2")}
            >
              {l.name}
            </TransitionLink>
          ))}
          <Sound />
        </nav>
      </div>
    </header>
  );
}
