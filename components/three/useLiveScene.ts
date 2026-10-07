"use client";

import { useEffect, useState } from "react";
import { scenes, SCENE_MS } from "@/data/studio";

const clockIndex = () => Math.floor(Date.now() / SCENE_MS) % scenes.length;

// The shared studio clock: every visitor sees the same scene in the same five minutes.
// `index` is null until mounted, so server and client markup agree.
export function useLiveScene() {
  const [index, setIndex] = useState<number | null>(null);
  const [left, setLeft] = useState(SCENE_MS);
  useEffect(() => {
    const tick = () => {
      setIndex(clockIndex());
      setLeft(SCENE_MS - (Date.now() % SCENE_MS));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return { index, left };
}
