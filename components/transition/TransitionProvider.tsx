"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { cut } from "@/lib/cut";

type Phase = "idle" | "cover" | "reveal";
type Ctx = { navigate: (href: string, label?: string) => void };

const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

// Cut, not curtain: the slate is up within a couple of frames, holds long
// enough to read the next page's name, then cuts away on a flash.
const COVER_MS = 140;
const HOLD_MS = 760;
const SAFETY_MS = 3500;

// Page changes play like a hard cut in an edit: a slate cuts in, names the next scene, and cuts out.
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const [take, setTake] = useState(0);
  const pending = useRef<string | null>(null);
  const pushTimer = useRef<number | undefined>(undefined);
  const safetyTimer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  const coveredAt = useRef(0);

  const open = useCallback(() => {
    window.clearTimeout(safetyTimer.current);
    pending.current = null;
    setPhase("reveal");
    // Out of the slate on a flash, over the new page.
    cut(["white", "invert", "clear"]);
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
      setTake((t) => t + 1);
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
            // A slate cut straight in, no wipe: black, the page name, a blood ghost.
            className="pointer-events-auto fixed inset-0 z-[100] overflow-hidden bg-void text-bone"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
          >
            <div className="slate-flash absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center px-4">
              {/* The next page's name, slammed on, with a lapis ghost a frame behind it. */}
              <p data-cut="in" data-cut-v="slam" style={{ animationDelay: "70ms" }} className="title relative text-center text-[clamp(4.5rem,22vw,20rem)]">
                <span className="absolute inset-0 translate-x-[0.03em] translate-y-[0.015em] text-blood">{label || "Sevith"}</span>
                <span className="relative">{label || "Sevith"}</span>
              </p>
            </div>
            <div className="hud absolute inset-x-0 top-6 flex justify-between px-4 md:top-8 md:px-8">
              <span>cut to</span>
              <span>take {String(take).padStart(2, "0")}</span>
            </div>
            <div className="hud absolute inset-x-0 bottom-6 flex justify-between px-4 md:bottom-8 md:px-8">
              <span>sevith_sadashiva</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
