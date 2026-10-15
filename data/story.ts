// The /story page: the long version, for people who clicked past the work.
// Headlines carry the credibility, captions carry the personality (Q7: the
// jokes land after a scroll). Every fact traces to the intake in
// ART-DIRECTION.md or the resume; nothing is invented.
//
// `todo: true` marks a prompt written to Sevith, not copy. It shows as a dashed
// card in development and is stripped from production entirely.
// *A phrase in asterisks* renders bold with a soft underline (ui/Copy).

import type { Block } from "./work";

export const opening = {
  photo: { src: "/story/rainy-hike.webp", alt: "Sevith from behind in a black rain jacket, hood up, facing storm clouds over green hills" },
  kicker: "My story",
  headline: "The long version.",
  standfirst: "For the people who scrolled past the work and thought: okay, but who is this guy?",
};

export const hello = {
  photo: { src: "/story/pool-table.webp", alt: "Sevith in a dark shirt and sunglasses, standing by a pool table under amber blinds", caption: "Lining up the shot. Missed it, obviously." },
  headline: "Hi, I'm Sevith.",
  body: "*Product engineer* in *Bangalore*. I design the interface, decide what the product should actually do, and write the code. One person, no handoff. Self-taught on the design side, which means everything I learn goes straight into something real, usually around 2am.",
};

// For the recruiter with forty seconds.
export const short: Block[] = [
  { text: "*Self-taught designer.* BCA from Christ University." },
  { text: "I design it, decide what it does, and build it. *One person, no handoff.*" },
  { text: "Built *Polaris* and *Tesseract AI* solo, from the idea to a working product." },
  { text: "Open to *freelance and full-time*. Startups, small businesses, anyone who wants it clean." },
];

export const chapters: { when: string; title: string; body: Block }[] = [
  {
    when: "As a kid",
    title: "Wow. I want to build that.",
    body: {
      text: "I'd land on a sleek, modern website and just stare at it. *I want to build something like this when I grow up.* That's the whole origin story. Turns out you're allowed to just go and do it.",
    },
  },
  {
    when: "Christ University",
    title: "BCA, and a lot of side quests",
    body: {
      text: "What the degree gave you, and what you had to go and get yourself. If most of what you use now was learnt outside the syllabus, say so. It reads as drive, not a complaint.",
      todo: true,
    },
  },
  {
    when: "Dec 2024 to Mar 2025",
    title: "First real users",
    body: {
      text: "Built a *real-estate platform* at Ceyone in React, TypeScript and Tailwind. Iterating on the UI lifted engagement *30%*, the first time I watched a design call move a number instead of just an opinion.",
    },
  },
  {
    when: "Mar 2025 to now",
    title: "The day job",
    body: {
      text: "Technical Writer at Digital.ai. I own the docs for enterprise DevOps products and took a *GenAI assistant's* content through *GA*. It taught me the most useful habit I have: start from the customer's confusion and work back to the fix.",
    },
  },
  {
    when: "Now",
    title: "Building after hours",
    body: {
      text: "*Polaris*, which reads what you own across brokers and gives you a paper desk to test every idea before real money moves. *Tesseract AI*, a mock-interview coach I built because I needed one. Next: a team, or a client, that wants all three jobs done by one person.",
    },
  },
];

export const learning = {
  photo: { src: "/story/ux-notes.webp", alt: "Handwritten notes from the Google UX Design course, on inclusive design and case studies" },
  kicker: "Visibly in progress",
  headline: "Still learning. On purpose.",
  body: "I'm a self-taught designer, so I learn something and ship it into a real project the same week. Last up: the *Google UX Design* course. These are my actual notes. The right-hand page says *tell a story* and *be concise*, which is, coincidentally, what this page is trying to do.",
};

export const offClock = {
  kicker: "Off the clock",
  headline: "Goated taste in everything.",
  body: "Music, art, food, fits. Not everyone has great taste. I'm just saying it out loud.",
  photos: [
    { src: "/story/beach.webp", alt: "Sevith at the beach in a white tank top and loose white trousers", caption: "Overspends on fits. Zero regrets." },
    { src: "/story/goa.webp", alt: "Sevith in a green shirt walking down a colourful street in Goa, drinking coffee", caption: "Goa. Coffee in one hand, main-character energy in the other." },
    { src: "/story/climbing.webp", alt: "Sevith on a climbing wall, mid-route", caption: "Always exploring. Always finds the way back down." },
    { src: "/story/touching-grass.webp", alt: "Sevith lying face-down in tall grass on a misty hillside", caption: "Chronically online guy, touching grass. Documented, obviously." },
  ],
  kitchen: "Best thing I make isn't on GitHub: *peri peri fried chicken with mac and cheese.*",
  memes: { src: "/story/memes.webp", alt: "A grid of saved workplace memes", caption: "Full-time online meme collector. This is a small sample. I have a problem." },
};

export const cats = {
  kicker: "The team",
  headline: "Four cats. Zero personal space.",
  body: "When I'm stuck, I watch a film or go and irritate one of these four. It works more often than it should. For the record, I'm half Simba, half Cream.",
  members: [
    { name: "Simba", src: "/cats/me-and-simba.webp", alt: "Sevith holding Simba, an orange cat, over his shoulder", line: "Orange, rowdy, starts every fight. Explores everything and always finds his way home." },
    { name: "Cream", src: "/cats/cream.webp", alt: "Cream, a small white cat, lying on a path covered in yellow petals", line: "Pearl's daughter. A cute little white monster. If it's on the floor, Cream did it." },
    { name: "Pearl", src: "/cats/pearl.webp", alt: "Pearl, a white cat with a grey patch on her head, looking up in warm light", line: "The adult in the room. Loafs, slow-blinks, judges quietly." },
    { name: "Ash", src: "/cats/ash.webp", alt: "Ash, a grey cat with amber eyes", line: "A coward with excellent survival instincts. Flinches at doors." },
  ],
};

export const history = {
  kicker: "On paper",
  headline: "The resume bit.",
  credentials: [
    { label: "Education", value: "BCA, Christ University", detail: "Bangalore" },
    { label: "Day job", value: "Technical Writer", detail: "Digital.ai · Mar 2025 – present" },
    { label: "Before that", value: "Software Developer Intern", detail: "Ceyone Marketing · Dec 2024 – Mar 2025" },
    {
      label: "Certification",
      value: "Google UX Design Certificate",
      detail: "Finished or in progress, and when? Confirm before this ships. It's the only line on the page I couldn't verify.",
      todo: true,
    },
  ] as { label: string; value: string; detail: string; todo?: boolean }[],
};

export const signoff = {
  line: "At 14 I wanted to be rich af. Now I want people to land on something I built and go *wow*. Honestly, the two aren't unrelated.",
  motto: "Gotta stack up the Gandhis for a Porsche 911 GT3 RS.",
};
