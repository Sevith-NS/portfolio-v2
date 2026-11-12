"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/utils";
import { LOAD_MS, Loader } from "./Loader";

type Phase = "idle" | "cover" | "reveal";
// `covered`: the page is hidden (the loader, or the dip between pages), so an entrance should wait.
// `navigate` takes the frame of a clicked project, if there is one, to push into.
type Ctx = { navigate: (href: string, frame?: HTMLElement) => void; covered: boolean };

const TransitionContext = createContext<Ctx>({ navigate: () => {}, covered: false });
export const usePageTransition = () => useContext(TransitionContext);

const DIP_MS = 450;
// Opening a project, beat by beat as Lusion does it: the words let go (QUIET), the
// section pushes toward you out of the clicked frame until its picture has gone past
// the edges of the screen (PUSH), the page colour closes over the last of that, and
// the project comes up out of it slowly (RISE). Coming back runs it the other way:
// the work section starts pushed into that project's picture and pulls back (PULL),
// and the words return once it has nearly settled.
const QUIET_MS = 320;
const PUSH_MS = 950;
const RISE_MS = 900;
const PULL_MS = 1150;
const SAFETY_MS = 3500;

// Where the section holding `frame` sits when it is pushed all the way in: centred on
// the frame, and past filling the screen, like a camera that has kept coming.
function aim(frame: HTMLElement, sec: Element) {
  const r = frame.getBoundingClientRect(), s = sec.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const fill = Math.max(window.innerWidth / r.width, window.innerHeight / r.height);
  return {
    origin: `${cx - s.left}px ${cy - s.top}px`,
    near: `translate(${window.innerWidth / 2 - cx}px, ${window.innerHeight / 2 - cy}px) scale(${fill * 1.6})`,
  };
}
const TIP = [{ transform: "rotate(0deg)" }, { transform: "rotate(-1.6deg)" }, { transform: "rotate(0deg)" }];

// Send the section holding `frame` toward the viewer.
function push(frame: HTMLElement) {
  const sec = frame.closest<HTMLElement>("section");
  if (!sec) return;
  // CSS fades everything but the pictures while this is set (globals.css).
  document.documentElement.dataset.going = "";
  const { origin, near } = aim(frame, sec);
  sec.style.transformOrigin = origin;
  const timing = { duration: PUSH_MS, delay: QUIET_MS, fill: "forwards", easing: "cubic-bezier(0.7, 0, 0.3, 1)" } as const;
  sec.animate([{ transform: "none" }, { transform: near }], timing);
  // It tips a little on the way, then squares up.
  sec.animate(TIP, { ...timing, composite: "add" });
  // And loses focus as it gets too close.
  frame.animate([{ filter: "blur(0px)" }, { filter: "blur(0px)", offset: 0.55 }, { filter: "blur(5px)" }], timing);
}

// The same, backwards: start pushed into `frame` and pull back to rest.
function pull(frame: HTMLElement) {
  const sec = frame.closest<HTMLElement>("section");
  if (!sec) return;
  const root = document.documentElement;
  root.dataset.going = "";
  const { origin, near } = aim(frame, sec);
  sec.style.transformOrigin = origin;
  const timing = { duration: PULL_MS, easing: "cubic-bezier(0.25, 0.6, 0, 1)" } as const;
  sec.animate([{ transform: near }, { transform: "none" }], timing);
  sec.animate(TIP, { ...timing, composite: "add" });
  frame.animate([{ filter: "blur(5px)" }, { filter: "blur(0px)", offset: 0.45 }, { filter: "blur(0px)" }], timing);
  window.setTimeout(() => delete root.dataset.going, PULL_MS * 0.55);
}

// Page changes dip to the page colour and back, like Lusion's. Opening a project
// pushes into its picture first, and coming back pulls out of it.
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pushing, setPushing] = useState(false);
  const pending = useRef<string | null>(null);
  const pushTimer = useRef<number | undefined>(undefined);
  const safetyTimer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  const last = useRef(pathname);

  // The loader: once per visit. The script in app/layout.tsx marks later pages and
  // reduced motion with data-seen before the first paint, and CSS hides it there.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if ("seen" in document.documentElement.dataset) {
      setLoading(false);
      return;
    }
    // It has been playing since the first paint, so wait only for what is left of it.
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem("seen", "1");
      } catch {} // private mode: it plays again next page, no harm
      setLoading(false);
    }, Math.max(0, LOAD_MS + 200 - performance.now()));
    return () => window.clearTimeout(t);
  }, []);

  const open = useCallback(() => {
    window.clearTimeout(safetyTimer.current);
    pending.current = null;
    delete document.documentElement.dataset.going;
    setPhase("reveal");
  }, []);

  const navigate = useCallback(
    (href: string, frame?: HTMLElement) => {
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
      // One transition at a time: extra clicks while it plays are ignored.
      if (busy.current) return;
      busy.current = true;
      pending.current = target;
      setPushing(!!frame);
      if (frame) push(frame);
      setPhase("cover");
      pushTimer.current = window.setTimeout(() => router.push(href), frame ? QUIET_MS + PUSH_MS : DIP_MS);
      // Never leave the page covered, whatever happens to the navigation.
      safetyTimer.current = window.setTimeout(open, SAFETY_MS);
    },
    [lenis, open, pathname, reduce, router]
  );

  // A new route has rendered. Lift the dip if we were waiting on it, a frame later so
  // the page has painted. Back on the landing page from a project (by a link or the
  // browser's back button), put that project's card mid-screen and pull out of it.
  useEffect(() => {
    const from = last.current;
    last.current = pathname;
    const slug = !reduce && pathname === "/" && from.startsWith("/work/") ? from.slice(6) : null;
    const waited = pending.current === pathname;
    if (!waited && !slug) return;
    const t = window.setTimeout(() => {
      if (waited) open();
      const frame = slug && document.querySelector<HTMLElement>(`#projects a[href="/work/${slug}"] [data-zoom]`);
      if (!frame) return;
      const offset = -(window.innerHeight - frame.offsetHeight) / 2;
      if (lenis) lenis.scrollTo(frame, { immediate: true, offset });
      else frame.scrollIntoView({ block: "center" });
      pull(frame);
    }, 80);
    return () => window.clearTimeout(t);
  }, [pathname, open, lenis, reduce]);

  // Back/forward during the dip cancels the queued push and lifts it.
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
    <TransitionContext.Provider value={{ navigate, covered: phase === "cover" || loading }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>
      <AnimatePresence
        onExitComplete={() => {
          busy.current = false;
          setPhase("idle");
        }}
      >
        {phase === "cover" && (
          <motion.div
            key="dip"
            aria-hidden
            className="pointer-events-auto fixed inset-0 z-[100] bg-paper"
            initial={{ opacity: 0 }}
            // After a push, the colour closes over only the last of it.
            animate={{ opacity: 1, transition: pushing ? { delay: (QUIET_MS + PUSH_MS - 380) / 1000, duration: 0.38, ease: "linear" } : { duration: DIP_MS / 1000, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: (pushing ? RISE_MS : DIP_MS) / 1000, ease: EASE } }}
          />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
