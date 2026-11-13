"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { navItems, resumeLink } from "@/data";
import { cn, EASE } from "@/lib/utils";
import { TransitionLink } from "../transition/TransitionLink";
import { usePageTransition } from "../transition/TransitionProvider";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";

// After Lusion's header: the logo on the left; the theme and sound buttons, LET'S
// TALK and MENU on the right. No page links in the bar: they live in the menu.
// It stays put while the page scrolls and flips its type over dark sections.
// MENU opens a small card under itself, not a full-screen menu, as Lusion's does.

const PILL = "flex h-10 items-center rounded-full font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em]";

// On a case study: a BACK pill to home's work, the logo in the case's own accent, like Lusion's,
// and the case's colours throughout (`turned`: them turned over, for its light end panel).
export function Header({ back = false, accent, turned }: { back?: boolean; accent?: string; turned?: CSSProperties } = {}) {
  const pathname = usePathname();
  const home = pathname === "/";
  const lenis = useLenis();
  const { navigate } = usePageTransition();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState<"" | "dark" | "light">("");
  const bar = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const onCase = !!turned;

  const href = (link: string) => (link.startsWith("#") && !home ? `/${link}` : link);
  // Work is home's own content, so it is current on home and on every case study.
  const current = (link: string) => (link === "#projects" ? home || pathname.startsWith("/work") : pathname.startsWith(link));

  // What's under the header's line decides its tokens: a section marked
  // data-header="dark" (the opened space card) gives light type; a `.band` (the
  // page turned inside out) gives the other side's type. Otherwise the page's own.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const b = button.current?.getBoundingClientRect();
      // Under MENU, both ways: a case study's end panel spans the screen's height off to the side.
      const line = b ? b.top + b.height / 2 : 60, mid = b ? b.left + b.width / 2 : window.innerWidth - 60;
      const under = (sel: string) => Array.from(document.querySelectorAll(sel)).some((n) => {
        const r = n.getBoundingClientRect();
        return r.top <= line && r.bottom >= line && r.left <= mid && r.right >= mid;
      });
      const dark = document.documentElement.classList.contains("dark");
      // A light panel inside a dark page (a case study's next-project panel) wins over the page.
      // A case study keeps its own colours, so only its light panel turns the header over.
      if (onCase) setOnDark(under('[data-header="light"]') ? "light" : "");
      else setOnDark(under('[data-header="light"]') ? "light" : under('[data-header="dark"]') ? (dark ? "" : "dark") : under(".band") ? (dark ? "light" : "dark") : "");
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    const marks = new MutationObserver(queue);
    marks.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-header"], subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      marks.disconnect();
    };
  }, [pathname, onCase]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("keydown", key);
    document.addEventListener("pointerdown", away);
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", away);
    };
  }, [open]);

  // LET'S TALK and CONTACT: down to the contact section, or home's when a page has none.
  const toContact = () => {
    setOpen(false);
    const el = document.getElementById("contact");
    if (!el) return navigate("/#contact");
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const talk = (
    <button
      type="button"
      onClick={toContact}
      className={cn(PILL, "group relative overflow-hidden bg-ink pl-5 pr-4 text-paper transition-colors duration-300 hover:bg-lamp hover:text-on-hl")}
    >
      <ArrowRight size={13} weight="bold" aria-hidden className="absolute left-4 -translate-x-5 opacity-0 transition-[transform,opacity] duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
      <span className="transition-transform duration-300 ease-out group-hover:translate-x-3">Let&apos;s talk</span>
      <span aria-hidden className="ml-2.5 size-[0.3rem] rounded-full bg-current transition-[transform,opacity] duration-300 group-hover:scale-0 group-hover:opacity-0" />
    </button>
  );

  const item = "group/item flex h-11 items-center justify-between rounded-xl px-4 font-wide text-[1.02rem] font-semibold uppercase tracking-[-0.01em] text-ink transition-colors duration-200 hover:bg-hl/10";
  const arrow = <ArrowRight size={16} aria-hidden className="-translate-x-2 opacity-0 transition-[transform,opacity] duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" />;

  return (
    <header
      ref={bar}
      style={onCase && onDark === "light" ? turned : undefined}
      className={cn("pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-[5vw] md:pt-[3rem]", !onCase && onDark)}
    >
      <div className="flex items-center justify-between gap-3">
        <TransitionLink href={home ? "#top" : "/"} style={accent ? { color: accent } : undefined} className="pointer-events-auto font-serif text-[clamp(1.55rem,1.9vw,2.2rem)] leading-none tracking-[-0.02em] text-ink">
          sevith<span className={accent ? undefined : "text-warm"}>.</span>
        </TransitionLink>

        <nav aria-label="Primary" className="pointer-events-auto relative flex items-center gap-2">
          {back && (
            <TransitionLink href="/" aria-label="Back to the work" className={cn(PILL, "group gap-2 bg-ink/[0.07] px-4 text-ink transition-colors duration-300 hover:bg-ink/[0.13] sm:px-5 md:mr-[6vw]")}>
              <ArrowLeft size={13} weight="bold" aria-hidden className="transition-transform duration-300 ease-out group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back</span>
            </TransitionLink>
          )}
          <ThemeToggle />
          <SoundToggle />
          <div className="hidden md:block">{talk}</div>
          <button
            ref={button}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            className={cn(PILL, "gap-3 bg-ink/[0.07] px-5 text-ink transition-colors duration-300 hover:bg-ink/[0.13]")}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span aria-hidden className={cn("flex gap-[3px] transition-transform duration-300", open && "rotate-90")}>
              <span className="size-[0.22rem] rounded-full bg-current" />
              <span className="size-[0.22rem] rounded-full bg-current" />
            </span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                ref={panel}
                id="site-menu"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-2rem))] origin-top-right"
              >
                <ul className="rounded-[1.1rem] bg-sheet p-2 shadow-[0_24px_60px_-30px_rgb(var(--shade)/0.45)]">
                  {navItems.map((m) => {
                    const on = current(m.link);
                    const inner = (
                      <>
                        {m.name}
                        {on ? <span aria-hidden className="size-[0.35rem] rounded-full bg-current" /> : arrow}
                      </>
                    );
                    return (
                      <li key={m.link}>
                        {m.link.startsWith("#") && home ? (
                          <a href={m.link} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} className={item}>
                            {inner}
                          </a>
                        ) : (
                          <TransitionLink href={href(m.link)} onClick={() => setOpen(false)} aria-current={on ? "page" : undefined} className={item}>
                            {inner}
                          </TransitionLink>
                        )}
                      </li>
                    );
                  })}
                  <li>
                    <button type="button" onClick={toContact} className={cn(item, "w-full")}>
                      Contact
                      {arrow}
                    </button>
                  </li>
                  {/* Phones: LET'S TALK moves in here. */}
                  <li className="px-2 pb-2 pt-1 md:hidden">{talk}</li>
                </ul>
                <a
                  href={resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/item mt-2 flex h-14 items-center justify-between rounded-[1.1rem] bg-ink px-5 text-paper"
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="font-serif text-[1.35rem] leading-none tracking-[-0.02em]">
                      s<span className="text-warm">.</span>
                    </span>
                    <span className="font-wide text-[1.02rem] font-semibold uppercase tracking-[-0.01em]">Resume</span>
                  </span>
                  <ArrowUpRight size={18} aria-hidden className="transition-transform duration-200 group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}
