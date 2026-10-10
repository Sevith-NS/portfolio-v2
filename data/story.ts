// The /story page: the long version of who Sevith is, for people who clicked
// past the work. Headlines carry the credibility, asides carry the personality.
//
// Same two review flags as data/work.ts: `todo: true` is a prompt written to
// Sevith, shown only in development and stripped from production.
// Copy convention: *a phrase in asterisks* renders bold with a lapis underline.

import type { Block } from "./work";

// Drop a photo at public/story/ and put the path here. While it's empty the page
// runs text-only rather than showing a broken frame.
export const portrait = {
  src: "",
  alt: "Sevith Sadashiva",
  caption: "me, pretending the deadline isn't today",
};

export const opening = {
  kicker: "My story",
  headline: "I make complicated software make sense, then I go home and build more of it.",
  standfirst:
    "I'm *Sevith* — *product engineer* in *Bangalore*. I design the interface, define the product and write the code, which is three job descriptions and one person. By day that is *Digital.ai*, where I own documentation for enterprise DevOps products and took a *GenAI assistant through its GA launch*. By night it is my own *AI products*, end to end, because apparently I don't own a television.",
  words: ["curious", "precise", "warm"],
  scribble: "the long version",
};

// The skimmable bio. Four lines, for the recruiter who has 40 seconds.
export const short: Block[] = [
  { text: "*BCA, Christ University.* Then straight into shipping." },
  { text: "Two years in: one *real-estate platform* as a developer, one *enterprise GenAI launch* as the person who made it understandable." },
  { text: "On my own time, two AI products built solo — *Flint OS* and *Tesseract AI* — from the idea through the interface to the first working version." },
  { text: "What I am after: a team that wants *one person who can design it, define it and build it*. Three job descriptions, one person, no handoff." },
];

// How I got here. The career beats are on record; the reason behind them isn't.
export const chapters: { when: string; title: string; body: Block }[] = [
  {
    when: "Before all this",
    title: "Where it started",
    body: {
      text: "The origin story. What actually got you into building things — a game you modded, a site you broke, a spreadsheet that got out of hand? Two or three sentences, in your voice. This is the part people remember, and it's the one thing a resume can never carry.",
      todo: true,
    },
  },
  {
    when: "Christ University",
    title: "BCA, and a lot of side quests",
    body: {
      text: "What the degree gave you, and what you had to go get yourself. If most of what you use now was learnt outside the syllabus, say so — it reads as drive, not as a complaint.",
      todo: true,
    },
  },
  {
    when: "Dec 2024 — Mar 2025",
    title: "Ceyone Marketing: my first real users",
    body: {
      text: "Built a *real-estate platform* in React, TypeScript and Tailwind, with Google Maps wired in. Iterating on the UI lifted engagement *30%* — the first time I watched a design call move a number instead of just an opinion.",
    },
  },
  {
    when: "Mar 2025 — now",
    title: "Digital.ai: documentation as a product",
    body: {
      text: "I own the docs for *Deploy, Release and TeamForge*, and I led *0-to-1 content for Ask Release*, Digital.ai's GenAI assistant, all the way to *GA*. Writing docs turns out to be product work wearing a disguise: you start from the customer's confusion and work back to the fix.",
    },
  },
  {
    when: "Now",
    title: "Building Flint OS, and done apologising for the title",
    body: {
      text: "*Flint OS* is an AI-powered quant investing platform that has to explain every trade it suggests. *Tesseract AI* is a mock-interview coach I built because I needed one. Next: somewhere that wants *all three* in one person.",
    },
  },
];

// What I actually do, in three honest buckets.
export const craft: { title: string; body: string; note: string }[] = [
  {
    title: "Define it",
    body: "Start from the customer's confusion, not the feature list. Read the tickets, the defects and the feedback, frame the problem, then prioritize with engineering and product. *300+ user stories and defects* across *30+ Agile sprints*.",
    note: "the unglamorous half of product",
  },
  {
    title: "Design it",
    body: "Clean, intuitive interfaces that feel as good as they look. I care about *type, spacing and motion* at a level most people would describe as a problem. I would describe it as the job.",
    note: "certified type nerd",
  },
  {
    title: "Build it",
    body: "*Next.js, TypeScript, Tailwind, Python.* Enough to take a product from an empty folder to something you can actually use — which keeps my design calls honest, because I'm the one who has to implement them.",
    note: "no handoff, no excuses",
  },
];

export const credentials: { label: string; value: string; detail: string; link?: string; todo?: boolean }[] = [
  {
    label: "Education",
    value: "BCA, Christ University",
    detail: "Bangalore",
  },
  {
    label: "Current role",
    value: "Technical Writer, Product Documentation",
    detail: "Digital.ai · Mar 2025 – present",
    link: "https://docs.digital.ai/release/docs/release-notes/release-notes-release",
  },
  {
    label: "Previously",
    value: "Software Developer Intern",
    detail: "Ceyone Marketing · Dec 2024 – Mar 2025",
    link: "https://www.onlyvillas.in/",
  },
  {
    label: "Certification",
    value: "Google UX Design Certificate",
    detail:
      "Confirm this before it ships: finished or in progress, and when? Add any others worth listing here too — this entry is the only guess on the page.",
    todo: true,
  },
];

// The three I'd want someone to look at, in order.
export const notable: { title: string; line: string; href: string; external?: boolean }[] = [
  {
    title: "Ask Release, Digital.ai",
    line: "I defined the information architecture for a *GenAI assistant* — agent customization, LLM guardrails, BYOM, Kubernetes deployment — and took the content through *GA*.",
    href: "https://docs.digital.ai/release/docs/release-notes/release-notes-release",
    external: true,
  },
  {
    title: "Flint OS",
    line: "An *AI quant investing platform* that explains every trade it suggests. Signal engine, risk analytics, a backtester, and a desk of agents that argue before they commit.",
    href: "/work/flint-os",
  },
  {
    title: "Tesseract AI",
    line: "An *AI mock-interview coach*. I built it for my own placements, then a recruiter told me how confident I sounded. Still my favourite bug report.",
    href: "/work/tesseract-ai",
  },
];

export const passions = {
  headline: "Off the clock, mostly on purpose",
  body:
    "*Sports* and the *gym*, because the screen can wait. *Video editing* and *cinema*, which is where the obsession with timing comes from. *Fonts and type*, which is where the obsession with everything else comes from. *Markets and finance*, which turned into Flint. *Cooking*, following the recipe roughly. And building a *personal brand* in public, which is a fancy way of saying I overthink my own portfolio.",
  scribble: "and sometimes panicking about the future",
};

// Four cats, from data/studio.ts. Names unknown; the personalities are not.
export const cats: { who: string; line: string; todo?: boolean }[] = [
  { who: "The orange one", line: "Rowdy, notorious, starts every fight. Crouches, wiggles, pounces." },
  { who: "The grey one", line: "A coward with excellent survival instincts. Flinches at doors." },
  { who: "The white one with the grey patch", line: "The girl. Soft, chill, loafs, slow-blinks. The adult in the room." },
  { who: "The white one", line: "Her daughter. Zoomies in a figure of eight, tail straight up, no regard for furniture." },
  {
    who: "Their names",
    line: "I know what your cats are like, not what they're called. Drop the four names in and this section gets a lot funnier.",
    todo: true,
  },
];

export const signoff = {
  line: "That's the long version. The short one is that I like building things that make sense, and I'd like to do it somewhere with better problems than my own.",
  scribble: "still reading? let's talk",
};
