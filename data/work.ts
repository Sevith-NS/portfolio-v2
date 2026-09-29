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
    role: "Solo: product definition, UX, frontend and backend",
    status: "In progress, not deployed yet",
    problem: {
      text: "Retail investors jump between a charting site, a screener, a news app and a spreadsheet, and none of them explain why a trade makes sense or how much to risk on it.",
      draft: true,
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
      text: "Not public yet. The next milestone is a deployed beta with a first set of users to learn from.",
      draft: true,
    },
  },
  {
    slug: "tesseract-ai",
    role: "Product scope, design and full-stack build",
    status: "Live",
    problem: {
      text: "Students preparing for placements rarely get realistic interview practice or feedback on how they present, until the real interview.",
      draft: true,
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
      text: "Live at tesseractai.vercel.app. Add usage numbers or student feedback here.",
      draft: true,
    },
  },
  {
    slug: "vercel-clone",
    role: "Design and full-stack build",
    status: "Code on GitHub",
    problem: {
      text: "I wanted to understand what actually happens between a git push and a live URL, beyond the platform's dashboard.",
      draft: true,
    },
    approach: [
      { text: "A React and Tailwind frontend for submitting a repository to deploy." },
      { text: "A Node.js and TypeScript service that builds the project and serves it, using AWS for storage." },
    ],
    decisions: [{ text: "Written in TypeScript end to end so the upload, build and serve steps share types.", draft: true }],
    outcome: { text: "A working learning build. Add what it taught you about build pipelines here.", draft: true },
  },
  {
    slug: "zenfinance",
    role: "Design and MERN build",
    status: "Live",
    problem: {
      text: "Personal finance dashboards show what already happened; this one also tries to show what's likely next.",
      draft: true,
    },
    approach: [
      { text: "A MERN stack dashboard (MongoDB, Express, React, Node.js) with real-time data visualization." },
      { text: "Machine-learning predictions rendered alongside the actuals in the same charts." },
    ],
    decisions: [{ text: "Kept predictions visually distinct from actual data so the two are never confused.", draft: true }],
    outcome: { text: "Live on Vercel.", draft: false },
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
    decisions: [{ text: "Recreated motion with Framer Motion rather than heavier animation libraries.", draft: true }],
    outcome: { text: "Live at ochi-front.vercel.app.", draft: false },
  },
  {
    slug: "learn2lead",
    role: "Product scope and full-stack build",
    status: "Code on GitHub",
    problem: {
      text: "Interview prep is scattered across courses, videos, question banks and job boards. Learn2Lead puts them in one place.",
    },
    approach: [
      { text: "Courses, videos and study materials, with interactive quizzes and mock interviews." },
      { text: "Personalized progress dashboards, and an admin side for managing content." },
      { text: "Internship listings and PitchIt, a module for presenting startup ideas." },
      { text: "Stripe payments for premium content." },
    ],
    decisions: [{ text: "Built on PHP and JavaScript to keep hosting simple and cheap.", draft: true }],
    outcome: { text: "Add who used it and what you learned here.", draft: true },
  },
  {
    slug: "spotify",
    role: "Full-stack build",
    status: "Live",
    problem: {
      text: "A learning build: recreate a real subscription product end to end, from auth and uploads to recurring payments.",
    },
    approach: [
      { text: "Next.js App Router, Tailwind, Supabase and PostgreSQL." },
      { text: "Song upload, playback with an advanced player, liked songs and playlists." },
      { text: "Supabase and GitHub authentication, and Stripe recurring subscriptions, including cancellation." },
    ],
    decisions: [
      { text: "Server components read the database directly, and API route handlers only cover writes and payments." },
      { text: "Followed an open-source course as the starting point.", draft: true },
    ],
    outcome: { text: "Live on Vercel.", draft: false },
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
