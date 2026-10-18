export const resumeLink =
  "https://drive.google.com/file/d/11E0TG7xOsdtzW9pANEm7BHBrhDYCTpmT/view?usp=sharing";

export const email = "sevithns@gmail.com";

// Home, section two: who I am, short. The long version lives on /story.
// First person, punchy, and the first joke is allowed here because the
// visitor has already scrolled once. Edit freely.
export const intro = {
  kicker: "Who I am",
  headline: "Self-taught designer. Learn it at 2am, ship it by morning.",
  body: "I'm Sevith. I design the interface, decide what the product should *actually do*, and write the code, so what you signed off on is what ships. *Startups, small businesses*, anyone who wants a clean UI built *end to end*. Freelance or full-time, either works.",
  aside: "Not everyone has great taste. Fortunately, I do.",
  photo: { src: "/cats/simba.webp", alt: "Simba, Sevith's orange cat, looking thoroughly unimpressed", caption: "simba. head of qa. has never approved a build." },
  more: "The long version",
};

export const projects = [
  {
    id: 7,
    title: "Polaris",
    slug: "polaris",
    tint: "sage",
    year: "2026",
    outcome: "I'm designing and building Polaris: see everything you own, test everything you don't.",
    des: "Polaris reads your broker holdings from Zerodha and Upstox, tracks India and US markets, and gives you a paper desk for every idea before real money moves.",
    img: "/polaris.png",
    iconLists: ["/next.svg", "/ts.svg", "/tail.svg", "/python.svg", "/gemini.svg"],
    link: "https://github.com/Sevith-NS/algo-trader",
    parts: ["Signal engine", "Risk analytics", "ML forecasts", "Backtester", "AI desk", "Trading desk agents"],
  },
  {
    id: 1,
    title: "Tesseract AI",
    slug: "tesseract-ai",
    tint: "amber",
    year: "", // TODO: add the year
    outcome: "I built an AI mock-interview coach so students can rehearse placements before the real thing.",
    des: "An AI mock-interview platform that helps students prepare for placements and internships, with Google Gemini-generated questions and text-to-speech.",
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
    des: "A Vercel-style frontend deployment platform, built to understand how build and hosting pipelines work, on Node.js and AWS.",
    img: "/Vercel.png",
    iconLists: ["/re.svg", "/tail.svg", "/ts.svg", "/nodejs.svg", "/aws.svg"],
    link: "https://github.com/Sevith-NS/vercel-clone",
  },
  {
    id: 3,
    title: "Zenfinance",
    slug: "zenfinance",
    tint: "mint",
    year: "2024",
    outcome: "I designed a finance dashboard that pairs ML predictions with live data visualization.",
    des: "A MERN finance dashboard that pairs machine-learning predictions with real-time data visualization.",
    img: "/1.png",
    iconLists: ["/re.svg", "/tail.svg", "/javascript.svg", "/nodejs.svg", "/mongodb.svg"],
    link: "https://zenfinance-five.vercel.app/",
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
  {
    id: 5,
    title: "Learn2Lead",
    slug: "learn2lead",
    tint: "garnet",
    year: "2024",
    outcome: "I scoped and built an interview-prep platform, from courses to a startup pitch module.",
    des: "An e-learning platform for interview prep: courses, quizzes, mock interviews, progress dashboards, internship listings, and a PitchIt module for startup ideas.",
    img: "/3.png",
    iconLists: ["/html5.svg", "/css.svg", "/javascript.svg", "/php.svg", "/stripe.svg"],
    link: "https://github.com/Sevith-NS/learn2lead",
  },
  {
    id: 6,
    title: "Spotify",
    slug: "spotify",
    tint: "clover",
    year: "2023",
    outcome: "I built a full-stack music app with playback, playlists and Stripe subscriptions.",
    des: "A Spotify clone with music playback, curated playlists and Stripe subscriptions.",
    img: "/4.png",
    iconLists: ["/next.svg", "/tail.svg", "/ts.svg", "/re.svg", "/stripe.svg"],
    link: "https://spotify-clone-sooty-mu.vercel.app/",
  },
];

// How I build: three phases, shown on my own products. Every artifact row below
// is a confirmed fact from data/work.ts — illustrative layout, real content.
export const approach = [
  {
    phase: "Phase 1",
    title: "Find the real problem",
    des: "*Start with the confusion, not the feature.* Who is stuck, where, and why, worked out before a single screen exists, so the thing I build is the thing people actually needed.",
    proof: "Polaris started as four tools that never explained themselves",
    artifact: {
      heading: "Polaris \u00b7 problem notes",
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
    des: "*Wireframes first, then the UI.* Clean, intuitive, and deliberately boring wherever boring is kinder. I design the flows I am about to build, so nothing gets lost in a handoff.",
    proof: "Tesseract AI, designed around one nervous student",
    artifact: {
      heading: "Tesseract AI \u00b7 screens",
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
    des: "*Rome wasn't built in a day,* and neither is a product. Small, reviewable slices, each one working before the next starts. Then real use decides what gets built after.",
    proof: "Polaris, shipped in slices and run on my own money",
    artifact: {
      heading: "Polaris \u00b7 build log",
      rows: [
        { tag: "Shipped", text: "Two services: Next.js frontend, Flask quant API" },
        { tag: "Shipped", text: "Backtester running 13 strategies" },
        { tag: "Shipped", text: "Trading Desk: agents argue before they commit" },
        { tag: "Live", text: "Paper portfolio, +5% in the first month" },
      ],
    },
  },
];

export const socialMedia = [
  { id: 1, name: "GitHub", link: "https://github.com/Sevith-NS" },
  { id: 3, name: "LinkedIn", link: "https://www.linkedin.com/in/sevith-s-079063273/" },
];
