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
    status: "Invite-only beta",
    problem: {
      text: "Retail investors bounce between a broker app, a charting site, a screener, a news app and a spreadsheet. Not one of them answers the only two questions that matter: *why does this trade make sense*, and *how much should I risk on it*. And if your money sits with more than one broker, nothing shows it all in one place.",
    },
    process: [
      {
        text: "It started with *tab fatigue*. One laptop, a tab for every minute piece of information, and all of them juggled to make one call. I don't have a Bloomberg terminal on my desk. So I built one with whatever I had.",
      },
      {
        text: "Then the rule that decides what stays on screen: *every number is earned*. No figure ships without its source and age. A backtest that hasn't seen out-of-sample data says so on the result. Other apps headline a single *Strong Buy*, a score with hidden weights or an analyst's upside. Polaris shows none of them, because none can show their working.",
      },
      {
        text: "Some things didn't earn it. I built *next-day price forecasts* on XGBoost and Prophet, looked at what they cost, and cut them: two large libraries carrying one feature.",
      },
      {
        text: "Then I put *real money* on its recommendations. The strategy was deliberately simple: *buy at support, sell at resistance*, plus basic smart money concepts and key levels. Everything I'd learned by *losing a lot of money* went into it, so I never have to learn it that way again.",
      },
      {
        text: "Then it stopped being just mine. I rebuilt the backend on *FastAPI*, added sign-in with Clerk and a Postgres database where every user sees only their own rows, and opened it as an *invite-only beta*.",
      },
    ],
    approach: [
      { text: "*Market pulse first*: Home opens on what the market is doing, with India and US indices, USD/INR, breadth, sector heat and the day's movers." },
      { text: "*Real and paper, never summed*: holdings sync read-only from eight brokers, including Zerodha, Upstox, Groww and Dhan. Paper books sit beside them, marked in blue, and no total ever adds the two together." },
      { text: "*The plan comes before the button*: open a symbol and get an entry, a stop, two targets and a size that risks exactly what you chose. You pick the method and the risk. Polaris does the arithmetic and shows it." },
      { text: "*Performance and risk*: time-weighted and money-weighted returns against a benchmark, plus VaR, max drawdown and concentration, each with one plain sentence about what it means." },
      { text: "*AI desk*: four seats (technical, fundamentals, news and a risk committee) explain what they see, with their sources on the table. A bull and a bear argue it out before anything gets a size. When a model is down, the card says so instead of guessing." },
      { text: "*Backtest*: an event-driven backtester running 13 strategies, costs on both sides, plus out-of-sample, walk-forward and Monte Carlo robustness passes." },
      { text: "*Watchlists and alerts*: named lists with sparklines, and price or percentage-move alerts that land in the bell." },
    ],
    walkthrough: [
      {
        title: "Read the market first",
        text: "Top gainers and losers, then a heatmap of the day's change. Green and red before a single chart, so you know what kind of day it is.",
        media: { kind: "video", src: "/work/polaris/markets.mp4", poster: "/work/polaris/markets-poster.webp", label: "The Polaris markets page: top movers, then the US equities heatmap" },
      },
      {
        title: "Click a ticker, get a plan",
        text: "Open a symbol from the watchlist and the chart arrives with a trade plan beside it: side, entry, stop, two targets and a size, drawn on the chart as lines.",
        media: { kind: "video", src: "/work/polaris/terminal.mp4", poster: "/work/polaris/terminal-poster.webp", label: "Opening PLTR from the watchlist and zooming into its trade plan" },
        aside: "Entry, stop, targets. Shown before the paper trade button, not after.",
      },
      {
        title: "Then check what's underneath",
        text: "Every reading side by side, then a fundamental x-ray built from four years of raw statements: growth, profitability, cash quality and the balance sheet.",
        media: { kind: "video", src: "/work/polaris/fundamentals.mp4", poster: "/work/polaris/fundamentals-poster.webp", label: "Scrolling the PLTR fundamentals tab: readings, then the fundamental x-ray" },
      },
      {
        title: "News, scored for tone",
        text: "Headlines from public feeds, each scored by a sentiment model, rolled up into an overall tone and a tone for every category.",
        media: { kind: "video", src: "/work/polaris/news.mp4", poster: "/work/polaris/news-poster.webp", label: "The Polaris news page, zooming into tone by category" },
      },
    ],
    insights: [
      {
        text: "*Surface candidates, never verdicts.* A single rating built from untested indicators is a recommendation engine wearing a lab coat. So the plan shows which factors voted for the trade and which voted against, and you weigh them yourself.",
      },
      {
        text: "*AI observes and explains. It never trades.* One model handing down one verdict has nobody checking it. On the desk, every round of debate needs a rebuttal, the risk seats argue size against half-Kelly and portfolio VaR, and the manager can still refuse.",
      },
      {
        text: "*Honesty is a feature.* Polaris isn't registered with SEBI, so it never recommends a stock. Every figure says where it came from and how old it is. Where something isn't built yet, like US broker sync, the app says so instead of pretending.",
      },
    ],
    decisions: [
      { text: "*Read-only by design*: Polaris can see the holdings on a real account but can never place an order there. The API rejects any write to a real account." },
      { text: "*Row-level security* in Postgres, so even a bug in the API can't show one user another user's portfolio." },
      { text: "Trade plan targets *move smoothly with the market*. Signal strength, trend and mean reversion shift them, and a nearby 52-week high or low pulls them back. No fixed 1.5R and 3R." },
      { text: "Every AI desk decision is *journaled*, then scored on realized alpha against the S&P 500. Past hits and misses feed the next run's prompts." },
      { text: "When a bar touches both the stop and the target, the backtester assumes *the stop was hit*. Results err on the side of caution." },
    ],
    wins: [
      { text: "Ran it on my own money as the first user: *13.45% return on a single stock*, after tuning the portfolio." },
      { text: "The part I'd rebuild exactly the same way: the *AI desk debate*. It argues both sides of a trade before anything gets a share count." },
    ],
    misses: [
      {
        text: "*I didn't build another Bloomberg.* I built something that tells me why a trade makes sense, and why it doesn't. It has a long way to go, and I'm still learning the *quant and finance* to get it there.",
      },
      { text: "*Not everything syncs yet.* US markets are live, but US broker holdings can't sync, and alerts only fire while the app is open." },
    ],
    outcome: {
      text: "Personally tested and optimized the portfolio, reaching a *13.45% return within the first month*.",
    },
    why: {
      text: "*One platform for every market I trade*, India and the US, real and paper, instead of a tab for every tool. The simpler version is the tab fatigue I started with.",
    },
  },
  {
    slug: "esdeekid",
    role: "Concept, art direction, motion and frontend build",
    status: "Fan concept",
    problem: {
      text: "Most artist sites are a tour list and a merch link. EsDeeKid keeps his *name, face and age* to himself, so a normal fan page would miss the most interesting thing about him. I wanted a site that *keeps the secret too*.",
    },
    process: [
      { text: "I found him through a *4 Raws edit with Timothée*, and the hook was instant: the accent, the dark sound, the *flash effects*. That's the mood I wanted the site to have." },
      {
        text: "I watched the music videos frame by frame and pulled the shots that carry each song. Every chapter on the site is *built from that video's own frames*, so nothing is stock and nothing is made up.",
      },
      {
        text: "Then I wrote down what the site should feel like before writing any code: a *classified file on someone who doesn't want to be found*. Every effect had to fit that, or it was cut.",
      },
    ],
    approach: [
      { text: "*A gate first*: a counter runs to 100 while the fonts and portrait load, a flashing-images warning shows, and you choose to enter with sound on or off." },
      { text: "*A depth portrait*: the balaclava photo becomes a 3D surface in Three.js, with a target lock on his face and Liverpool's coordinates in the corner. Scroll dives into his eyes, then hard cuts." },
      { text: "*The file*: a dossier page where his name is a *redaction bar* and the heading decrypts out of random glyphs. The bio, stats and tour dates sit beside it, each with a date and a source." },
      { text: "*A chapter per track*: nine sections, from Dirty to Bandit, each with its own song, palette and grain. The music changes as you scroll, and every cut flashes negative." },
      { text: "*Live, then out*: the live show plays as a 3D tunnel of frames, and the page ends on a red outro." },
    ],
    walkthrough: [
      {
        title: "Choose your volume first",
        text: "A counter runs to 100 while the portrait loads, under a flashing-images warning. Then you pick: enter with sound on, or off. He's already watching when you get in.",
        media: { kind: "video", src: "/work/esdeekid/enter.mp4", poster: "/work/esdeekid/enter-poster.webp", label: "The EsDeeKid gate counting to 100, then the hero with a target lock on his eyes" },
        aside: "Sound off is a valid choice. Wrong, but valid.",
      },
      {
        title: "Dive into the file",
        text: "Scroll and you fall into his eyes, then hard cut to his file. The name decrypts out of random glyphs, and every stat carries the date it was read.",
        media: { kind: "video", src: "/work/esdeekid/file.mp4", poster: "/work/esdeekid/file-poster.webp", label: "The hero cutting to the File page as the name decrypts" },
        aside: "The only field left blank is the one everyone wants.",
      },
      {
        title: "A chapter per track",
        text: "Each song gets its own chapter, built from frames of its own video. The music switches as you scroll in, and every cut flashes negative.",
        media: { kind: "video", src: "/work/esdeekid/chapter.mp4", poster: "/work/esdeekid/chapter-poster.webp", label: "Scrolling into the Dirty chapter: its title, then frames from the video" },
      },
      {
        title: "The live show, as a tunnel",
        text: "Lithuania plays as a 3D corridor of frames. Scroll moves you down it, past the crowd and the stage lights.",
        media: { kind: "video", src: "/work/esdeekid/live.mp4", poster: "/work/esdeekid/live-poster.webp", label: "Moving through the 3D tunnel of frames from the Lithuania show" },
      },
      {
        title: "Out on red",
        text: "The page ends the way it started, with his name and the balaclava, now on red. Then the credits and every source.",
        media: { kind: "video", src: "/work/esdeekid/outro.mp4", poster: "/work/esdeekid/outro-poster.webp", label: "The red outro, then the credits and sources" },
      },
    ],
    insights: [
      {
        text: "*Personality isn't a color palette.* It's what the site refuses to show you. The most EsDeeKid thing on the page is the redaction bar where his name should be.",
      },
      {
        text: "A drill track is *cut, not scrolled*. Smooth fades felt wrong against the music, so sections hand over with hard cuts and a negative flash, the way his videos edit.",
        draft: true,
      },
    ],
    decisions: [
      { text: "*Sound is opt-in*. Audio starts only from the Enter click, so browsers allow it and nobody gets a drill track blasting in an open office." },
      { text: "*Reduced motion gets a calm version*: the flat cutout instead of the 3D portrait, and the name already decrypted." },
      { text: "*Facts are dated and sourced*: stats say when they were read, and the sources are listed. It's a fan site, not a rumor mill." },
      { text: "Labeled an *unofficial fan concept* on the first screen, so nobody mistakes it for his real site." },
    ],
    wins: [
      { text: "*The dive into his eyes*, the live tunnel, and landing on a *brutalist design* that suits him." },
    ],
    misses: [],
    outcome: {
      text: "Live as an *unofficial fan concept*, sound on recommended.",
    },
    why: {
      text: "A product engineer's job is to work out *what something should feel like*, then build exactly that. This was the same job with a rapper instead of a portfolio.",
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
      { text: "*Gemini* writes the questions (technical, behavioral, or mixed) and can *tailor them to your resume*, which is read once and reused everywhere." },
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
      { text: "I practiced on it before my own placement rounds. In one, the recruiter called out *how confident I was* answering every question." },
      { text: "My faculty asked me to present it to the *university board*, as a way to help more students prepare the same way." },
    ],
    misses: [
      { text: "*No real users yet.* It works, it is live, and it has an audience of one. Getting it in front of students is the next step and I have not done it." },
      {
        text: "The first setup made you *fill in a form by hand*: role, company, your experience, the job. Who even does that anymore. So I built a *resume parser* and a *job description fetcher* that pulls from any job portal, and the form now mostly fills itself.",
      },
    ],
    outcome: {
      text: "Live, and proven on exactly one user: *me, in a real interview*. The build is done, but distribution isn't.",
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
        text: "Two pupils that follow your cursor anywhere on the page. Find the center of each eye, find the cursor, point the pupil, every frame.",
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
        text: "It landed with *the eyes that follow your cursor*. Find the center of each eye, find the cursor, work out where the pupil should point, every frame. One hell of a thing to pull off, and the first time *math felt like a design tool*.",
      },
    ],
    decisions: [
      { text: "Recreated the motion with *Framer Motion* rather than reaching for heavier animation libraries." },
    ],
    wins: [
      { text: "One of my biggest learning jumps for interactive sites: I learned how to *use math to drive animation*." },
    ],
    misses: [
      {
        text: "*A study piece, not original design.* The layout and motion are Ochi's. I was building scroll-animated sites before they got famous. This one showed me exactly how complex, and how simple, they can be.",
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
