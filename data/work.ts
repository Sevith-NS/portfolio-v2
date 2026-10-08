// Case-study drafts. Facts come from each repo's README, its code and the resume.
// Anything marked `draft: true` is an inference Sevith still needs to confirm;
// in development those blocks show a dashed "confirm" tag, in production they render normally.

export type Block = { text: string; draft?: boolean };

export type CaseStudy = {
  slug: string;
  role: string;
  status: string;
  problem: Block;
  approach: Block[];
  decisions: Block[];
  outcome: Block;
};

export const cases: CaseStudy[] = [
  {
    slug: "flint-os",
    role: "Market Research, Product Design, Product definition, UX, frontend and backend",
    status: "Still Cooking",
    problem: {
      text: "Retail investors jump between a charting site, a screener, a news app and a spreadsheet, and none of them explain why a trade makes sense or how much to risk on it.",
    },
    approach: [
      { text: "Terminal: candlestick charting with a systematic Quant Trade Plan: limit entry, ATR and swing-based stop loss, 1.5R and 3R targets, a factor vote breakdown and half-Kelly position sizing." },
      { text: "Portfolio: paper trading with live prices and risk analytics: 95% VaR and CVaR, Sharpe, Sortino, max drawdown, beta vs the S&P 500 and Markowitz max-Sharpe optimization." },
      { text: "Trading Desk: a multi-agent pipeline where four analysts file reports, a bull and a bear debate, three risk seats argue position size, and a portfolio manager approves or refuses with a share count." },
      { text: "Backtest: an event-driven backtester with 13 strategies, costs on both sides, and out-of-sample, walk-forward and Monte Carlo robustness passes." },
      { text: "Flint AI: a Gemini assistant that sees the paper portfolio, the symbol on screen, live signals and news sentiment, and answers grounded questions about risk and sizing." },
    ],
    decisions: [
      { text: "Split the product into two independently deployable services, a Next.js frontend and a Flask quant API, that talk only over HTTP." },
      { text: "Every Trading Desk decision is journalled and later scored on realized alpha vs the S&P 500, and past hits and misses feed the next run's prompts." },
      { text: "The backtester assumes the stop was hit when a bar touches both stop and target, so results err on the side of caution." },
    ],
    outcome: {
        text: "Personally tested and optimized the portfolio, achieving a 5% return within the first month.",
    },
  },
  {
  slug: "tesseract-ai",
  role: "Product scope, design and full-stack build",
  status: "Live",
  problem: {
    text: "I built Tesseract for myself. I knew the theory for placements, but explaining it clearly under pressure is a different skill, and most students only find that out in the real interview.",
  },
  approach: [
    { text: "Gemini generates interview questions tailored to the role and experience level a student picks." },
    { text: "Text-to-speech reads questions aloud, so practice feels closer to a real conversation." },
    { text: "A dashboard to start new mock interviews and revisit feedback on past ones." },
  ],
  decisions: [
    { text: "Clerk for authentication, and Neon-hosted PostgreSQL for interview history." },
    { text: "Next.js on Vercel so the whole product ships as one deployable app." },
  ],
  outcome: {
    text: "I practised with it before my own placement rounds, and in one of them the recruiter praised how confident I was answering every question. My faculty then asked me to present it to the university board as a way to help more students prepare the same way. It has no real users yet, the next step is getting it in front of students.",
  },
},
  {
  slug: "vercel-clone",
  role: "Design and full-stack build",
  status: "Code on GitHub",
  problem: {
    text: "I wanted to understand what actually happens between a git push and a live URL, beyond the platform's dashboard.",
  },
  approach: [
    { text: "A React and Tailwind frontend for submitting a repository to deploy." },
    { text: "A Node.js and TypeScript service that builds the project and serves it, using AWS S3 for storage." },
  ],
  decisions: [
    { text: "Written in TypeScript end to end so the upload, build and serve steps share types." },
    { text: "Followed Harkirat Singh's course as the starting point." },
  ],
  outcome: {
    text: "A working build that taught me how a deployment pipeline moves code from a repository to a live URL, and how to work with AWS and S3 buckets for storing and serving build output.",
  },
},
  {
  slug: "zenfinance",
  role: "Design and MERN build",
  status: "Live",
  problem: {
    text: "A practice project to learn how to map data into charts and build dashboards in React. Most personal finance dashboards show only what already happened, so I also tried to show what's likely next.",
  },
  approach: [
    { text: "A MERN stack dashboard (MongoDB, Express, React, Node.js) with real-time data visualization." },
    { text: "Machine-learning predictions rendered alongside the actuals in the same charts." },
  ],
  decisions: [
    { text: "Kept predictions visually distinct from actual data so the two are never confused." },
  ],
  outcome: {
    text: "Live on Vercel. It gave me hands-on practice turning raw data into dashboards in React, which I carried into Flint's charts and analytics.",
  },
},
  {
  slug: "ochi",
  role: "Frontend build and motion",
  status: "Live",
  problem: {
    text: "A study project: rebuild a motion-heavy studio website to learn how layout, type and animation work together.",
  },
  approach: [
    { text: "Rebuilt the site in React with Vite, Tailwind CSS and Framer Motion." },
    { text: "Focused on scroll-driven reveals, marquee type and hover interactions." },
  ],
  decisions: [
    { text: "Recreated motion with Framer Motion rather than heavier animation libraries." },
    { text: "Followed a Sheriyans Coding School tutorial as the starting point." },
  ],
  outcome: {
    text: "One of my biggest learnings for building modern interactive websites. I learnt how to use math to drive interactive animations.",
  },
},
  {
  slug: "learn2lead",
  role: "Product scope and full-stack build",
  status: "Code on GitHub",
  problem: {
    text: "My college project: make e-courses easier to access, and bring interview prep, internships and startup pitching into the same place instead of scattering them across separate sites.",
  },
  approach: [
    { text: "Courses, videos and study materials, with interactive quizzes and mock interviews." },
    { text: "Personalized progress dashboards, and an admin side for managing content." },
    { text: "Internship listings and PitchIt, a module where founders present startup ideas to venture capitalists." },
    { text: "Stripe payments for premium content." },
  ],
  decisions: [
    { text: "Built on PHP and JavaScript to learn from the basics how a backend talks to a frontend, so I could move to Node and other libraries later." },
  ],
  outcome: {
    text: "Delivered as my college project. PitchIt was the most ambitious piece, and building a multi-sided product with payments and an admin side taught me how many moving parts a real platform has.",
  },
},
  {
  slug: "spotify",
  role: "Full-stack build",
  status: "Live",
  problem: {
    text: "My first ever full-stack build, done over a summer break: recreate a real subscription product end to end, from auth and uploads to recurring payments.",
  },
  approach: [
    { text: "Next.js App Router, Tailwind, Supabase and PostgreSQL." },
    { text: "Song upload, playback with an advanced player, liked songs and playlists." },
    { text: "Supabase and GitHub authentication, and Stripe recurring subscriptions, including cancellation." },
  ],
  decisions: [
    { text: "Server components read the database directly, and API route handlers only cover writes and payments." },
    { text: "Followed an open-source course as the starting point." },
  ],
  outcome: {
    text: "Live on Vercel. It taught me how auth, storage, payments and the frontend fit together, and that made me want to go deep on the skills behind projects like Flint and Tesseract.",
  },
},
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
