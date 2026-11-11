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
  media:
    | { kind: "video"; src: string; poster: string; label: string }
    | { kind: "image"; src: string; alt: string }
    | { kind: "board"; src: string; dark: string; alt: string };
};

// A process-board frame, exported once per theme as <path>.webp and <path>-dark.webp.
const frame = (path: string, alt: string) => ({ kind: "board" as const, src: `/work/${path}.webp`, dark: `/work/${path}-dark.webp`, alt });

type CaseStudy = {
  slug: string;
  role: string;
  status: string;
  /** What problem was I trying to solve. */
  problem: Block;
  /** What process did I follow — the real steps, in order. */
  process: Block[];
  /** The process board, frame by frame, laid out like the walkthrough. */
  board?: Step[];
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
    board: [
      {
        title: "From Flint to Polaris",
        text: "Flint's fast first build, a written spec, a rebuild, two visual passes, a review round, then a speed pass before shipping.",
        media: frame("polaris/process/timeline", "A timeline of Polaris, eleven milestones from Flint v1 to ready to ship"),
      },
      {
        title: "Test it before it costs you",
        text: "Most traders test a strategy with real money. Polaris is the back office where it gets tested first: on history, then on paper, sized to a risk you chose.",
        media: frame("polaris/process/problem", "The problem statement and the job to be done, above the five tabs Polaris replaces: broker app, charting site, screener, news app and spreadsheet"),
      },
      {
        title: "Who it's for",
        text: "The self-directed trader who wants proof before funding a strategy. So far that's me, from research through review.",
        media: frame("polaris/process/users", "A card for the self-directed trader, above a journey map from discover to review"),
      },
      {
        title: "Principles, and how they moved",
        text: "From the first brief to the shipped build. The number as the hero and discipline over emotion survived every version.",
        media: frame("polaris/process/principles", "Four cards of design principles from Flint v1 to the shipped build, and a note on which ones survived"),
      },
      {
        title: "Information architecture, four snapshots",
        text: "Eight destinations in one top bar, then the spec, a glass sidebar with phone tabs, and Ask Polaris on every page. The reason for each change sits under the maps.",
        media: frame("polaris/process/sitemap", "Four site maps of Polaris from Flint v1's top nav to the shipped build, with the reason for each change"),
      },
      {
        title: "Key flows, as shipped",
        text: "Signing up, placing a paper trade, running the AI desk and asking Polaris, the way they work in the final build, plus the five states every flow defines.",
        media: frame("polaris/process/flows", "Four flows as numbered steps: invite to first value, symbol to paper trade, running the desk and Ask Polaris, then the five states every flow defines"),
      },
      {
        title: "Flint v1, the first build",
        text: "The first build: a 3D field, a ticker that wasn't live, count-up stats, and a dashboard quoting a 62.5% forecast typed into the code.",
        media: frame("polaris/process/sketch", "Pencil sketches on grid paper of the Flint v1 landing page and dashboard, with handwritten notes in the margin"),
      },
      {
        title: "v2, wireframed before the rebuild",
        text: "The symbol page, the same page at 360px, and a home built only from real data, all drawn in the spec before any of it was built.",
        media: frame("polaris/process/wireframes", "Wireframes of the v2 symbol page on a laptop and a phone, and the v2 home page, with numbered notes"),
      },
      {
        title: "Same job, three versions",
        text: "Where you land after signing in, the symbol page and the front door, from the v1 sketch through the spec to what shipped.",
        media: frame("polaris/process/evolution", "Three rows comparing the Flint v1 sketch, the v2 spec and the shipped app for the home page, the symbol page and the landing page"),
      },
      {
        title: "What got cut, and why",
        text: "Geotrade, the community feed, next-day forecasts, the rounds picker and more, and why each one went.",
        media: frame("polaris/process/cuts", "A table of nine cuts, each with the reason it went"),
      },
      {
        title: "Visual system, v2 to v4",
        text: "Sharp and precise, then glass, then liquid glass, then icons and a loading spinner. Color only when it means something: gains, losses, stale data and paper money.",
        media: frame("polaris/process/visual", "Four cards of Polaris visual tokens from v2 to the shipped icons and spinner, above a specimen of each interface state"),
      },
      {
        title: "The review round",
        text: "I used it as a user and wrote down what bothered me. What I said, what was actually wrong, what changed, then two before-and-afters.",
        media: frame("polaris/process/review", "A table of what one user flagged and what changed, then the backtest result and the AI desk before and after"),
      },
    ],
    approach: [
      { text: "*Market pulse first*: Home opens on what the market is doing, with India and US indices, USD/INR, breadth, sector heat and the day's movers." },
      { text: "*Real and paper, never summed*: holdings sync read-only from eight brokers, including Zerodha, Upstox, Groww and Dhan. Paper books sit beside them, marked in blue, and no total ever adds the two together." },
      { text: "*The plan comes before the button*: open a symbol and get an entry, a stop, two targets and a size that risks exactly what you chose. You pick the method and the risk. Polaris does the arithmetic and shows it." },
      { text: "*Performance and risk*: time-weighted and money-weighted returns against a benchmark, plus VaR, max drawdown and concentration, each with one plain sentence about what it means." },
      { text: "*AI desk*: four analysts (fundamentals, technical, news, and sentiment and flow) say what they see, and every figure comes from Polaris's own engines. The case for strength opens, the case for caution has to answer it, and the summary picks no winner. Your own risk rule sizes the trade with arithmetic, not a model. When a model is down, the card says so instead of guessing." },
      { text: "*Ask Polaris*: a chat that reads the stock on screen, your paper portfolio and any company you name, then explains in plain words. Chats are kept per user, behind the same row-level security as everything else." },
      { text: "*Backtest*: an event-driven backtester running 13 strategies, costs on both sides, plus out-of-sample, walk-forward and Monte Carlo robustness passes." },
      { text: "*Watchlists and alerts*: named lists with sparklines, and price or percentage-move alerts that land in the bell. Right-click a price on any chart to set one there." },
    ],
    walkthrough: [
      {
        title: "Read the market first",
        text: "Pick a universe and the overview opens on breadth, then a heat grid sorted by the day's move and the biggest gains and falls. Green and red before a single chart, so you know what kind of day it is.",
        media: { kind: "video", src: "/work/polaris/markets.mp4", poster: "/work/polaris/markets-poster.webp", label: "The Polaris markets overview: picking the US Large Cap universe, then breadth, the heat grid and the day's gains and falls" },
      },
      {
        title: "Click a ticker, get a plan",
        text: "Open a symbol from the watchlist and the chart arrives with a trade plan beside it: side, entry, stop, two targets and a size, drawn on the chart as lines.",
        media: { kind: "video", src: "/work/polaris/terminal.mp4", poster: "/work/polaris/terminal-poster.webp", label: "Opening GOOGL from the watchlist and zooming into its trade plan" },
      },
      {
        title: "Then ask the desk",
        text: "Four analysts file first, on fundamentals, technicals, news, and sentiment and flow. The case for strength opens and the case for caution has to answer one of its claims. Then your own risk per trade turns the plan into shares and the amount at risk.",
        media: { kind: "video", src: "/work/polaris/desk.mp4", poster: "/work/polaris/desk-poster.webp", label: "The AI desk working on GOOGL: four analysts file, strength and caution argue, then the summary and Your rules" },
      },
      {
        title: "Test it on the past",
        text: "Pick one of 13 strategies and run it over years of daily history. The verdict against buy and hold comes first, and a result that hasn't seen out-of-sample data says so.",
        media: { kind: "video", src: "/work/polaris/backtest.mp4", poster: "/work/polaris/backtest-poster.webp", label: "Running a MACD backtest on GOOGL: the verdict against buy and hold, the growth chart, then monthly returns" },
      },
      {
        title: "Then check what's underneath",
        text: "Every reading side by side, then a fundamental x-ray built from four years of raw statements: growth, profitability, cash quality and the balance sheet.",
        media: { kind: "video", src: "/work/polaris/fundamentals.mp4", poster: "/work/polaris/fundamentals-poster.webp", label: "Scrolling the GOOGL fundamentals tab: readings, then the fundamental x-ray" },
      },
      {
        title: "A teardown in plain English",
        text: "The Deep Dive reads the company profile and a dozen dated headlines first, then writes the teardown and lists its sources. It opens with one line, then what's going well and what could go wrong.",
        media: { kind: "video", src: "/work/polaris/deepdive.mp4", poster: "/work/polaris/deepdive-poster.webp", label: "Writing the GOOGL Deep Dive: the one-line summary, what's going well and what could go wrong" },
      },
      {
        title: "Ask in plain words",
        text: "Ask Polaris reads the stock on your screen, your paper portfolio and any company you name, then explains. It doesn't advise. Every chat is saved to your account alone, in a side pane like any chat app.",
        media: { kind: "video", src: "/work/polaris/ask.mp4", poster: "/work/polaris/ask-poster.webp", label: "Asking Polaris to explain the GOOGL trade plan in plain words, then opening the chats pane" },
      },
      {
        title: "News, scored for tone",
        text: "Headlines from public feeds, each scored by a sentiment model, rolled up into an overall tone and a tone for every category.",
        media: { kind: "video", src: "/work/polaris/news.mp4", poster: "/work/polaris/news-poster.webp", label: "The Polaris news page, then tone by category as the tabs change" },
      },
    ],
    insights: [
      {
        text: "*Surface candidates, never verdicts.* A single rating built from untested indicators is a recommendation engine wearing a lab coat. So the plan shows which factors voted for the trade and which voted against, and you weigh them yourself.",
      },
      {
        text: "*AI observes and explains. It never trades.* One model handing down one verdict has nobody checking it. On the desk, the case for caution has to answer a specific claim from the case for strength, the summary picks no winner, and no seat is allowed a rating, a target or a size.",
      },
      {
        text: "*Honesty is a feature.* Polaris isn't registered with SEBI, so it never recommends a stock. Every figure says where it came from and how old it is. Where something isn't built yet, like US broker sync, the app says so instead of pretending.",
      },
    ],
    decisions: [
      { text: "*Read-only by design*: Polaris can see the holdings on a real account but can never place an order there. The API rejects any write to a real account." },
      { text: "*Row-level security* in Postgres, so even a bug in the API can't show one user another user's portfolio." },
      { text: "Trade plan targets *move smoothly with the market*. Signal strength, trend and mean reversion shift them, and a nearby 52-week high or low pulls them back. No fixed 1.5R and 3R." },
      { text: "Every desk run is *journaled* as a note: the summary, what to watch and the readings, so you can look back. Nothing gets scored, because the desk never makes a call to grade." },
      { text: "*One exchange, not four rounds*: every extra round re-read the same cards and restated round one, at two model calls a round. The desk now runs one exchange in 7 model calls." },
      { text: "When a bar touches both the stop and the target, the backtester assumes *the stop was hit*. Results err on the side of caution." },
    ],
    wins: [
      { text: "Ran it on my own money as the first user: *13.45% return on a single stock*, after tuning the portfolio." },
      { text: "The part I'd rebuild exactly the same way: the *AI desk debate*. It argues both sides of a trade before anything gets a share count." },
      { text: "Worked through a 31-item speed checklist on the frontend and the API. The watchlists page now loads in *one request instead of two per row*. Ask Polaris streams its reply, so the *first words show at 2.2 seconds*, before a short answer is done at 2.9." },
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
    // Client work from the Ceyone Marketing internship. The process is confidential, so there's no
    // "How I worked" and no board: the walkthrough carries it. Results come from the live site.
    slug: "only-villas",
    role: "Frontend build, UI, and the Google Maps and Places integration",
    status: "Live client work",
    problem: {
      text: "Property portals are built for flats. A villa buyer scrolls past apartment listings, then still has to drive out to see *what's near the plot*. Only Villas wanted the opposite. *Villas only, verified*, and everything a buyer asks before a site visit on one page.",
    },
    process: [],
    approach: [
      { text: "*Map and list, side by side.* Every villa is a pin on Google Maps beside its card, with a satellite view and a full-screen map. Villas and whole projects get their own tabs." },
      { text: "*Filters modeled on Airbnb's.* One panel for price range, bedrooms, built-up area, facing, villa type, and features like a private pool or a terrace garden." },
      { text: "*A page per project.* Overview, master plan, villa plan, the full price breakdown, an *EMI calculator*, amenities, gallery and specifications, with a tab bar that follows you down." },
      { text: "*What's nearby.* The *Places API* finds the bus stops, train stations, airport, hospitals, schools, ATMs, theatres and supermarkets around each project, sorted under Transit, Essentials and Utility, each with its distance." },
      { text: "*A callback that's always one tap away*, with a phone OTP, so the sales team calls real numbers." },
      { text: "The look takes its cues from *eXp Realty*. A serif display face, navy and white, and big photography. Built in *React, TypeScript, Tailwind CSS and Zustand*."},
    ],
    walkthrough: [
      {
        title: "Villas only, from the first screen",
        text: "A full-bleed villa, then the promise in plain words. Every villa is verified and picked for you, and someone stays with you till the griha pravesha. Then the homebuyers get the last word.",
        media: { kind: "video", src: "/work/onlyvillas/landing.mp4", poster: "/work/onlyvillas/landing-poster.webp", label: "The Only Villas landing page, from the hero to the verified villas promise and the homebuyer reviews" },
      },
      {
        title: "Search on a map",
        text: "Every villa is a pin beside its card. Zoom into a neighborhood, or switch to satellite and see the land around it.",
        media: { kind: "video", src: "/work/onlyvillas/search.mp4", poster: "/work/onlyvillas/search-poster.webp", label: "Villa cards beside a Google Map of Bengaluru, zooming in, then switching to satellite" },
      },
      {
        title: "Filters that think like a buyer",
        text: "Price, bedrooms, built-up area, facing, villa type and features, all in one panel, the way Airbnb does it. Apply once and the list and the map update together.",
        media: { kind: "video", src: "/work/onlyvillas/filters.mp4", poster: "/work/onlyvillas/filters-poster.webp", label: "Setting price, bedrooms, built-up area, facing, villa type and features in the filters panel, then the filtered results" },
      },
      {
        title: "Every number on one page",
        text: "Overview, master plan, villa plan and the full price, down to GST and car parking. Then an EMI calculator, so the monthly number is never a surprise.",
        media: { kind: "video", src: "/work/onlyvillas/project.mp4", poster: "/work/onlyvillas/project-poster.webp", label: "A project page scrolling through the overview, master plan, villa plan, pricing and EMI calculator" },
      },
      {
        title: "What's around it",
        text: "The coolest part. Pick Transit, Essentials or Utility and the map lights up with bus stops, the airport, hospitals, theatres and supermarkets, each with how far it is.",
        media: { kind: "video", src: "/work/onlyvillas/nearby.mp4", poster: "/work/onlyvillas/nearby-poster.webp", label: "The location map switching between bus stations, the airport, hospitals, theatres and supermarkets near a project" },
      },
    ],
    insights: [],
    decisions: [
      { text: "*Map and list together*, never a map mode you switch into. A villa's price means little until you see where it is." },
      { text: "*Filters in one panel* instead of a sidebar of dropdowns. Set everything, apply once." },
      { text: "*Distances, not just pins.* Every nearby place says how far it is, sorted by what a buyer asks first." },
    ],
    wins: [
      { text: "*The nearby places map.* Turning a pin into an answer to \"how far is the airport\" was the coolest thing I built there." },
      { text: "Built from *reusable components*, which cut development time by 10%." },
    ],
    misses: [
      { text: "*Type and structure.* I'd pick a better font, add smooth scroll, and tighten the page structure. Then apply proper design principles to the landing page, the nav and every page after it. The features held up better than the polish." },
    ],
    outcome: {
      text: "Live at onlyvillas.in, listing *183 villas across 10 projects* in Bengaluru, with *user engagement up 30%* after rounds of UI and UX changes.",
    },
    why: {
      text: "Read the homebuyer reviews on the site. *8 of the 10* talk about location, from the main road and the bus stop to the highway and the lake. Buyers judge a villa by what's around it, and that's the question every project page answers.",
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
      { text: "*A depth portrait*: the balaclava photo becomes a 3D surface in Three.js, with a target lock on his face and Liverpool's coordinates in the corner. It turns away from your cursor, or with your phone's tilt. Scroll dives into his eyes, then hard cuts." },
      { text: "*The file*: a dossier page where his name is a *redaction bar* and the heading decrypts out of random glyphs. The bio, stats and tour dates sit beside it, each with a date and a source." },
      { text: "*A chapter per track*: nine sections, from Dirty to Bandit, each with its own song, palette and grain. The music changes as you scroll, and every cut flashes negative." },
      { text: "*Live, then out*: 40 frames from the live show run in a 3D carousel that curls harder the faster you scroll, and the page ends on a red outro." },
    ],
    walkthrough: [
      {
        title: "Choose your volume first",
        text: "A counter runs to 100 while the portrait loads, under a flashing-images warning. Then you pick: enter with sound on, or off. He's already watching when you get in.",
        media: { kind: "video", src: "/work/esdeekid/enter.mp4", poster: "/work/esdeekid/enter-poster.webp", label: "The EsDeeKid gate counting to 100, then the hero with a target lock on his eyes" },
      },
      {
        title: "Dive into the file",
        text: "Scroll and you fall into his eyes, then hard cut to his file. The name decrypts out of random glyphs, and every stat carries the date it was read.",
        media: { kind: "video", src: "/work/esdeekid/file.mp4", poster: "/work/esdeekid/file-poster.webp", label: "The hero cutting to the File page as the name decrypts" },
      },
      {
        title: "A chapter per track",
        text: "Each song gets its own chapter, built from frames of its own video. The music switches as you scroll in, and every cut flashes negative.",
        media: { kind: "video", src: "/work/esdeekid/chapter.mp4", poster: "/work/esdeekid/chapter-poster.webp", label: "Scrolling into the Dirty chapter: its title, then frames from the video" },
      },
      {
        title: "The live show, on a bend",
        text: "Forty frames from Lithuania run in one 3D row. The middle frame sits flat and the ones beside it curl toward you, harder the faster you scroll. Click one to open it full screen.",
        media: { kind: "video", src: "/work/esdeekid/live.mp4", poster: "/work/esdeekid/live-poster.webp", label: "Scrolling the Lithuania carousel: frames curl toward the camera and smear on a fast scroll" },
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
      { text: "*The dive into his eyes*, the live carousel, and landing on a *brutalist design* that suits him." },
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
    board: [
      {
        title: "Built, used, rebuilt",
        text: "v1, which I practiced on before my own placement rounds, then a rebuild that improved on it.",
        media: frame("tesseract/process/timeline", "A timeline of Tesseract, eight milestones from v1 to the rebuild"),
      },
      {
        title: "Knowing it isn't saying it",
        text: "The problem, then everything I tried first and what each one trains. Tesseract is built for the gap they leave.",
        media: frame("tesseract/process/problem", "The problem in a quote, above five cards comparing question lists, YouTube, recording yourself, friends and Tesseract"),
      },
      {
        title: "Who it's for, and what I tested",
        text: "One real user so far, a job to be done, and three assumptions I tested on myself.",
        media: frame("tesseract/process/users", "A card for the one real user and the job to be done, beside a table of three assumptions with the evidence for each"),
      },
      {
        title: "Principles behind the rebuild",
        text: "Practice has to feel like the interview, start from the job you want, say what was actually wrong, and keep the video with you.",
        media: frame("tesseract/process/principles", "Four principle cards, each with the line it came from and where it shows up in the product"),
      },
      {
        title: "Information architecture, three snapshots",
        text: "Nav links with no page behind them in v1, then a feedback form and a social page, then jobs, a profile and community in the rebuild.",
        media: frame("tesseract/process/sitemap", "Three site maps of Tesseract, from v1 to the rebuild"),
      },
      {
        title: "The core flow, before and after",
        text: "Four typed fields became one pasted link, and feedback moved from the end of the interview to after every answer.",
        media: frame("tesseract/process/flows", "The core flow as numbered steps, eight in v1 beside nine after the rebuild"),
      },
      {
        title: "v1, the first build",
        text: "The v1 dashboard, the setup dialog with four required fields, the interview room, and feedback that only arrived at the end.",
        media: frame("tesseract/process/sketch", "Pencil sketches on grid paper of the v1 dashboard, setup dialog, interview room and feedback page, with handwritten notes in the margin"),
      },
      {
        title: "The rebuild, wireframed",
        text: "A new interview built from a pasted link, a get-ready page with the time it takes, the interview room and feedback on every answer.",
        media: frame("tesseract/process/wireframes", "Wireframes of the rebuild's new interview form, get-ready page, interview room and feedback page, with numbered notes"),
      },
      {
        title: "Same job, two versions, then the real thing",
        text: "Setting up, answering and feedback, each as the v1 sketch, the rebuild wireframe and the shipped screen.",
        media: frame("tesseract/process/evolution", "Three rows comparing the v1 sketch, the rebuild wireframe and the shipped screen for setup, answering and feedback"),
      },
      {
        title: "What changed, and why",
        text: "Setup, the job source, the camera and the feedback header, from v1 to the rebuild, and why each one changed.",
        media: frame("tesseract/process/changes", "A table of four changes from v1 to the rebuild, each with its reason"),
      },
      {
        title: "Visual system and states",
        text: "v1 ran on shadcn defaults. The rebuild has its own tokens: one brand orange for actions and a soft tint for each score tone.",
        media: frame("tesseract/process/visual", "The v1 and rebuild color tokens side by side, above the empty, error and loading states each version shipped"),
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
