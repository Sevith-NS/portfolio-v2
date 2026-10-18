"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The track behind a toggle. Off until the visitor asks; first play starts at
// the breakdown before the drop. Lives in the layout, so it keeps playing
// across page changes.
const START = 61.2;

export function Sound() {
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (on) {
      a.pause();
      setOn(false);
      return;
    }
    const seek = () => {
      if (a.currentTime < 1) a.currentTime = START;
    };
    if (a.readyState >= 1) seek();
    else a.addEventListener("loadedmetadata", seek, { once: true });
    a.volume = 0.7;
    a.play()
      .then(() => setOn(true))
      .catch(() => setOn(false));
  };

  return (
    <>
      <button type="button" onClick={toggle} aria-pressed={on} data-cursor={on ? "mute" : "play dirty"} className="flex items-center gap-2">
        <span aria-hidden className={cn("eq flex h-3 items-end gap-[2px]", on && "eq-on")}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-[2px] bg-current" style={{ height: on ? undefined : "3px", animationDelay: `${i * -0.17}s` }} />
          ))}
        </span>
        <span>{on ? "sound on" : "sound off"}</span>
      </button>
      <audio ref={ref} src="/audio/dirty.mp3" preload="metadata" loop />
    </>
  );
}
