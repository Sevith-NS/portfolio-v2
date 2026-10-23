"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Cat as CatIcon, Lightbulb } from "@phosphor-icons/react";
import { StudioSkeleton } from "./three/StudioSkeleton";
import type { Hotspot } from "./three/Room";
import { catNote } from "./EasterEggs";
import { usePageTransition } from "./transition/TransitionProvider";

const Room = dynamic(() => import("./three/Room"), { ssr: false, loading: () => <StudioSkeleton /> });

// What each thing in the room says when you point at it.
const HINTS: Record<Hotspot, string> = {
  lamp: "The lamp. Click to switch it.",
  monitor: "Polaris, still cooking. Click to open.",
  cream: "Cream. Don't. (She will.)",
  simba: "Simba, head of QA. He has notes.",
};

const GRUMBLES = ["Simba: mrrrow.", "Simba: MRRROW. Who touched me.", "Simba: filing this with HR. Grooming now."];

const btn =
  "inline-flex h-10 items-center gap-2 rounded-full border border-rule bg-paper px-4 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink";

export default function StudioView() {
  const [lampOn, setLampOn] = useState(true);
  const [chaos, setChaos] = useState(0);
  const [hint, setHint] = useState<Hotspot | null>(null);
  // Simba walks up out of the contact card into the room (see PixelCats).
  const [simbaX, setSimbaX] = useState<number | null>(null);
  const [simbaFuss, setSimbaFuss] = useState(0);
  const { navigate } = usePageTransition();

  // Cream does laps and the mug goes over: when she's clicked, or when "cream" is typed anywhere.
  const cream = () => {
    setChaos((n) => n + 1);
    catNote("Cream was here. Sorry about the mug.");
  };
  useEffect(() => {
    const go = () => setChaos((n) => n + 1);
    const inside = (e: Event) => setSimbaX((e as CustomEvent<number>).detail);
    window.addEventListener("cream", go);
    window.addEventListener("simba-in", inside);
    return () => {
      window.removeEventListener("cream", go);
      window.removeEventListener("simba-in", inside);
    };
  }, []);

  const pick = (h: Hotspot) => {
    if (h === "lamp") setLampOn((v) => !v);
    else if (h === "cream") cream();
    else if (h === "simba") {
      setSimbaFuss((n) => n + 1);
      // He talks a lot. Each note replaces the last, so they land one after another.
      GRUMBLES.forEach((line, i) => setTimeout(() => catNote(line), i * 1400));
    } else navigate("/work/polaris", "Polaris");
  };

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-rule bg-sheet sm:aspect-[4/3] lg:aspect-[16/10]">
        <Room lampOn={lampOn} chaos={chaos} simbaX={simbaX} simbaFuss={simbaFuss} onHover={setHint} onPick={pick} />

        {/* What's under the pointer, in the corner like a caption. */}
        <div aria-hidden className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-start">
          <AnimatePresence>
            {hint && (
              <motion.p
                key={hint}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-full border border-rule bg-paper/90 px-4 py-2 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink backdrop-blur-md"
              >
                {HINTS[hint]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Everything you can click in the room, as plain buttons too: keyboard,
          screen readers and phones get the same room. */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <button type="button" className={btn} aria-pressed={lampOn} onClick={() => setLampOn((v) => !v)}>
          <Lightbulb size={15} weight={lampOn ? "fill" : "regular"} className="text-accent" />
          {lampOn ? "Lamp off" : "Lamp on"}
        </button>
        <button type="button" className={btn} onClick={cream}>
          <CatIcon size={15} className="text-accent" /> Bother Cream
        </button>
        <button type="button" className={btn} onClick={() => pick("monitor")}>
          <ArrowUpRight size={15} className="text-accent" /> What&apos;s on the screen
        </button>
      </div>
    </div>
  );
}
