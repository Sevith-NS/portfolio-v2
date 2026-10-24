"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { DustReveal } from "@/components/motion/PixelDissolve";

type Phase = "idle" | "cover" | "reveal";
type Ctx = { navigate: (href: string, label?: string) => void };

const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

// Premium motion personality: one curve for the curtain, in and out.
const CURTAIN = [0.76, 0, 0.24, 1] as const;
const COVER_MS = 620;
// The curtain stays shut at least this long, so the page name finishes
// assembling from dust before it opens.
const NAME_MS = 1100;
const HOLD_MS = NAME_MS + 250;
const SAFETY_MS = 3500;

// Page changes play like a film slate: a curtain closes, names the next scene, and opens.
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  // const [scene, setScene] = useState(1);
  const pending = useRef<string | null>(null);
  const pushTimer = useRef<number | undefined>(undefined);
  const safetyTimer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  const coveredAt = useRef(0);

  const open = useCallback(() => {
    window.clearTimeout(safetyTimer.current);
    pending.current = null;
    setPhase("reveal");
  }, []);

  const navigate = useCallback(
    (href: string, next = "") => {
      const [path, hash] = href.split("#");
      const target = path || pathname;
      if (target === pathname) {
        const el = hash ? document.getElementById(hash) : null;
        if (el && lenis) lenis.scrollTo(el, { offset: -88, duration: 1.2 });
        else el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        return;
      }
      if (reduce) {
        router.push(href);
        return;
      }
      // One transition at a time: extra clicks while the curtain moves are ignored.
      if (busy.current) return;
      busy.current = true;
      pending.current = target;
      setLabel(next);
      // setScene((s) => s + 1);
      setPhase("cover");
      coveredAt.current = performance.now();
      pushTimer.current = window.setTimeout(() => router.push(href), COVER_MS);
      // Never leave the curtain closed, whatever happens to the navigation.
      safetyTimer.current = window.setTimeout(open, SAFETY_MS);
    },
    [lenis, open, pathname, reduce, router]
  );

  // Open the curtain once the route we asked for has rendered.
  useEffect(() => {
    if (pending.current && pathname === pending.current) {
      const left = HOLD_MS - (performance.now() - coveredAt.current);
      const t = window.setTimeout(open, Math.max(120, left));
      return () => window.clearTimeout(t);
    }
  }, [pathname, open]);

  // Back/forward during the cover cancels the queued push and opens up.
  useEffect(() => {
    const onPop = () => {
      if (!busy.current) return;
      window.clearTimeout(pushTimer.current);
      open();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  useEffect(
    () => () => {
      window.clearTimeout(pushTimer.current);
      window.clearTimeout(safetyTimer.current);
    },
    []
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <AnimatePresence
        onExitComplete={() => {
          busy.current = false;
          setPhase("idle");
        }}
      >
        {phase === "cover" && (
          <motion.div
            key="curtain"
            aria-hidden
            // Between pages the next page's name settles in on the page colour,
            // in the side's accent, so the type and its dust are one colour.
            className="pointer-events-auto fixed inset-0 z-[100] flex items-end overflow-hidden bg-paper text-warm"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.62, ease: CURTAIN }}
          >
            {/* A soft glow of the accent rising from under the page name, like
                light spilling in from the next room as it opens. */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_22%_105%,rgb(var(--warm)/0.34),transparent_70%)] dark:bg-[radial-gradient(70%_60%_at_22%_105%,rgb(var(--warm)/0.38),transparent_70%)]"
            />
            <div className="relative mx-auto flex w-full max-w-page items-end justify-between gap-6 px-4 pb-10 md:px-8 md:pb-14">
              {/* The next page's name assembles from dust, like the landing headline. */}
              <DustReveal duration={NAME_MS}>
                <motion.p
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="font-wide text-5xl font-semibold uppercase leading-none tracking-[-0.01em] md:text-8xl"
                >
                  {label || "Sevith"}
                </motion.p>
              </DustReveal>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="hidden font-mono text-[0.75rem] uppercase tracking-[0.18em] sm:block"
              >
                Sevith Sadashiva
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
