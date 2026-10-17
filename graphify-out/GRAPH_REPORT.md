# Graph Report - portfolio  (2026-10-15)

## Corpus Check
- 162 files · ~395,321 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .glb 10, (none) 3, .log 1)

## Summary
- 481 nodes · 1055 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- 3D Room Scene
- Home Page Sections
- Audit Ledger Tests
- Root Layout & Globals
- Coverage Ledger Validator
- Findings Validator
- Case Study Pages
- Pixel Cats
- TS Config
- Story Page
- Package Refs
- Runtime Dependencies
- JSON Preflight Parser
- Dev Dependencies
- Next Security Config
- NPM Scripts
- ESLint Config
- Package Overrides
- PostCSS Config
- Tailwind Config

## God Nodes (most connected - your core abstractions)
1. `react` - 26 edges
2. `cn()` - 24 edges
3. `framer-motion` - 20 edges
4. `collectUnitErrors()` - 16 edges
5. `CasePage()` - 16 edges
6. `Footer()` - 16 edges
7. `compilerOptions` - 16 edges
8. `Reveal()` - 15 edges
9. `Scene()` - 14 edges
10. `TransitionLink()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `FloatingNav()`  [EXTRACTED]
  app/page.tsx → components/ui/FloatingNav.tsx
- `Head()` --calls--> `Copy()`  [EXTRACTED]
  app/story/page.tsx → components/ui/Copy.tsx
- `StoryPage()` --calls--> `Footer()`  [EXTRACTED]
  app/story/page.tsx → components/Footer.tsx
- `StoryPage()` --calls--> `Reveal()`  [EXTRACTED]
  app/story/page.tsx → components/motion/Reveal.tsx
- `StoryPage()` --calls--> `TransitionLink()`  [EXTRACTED]
  app/story/page.tsx → components/transition/TransitionLink.tsx

## Import Cycles
- None detected.

## Communities (21 total, 4 thin omitted)

### Community 0 - "3D Room Scene"
Cohesion: 0.07
Nodes (63): Cream(), Ear(), LAP, Box(), Bulb(), findSeat(), fontVar(), Glow() (+55 more)

### Community 1 - "Home Page Sections"
Cohesion: 0.10
Nodes (38): Home(), Approach(), Artifact(), Step, CreamHint(), Footer(), ease, Hero() (+30 more)

### Community 2 - "Audit Ledger Tests"
Cohesion: 0.06
Nodes (31): LIMITS, archivedAttempt(), assert, fs, {
  LIMITS,
  canonicalCoverageId,
  encodeCanonicalRef,
  isSafeAgentId,
  isSafeRelativePath,
  preflightJsonText,
  validateDocument,
}, localCheck(), os, path (+23 more)

### Community 3 - "Root Layout & Globals"
Cohesion: 0.08
Nodes (34): display, metadata, RootLayout(), serif, viewport, NotFound(), ThemeProvider(), metadata (+26 more)

### Community 4 - "Coverage Ledger Validator"
Cohesion: 0.13
Nodes (40): ATTEMPT_FIELDS, ATTEMPT_STATUSES, canonicalCoverageId(), collectUnitErrors(), createErrorList(), encodeCanonicalRef(), escapeUnsafeDiagnosticCharacters(), fs (+32 more)

### Community 5 - "Findings Validator"
Cohesion: 0.10
Nodes (38): canonicalKey(), append(), encode(), codePointLength(), collect(), collectDataLimitErrors(), collectFindingSemanticErrors(), collectSchemaErrors() (+30 more)

### Community 6 - "Case Study Pages"
Cohesion: 0.12
Nodes (24): Bullets(), CasePage(), dynamicParams, Props, Row(), Text(), WalkStep(), Plate() (+16 more)

### Community 7 - "Pixel Cats"
Cohesion: 0.08
Nodes (28): arc(), Beat, beatAt(), CatName, CATS, clamp01(), Coat, COATS (+20 more)

### Community 8 - "TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Story Page"
Cohesion: 0.20
Nodes (15): Head(), metadata, Print(), StoryPage(), faces, TypeSpecimen(), cats, chapters (+7 more)

### Community 10 - "Package Refs"
Cohesion: 0.12
Nodes (15): name, private, version, clsx, @emailjs/browser, eslint, eslint-config-next, postcss (+7 more)

### Community 11 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, clsx, @emailjs/browser, framer-motion, geist, lenis, next, next-themes (+8 more)

### Community 12 - "JSON Preflight Parser"
Cohesion: 0.40
Nodes (11): JsonStructureError, preflightJsonText(), beginContainer(), beginString(), beginValue(), closeContainer(), countValue(), currentContainer() (+3 more)

### Community 13 - "Dev Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+2 more)

### Community 14 - "Next Security Config"
Cohesion: 0.40
Nodes (3): csp, nextConfig, securityHeaders

### Community 15 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 17 - "Package Overrides"
Cohesion: 0.67
Nodes (3): postcss, overrides, next

## Knowledge Gaps
- **9 isolated node(s):** `next/core-web-vitals`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/three` (+4 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 179 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Home Page Sections` to `3D Room Scene`, `Root Layout & Globals`, `Case Study Pages`, `Pixel Cats`, `Story Page`, `Package Refs`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `@types/node`, `@types/react` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `3D Room Scene` be split into smaller, more focused modules?**
  _Cohesion score 0.06584723441615452 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `Home Page Sections` to `3D Room Scene`, `Root Layout & Globals`, `Case Study Pages`, `Pixel Cats`, `Package Refs`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `Home Page Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.10101010101010101 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Refs`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Audit Ledger Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.05673758865248227 - nodes in this community are weakly interconnected._