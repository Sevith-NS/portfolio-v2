"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, EnvelopeSimple, Mouse } from "@phosphor-icons/react";
import { email, resumeLink } from "@/data";
import { Scribble } from "./ui/Scribble";

const ease = [0.16, 1, 0.3, 1] as const;

// Centered serif statement, a lapis handwritten note crossing it, and a quiet cue to scroll.
const Hero = () => {
  const words = "Product builder who designs, defines and ships thoughtful AI products.".split(" ");
  return (
    <section id="top" className="relative mx-auto flex min-h-[100dvh] max-w-[64rem] flex-col items-center justify-center px-4 pb-16 pt-28 text-center md:px-8">
      <motion.p
        initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease }}
        className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-accent"
      >
        Sevith Sadashiva · Bangalore
      </motion.p>

      <h1 className="relative mt-7 max-w-[18ch] font-serif text-[2.6rem] leading-[1.08] tracking-[-0.02em] text-ink sm:text-6xl md:text-[4.1rem]">
        {words.map((w, i) => (
          <span key={i}>
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.045, ease }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
        <Scribble
          delay={1100}
          className="pointer-events-none absolute -bottom-16 right-0 -rotate-6 text-[3rem] sm:-bottom-20 sm:-right-6 sm:text-[4.4rem] md:-right-16 md:text-[5.2rem]"
        >
          hi, i&apos;m sevith
        </Scribble>
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease }}
        className="mt-28 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-2 sm:mt-32"
      >
        Technical Writer at Digital.ai, aiming for AI PM and product design roles. I led content for a GenAI launch by day, and
        design and build AI products end to end on my own time.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.95, ease }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Résumé <ArrowUpRight size={15} />
        </a>
        <a href={`mailto:${email}`} className="btn btn-ghost">
          <EnvelopeSimple size={16} /> {email}
        </a>
      </motion.div>

      <motion.a
        href="#projects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="mt-16 flex flex-col items-center gap-2 text-[0.9375rem] font-medium text-ink-3 hover:text-ink"
      >
        <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <Mouse size={22} />
        </motion.span>
        scroll to see work
      </motion.a>
    </section>
  );
};

export default Hero;
