// Case-study drafts. Facts come from each repo's README, its code and the resume.
//
// Two review flags, both dev-only in the UI:
//   draft: true  — an inference Sevith still needs to confirm; shows a dashed "confirm" tag.
//   todo:  true  — a prompt written to Sevith, not copy. Nothing here is invented: these are
//                  the questions a case study has to answer that the repo can't answer for him.
//                  They render as dashed "your turn" cards in development and are stripped from
//                  production entirely — a row with nothing but todos doesn't render at all, so
//                  the live site never shows a hole.
//
// Copy convention: *a phrase in asterisks* renders bold with a lapis underline (see ui/Copy).

export type Block = { text: string; draft?: boolean; todo?: boolean };

export type CaseStudy = {
  slug: string;
  role: string;
  status: string;
  /** What problem was I trying to solve. */
  problem: Block;
  /** What process did I follow — the real steps, in order. */
  process: Block[];
  /** What I built. */
  approach: Block[];
  /** What insights informed the design. */
  insights: Block[];
  /** The calls I made, and why. */
  decisions: Block[];
  /** Where I succeeded. */
  wins: Block[];
  /** Where I fell short. The part most portfolios skip. */
  misses: Block[];
  /** Where it landed. */
  outcome: Block;
  /** Why I think this was the right answer. */
  why: Block;
};

export const cases: CaseStudy[] = [
  {
    slug: "flint-os",
    role: "Market research, product design, product definition, UX, frontend and backend",
    status: "Still cooking",
    problem: {
      text: "Retail investors bounce between a charting site, a screener, a news app and a spreadsheet. Not one of them answers the only two questions that matter: *why does this trade make sense*, and *how much should I risk on it*.",
    },
    process: [
      {
        text: "Your actual first move. Did you paper-trade by hand for a few weeks, read up on factor investing, or pull apart an existing terminal to see what it hid? Name the step and roughly when.",
        todo: true,
      },
      {
        text: "How you picked which factors and risk metrics made the cut — and, more interesting, what you cut.",
        todo: true,
      },
      {
        text: "How you tested it on yourself. The 5% month is the result; what was the setup — how much, how long, which strategies?",
        todo: true,
      },
    ],
    approach: [
      { text: "*Terminal*: candlestick charting with a systematic Quant Trade Plan — limit entry, ATR and swing-based stop loss, 1.5R and 3R targets, a *factor vote breakdown* and half-Kelly position sizing." },
      { text: "*Portfolio*: paper trading on live prices with risk analytics — 95% VaR and CVaR, Sharpe, Sortino, max drawdown, beta against the S&P 500, and Markowitz max-Sharpe optimization." },
      { text: "*Trading Desk*: a multi-agent pipeline. Four analysts file reports, a bull and a bear argue it out, three risk seats fight over position size, and a portfolio manager approves or refuses with a share count." },
      { text: "*Backtest*: an event-driven backtester running 13 strategies, costs on both sides, plus out-of-sample, walk-forward and Monte Carlo robustness passes." },
      { text: "*Flint AI*: a Gemini assistant that can see the paper portfolio, the symbol on screen, live signals and news sentiment, and answers grounded questions about risk and sizing." },
    ],
    insights: [
      {
        text: "The insight behind the factor vote breakdown. What convinced you a signal is worthless unless the user can see which factors voted for it, and which voted against?",
        todo: true,
      },
      {
        text: "What paper-trading taught you that changed the risk analytics. Did a drawdown you did not see coming push VaR and CVaR up the screen?",
        todo: true,
      },
      {
        text: "Why the Trading Desk had to argue instead of just answering. What was wrong with a single model handing down one verdict?",
        todo: true,
      },
    ],
    decisions: [
      { text: "Split the product into *two independently deployable services* — a Next.js frontend and a Flask quant API — talking only over HTTP." },
      { text: "Every Trading Desk decision is *journalled*, then scored on realized alpha against the S&P 500. Past hits and misses feed the next run's prompts." },
      { text: "When a bar touches both the stop and the target, the backtester assumes *the stop was hit*. Results err on the side of caution." },
    ],
    wins: [
      { text: "Ran it on my own money as the first user: *5% return in the first month*, after tuning the portfolio." },
      { text: "The one mechanism you would rebuild exactly the same way. Which part of this is genuinely good, and how do you know?", todo: true },
    ],
    misses: [
      {
        text: "The honest gap. No users but you yet? A strategy that looked beautiful in backtest and fell apart live? An agent debate that produced confident nonsense? Name one real miss — it reads far stronger than a clean sweep.",
        todo: true,
      },
    ],
    outcome: {
      text: "Personally tested and optimized the portfolio, reaching a *5% return within the first month*.",
    },
    why: {
      text: "Why this shape beat the simpler one — a single app, one model, no debate, no journal. What would that version have gotten wrong?",
      todo: true,
    },
  },
  {
    slug: "tesseract-ai",
    role: "Product scope, design and full-stack build",
    status: "Live",
    problem: {
      text: "I built Tesseract for me. I knew the theory for placements cold, but *explaining it clearly under pressure* is a different skill — and most students only find that out in the real interview.",
    },
    process: [
      {
        text: "What you tried before building anything. Mock interviews with friends, YouTube question lists, writing answers out longhand? What specifically failed?",
        todo: true,
      },
      {
        text: "How you landed on role plus experience level as the two inputs. Did you try others first?",
        todo: true,
      },
      {
        text: "How you tested it: how many rounds you ran on yourself before your real placements, and what you changed between them.",
        todo: true,
      },
    ],
    approach: [
      { text: "*Gemini* generates interview questions tailored to the role and experience level a student picks." },
      { text: "*Text-to-speech* reads questions aloud, so practice sits closer to a real conversation than to a reading exercise." },
      { text: "A *dashboard* to start new mock interviews and go back over feedback from past ones." },
    ],
    insights: [
      {
        text: "Why hearing a question mattered more than reading it. What did silent practice fail to prepare you for, and what tipped you off?",
        todo: true,
      },
      {
        text: "What you noticed reviewing your own past sessions that made feedback history worth building.",
        todo: true,
      },
    ],
    decisions: [
      { text: "*Clerk* for authentication, and *Neon-hosted PostgreSQL* for interview history." },
      { text: "*Next.js on Vercel*, so the whole product ships as one deployable app." },
    ],
    wins: [
      { text: "I practised on it before my own placement rounds. In one, the recruiter called out *how confident I was* answering every question." },
      { text: "My faculty asked me to present it to the *university board*, as a way to help more students prepare the same way." },
    ],
    misses: [
      { text: "*No real users yet.* It works, it is live, and it has an audience of one. Getting it in front of students is the next step and I have not done it." },
      {
        text: "A product or design call you would take back. Something students found confusing, or a feature you built that nobody needed?",
        todo: true,
      },
    ],
    outcome: {
      text: "Live, and proven on exactly one user: *me, in a real interview*. The build is done; distribution is not.",
    },
    why: {
      text: "Why generated questions plus spoken delivery beat the obvious alternatives — a fixed question bank, or just recording yourself. What does your version do that those cannot?",
      todo: true,
    },
  },
  {
    slug: "vercel-clone",
    role: "Design and full-stack build",
    status: "Code on GitHub",
    problem: {
      text: "I wanted to know what *actually happens between a git push and a live URL*, past the part the platform's dashboard shows you.",
    },
    process: [
      { text: "Followed *Harkirat Singh's course* as the starting point, then built past it." },
      {
        text: "Where you stopped following along and started making your own calls. Which part did you have to work out yourself?",
        todo: true,
      },
    ],
    approach: [
      { text: "A *React and Tailwind* frontend for submitting a repository to deploy." },
      { text: "A *Node.js and TypeScript* service that builds the project and serves it, with *AWS S3* for storage." },
    ],
    insights: [
      {
        text: "The thing that surprised you about how deploys really work. What did you assume was simple and was not — or assumed was magic and turned out to be a shell command?",
        todo: true,
      },
    ],
    decisions: [
      { text: "*TypeScript end to end*, so the upload, build and serve steps share types." },
    ],
    wins: [
      { text: "A working build that showed me how a *deployment pipeline* moves code from a repository to a live URL." },
      { text: "First real hands-on with *AWS and S3* for storing and serving build output." },
    ],
    misses: [
      {
        text: "What this version cannot do that the real thing can. Concurrent builds, caching, rollbacks, custom domains? Naming the gap signals you understand it.",
        todo: true,
      },
    ],
    outcome: {
      text: "A working deploy pipeline, on GitHub, built to be *understood* rather than used.",
    },
    why: {
      text: "Why building it beat reading about it. What do you know now that a blog post would not have taught you?",
      todo: true,
    },
  },
  {
    slug: "zenfinance",
    role: "Design and MERN build",
    status: "Live",
    problem: {
      text: "A practice project, to learn how to *map data into charts* and build dashboards in React. Most personal finance dashboards only show what already happened, so I tried to show *what is likely next* too.",
    },
    process: [
      {
        text: "How you got from 'learn charts' to this specific product. What did you sketch or try first?",
        todo: true,
      },
      {
        text: "How you chose the prediction model, and how you checked whether its output was worth showing at all.",
        todo: true,
      },
    ],
    approach: [
      { text: "A *MERN* dashboard — MongoDB, Express, React, Node.js — with real-time data visualization." },
      { text: "*Machine-learning predictions* drawn alongside the actuals, in the same charts." },
    ],
    insights: [
      {
        text: "What made you separate predictions from actuals visually. Did you first draw them the same way and find it misleading?",
        todo: true,
      },
    ],
    decisions: [
      { text: "Kept predictions *visually distinct* from actual data, so the two can never be confused." },
    ],
    wins: [
      { text: "Real practice turning raw data into dashboards in React — which I carried straight into *Flint's charts and analytics*." },
    ],
    misses: [
      {
        text: "Where this falls short as a product. Would you trust its predictions with your own money? If not, say why — that is the useful answer.",
        todo: true,
      },
    ],
    outcome: {
      text: "Live on Vercel. Its real output was the charting skill underneath *Flint OS*.",
    },
    why: {
      text: "Why pairing predictions with actuals in one chart was the right call, rather than splitting them into two views.",
      todo: true,
    },
  },
  {
    slug: "ochi",
    role: "Frontend build and motion",
    status: "Live",
    problem: {
      text: "A study project: rebuild a motion-heavy studio site to learn how *layout, type and animation* actually work together.",
    },
    process: [
      { text: "Followed a *Sheriyans Coding School* tutorial as the starting point." },
      {
        text: "What you rebuilt from scratch or changed once the tutorial ran out. Which interaction did you have to reason through yourself?",
        todo: true,
      },
    ],
    approach: [
      { text: "Rebuilt the site in *React with Vite*, Tailwind CSS and *Framer Motion*." },
      { text: "Concentrated on *scroll-driven reveals*, marquee type and hover interactions." },
    ],
    insights: [
      {
        text: "What clicked about motion here. You have said you learnt to drive animation with math — what was the moment it landed?",
        todo: true,
      },
    ],
    decisions: [
      { text: "Recreated the motion with *Framer Motion* rather than reaching for heavier animation libraries." },
    ],
    wins: [
      { text: "One of my biggest learning jumps for interactive sites: I learnt how to *use math to drive animation*." },
    ],
    misses: [
      {
        text: "Where the rebuild does not hold up against the original, or what you would now do differently. Also worth saying plainly: this is a study piece, not original design.",
        todo: true,
      },
    ],
    outcome: {
      text: "Live, and the direct reason the motion on *this* site works the way it does.",
    },
    why: {
      text: "Why rebuilding someone else's site taught you more, at that point, than designing your own would have.",
      todo: true,
    },
  },
  {
    slug: "learn2lead",
    role: "Product scope and full-stack build",
    status: "Code on GitHub",
    problem: {
      text: "My college project. Make e-courses easier to get at, and pull *interview prep, internships and startup pitching* into one place instead of scattering them across separate sites.",
    },
    process: [
      {
        text: "How you scoped this. Four modules is a lot for a college project — did you talk to other students, or start from what you personally wanted?",
        todo: true,
      },
      {
        text: "The order you built it in, and what you cut along the way to actually ship it.",
        todo: true,
      },
    ],
    approach: [
      { text: "*Courses*, videos and study materials, with interactive quizzes and mock interviews." },
      { text: "*Personalized progress dashboards*, plus an admin side for managing content." },
      { text: "*Internship listings* and *PitchIt*, where founders present startup ideas to venture capitalists." },
      { text: "*Stripe* payments for premium content." },
    ],
    insights: [
      {
        text: "What you learnt about students' actual prep habits that shaped the modules — or, honestly, if this was scoped on instinct, say that instead.",
        todo: true,
      },
    ],
    decisions: [
      { text: "Built on *PHP and JavaScript* to learn from the basics how a backend talks to a frontend, so that moving to Node and friends later would make sense." },
    ],
    wins: [
      { text: "Delivered as my college project. *PitchIt* was the most ambitious piece." },
      { text: "Building a *multi-sided product* with payments and an admin side taught me how many moving parts a real platform has." },
    ],
    misses: [
      {
        text: "The over-scoping. Four modules in one project — which of them is thin, and what would you have dropped to make the rest good?",
        todo: true,
      },
    ],
    outcome: {
      text: "Shipped as my college project: a *four-module platform* that taught me what scope really costs.",
    },
    why: {
      text: "Why one platform beat four small focused projects — or, if it did not, what you would tell your past self.",
      todo: true,
    },
  },
  {
    slug: "spotify",
    role: "Full-stack build",
    status: "Live",
    problem: {
      text: "My first full-stack build, over a summer break: recreate a real *subscription product* end to end — auth, uploads, recurring payments, all of it.",
    },
    process: [
      { text: "Followed an *open-source course* as the starting point." },
      {
        text: "What you added or rebuilt beyond the course, and the first thing that broke in a way the tutorial did not cover.",
        todo: true,
      },
    ],
    approach: [
      { text: "*Next.js App Router*, Tailwind, *Supabase* and PostgreSQL." },
      { text: "Song upload, playback through an advanced player, liked songs and playlists." },
      { text: "Supabase and GitHub *authentication*, and *Stripe recurring subscriptions*, cancellation included." },
    ],
    insights: [
      {
        text: "What surprised you about payments or auth — the part you expected to take an afternoon and did not.",
        todo: true,
      },
    ],
    decisions: [
      { text: "*Server components read the database directly*; API route handlers only cover writes and payments." },
    ],
    wins: [
      { text: "Live on Vercel, with *auth, storage, payments and the frontend* all actually fitting together." },
      { text: "The project that made me want to go deep, and led straight to *Flint* and *Tesseract*." },
    ],
    misses: [
      {
        text: "Where a first build shows. Something you would now call badly structured, or a shortcut on payments or auth you would not repeat?",
        todo: true,
      },
    ],
    outcome: {
      text: "Live on Vercel — and the build that set the direction for everything after it.",
    },
    why: {
      text: "Why cloning a real subscription product was the right first full-stack project, rather than something original and smaller.",
      todo: true,
    },
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
