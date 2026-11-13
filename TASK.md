# TASK

The rebuild, broken into bite-sized tasks. Each one should fit in a single
sitting and has a "done when" line so it can be checked off honestly.
Tick a box when it ships, and log the change in `MEMORY.md`.

Legend: **[S]** needs something from Sevith first.

---

## 0. Just shipped (verify on a real phone)

- [ ] **No glow, screen spill.** Done when the colours have been judged in both modes without the glow, and the spill doesn't look muddy on oat.
- [ ] **Living headline.** Done when the cursor reaction is noticeable only on a second pass, never jitters the layout, and the scroll narrowing feels right on a phone.
- [ ] **Film posters.** Done when all three read clearly in the studio at night and at golden hour.
- [ ] **Pixel scan theme switch.** Done when it runs smoothly on a mid-range Android phone and the scan visibly grows out of the theme button.
- [ ] **Two-colour palette (lapis replaces orange).** Done when every page has been eyeballed in both modes and no orange is left outside the 3D room.
- [ ] **Footer cat scenes.** Done when all five scenes have been watched start to finish on phone width without the cats leaving the card edge.
- [ ] **Cream's laps in the studio.** Done when she never clips through the chair, bench or barbell.

## 1. First impression ("WOW, I want to build sites like him")

- [x] **Loading screen.** The favicon mark builds with a counter, once per visit, about 1.3s, skipped under reduced motion (2026-11-12).
- [ ] **Hero says what I offer and my name** in under 5 seconds of reading. Done when a non-technical friend can repeat it back.
- [ ] **Explain "product engineer" by showing it,** like "product designer who engineers". Done when the hero line needs no jargon.
- [ ] **Numbers as a visual feature.** Pick 3 real numbers (for example +30% engagement, 13 strategies, +5% first month). Done when they appear large on the home page.

## 2. Scroll and section transitions

- [ ] **Weighty scroll.** Tune Lenis toward Locomotive's slow, heavy feel. Done when it feels weighty on a laptop trackpad and still responsive on a phone.
- [ ] **Stacking sections** like lil-boxes.com. Prototype on one section first. Done when it never covers content (the old case-study stack did).
- [ ] **One gravity-design.de style transition** between two home sections. Done when it plays forwards and backwards with scroll.
- [ ] **Keep motion calm.** Done when no section has more than one moving idea at a time.

## 3. Work and case studies

- [ ] **Device mockups** instead of the browser frame for project screenshots. Done for Polaris first, then the rest.
- [ ] **Case-study format after rachelchen.tech:** long-form, video walkthroughs inline. Done when Polaris has at least one walkthrough clip.
- [ ] **[S] Polaris details:** answers to the `todo` prompts in `data/work.ts`.
- [ ] **[S] Polaris screenshot:** confirm the net-worth figure is demo data.
- [ ] **Custom cursor labels** on case-study media ("Play", "Zoom"). Done when every interactive media block has one.

## 4. Story and personality

- [ ] **[S] Photos of me,** posed but candid (mountains, out and about). Done when /story has at least two.
- [ ] **[S] The 2am "working" photo** for the home intro.
- [ ] **[S] Christ University chapter** and **Google UX certificate status.**
- [ ] **Humour after the scroll, not on screen one.** Add one line each: "Not everyone has great taste", the peri peri chicken, the meme collector. Done when the first screen has no jokes and the story page has three.
- [ ] **Downplay Digital.ai** on every page. Done when it's never in a headline.
- [ ] **[S] Reel or video** if one exists.

## 5. Studio (side page)

- [ ] **Better models.** The desk, chair and figure are the weakest. Done when each has been rebuilt or replaced and checked against the posters for quality.
- [ ] **A warm table lamp with Cream next to it** stays the hero shot. Done when the lamp light visibly falls on her.
- [ ] **Studio on phones.** Done when the room is readable at 375px wide and Cream is tappable.

## 6. Type and colour follow-ups

- [ ] **Decide on Bodoni.** It is the nav logo, the italic "actually" (hero and gallery line) and the studio poster. A same-font "actually" was tried and rejected on 2026-11-12, so Option A (keep) stands unless Sevith says otherwise.
- [x] **Handwriting removed** everywhere; motto added to /story.
- [ ] **Paper texture.** The grain is on. Done when light mode feels like paper, not screen, without hurting contrast.
- [ ] **Dark mode lapis check.** Done when `#2F5BFF` and `#809BFF` have been looked at on every page and small lapis text is readable.

## 7. Easter eggs

- [ ] **One more egg,** for example the cats reacting to the theme switch. Done when it's discoverable without reading the source.

## 9. Polaris November update and the process boards (branch `polaris-nov-demo`, 4 Nov 2026)

### Case study

- [x] **Pull the latest Polaris.** Done when both repos' `main` match GitHub (frontend `52e16d2`, backend `736a043`, both 3 Nov) and the case study has been checked against them.
- [x] **Recut the four loops from the 4 Nov demo** (markets, symbol plan, fundamentals, news). Done when each is 1280 wide, silent, about 1 MB or less, and its label names what it shows.
- [x] **Add four walkthrough steps:** AI desk run, backtest verdict, Deep Dive, Ask Polaris. Done when every caption traces to a Polaris commit note or the code.
- [x] **Fix the AI claims the code no longer backs:** the risk committee, bull and bear, the risk seats and the manager, and scoring on realized alpha. Done when each line matches `agents_desk.py` at `736a043`.
- [x] **[S] Confirm the six `draft` lines in the Polaris case:** AI desk, Ask Polaris, alerts, the desk insight, the journal and the one-exchange decision. Done when every `draft` flag is gone or rewritten. *(Confirmed 4 Nov, flags removed.)*
- [x] **[S] The rupee bug in the Ask Polaris clip.** The answer prints GOOGL at "₹280.03". Done when the clip is re-recorded after a fix in Polaris, or Sevith accepts it. *(Shipped as is on 4 Nov. The fix belongs in Polaris.)*
- [ ] **Eight steps on a phone.** Done when the walkthrough reads well at 375px, each clip plays only on screen, and the page doesn't drag.
- [x] **[S] Commit the branch.** Done when Sevith has seen the case page and says ship. *(Shipped 4 Nov.)*

### Process boards (artifact and PNGs)

- [x] **Polaris board, 28 Oct to 3 Nov:** timeline, IA, flows, the review round, cuts, visual system, captures from the 4 Nov demo. Done when every new item carries a provenance chip. *(Artifact version 2, 4 Nov: new frame 12, "The review round".)*
- [x] **Tesseract board unchanged,** as asked.
- [x] **PNG export refreshed** in `D:\College\Projects\process-boards`. Done when every Polaris frame has a PNG named like the 27 Oct set. *(13 Polaris PNGs; the 27 Oct ones are in `_27-oct`.)*
- [x] **[S] Approve both boards.** Done when Sevith signs off. *(Approved 4 Nov.)*
- [ ] **After approval: a Process section on the Polaris and Tesseract case studies** (IA, flows, before and after), with the boards as the source. Done when each case shows at least three frames and links the full board. *(4 Nov, branch `process-frames`: a "The process." section between How I worked and What I built, with every board frame as a numbered step beside its text, laid out like the walkthrough. Light and dark, zoomable. The link waits on Sevith sharing the artifact publicly, or dropping the link.)*
- [ ] **[S] Tesseract frame 09:** five reasons still read "Not written down". Done when Sevith gives them or decides they stay.
- [ ] **[S] Usability tests on both boards:** planned, not run. Done when real sessions fill the empty rows.

## 8. Phase 7 (owed): quality and security

- [ ] **Install the Cloudflare security-audit skill** (github.com/cloudflare/security-audit-skill) and run the full audit. Done when every finding is fixed or explicitly accepted.
- [ ] **[S] EmailJS settings:** allowed domains, a rate limit, and `{{message}}` not `{{{message}}}`.
- [ ] **Frontend critique pass** with the design skills (impeccable, taste, redesign). Done when the findings are logged here as tasks.
- [ ] **Mobile-first test pass** on a real phone, per the Google UX course. Done when every page has been used one-handed.
- [ ] **Accessibility pass:** contrast, focus rings, keyboard path, reduced motion. Done when nothing fails WCAG AA.
- [ ] **Performance:** Lighthouse on home and /studio. Done when both score 90 or above on mobile.

## 9. Space film and Blender studio (12 Nov, branch `lusion`)

A 48-second film rendered in Blender (Cycles), six 8-second scenes. The idea: the sun in his visor turns out to be the desk lamp. Scripts are in `scripts/space/`. Assets, frames, and renders are in `blender-work/` (git-ignored).

- [x] **Assets fetched** with `python scripts/space/fetch_assets.py`. NASA's EMU suit, Earth and star maps, Poly Haven chair, lamp, plant, and surfaces.
- [x] **Astronaut re-shaded** (`lib.load_astronaut`). Cloth, gold visor, lapis shoulder patch. Flag, mission patch, and label text removed. The boxy jetpack frame is cut away.
- [x] **Studio room built** (`studio.py`). Walnut desk, monitor with a lapis glow, clamp lamp, chair, rug, window with city lights, five lit wall cubes, an Aurora print, dust in the lamp light. Three still cameras: wide, cubes, desk.
- [x] **All eight segments built** (`film.py`). s1 orbit, s2 night falls, s3a and s3b the fall, s4 the one lit window, s5 the room, s6a and s6b back to orbit.
- [x] **Edit step written** (`post.py`). Crossfades, bloom, lapis streak, grain, vignette, H.264.
- [x] **Animatic checked.** `blender-work/out/space-film-preview.mp4` plays through, 48 seconds. It predates three fixes: a front light in the room, a clean backpack in place of the cut-down frame, and a closer camera in the fall.
- [ ] **[S] Approve the look** from the animatic and the stills. The long render was started without waiting, since he said to start working.
- [ ] **Final render (stopped 12 Nov).** Sevith rejected the room in the film: the studio room is separate from the space scene. s5 and s6a are dead. The space shots may go in the home reel instead, once he says go. It was started 12 Nov about 14:30. About 21 seconds a frame at 1080p on the RTX 3060, so about 7 hours for 1,200 frames. It skips frames already on disk, so rerunning the same command resumes it. One segment: `D:/Blender/blender.exe -b --python scripts/space/film.py -- --scene s1`. Then `python scripts/space/post.py`. Done when `blender-work/out/space-film.mp4` exists.
- [x] **Studio stills at full quality.** `wide`, `cubes`, and `desk` are in `blender-work/renders/studio/` as PNG and JPG.
- [ ] **Known limits to fix if he wants more.** The suit cloth is smooth up close. The street grid in scene 3 reads as a flat waffle. He can't bend his arms (no rig), so there is no crouch and no opening of the arms.
- [ ] **Decide where the film goes on the site.** Not started. It would replace or sit behind the closing space scene. Needs a WebM and a poster under the image rules.
- [ ] **Credit line** for Solar System Scope (CC BY 4.0) wherever the film is shown.

## 10. Lusion rebuild (started 12 Nov, branch `lusion`, commit only when Sevith asks)

Every decision is in `MEMORY.md` under "Lusion rebuild". Each piece is shown to Sevith live on localhost:3001 and approved before the next starts. Ask him about every detail of a piece before building it.

- [x] **Sample 1 (approved 12 Nov: "perfect proceed"): hero, header, and menu.** After review: header links and the hero paragraph removed, the cursor made subtle, a vignette and darker satin look, the smear reduced to a soft cut, the title in one font and colour, and the loader slowed to creep then rush. Blender connector pieces in the hero card with Rapier physics, cursor push, and the liquid smear. The statement, paragraph, "+" marks, and SCROLL TO EXPLORE. The new header (logo, links, round theme and sound buttons, LET'S TALK, MENU) and the dropdown menu with the RESUME card. Checked in Chrome on desktop in both themes and with Playwright at iPhone 15 size in both themes, with no console errors from the site (only a Grammarly hydration warning). About 69 fps on the laptop with the cursor pushing. Done when Sevith approves it live.
- [x] **Sample 2 (approved 12 Nov: "perfect next steps"): intro and reel.** Staggered heading, the approved intro cut, "• My approach" (to /about, a 404 until that page exists), the lapis line drawing on scroll, the small lapis-duotone reel card that bends, grows, turns full colour and locks with PLAY ▶ REEL, and a full-screen player. Reel cut by `python scripts/reel/cut.py` into `public/reel/loop.mp4` and `reel.mp4`.
  - [x] **Tracks downloaded** by Sevith (12 Nov). The reel now has music, cut on the beat (136 BPM, starts one shot before the drop). The ambient track plays when sound is on and steps aside while the reel player runs (`components/Ambient.tsx`).
  - [x] **Line redone like Lusion's** (his note: behind everything): measured from the heading and the card, it passes behind the heading, loops round and under the card, waves right, and runs on behind the growing reel.
  - [ ] **Orbit render** (doing, resumes if stopped: `D:/Blender/blender.exe -b --python scripts/space/film.py -- --scene s1`). Then rerun `python scripts/reel/cut.py` to swap the preview orbit for the full one and mix in the music, and retime the cuts to the track's beat.
- [x] **Work section (approved 12 Nov: "awesome go ahead").** Lusion's layout: + marks in quarters, the 3-line heading on the left at about 7vw with SHIPPED IT. in lapis, THE WORK in plain caps on the grid's last quarter, and under each card the role tags then a bigger title (year, stack, and outcome sentence gone). Checked on desktop in both themes and on a phone in light mode, no console errors.
- [ ] **Space close, sample 3 (built 13 Nov, waiting on Sevith's review): the opening and the first tunnel.** Heading MOST IDEAS DIE / IN THE NOTES APP. / MINE SHIP., his motto, the lapis line back like Lusion's, a tablet of the rigged NASA suit over the reel's Earth that drops its bezel and grows to the screen, the line flying past word by word, the faint halo, and the glass grid tunnel (white, then green and pink). Then still to come, each with questions first: the lattice, white flash, lapis corridor, the wave, the 4 cats, the stickers, and the tunnel rush sound (3 licence-checked options for him to pick). Reel recut with the full orbit render (all 192 frames).
- [ ] **Space close, the full flight (13 Nov: rebuilt beat by beat against astro.mp4, both halves checked side by side at the same seconds; the tablet zoom now ends 1:1 instead of magnified, which fixed the sizes everywhere. His verdict the same day: "it looks so low quality", left for now on his word, to revisit later; `public/audio/rush.mp3` is in (256 kbps) and plays when sound is on. Waiting on him: `public/audio/rush.mp3` download, where the Earth texture credit goes, real project logos or my marks on the stickers).** Smooth line, real starfield, kaleidoscope lattice with ghost copies, pink cages and flash, lapis room and paw-print corridor, screen and shatter, the wave, stickers, the 4 cats in bubble helmets, the rush sound. Was: Lusion's full flight with neon pink and green, the rigged NASA suit waving, 4 realistic cats in suits, illustrated stickers. Ask the remaining details first.
- [ ] **Footer and next-page bars.** Lusion's layout, wordmark and Cream hint removed, home ends with a bar into about.
- [ ] **Case pages, Polaris sample (built 13 Nov, waiting on his review).** Lusion's project page in Polaris's own black and white: first screen with title, intro, LAUNCH PROJECT, role and the first clip; a sideways strip of every clip, process frame and chapter; a light NEXT PROJECT panel at the end; BACK in the header. Phones stack it top to bottom. Then the other 5 cases, each in its own site's colours.
- [x] **Process frames in each product's colours (13 Nov).** Polaris and Tesseract dark exports recoloured to their case colours; pencil sketches left on paper.
- [ ] **Approach page, at /approach (was About).** Questions done 13 Nov (see memory). Waiting on: his OK of the playback, and the Human Base Meshes download in `blender-work/assets/human`. Then: the head in points, SEVITH and the snaps, the 4 turning cards, footer and bar; the menu and the "My approach" link move to /approach.
- [ ] **Case pages.** Sideways on desktop, top-down on phones, tint colours and accents, BACK pill, LAUNCH PROJECT.
- [ ] **Studio room.** The current room made realistic, him from behind, Simba and Cream, both hours, all interactions, drag to look.
- [ ] **Loader cat, 404 cat, sound.** Cream's paw swats the dot. Ambient track and interface sounds once he picks them.
- [ ] **[S] Send a front-facing close-up photo** for the particle portrait.
