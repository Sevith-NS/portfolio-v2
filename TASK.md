# TASK

Open work on the drill cover rebuild. Each task has a "done when" line. Tick
it when it ships and log the change in `MEMORY.md`.

Legend: **[S]** needs something from Sevith first.

## Verify

- [ ] **Real devices.** Done when home, /story and one case study have been scrolled on a mid-range Android phone and a laptop trackpad, the reel reads as fast cuts, and nothing janks.
- [ ] **Flash level.** Done when Sevith has read a full case study and /story with the scene flashes on and either keeps them or tunes `GAP_MS` / `BURSTS` in `components/edit/CutLayer.tsx` and `lib/cut.ts`.
- [ ] **Sound.** Done when the toggle has been tested on iOS Safari (autoplay rules) and the track survives every page change.
- [ ] **[S] "Dirty" on a public site.** Sevith accepted the copyright risk. Done when he has decided to keep it for launch or swap in a cleared track.

## Content

- [ ] **[S] Christ University chapter** on /story.
- [ ] **[S] Google UX certificate status** (finished or in progress, and when).
- [ ] **[S] Polaris case study answers** to the `todo` prompts in `data/work.ts`, and confirm the screenshot's net-worth figure is demo data.
- [ ] **[S] Tesseract AI year** (`data/index.ts`) and its open prompts.
- [ ] **[S] The 2am working photo.** Done when it replaces a panel in the reel triptych.
- [ ] **Reel video re-cut.** Done when `sevith_reel_final_v7.mp4` is re-rendered from the new-look reel (the current file shows the first, lapis-era shots), using the scripts in the session notes.

## Ship

- [ ] **Security audit** (the full `security-audit` run, owed since the old Phase 7). Done when it has run against this rebuild.
- [ ] **Production build** passes and Lighthouse has been run on home (the reel video is 2.1MB, the audio loads on demand).
- [ ] **OG image** in the new look.
- [ ] **Refresh the knowledge graph** (`graphify-out/` still maps the old site).
