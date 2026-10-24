"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

// A paragraph that lights up word by word as you scroll through it, from faint
// to full. *Asterisk* phrases are keywords, as in ui/Copy.
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  // Words and the spaces between them, kept as written so punctuation stays put.
  const tokens = text.split(/\*([^*]+)\*/g).flatMap((part, i) =>
    part.split(/(\s+)/).filter(Boolean).map((t) => ({ t, key: i % 2 === 1, space: !t.trim() }))
  );
  const total = tokens.filter((x) => !x.space).length;
  let n = 0;

  return (
    <p ref={ref} className={className}>
      {tokens.map(({ t, key, space }, i) => {
        if (space) return t;
        const at = n++ / total;
        return (
          <Word key={i} p={scrollYProgress} at={[at, at + 1 / total]} still={!!reduce}>
            {key ? <strong className="key">{t}</strong> : t}
          </Word>
        );
      })}
    </p>
  );
}

function Word({ children, p, at, still }: { children: ReactNode; p: MotionValue<number>; at: [number, number]; still: boolean }) {
  const opacity = useTransform(p, at, [0.15, 1]);
  return <motion.span style={still ? undefined : { opacity }}>{children}</motion.span>;
}
