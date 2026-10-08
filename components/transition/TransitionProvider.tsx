"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";

type Phase = "idle" | "cover" | "reveal";
type Ctx = { navigate: (href: string, label?: string) => void };

const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

// Premium motion personality: one curve for the curtain, in and out.
const CURTAIN = [0.76, 0, 0.24, 1] as const;
const COVER_MS = 620;
const SAFETY_MS = 3500;

// Page changes play like a film slate: a lapis curtain closes, names the next scene, and opens.
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  // const [scene, setScene] = useState(1);
  const pending = useRef<string | null>(null);
  const pushTimer = useRef<number>();
  const safetyTimer = useRef<number>();
  const busy = useRef(false);

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
      pushTimer.current = window.setTimeout(() => router.push(href), COVER_MS);
      // Never leave the curtain closed, whatever happens to the navigation.
      safetyTimer.current = window.setTimeout(open, SAFETY_MS);
    },
    [lenis, open, pathname, reduce, router]
  );

  // Open the curtain once the route we asked for has rendered.
  useEffect(() => {
    if (pending.current && pathname === pending.current) {
      const t = window.setTimeout(open, 120);
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
            className="pointer-events-auto fixed inset-0 z-[100] flex items-end bg-accent text-on-hl"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.62, ease: CURTAIN }}
          >
            <div className="mx-auto flex w-full max-w-page items-end justify-between gap-6 px-4 pb-10 md:px-8 md:pb-14">
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-5xl font-normal leading-none tracking-[-0.02em] md:text-8xl"
              >
                {label || "Sevith"}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="font-mono text-xs tabular md:text-sm"
              >
                {/* Scene {String(scene).padStart(2, "0")} */}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
