export const resumeLink =
  "https://drive.google.com/file/d/11E0TG7xOsdtzW9pANEm7BHBrhDYCTpmT/view?usp=sharing";

export const email = "sevithns@gmail.com";

export const navItems = [
  { name: "Work", link: "#projects" },
  { name: "Studio", link: "/studio" },
  { name: "Gallery", link: "/gallery" },
];

// Home, section two: who I am, the whole story in one paragraph (there is no
// /story page). First person, punchy, and the first joke is allowed here
// because the visitor has already scrolled once (Q7). Edit freely.
export const intro = {
  kicker: "Who I am",
  text: "Hi, I'm Sevith, a *self-taught designer* and *product engineer* in Bangalore. I learn stuff at 2am and ship it by morning. I design the interface, decide what the product should *actually do*, and write the code, so what you signed off on is what ships. By day I'm a *Technical Writer at Digital.ai*. After hours I vibe code the first version fast, then do the product work, cut what doesn't earn its place, and sweat the details until nothing feels accidental.",
  photo: { src: "/story/pool-table.webp", alt: "Sevith in a dark shirt and sunglasses, standing by a pool table under amber blinds", caption: "" },
};

export const projects = [
  {
    id: 7,
    title: "Polaris",
    slug: "polaris",
    tint: "sage",
    year: "2026",
    outcome: "I'm designing and building Polaris: India and US markets, one honest view.",
    des: "An invite-only portfolio manager. It syncs your holdings read-only from eight brokers, follows India and US markets live, and lets you test every idea on paper before real money moves.",
    img: "/polaris.png",
    iconLists: ["/next.svg", "/ts.svg", "/tail.svg", "/python.svg", "/gemini.svg"],
    link: "https://polaris-snowy-three.vercel.app/",
    parts: ["Market pulse", "Broker sync", "Trade plans", "Risk and performance", "AI desk", "Backtester", "Watchlists and alerts"],
  },
  {
    id: 8,
    title: "EsDeeKid",
    slug: "esdeekid",
    tint: "stone",
    year: "2026",
    outcome: "I built a fan site for a rapper who hides his face, and made the site keep the secret too.",
    des: "An unofficial fan concept for EsDeeKid: a classified file with his name redacted, a 3D portrait you dive into, and a soundtrack that changes with every chapter.",
    img: "/esdeekid.png",
    iconLists: ["/next.svg", "/ts.svg", "/three.svg", "/gsap.svg"],
    link: "https://esdeekid.vercel.app/",
    parts: ["Depth portrait", "Redacted file", "Chapter soundtrack", "Negative cuts", "Live tunnel"],
  },
  {
    id: 1,
    title: "Tesseract AI",
    slug: "tesseract-ai",
    tint: "amber",
    year: "", // TODO: add the year
    outcome: "I built an AI mock-interview coach so students can rehearse placements before the real thing.",
    des: "An AI mock-interview platform that helps students prepare for placements and internships. Gemini writes the questions and text-to-speech reads them aloud.",
    img: "/tesseract.png",
    iconLists: ["/re.svg", "/tail.svg", "/javascript.svg", "/next.svg", "/gemini.svg", "/clerk.svg", "/neon.png"],
    link: "https://tesseractai.vercel.app/",
  },
  {
    id: 2,
    title: "Vercel Clone",
    slug: "vercel-clone",
    tint: "stone",
    year: "2024",
    outcome: "I rebuilt a frontend deploy platform to learn how build and hosting pipelines actually work.",
    des: "A Vercel-style deployment platform on Node.js and AWS, built to learn how build and hosting pipelines work.",
    img: "/Vercel.png",
    iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/nodejs.svg", "/aws.svg"],
    link: "https://github.com/Sevith-NS/vercel-clone",
  },
  {
    id: 4,
    title: "Ochi",
    slug: "ochi",
    tint: "blush",
    year: "2024",
    outcome: "I rebuilt a design-studio website to study layout craft and motion.",
    des: "A rebuild of the Ochi design-studio website, focused on layout craft and motion.",
    img: "/Ochi.png",
    iconLists: ["/tail.svg", "/javascript.svg", "/re.svg", "/fm.svg"],
    link: "https://ochi-front.vercel.app/",
  },
];

// How I build: three phases, shown on my own products. Every artifact row below
// is a confirmed fact from data/work.ts — illustrative layout, real content.
export const approach = [
  {
    phase: "Phase 1",
    title: "Find the real problem",
    des: "*Start with the confusion, not the feature.* I work out who is stuck, where and why before any screen exists. Then I build what people actually need.",
    proof: "Polaris started as four tools that never explained themselves",
    artifact: {
      rows: [
        { tag: "Pain", text: "Investors juggle a chart site, a screener, news and a spreadsheet" },
        { tag: "Pain", text: "None of them say why a trade makes sense" },
        { tag: "Pain", text: "None of them say how much to risk" },
        { tag: "Fix", text: "Every suggestion explains itself, factor by factor" },
      ],
    },
  },
  {
    phase: "Phase 2",
    title: "Design it",
    des: "*Wireframes first, then the UI.* Clean, intuitive, and deliberately boring wherever boring is kinder. I design the flows I'm about to build, so nothing gets lost in a handoff.",
    proof: "Tesseract AI, designed around one nervous student",
    artifact: {
      rows: [
        { tag: "Screen", text: "Pick a role and an experience level" },
        { tag: "Screen", text: "Questions read aloud, like a real interview" },
        { tag: "Screen", text: "Dashboard: start a mock, revisit feedback" },
        { tag: "Screen", text: "Sign in with Clerk, history kept in Postgres" },
      ],
    },
  },
  {
    phase: "Phase 3",
    title: "Build it in small chunks",
    des: "*Rome wasn't built in a day,* and neither is a product. I ship small slices and finish each one before starting the next. Real use decides what comes after.",
    proof: "Polaris, shipped in slices and run on my own money",
    artifact: {
      rows: [
        { tag: "Shipped", text: "Two services: Next.js frontend, FastAPI quant API" },
        { tag: "Shipped", text: "Backtester running 13 strategies" },
        { tag: "Shipped", text: "AI desk: agents argue before they commit" },
        { tag: "Live", text: "Real money, +13.45% in the first month" },
      ],
    },
  },
];

export const socialMedia = [
  { id: 1, name: "GitHub", link: "https://github.com/Sevith-NS" },
  { id: 3, name: "LinkedIn", link: "https://www.linkedin.com/in/sevith-s-079063273/" },
];
