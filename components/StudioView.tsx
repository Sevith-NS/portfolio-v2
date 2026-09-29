"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb } from "@phosphor-icons/react";
import { scenes, SCENE_MS } from "@/data/studio";
import { cn } from "@/lib/utils";

const StudioRoom = dynamic(() => import("./three/StudioRoom"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[2rem] bg-sheet" />,
});

const clockIndex = () => Math.floor(Date.now() / SCENE_MS) % scenes.length;

export default function StudioView() {
  const [base, setBase] = useState<number | null>(null);
  // null = follow the live clock; a number = a scene the visitor picked.
  const [manual, setManual] = useState<number | null>(null);
  const [left, setLeft] = useState(SCENE_MS);
  const [lightsOn, setLightsOn] = useState(true);

  useEffect(() => {
    const tick = () => {
      setBase(clockIndex());
      setLeft(SCENE_MS - (Date.now() % SCENE_MS));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const n = scenes.length;
  const i = manual ?? base ?? 0;
  const step = (d: number) => setManual(((i + d) % n + n) % n);
  const scene = scenes[i];
  const mm = Math.floor(left / 60000);
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] lg:aspect-[4/3] border border-rule bg-tint-lapis/40 lg:col-span-8">
        {base !== null && <StudioRoom id={scene.id} lightsOn={lightsOn} />}
        <button
          type="button"
          onClick={() => setLightsOn((v) => !v)}
          aria-pressed={lightsOn}
          className="btn btn-ghost absolute right-4 top-4 !h-9 !px-3.5 text-sm"
        >
          <Lightbulb size={16} weight={lightsOn ? "fill" : "regular"} />
          {lightsOn ? "Lights off" : "Lights on"}
        </button>
      </div>

      <div className="lg:col-span-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-serif text-4xl font-normal tracking-[-0.02em] text-ink md:text-5xl">{scene.title}</h2>
            <p className="mt-4 max-w-[36ch] text-lg leading-relaxed text-ink-2">{scene.note}</p>
            <p className="note tabular mt-3">
              Scene {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          <button type="button" onClick={() => step(-1)} className="btn btn-ghost !px-3.5" aria-label="Previous scene">
            <ArrowLeft size={16} />
          </button>
          <button type="button" onClick={() => step(1)} className="btn btn-ghost !px-3.5" aria-label="Next scene">
            <ArrowRight size={16} />
          </button>
          {manual !== null && (
            <button type="button" onClick={() => setManual(null)} className="text-sm text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink">
              Back to live
            </button>
          )}
        </div>
        <p className="note mt-4" aria-live="off">
          {manual === null ? `Live. Next scene in ${mm}:${ss}` : "Browsing scenes. The live room keeps its own clock."}
        </p>

        <ul className="mt-8 flex flex-wrap gap-2" aria-label="All scenes">
          {scenes.map((s, k) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setManual(k === base ? null : k)}
                aria-current={k === i}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  k === i ? "border-accent bg-accent text-on-hl" : "border-rule text-ink-2 hover:border-ink hover:text-ink"
                )}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
