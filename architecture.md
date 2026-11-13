# Architecture

A personal portfolio. Static pages, no backend. The contact form sends through EmailJS from the browser.

## Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind 3**.
- **3D:** three 0.186, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3.
- **Physics:** @react-three/rapier (Rapier), added 12 Nov for the hero pieces. It loads only with the hero scene.
- **Motion:** framer-motion 11 and Lenis.
- **Models:** made in Blender 5.2 (`D:/Blender/blender.exe`) by Python scripts in `scripts/`, exported as GLB to `public/models/`.

## Folders

- `app/`: pages (home, `work/[slug]`, `studio`, `gallery`, and a new `approach`).
- `components/`: page sections. `components/three/` holds the 3D scenes. `components/motion/` holds reusable motion. `components/transition/` holds the loader and page change. `components/case/` holds the case pages' sideways strip.
- `data/`: all copy and project facts (`index.ts`, `work.ts`).
- `lib/`: theme tokens (`theme.ts`), helpers.
- `scripts/`: Blender model scripts and asset tools. `scripts/space/` builds the space shots.
- `blender-work/`: downloaded assets, renders, and frames. Git-ignored.

## Data flow

Copy and facts live in `data/`. Pages read them at build time and render on the server. 3D scenes load on the client only when near the screen (`useInView3D`), so the first paint is plain HTML.

## Key decisions

- **Live 3D over pre-rendered video** for every scene, chosen by Sevith so scenes react to scroll and cursor. Blender bakes the look, three.js draws it.
- **Physics with Rapier** for the hero, because the connector arms must collide exactly. He lifted the old no-new-libraries rule for this rebuild.
- **Phones get the same live 3D, lighter:** fewer pieces, simpler lighting, lower resolution.

## Performance checklist

1. Skeleton loading screens: done. The loader covers the first load, and 3D sections show their card colour until the scene draws.
2. WebP or AVIF images: done. `npm run gallery` and the image rules make WebP.
3. Duplicate API calls: not needed. No API.
4. Debounced search: not needed. No search.
5. Paginated API results: not needed. No API.
6. CDN for static files: done by the host (Vercel).
7. Background job queue: not needed. No server work.
8. N+1 queries: not needed. No database.
9. Brotli or gzip: done by the host.
10. Redis cache: not needed. No database.
11. Unused dependencies: to check before shipping the rebuild.
12. Timeouts on external calls: to check on the EmailJS call.
13. Streaming AI responses: not needed. No AI.
14. Update the UI before the server responds: done on the form (it shows sending at once).
15. Lazy-load images below the screen: done. On case pages the process frames load lazily as the strip brings them near, and clips load their metadata only and play only while on screen.
16. Parallel requests: not needed.
17. Database indexes: not needed.
18. OpenTelemetry: not needed. No backend.
19. Servers near the database: not needed.
20. Server or build-time rendering: done. Pages are static.
21. Third-party scripts after the page: done. EmailJS loads with the form.
22. JavaScript split by page: done by Next. 3D scenes are dynamic imports.
23. Virtualized long lists: not needed. No long lists.
24. Select only needed columns: not needed.
25. Connection pooling: not needed.
26. Unnecessary re-renders: done for 3D and the case strip. Per-frame work writes to refs and transforms, not React state.
27. Browser caching for static files: done by the host.
28. Load balancing: not needed. Static site.
29. Self-hosted fonts, few weights: done (`next/font`, subsets).
30. Real user speed monitoring: not set up. Owed (see `TASK.md` phase 7).
31. Test on slow phones and networks: owed for each 3D sample.
