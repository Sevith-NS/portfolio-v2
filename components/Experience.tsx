"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "@phosphor-icons/react";
import { workExperience } from "@/data";
import { SectionHeader } from "./SectionHeader";

const Experience = () => {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <section id="experience" className="mx-auto max-w-page px-4 py-20 md:px-8 md:py-24">
      <SectionHeader
        title="Where I've shipped."
        note="Two roles, one thread: understand what users need, then get it into their hands."
      />

      {/* Hovering one entry isolates its thread; the rest fall back to graphite. */}
      <ol className="group/log mt-14 border-t border-rule">
        {workExperience.map((job) => {
          const isOpen = open === job.id;
          return (
            <li
              key={job.id}
              className="grid gap-4 border-b border-rule py-8 transition-opacity duration-300 md:grid-cols-12 md:gap-8 md:py-10 [@media(hover:hover)]:group-hover/log:opacity-45 [@media(hover:hover)]:hover:!opacity-100"
            >
              <div className="md:col-span-3">
                <p className="note">{job.duration}</p>
                <p className="mt-1 text-lg font-medium text-ink">{job.company}</p>
              </div>

              <div className="md:col-span-6">
                <h3 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[1.75rem]">
                  {job.title}
                </h3>
                <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-2">{job.desc}</p>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : job.id)}
                    aria-expanded={isOpen}
                    aria-controls={`job-${job.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
                  >
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                      <Plus size={14} weight="bold" />
                    </motion.span>
                    {isOpen ? "Hide details" : `${job.points.length} details`}
                  </button>

                  {job.link && (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
                    >
                      <ArrowUpRight size={14} weight="bold" />
                      View work
                    </a>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      id={`job-${job.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      {job.points.map((p) => (
                        <li key={p} className="flex gap-3 pt-3 text-[0.9375rem] leading-relaxed text-ink-2 first:pt-5">
                          <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-ink-3" />
                          {p}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="md:col-span-3">
                <p className="note">Headline result</p>
                <p className="mt-1 text-[0.9375rem] leading-snug text-ink">
                  <span className="rounded-sm bg-hl px-1.5 py-0.5 text-on-hl [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    {job.decision}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default Experience;
