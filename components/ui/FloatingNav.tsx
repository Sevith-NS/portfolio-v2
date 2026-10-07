"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Cube,
  EnvelopeSimple,
  FileText,
  List,
  Path,
  Smiley,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { resumeLink } from "@/data";
import { ThemeToggle } from "./ThemeToggle";
import { TransitionLink } from "../transition/TransitionLink";

// Every section on the home page, in scroll order: the counter reads off this.
const sections = ["top", "projects", "about", "experience", "approach", "off-the-clock", "contact"];

const icons: Record<string, Icon> = {
  Work: Briefcase,
  About: Smiley,
  Experience: Path,
  Studio: Cube,
  Contact: EnvelopeSimple,
};

// Pill navigation: a name pill on the left, a cluster of icon pills on the right.
// The active pill fills with lapis and slides between items.
export const FloatingNav = ({ navItems }: { navItems: { name: string; link: string }[] }) => {
  const [active, setActive] = useState<string>("");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const home = pathname === "/";
  const toggle = useRef<HTMLButtonElement>(null);

  // A hairline that fills across the top as the page runs out.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const hrefFor = (link: string) => (link.startsWith("#") && !home ? `/${link}` : link);
  const isActive = (link: string) =>
    link.startsWith("#")
      ? (home && active === link) || (link === "#projects" && pathname.startsWith("/work"))
      : pathname.startsWith(link);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen((o) => {
        if (o) toggle.current?.focus();
        return false;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  // Track which section is in the middle of the screen: it drives both the pill and the counter.
  useEffect(() => {
    if (!home) return;
    const anchors = new Set(navItems.filter((n) => n.link.startsWith("#")).map((n) => n.link));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          const i = sections.indexOf(id);
          if (i >= 0) setIndex(i);
          if (id === "top") setActive("");
          else if (anchors.has(`#${id}`)) setActive(`#${id}`);
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [navItems, home]);

  const pill = "flex h-10 items-center rounded-full border border-rule bg-paper/80 backdrop-blur-md shadow-[0_6px_20px_-12px_rgb(0_0_0/0.25)]";

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-4 md:top-4 md:px-8">
      {/* Progress line: same scroll, drawn thin. */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="pointer-events-none fixed inset-x-0 top-0 h-px origin-left bg-accent"
      />

      <div className="mx-auto flex max-w-[64rem] items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TransitionLink
            href={home ? "#top" : "/"}
            label="Home"
            className={cn(pill, "px-4 font-serif text-[1.15rem] tracking-[-0.02em] text-ink")}
          >
            sevith<span className="text-accent">.</span>
          </TransitionLink>

          {home && (
            <p className={cn(pill, "label hidden px-3 text-ink-3 sm:flex")} aria-hidden>
              {String(index + 1).padStart(2, "0")}
              <span className="px-1 text-rule">/</span>
              {String(sections.length).padStart(2, "0")}
            </p>
          )}
        </div>

        <nav aria-label="Primary" className="flex items-center gap-1.5">
          <ul className={cn(pill, "hidden gap-0.5 p-1 lg:flex")}>
            {navItems.map((item) => {
              const Ic = icons[item.name] ?? Briefcase;
              const on = isActive(item.link);
              return (
                <li key={item.link} className="relative">
                  {on && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <TransitionLink
                    href={hrefFor(item.link)}
                    label={item.name}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "relative flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.875rem] font-medium transition-colors",
                      on ? "text-on-hl" : "text-ink-2 hover:text-ink"
                    )}
                  >
                    <Ic size={15} weight={on ? "fill" : "regular"} />
                    {item.name.toLowerCase()}
                  </TransitionLink>
                </li>
              );
            })}
            <li>
              <a
                href={resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.875rem] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                <FileText size={15} />
                résumé
              </a>
            </li>
          </ul>

          <div className={cn(pill, "px-0.5")}>
            <ThemeToggle />
          </div>
          <button
            ref={toggle}
            type="button"
            className={cn(pill, "w-10 justify-center text-ink lg:hidden")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="mx-auto mt-2 max-w-[64rem] overflow-hidden rounded-3xl border border-rule bg-paper/95 p-2 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.3)] backdrop-blur-md lg:hidden"
          >
            {navItems.map((item, i) => {
              const Ic = icons[item.name] ?? Briefcase;
              return (
                <motion.li key={item.link} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <TransitionLink
                    href={hrefFor(item.link)}
                    label={item.name}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3.5 font-serif text-xl",
                      isActive(item.link) ? "bg-accent text-on-hl" : "text-ink hover:bg-sheet"
                    )}
                  >
                    <Ic size={18} weight={isActive(item.link) ? "fill" : "regular"} />
                    {item.name.toLowerCase()}
                  </TransitionLink>
                </motion.li>
              );
            })}
            <li>
              <a
                href={resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-serif text-xl text-ink hover:bg-sheet"
              >
                <FileText size={18} />
                résumé
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
};
