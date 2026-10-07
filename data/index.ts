export const resumeLink =
  "https://drive.google.com/file/d/1VpV84tcSQfn0ey0fELITyGvf4WEAYlgh/view?usp=drive_link";

export const email = "sevithns@gmail.com";

export const navItems = [
  { name: "Work", link: "#projects" },
  { name: "About", link: "#about" },
  { name: "Experience", link: "#experience" },
  { name: "Studio", link: "/studio" },
  { name: "Contact", link: "#contact" },
];

// Margin notes beside the hero, oldest first.
export const heroNotes = [
  { when: "Dec 2024", what: "Shipped a real-estate platform at Ceyone" },
  { when: "Mar 2025", what: "Joined Digital.ai, owning product docs" },
  { when: "2025", what: "Led 0-to-1 docs for Ask Release GA" },
  { when: "Now", what: "Building Flint OS, solo" },
  { when: "Next", what: "AI PM or product design role", highlight: true },
];

// Every number here comes from the resume.
export const ledger = [
  { value: "300+", label: "user stories and defects prioritized" },
  { value: "30+", label: "Agile sprints" },
  { value: "50+", label: "customer-reported defects resolved" },
  { value: "3", label: "major release cycles, 25.1 to 26.3" },
];

export const gridItems = [
  {
    id: 1,
    title: "Product builder aiming for AI PM and product design roles, currently a Technical Writer at Digital.ai",
    description: "BCA, Christ University",
  },
  {
    id: 4,
    title: "Tech and Finance enthusiast with a passion for development.",
    description: "",
  },
  {
    id: 5,
    title: "Currently building Flint OS, an AI-powered quant investing platform",
    description: "",
  },
  {
    id: 6,
    title: "Talent meets opportunity. Shall we begin?",
    description: "",
  },
];

export const projects = [
  {
    id: 7,
    title: "Flint OS",
    slug: "flint-os",
    tint: "sage",
    year: "2026",
    outcome: "I'm designing and building a quant investing platform that explains every trade it suggests.",
    des: "An AI-powered quant investing platform: multi-factor signal engine, VaR/CVaR risk analytics, XGBoost and Prophet forecasts, an event-driven backtester, and a Gemini-powered research assistant.",
    img: "/flint.png",
    iconLists: ["/next.svg", "/ts.svg", "/tail.svg", "/python.svg", "/gemini.svg"],
    link: "https://github.com/Sevith-NS/algo-trader",
    parts: ["Signal engine", "Risk analytics", "ML forecasts", "Backtester", "Flint AI assistant", "Trading desk agents"],
  },
  {
    id: 1,
    title: "Tesseract AI",
    slug: "tesseract-ai",
    tint: "amber",
    year: "", // TODO: add the year
    outcome: "I built an AI mock-interview coach so students can rehearse placements before the real thing.",
    des: "An AI mock-interview platform that helps students prepare for placements and internships, with Gemini-generated questions and text-to-speech.",
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

export const workExperience = [
  {
    id: 1,
    title: "Technical Writer (Product Documentation)",
    company: "Digital.ai",
    duration: "Mar 2025 – Present",
    desc: "Own the docs roadmap for Deploy, Release and TeamForge across 4 major release cycles. Led 0-to-1 content for Ask Release, Digital.ai's GenAI assistant, through its GA launch.",
    link: "https://docs.digital.ai/release/docs/release-notes/release-notes-release/",
    points: [
      "Prioritize 300+ user stories and defects across 30+ Agile sprints in Agility.",
      "Defined the information architecture for Ask Release, covering agent customization, LLM guardrails, BYOM and Kubernetes deployment, through GA.",
      "Write release notes for every GA and monthly maintenance release, plus deprecation and support-matrix communications.",
      "Closed the customer feedback loop on 50+ reported defects with engineering and product.",
      "Shipped MCP integration guides and Copilot/Claude agent instructions, plus content-QA automation scripts.",
    ],
    decision: "Led 0-to-1 content for AI Assistant through GA",
  },
  {
    id: 2,
    title: "Software Developer Intern",
    company: "Ceyone Marketing",
    duration: "Dec 2024 – Mar 2025",
    desc: "Built a responsive real-estate platform in React, TypeScript, Tailwind and Zustand with Google Maps integration, improving user engagement by 30%.",
    link: "https://www.onlyvillas.in/",
    points: [
      "Translated business requirements into a responsive real-estate platform; iterative UI/UX changes lifted engagement 30%.",
      "Built the frontend in React, TypeScript, Tailwind and Zustand with Google Maps and Places APIs; reusable components cut dev time 10%.",
    ],
    decision: "Engagement up 30%",
  },
];

// How I work: the three phases, rewritten from what Sevith actually does.
export const approach = [
  {
    phase: "Phase 1",
    title: "Planning & Strategy",
    des: "Start with the customer, not the feature. I read support tickets, defect reports and feedback, then frame the problem and prioritize the backlog with engineering and product before anything gets built.",
    proof: "300+ user stories and defects prioritized in Agility",
    artifact: {
      heading: "Backlog, sorted by customer impact",
      rows: [
        { tag: "Defect", text: "Kubernetes support versions out of date" },
        { tag: "Story", text: "AI Assistant: BYOM configuration guide" },
        { tag: "Story", text: "Deprecation notice for end-of-support versions" },
        { tag: "Defect", text: "Broken links in plugin reference" },
      ],
    },
  },
  {
    phase: "Phase 2",
    title: "Development & Progress Update",
    des: "Build in small, reviewable slices and keep everyone updated. I work sprint by sprint with engineers, write while features are still moving, and flag gaps early rather than at release.",
    proof: "30+ sprints, 0-to-1 content for AI Assistant",
    artifact: {
      heading: "Sprint update",
      rows: [
        { tag: "Done", text: "Agent customization guide" },
        { tag: "Done", text: "LLM guardrails reference" },
        { tag: "Review", text: "Docker and Kubernetes architecture" },
        { tag: "Next", text: "Release notes draft" },
      ],
    },
  },
  {
    phase: "Phase 3",
    title: "Deployment & Launch",
    des: "Launch is where learning starts. I ship the release notes, support matrices and end-of-support communications, then route what customers report straight back into the next plan.",
    proof: "4 major release cycles, AI Assistant GA",
    artifact: {
      heading: "Release notes",
      rows: [
        { tag: "New", text: "AI Assistant is generally available" },
        { tag: "Improved", text: "Updated Kubernetes support matrix" },
        { tag: "Fixed", text: "Customer-reported install guide issues" },
        { tag: "Notice", text: "End of support for older versions" },
      ],
    },
  },
];

// Off the clock. Edit freely: empty values are hidden on the site.
export const interests = [
  "Sports",
  "Video editing",
  "Cinema",
  "Fonts & type",
  "Marketing & Personal brand",
  "Finance",
  "Cooking",
];

export const nowLine = [
  { label: "Now building", value: "Flint OS" },
  { label: "Now watching", value: "" }, // e.g. a series or film
  { label: "Now listening", value: "" }, // e.g. an album or playlist
];

export const socialMedia = [
  { id: 1, name: "GitHub", link: "https://github.com/Sevith-NS" },
  { id: 3, name: "LinkedIn", link: "https://www.linkedin.com/in/sevith-s-079063273/" },
];
