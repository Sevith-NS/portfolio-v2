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

/** One step of a product walkthrough: a short clip or a screenshot, with what it shows. */
export type Step = {
  title: string;
  text: string;
  media: { kind: "video"; src: string; poster: string; label: string } | { kind: "image"; src: string; alt: string };
  /** A personality line under the media, in the caption voice. */
  aside?: string;
};

type CaseStudy = {
  slug: string;
  role: string;
  status: string;
  /** What problem was I trying to solve. */
  problem: Block;
  /** What process did I follow — the real steps, in order. */
  process: Block[];
  /** What I built. */
  approach: Block[];
  /** The product, shown working. Optional: only cases with real footage get one. */
  walkthrough?: Step[];
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

const cases: CaseStudy[] = [
  {
    slug: "polaris",
    role: "Market research, product design, product definition, UX, frontend and backend",
    status: "Still cooking",
    problem: {
      text: "Retail investors bounce between a charting site, a screener, a news app and a spreadsheet. Not one of them answers the only two questions that matter: *why does this trade make sense*, and *how much should I risk on it*.",
    },
    process: [
      {
        text: "It started with *tab fatigue*: one laptop, a tab for every piece of information, juggling all of them to make one call. I don't have a Bloomberg terminal on my desk. So I built one with whatever I had.",
      },
      {
        text: "Plain version: Polaris shows a lot of numbers (VaR, Sharpe, Sortino, drawdown, beta, the factor votes). How did you decide which ones earn a spot on screen? And did you ever build something, look at it, and remove it because it didn't help you decide anything? One example is enough.",
        todo: true,
      },
      {
        text: "Then I put *real money* on its recommendations. The strategy was deliberately simple: *buy at support, sell at resistance*, plus basic smart money concepts and key levels. Everything I'd learnt by *losing a lot of money* went into it, so I never have to learn it that way again.",
      },
    ],
    approach: [
      { text: "*Terminal*: candlestick charting with a systematic Quant Trade Plan: limit entry, ATR and swing-based stop loss, 1.5R and 3R targets, a *factor vote breakdown* and half-Kelly position sizing." },
      { text: "*Portfolio*: paper trading on live prices with risk analytics: 95% VaR and CVaR, Sharpe, Sortino, max drawdown, beta against the S&P 500, and Markowitz max-Sharpe optimization." },
      { text: "*Trading Desk*: a multi-agent pipeline. Four analysts file reports, a bull and a bear argue it out, three risk seats fight over position size, and a portfolio manager approves or refuses with a share count." },
      { text: "*Backtest*: an event-driven backtester running 13 strategies, costs on both sides, plus out-of-sample, walk-forward and Monte Carlo robustness passes." },
      { text: "*AI desk*: a Gemini assistant that can see the paper portfolio, the symbol on screen, live signals and news sentiment, and answers grounded questions about risk and sizing." },
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
      { text: "Split the product into *two independently deployable services*, a Next.js frontend and a Flask quant API, talking only over HTTP." },
      { text: "Every Trading Desk decision is *journalled*, then scored on realized alpha against the S&P 500. Past hits and misses feed the next run's prompts." },
      { text: "When a bar touches both the stop and the target, the backtester assumes *the stop was hit*. Results err on the side of caution." },
    ],
    wins: [
      { text: "Ran it on my own money as the first user: *5% return in the first month*, after tuning the portfolio." },
      { text: "The one mechanism you would rebuild exactly the same way. Which part of this is genuinely good, and how do you know?", todo: true },
    ],
    misses: [
      {
        text: "*I didn't build another Bloomberg.* I built something that tells me why a trade makes sense, and why it doesn't. It has a long way to go, and I'm still learning the *quant and finance* to get it there.",
      },
    ],
    outcome: {
      text: "Personally tested and optimized the portfolio, reaching a *5% return within the first month*.",
    },
    why: {
      text: "Why this shape beat the simpler one: a single app, one model, no debate, no journal. What would that version have gotten wrong?",
      todo: true,
    },
  },
  {
    slug: "tesseract-ai",
    role: "Product scope, design and full-stack build",
    status: "Live",
    problem: {
      text: "I built Tesseract for me. I knew the theory for placements cold, but *explaining it clearly under pressure* is a different skill, and most students only find that out in the real interview.",
    },
    process: [
      {
        text: "First I tried everything that already existed. Question lists from *InterviewBit* and similar sites, rehearsed on my own. *YouTube*, which helped up to a point. *Mock interviews with friends*, which lasted until we made eye contact and all started laughing.",
      },
      {
        text: "The first version did three things: *give me a question, record my answer, tell me how it went*. Everything else, the job feed, the resume, the formats, came out of a lot of conversations with *classmates and teachers* about what they actually needed.",
      },
      {
        text: "Then I used it. A lot. I did not keep count, but enough that by the real placement round, the hard questions had already happened to me once.",
      },
    ],
    approach: [
      { text: "A *jobs feed* of fresh postings, pulled nightly from open job boards, so practice starts from a real role." },
      { text: "*Paste a LinkedIn link* or a job description, and the interview is built around that exact posting." },
      { text: "*Gemini* writes the questions (technical, behavioural or mixed) and can *tailor them to your resume*, which is read once and reused everywhere." },
      { text: "Questions are *read aloud*, the camera is optional, and *video never leaves the browser*: only the text transcript of your answers is saved." },
      { text: "*Feedback on every answer*: a score, filler words, skipped questions, and a critique of what you actually said." },
    ],
    walkthrough: [
      {
        title: "Start from a real job",
        text: "Fresh postings every morning, pulled from open job boards worldwide. Pick one and the practice is about that role, not a generic one.",
        media: { kind: "video", src: "/work/tesseract/jobs.mp4", poster: "/work/tesseract/jobs-poster.webp", label: "Scrolling the Tesseract jobs feed" },
      },
      {
        title: "Build the interview around it",
        text: "Paste the job, set the role and company, say how much experience you have, then pick the format and how many questions. Tick one box and the questions come from your own resume.",
        media: { kind: "video", src: "/work/tesseract/setup.mp4", poster: "/work/tesseract/setup-poster.webp", label: "Filling in the new interview form, sped up" },
        aside: "Sped up 3\u00d7. Nobody needs to watch me type.",
      },
      {
        title: "Your resume, read once",
        text: "Upload it once. Tesseract keeps the details and reuses them to fill in every new interview and to write questions about your own work.",
        media: { kind: "image", src: "/work/tesseract/profile-page.webp", alt: "Tesseract profile page showing an uploaded resume and the details extracted from it" },
      },
      {
        title: "Then it gets real",
        text: "Questions are read aloud, one at a time. The camera is optional and the video never leaves your browser. Only the text of your answers is saved.",
        media: { kind: "video", src: "/work/tesseract/interview.mp4", poster: "/work/tesseract/interview-poster.webp", label: "Stepping through interview questions with the camera off" },
      },
      {
        title: "Honest feedback, per answer",
        text: "A score, the filler words, what got skipped, and a critique of what you actually said, with your answer right underneath it.",
        media: { kind: "image", src: "/work/tesseract/feedback.webp", alt: "Tesseract feedback page: a 1.7 out of 5 average score and per-question critique" },
        aside: "Yes, that 1.7 out of 5 is mine. The coach does not do participation trophies.",
      },
    ],
    insights: [
      {
        text: "Rehearsing from a list, I was answering questions lying on my bed. *Nobody interviews lying on their bed.* Practice only counts if it feels like the real thing: a question you hear, not read, and a *camera that's on*.",
      },
      {
        text: "Going back through my old sessions was humbling. My answers were *vague*, and I never built up to the point, I just sort of arrived at it. The feedback kept handing me *frameworks to structure an answer*, and seeing the same mistake across sessions is what made me use them. One bad answer is noise. Five in a row is a pattern.",
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
        text: "The first setup made you *fill in a form by hand*: role, company, your experience, the job. Who even does that anymore. So I built a *resume parser* and a *job description fetcher* that pulls from any job portal, and the form now mostly fills itself.",
      },
    ],
    outcome: {
      text: "Live, and proven on exactly one user: *me, in a real interview*. The build is done; distribution is not.",
    },
    why: {
      text: "A fixed question bank lets you rehearse the answers. Recording yourself lets you rehearse on the bed. Friends let you rehearse laughing. Tesseract writes the questions from *the job you want and the resume you have*, says them out loud, hears you answer, and then tells you *what was actually wrong*. That's the only one of the four that feels like the interview.",
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
        text: "The course stopped holding my hand at the *AWS Console*. That part I had to figure out myself. A flight cockpit is easier to navigate.",
      },
    ],
    approach: [
      { text: "A *React and Tailwind* frontend for submitting a repository to deploy." },
      { text: "A *Node.js and TypeScript* service that builds the project and serves it, with *AWS S3* for storage." },
    ],
    insights: [
      {
        text: "I used to think uploading a project to Vercel *was* deployment, and that I had reached peak technology. Then I built the part Vercel hides, and found out *the upload is the easy bit*.",
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
        text: "*It's primitive.* It takes the project and pulls the latest changes on a *fixed schedule*, not when you push, and that's about all it does. Everything that makes the real one worth paying for is missing. It's hosting, barely.",
      },
    ],
    outcome: {
      text: "A working deploy pipeline, on GitHub, built to be *understood* rather than used.",
    },
    why: {
      text: "Anybody can read about deployment pipelines. I'm a *FAFO* learner: the more I mess around, the more I find out. *Reading and then building it* is the only way it sticks for me.",
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
        text: "Then I rebuilt the *hover-to-reveal text* myself: fixed its positioning and kept playing with its styles until it felt right.",
      },
    ],
    approach: [
      { text: "Rebuilt the site in *React with Vite*, Tailwind CSS and *Framer Motion*." },
      { text: "Concentrated on *scroll-driven reveals*, marquee type and hover interactions." },
    ],
    walkthrough: [
      {
        title: "Type first, then motion",
        text: "A big all-caps hero with a small image that slides into the headline, then a full-width marquee that rolls in as you scroll.",
        media: { kind: "video", src: "/work/ochi/hero.mp4", poster: "/work/ochi/hero-poster.webp", label: "The Ochi hero headline, then the marquee scrolling in" },
      },
      {
        title: "The eyes",
        text: "Two pupils that follow your cursor anywhere on the page. Find the centre of each eye, find the cursor, point the pupil, every frame.",
        media: { kind: "video", src: "/work/ochi/eyes.mp4", poster: "/work/ochi/eyes-poster.webp", label: "The cartoon eyes tracking the cursor as it moves" },
        aside: "They watch you scroll. Rude, honestly.",
      },
      {
        title: "Hover to reveal",
        text: "Hover a project and its name slides in across the cards. The part I rebuilt myself: its positioning, and its styles until they felt right.",
        media: { kind: "video", src: "/work/ochi/hover.mp4", poster: "/work/ochi/hover-poster.webp", label: "Hovering featured projects to reveal their names" },
      },
    ],
    insights: [
      {
        text: "It landed with *the eyes that follow your cursor*. Find the centre of each eye, find the cursor, work out where the pupil should point, every frame. One hell of a thing to pull off, and the first time *math felt like a design tool*.",
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
        text: "*A study piece, not original design.* The layout and motion are Ochi's. I was building scroll-animated sites before they got famous; this one showed me exactly how complex, and how simple, they can be.",
      },
    ],
    outcome: {
      text: "Live, and the direct reason the motion on *this* site works the way it does.",
    },
    why: {
      text: "Following a tutorial only gets you a copy. The parts of Ochi that mattered, *the eyes and the hover*, didn't work until I understood them. That's why this one taught me a lot.",
    },
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
