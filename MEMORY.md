# MEMORY

A running log of what has changed on the portfolio and why. Newest first.
Work lives on the `after-hours` branch, cut from `save-with-case`. Nothing on
`after-hours` is committed yet. `save-with-case` stays the version that gets
sent to people until this one is ready.

The art direction is called **After Hours**. Every decision traces back to the
intake answers in `ART-DIRECTION.md`. The open work is in `TASK.md`.

---

## Current state at a glance

| Area | Now |
|---|---|
| Light palette | Oat `#EFE9DE` page, black `#1A1612` text, lapis `#002DB4` as the only accent |
| Dark palette | Navy `#081028` page, off-white text, near-black surfaces, lapis `#2F5BFF` fills, `#809BFF` small-text accent |
| Colour source | `lib/theme.ts` only. Tailwind emits the CSS variables from it; canvas, WebGL and metadata call `light.hex()` / `dark.hex()`. No hex anywhere else (3D room materials and pixel cats excepted) |
| Fonts | Four families: Archivo (wide caps), Geist Sans (body), Geist Mono (labels), Bodoni Moda (logo and a few big statements). No handwriting anywhere |
| Theme switch | A slow pixel scan that spreads out from the theme button, a quote, then a second scan from the same button clears it |
| Page change | Curtain names the next page. Near-black in dark mode, oat with black type in light mode. No glow |
| Motto | "Gotta stack up the Gandhis for a Porsche 911 GT3 RS." on /story, under the sign-off |
| Studio | One night-time room in 3D. Cream loafs on the desk and runs laps when clicked. Posters: Interstellar, Cars, Game of Thrones |
| Footer | Pixel Simba and Cream on the contact card's edge, playing a five-scene loop |
| Easter egg | Type `cream` anywhere. The footer shows the five keys and lights them up as you type |

---

## Session: 10 Nov 2026 (branch `process-frames`, uncommitted)

- **A shelf gallery was built at `/gallery-2` and rejected the same day, then deleted.** It followed a "curved VHS archive" reference he pasted: the 53 photos as tapes on a shelf bending away, spines cut from each photo, the middle one turned to face you, a ruler along the bottom. His answer was "naa remove it". Like the hallway strip, a single row of photos did not beat the card plane. He wants the gallery to grow out of the site's own dust theme instead, keeping the cards and the endless drag. `/gallery` is back to exactly what it was.
- **Dust on the photos was tried two ways and rejected too ("both are bad"), then reverted.** One had every card gather from specks of its own photo where it lies. The other had the deck gather from lapis dust and then deal as usual. Dust stays on type. The open question he asked next is what the gallery should be so it belongs to the portfolio and doesn't read as a random thing that looked cool.
- **The answer so far: give the page a line in the hero's voice.** `/gallery` now opens on "Then I *actually* log off." in the hero's exact type (`HEADLINE` and `ACTUALLY` are exported from `Hero.tsx`). It assembles from dust, holds, then the deck deals and it crumbles. His verdict: "good but not great". Kept as is.

## Session: 11 Nov 2026 (branch `process-frames`, uncommitted)

- **The gallery is now "Glass", picked from four ideas built side by side on a temporary `/gallery-2`** ("glass is good remove everything else"). On `/gallery` the face-down deck deals out with no title card, then "Built all week. Then I *actually* touched grass." (his words) gathers from dust in a clearing kept free of photos in the middle of the table. It lies flat on the table and drags with the photos. While the table moves, an SVG filter (`#gallery-glass`) blurs it along the drag and parts red and blue a little, and at rest it is sharp. This was my reading of the Aurelis infinite gallery's motion blur, whose page I couldn't read. The line uses the hero's `ACTUALLY` (exported from `Hero.tsx`) at a smaller size.
- **Rejected and deleted the same day:** the "Then I actually log off." title card (good but not great), the same table without glass, a shelf of books with card-back spines and photo descriptions, and a KR.ST-style sphere of photos with the line in the middle.
- **Photo names aren't descriptions** ("archi", "scar2", "pink"). That only matters if captions ever come back. There is a photo called `touching-grass`.
- **Checked** in headless Chromium (light, dark, 390 px): the deal, the line, glass on while moving and off at rest, a drag isn't a click, open and Escape. Not checked: Safari, a real phone, frame rate. The filter redraws the whole table every frame of a drag, so a slow phone is the risk.
- **404 in the house type.** He called the Bodoni heading "old". It's now the mono accent kicker over wide Archivo caps, copy unchanged.
- **Case pages lead with the work**, after a Tommy Geoco portfolio review reel he shared (they praised a portfolio whose projects open on the live product and whose sections are headlined by outcomes, and knocked its bio and "Visual Craft • Product Strategy • Design Eng" labels as buzzwords). Now: title, then the product screenshot on the first screen, then the one line, status and live-site button, then "On this page" links, then the walkthrough before the problem, process and the rest. Walkthrough and board steps put the media first in the markup, so phones show the clip before its text. "Where it landed" is renamed "Results".
- **No tabs.** He asked about Visual craft / Product strategy / Design engineering tabs inside projects. Decided against: those labels are what the reel knocked, tabs hide work from skimmers, and the learning builds can't fill three tabs. Instead, plain "On this page" jump links (`nav aria-label="On this page"`), only for sections the case has, each named exactly like its heading. Headings are `tabIndex={-1}` and sized to their words so the keyboard focus ring hugs them.
- **Gotcha, fixed at the root:** lazy process-board images had no size, so the Polaris page grew from about 14,400 px to 20,100 px as you scrolled and any jump past them stopped short. `ZoomImage` now takes `w`/`h`, read with sharp in the async `WalkStep`, and the page height no longer moves. Lenis's `anchors` option (offset -88) does the glide. With reduced motion the browser jumps and `motion-reduce:scroll-mt-[88px]` clears the nav. Don't add a scroll-margin for Lenis too: it subtracts it and doubles the gap. A test that focuses a link and presses Enter in the same instant fakes a 600 px miss (the focus scroll hasn't reached Lenis yet); real use leaves a beat.
- **Open:** the buzzword rewrite list (home intro, How I build, project captions, case roles, Polaris problem and result) is waiting on his approval. Copy is his to sign off.

## Session: 7 Nov 2026 (branch `process-frames`, uncommitted)

- **Repos pulled.** Polaris PR #7 (frontend) and PR #5 (backend) are merged on GitHub, so local `main` was fast-forwarded to `cd808e7` and `6f80e4e`. The 6 Nov speed win is on `main` now. EsDeeKid was already current.
- **The process section, redone and approved.** Sevith's rules: no dates anywhere (labels, years, step text), nothing untested, no names (only the type of person and what they do), no doc references, no italic captions under frames or walkthrough clips, and only the main process. Polaris now reads as **a back office for testing strategies before real money**, not a buy and sell app: new problem frame and job to be done, one user card ("The self-directed trader"), and flows rewritten from the shipped code (sign-up is Currency, Markets, Risk; the ticket shows the amount at risk before "Place paper buy"; Ask Polaris streams). The timeline ends on "Ready to ship". Gone: the usability test and validation frames, the proto-personas, Tesseract's "None" assumptions, 9 of 18 cuts, the "Not written down" rows, "Owner's direction" and the no-glass line. Polaris has 12 steps, Tesseract 11. The v1 sketches are pencil on grid paper with handwritten margin notes (an arrow when the path is clear, a circled number when it isn't), the same in both themes. Step titles say what each thing is ("Flint v1, the first build", "The rebuild, wireframed"), never how the board was made ("redrawn", "from the code"). The Polaris timeline is "From Flint to Polaris", with no time span. Wireframes stay clean. No drawing is cropped any more; the 4 Nov exports cropped several. `Step.aside` and its figcaption were removed with the captions. The board artifact is unchanged and keeps its provenance.
- **How the frames are exported**, since the script lives in a session scratchpad: each frame renders at 1044 CSS px wide at 2x with the header, tags, chips, sources and asides hidden and a transparent border. Drawings zoom to fit, then the frame scales to 1600 px webp. Approved on a private review page first: https://claude.ai/artifact/DM5tiQqncgDNK3VbWLtNkH
- **EsDeeKid caught up with 6 Nov.** Live is now a 40-frame carousel that curls with scroll speed, and the portrait follows phone tilt. The approach, the walkthrough step ("The live show, on a bend"), the win and the project tag say so. `live.mp4` was re-recorded from the build at 1280×580, 10 s.

- **Gallery stays the drag plane, minus 5 duplicate photos.** A hallway strip (carousel 1 from Marcelo Cedeno's reel) was built at `/gallery-b` and rejected ("looks bad, so empty"), then deleted. Sevith keeps the Pamidor-style plane. Five photos were in `public/gallery` twice, under their real names and as `whatsapp-image-2026-10-24-at-20.11.5*` leftovers whose sources had already been renamed in `photos-src`. The leftovers were removed, so the set is 53 unique photos, and no photo repeats on screen at 1440, 1920 or 390 wide. The gallery's photos are now **cards**. They arrive as a face-down deck in the middle (the card back is **Aurora**, picked from two rounds of options: three blurred lights in the new `deck`, `deck-glow` and `deck-deep` tokens drift slowly under the site's `.grain`, with only the favicon `/1.svg` in the top corner and no name. Lapis with light blue in light mode, a deep lapis navy in dark. Only cards lying face down animate. Rejected along the way: dot matrix, monogram, pixel dust, halftone, guilloché, film slate, a pixel Simba, plain liquid glass and an aurora-glass hybrid, because he dislikes pointer-following effects). They're dealt from the top in a random order: thrown up in an arc, turning face up in the air, dropping with a little give and sliding to a stop. They rest at uneven, random leans (`TILT` 11°, spread evenly, so most visibly lean), with sizes from 0.68 to 1.28 of a spot and `SCATTER` 0.33 off their spots, so the table looks thrown rather than laid out. Later cards lie on top. Now and then (`DOWN` 7%, about two of the ~56 cards laid out) one lands face down: the first click turns it over with a lift (Web Animations), the second opens it. Turned cards stay turned. The deck waits for the on-screen photos to decode (at most 1.5 s) and for the page curtain to lift, through a new `covered` flag on `usePageTransition()`. Reduced motion skips the deal and the flip animation. The plane, its drag, bend and open view are unchanged. **Cursor fix:** the site hides the system cursor for its custom dot, but a modal `<dialog>` (gallery photo, case study `ZoomImage`) sits in the top layer above the dot, so opening an image left no cursor at all. `globals.css` now restores the system cursor inside open dialogs: an arrow, zoom-out over the backdrop (a click there closes), and a hand on buttons.

## Session: 6 Nov 2026 (branch `process-frames`, uncommitted)

- **Polaris speed win, with its numbers.** One new win from the frontend's T9.10 to T9.13 commits (`a1a0624`, `efecdf7`). The watchlists page loads in one request instead of two per row, and Ask Polaris streams (first words at 2.2 s, a short answer done at 2.9 s). Sevith confirmed it the same day, so it carries no `draft` flag, and cut the three draft decisions that came with it (servers beside the database, AI time limits, changes shown before the server confirms). Sevith wants no colons, semicolons or em dashes inside sentences. Every number comes from the frontend's `docs/MEMORY.md`, and no before-and-after latency was measured, so none is claimed. Those commits are on `markets-alerts-redesign` and not yet on `main`, so publish this after they reach production.

## Session: 4 Nov 2026 (branch `polaris-nov-demo`, shipped)

- **Polaris case brought up to the 3 Nov build.** Both Polaris repos pulled (frontend `main` `52e16d2`, backend `736a043`). The walkthrough is now eight steps cut from Sevith's 4 Nov demo (`Desktop/Polaris.mp4`, 9:15, silent): markets, symbol plan, AI desk, backtest, fundamentals, Deep Dive, Ask Polaris, news. Each clip is a 1280×582 H.264 loop of 7 to 10 s (0.25 to 1.1 MB), cut from several segments with short crossfades and punch-in crops, with a webp poster from the same crop.
- **Three AI claims the code no longer backs were rewritten** against `agents_desk.py`: the risk committee and bull and bear (approach), the risk seats and the manager (insights), and scoring on realized alpha (decisions). Ask Polaris and chart alerts joined the approach list, and the one-exchange desk became a decision. Sevith confirmed every changed line the same day, so none carries a `draft` flag.
- **Approved and shipped on 4 Nov:** the case page, plus both process boards (artifact version 2, Polaris brought up to 3 Nov, Tesseract unchanged). Next is a Process section on both case studies, in `TASK.md` §9.
- **"The process." on both case studies** (branch `process-frames`, stacked on `polaris-nov-demo`, uncommitted): every process-board frame is a numbered step beside its title and text, laid out like the walkthrough. That's 13 steps for Polaris and 12 for Tesseract, between How I worked and What I built. Both sections render through one `Steps` component, and `Step.media` has a `board` kind. The frames render complete except for anything that only says where something came from. Gone are the header, roadmap tags, provenance chips, citations, commit hashes, doc names, and the date, source and commit columns of tables. Sevith asked for no sources or dates on the page, because readers don't need the minute details. The timeline keeps its dates. Dense grids go 2 × 2, and flows and timelines become vertical steppers. They're exported in both themes as 1600 px webp under `public/work/<case>/process/`. A tall frame keeps its text sticky beside it. Two earlier tries were rejected the same day: three whole frames stacked (too dense, with the wrapped flow boxes unstructured), then three cropped excerpts (too much removed). `ZoomImage`'s dialog image is now lazy, so the other theme's set never downloads. There's no link to the full board yet, because the artifact is private.
- **Noticed, not fixed (Polaris):** in the demo, the Ask Polaris answer prints GOOGL prices in rupees ("₹280.03").

## Session: 17 Oct 2026

- **Tungsten (warm black, bone, amber) tried and rejected outright.** Now lapis only, in both modes. Carrot is gone. Dark mode: only the page background is navy `#081028`; every other dark token is the original.
- **One source of truth for colour:** `lib/theme.ts` holds a `Palette` class with `light` and `dark` instances. `tailwind.config.ts` builds the colour utilities and the `:root` / `.dark` variables from it. globals.css no longer holds any values.
- **Pixel system:** `lib/pixels.ts` holds the shared pixel front (schedule, SVG mask, lapis flash). The theme switch is a pure pixel reveal over a frozen snapshot of the old page (no quote screen). Only the landing hero breaks into pixels on scroll (on every page it looked odd). The page-change curtain's name builds itself out of pixels of the letters (clipped to the glyphs, never a box; ~1.1s, the curtain holds until it's done), left to right, over a soft lapis glow (light-mode glow at 0.34, dark at 0.38). Both live in `components/motion/PixelDissolve.tsx`. A pixel skyline + Simba on the roofs was tried and rejected.
- A pixel loading screen ("SEVITH" in pixel font) was tried and dropped as just okay.
- New tokens `shade` (shadow colour) and `danger` (form errors) replace the hardcoded `rgb(0 0 0)` shadows and orange error hexes.

## Session: 15 Oct 2026

### Round 8: palette trials, no glow, living headline, film posters (uncommitted)
- **Three palettes tried and rejected:** racing green, oxblood noir and electric cobalt. Back to oat, black, lapis and carrot. The diagnosis: the soft lamp glow spoiled every palette.
- **Intake round two (Q116-Q130)** is in `ART-DIRECTION.md`.
- **The glow is gone everywhere:** the landing wash and its pulse, the hero's corner shadow, the case-study opening, the next-case card and the curtain. The glow CSS is deleted.
- **Screen spill on project cards:** a blurred copy of each screenshot sits under it, so the only light comes from the work. Fainter in light mode.
- **The hero headline reacts:** letters near the cursor widen and thicken on Archivo's axes, and the headline narrows on scroll. Off under reduced motion. Screen readers get the plain sentence.
- **Studio posters replaced** with homages drawn in canvas: Gargantua (Interstellar), a Piston Cup race (Cars, no character drawn), the Iron Throne (Game of Thrones). The After Hours film, WANTED Cream and gym posters are gone.

### Round 7: emerald trial (uncommitted, on top of commit 11a9c63)
- **Palette swapped from lapis to a racing-green set,** three colours per mode from a car interior: emerald paint, cognac leather, cream or near-black base. Light: cream `#F1ECE2`, near-black text, emerald `#0F5C45`, cognac `#9A4E24`. Dark: near-black, off-white text, emerald `#13805C` fills and `#4FC496` small text, cognac `#D07A45`.
- **Emerald** does every interactive job (nav pill, cursor, links, labels, markers, tags). **Cognac** is the lamp: the hero's "actually", "Shipped it.", the logo dot, the footer sign-off, the warm glows. New token `--warm` / `text-warm`.
- **Dark-mode pixel scan** now uses the site's near-black (`#0A0B0E` / `#14161B`) instead of navy, with a cognac `#D07A45` scan flash. The light-mode scan flashes emerald.
- Tried a pixel scan inside the footer name on hover. Sevith rejected it, so the fogged-glass `GlassPaint` wipe is back. A cursor-trail pixel version (2026-10-23) was rejected too: leave the footer name's effect alone.
- To undo, `git checkout -- .` returns to the committed lapis version.
- **Studio "not loading":** could not reproduce. It loads in dev, in a production build, on direct load and through page navigation, with no hydration warnings.

### Round 6: two colours, no handwriting, motto, scan from the button
- **Handwriting removed everywhere.** The `Scribble` component and its CSS are deleted. The 404 note is plain text now, and the "my actual handwriting" label on /story is gone.
- **The motto** "Gotta stack up the Gandhis for a Porsche 911 GT3 RS." replaces the old sign-off scribble on /story, set in Archivo caps under a "The motto" label.
- **Back to two colours per mode, with lapis where orange was.** Light: oat, black text, lapis. Dark: near-black, white text, lapis. The nav pill, cursor, highlights, tags, keyword underlines, the hero word and the footer sign-off are all lapis. Lapis fills carry white text. The maroon corner glow turned lapis too. The 3D room keeps its own colours.
- **Pixel scan is slower** (about 3.6s in, 4.2s out) and now spreads out from the theme button instead of the top-left corner.

### Round 5: palette, fonts, scan, docs
- **Light mode was reading pastel.** The muted blue `#226192` and light coral `#EF8557` were swapped for saturated lapis `#002DB4` and burnt orange `#E8501A`. Secondary text uses two softer lapis steps. All text still meets contrast on ivory. Orange fills carry deep navy text.
- **Dark mode orange** moved to `#FF6B35`, and dark accents back to the original light lapis.
- **Font audit (UI/UX Pro Max).** The site loaded five families. The handwriting script was dropped: its three margin notes now use Bodoni italic. The mobile menu moved to Archivo caps and the footer email to Geist. Bodoni is now only the logo, the hero's "actually", the footer sign-off, the 404 and the theme quote.
- **Theme switch is now a pixel scan,** after the After Effects "Pixel Scan Logo Animation" tutorial. A ragged front sweeps from the top-left corner, each cell flashes the accent as the scan passes, then settles. The clear runs from the same corner.
- **Simba is drawn 20% bigger than Cream** in the footer.
- Added `MEMORY.md` (this file) and `TASK.md`.

### Round 4: footer cats get a story
- Cats no longer follow the cursor. They play a scripted loop of five scenes on the contact card's top edge: the tail, zoomies, boop, the nap, and the love bite. Cream irritates Simba, Simba stays calm, and in the end he grooms her and they nap together.
- Clicking either cat still makes it roll over.

### Round 3: studio, curtain, palette
- **Studio** now holds only Cream, as a 3D cat on the desk by the lamp. Clicking her, the "Bother Cream" button, or typing `cream` sends her on two laps of the room and knocks the mug over.
- **Footer cats** (as they were then) followed the cursor with a delay and never walked over the form.
- **Page-change curtain:** dark mode unchanged, light mode ivory with blue type.
- **Light mode text** all blue, highlights orange.

### Round 2: case studies, palette, cats, easter egg
- **Case studies** no longer stack sticky on top of each other, so the outcome line and tech stack are never covered.
- **Typography:** sentence-length Bodoni italic (outcome lines, case-study statements, story statements) moved to Geist medium.
- **Palette:** first ivory, editorial blue `#226192` and coral `#EF8557` (since replaced).
- **Pallu renamed to Cream everywhere,** including copy, alt text, the WANTED poster, photo filenames and the easter egg word.
- **Easter egg made clear:** the footer shows C R E A M as keys that light up as you type. Tapping them works on phones.
- **Em dashes:** six more removed from the approach phases and the Tesseract case study.
- Built the pixel cat sprites (`components/PixelCats.tsx`), drawn in code with no image files.

### Round 1: studio polish, nav, theme switch, copy
- **Studio room:** Ash moved out from under the desk (the camera couldn't see him). All cats redesigned with pointed ears, coloured eyes, whiskers and curled tails. The figure got ears, a mouth, a belt and shoe soles, and the chair swivels to show his profile.
- **Posters** replaced the "Aa / & / Rg" type cards: an After Hours film poster, WANTED Cream, and LIGHT WEIGHT BABY.
- **Gym corner:** bench, loaded barbell, hex dumbbells, kettlebell.
- **Navbar** active pill and progress line moved from lapis to orange.
- **Theme switch** changed from a tile mosaic to a slow random pixel dissolve (since replaced by the scan).
- **All em dashes removed** from site copy.

---

## Earlier sessions (before 15 Oct 2026)

- **Phase 1:** foundation and hero.
- **Phase 2:** home page structure.
- **Phase 3:** `/story`.
- **Phase 4:** case studies (Polaris, formerly Flint OS; Tesseract walkthrough clips).
- **Phase 5:** motion and the first cat easter eggs.
- **Phase 6:** the studio as one room, plus the Next 15, React 19 and R3F 9 upgrade.
- **Phase 7 is still owed:** the full security audit and a frontend critique pass. See `TASK.md`.

- **iPhone fixes (later on 7 Nov).** The landing headline no longer blinks blue as it assembles and crumbles. Its dust is each letter's own colour, so only "actually" is blue (`useDust` takes `null` for the blue copy; How I build and the curtain keep their blink). Gallery on iPhone 15: a theme switch showed every card's back, because Safari's view transition flattens 3D and ignores `backface-visibility`. Now a face-up card drops its back once the deal lands, and a clicked card counts as turned only when its flip ends. The deal lagged, so the per-frame airborne `box-shadow` is gone (the resting shadow stays) and only cards landing on screen, plus a 20% margin, are thrown. That's about 20 of 60 on a phone. In throttled Chromium, slow frames during the deal went from about 23 to about 4. Not yet checked on a real iPhone.
- **Studio Simba (8 Nov).** Petting him on the card mid walk-out made him vanish into the room while belly up: his walk clock kept running. Now it waits while he's belly up, and a pet mid-leap is ignored. His entry was rough because the leap aimed at a fixed spot and the room turned wherever it ended into an entry on the floor's edge. On phones that was the right edge, then a walk left across the rug. Now it runs the other way. The room fixes his way in straight below his rug spot on screen (`SIMBA_ENTRY`) and its `Door` sends that point and his height in px (`simba-door`). He leaps there from the card, shrinking to his room size (about 0.4x on a phone, about 0.9x on desktop), and the 3D Simba takes over at the same spot and walks straight up. `simba-in` is now just a signal, and `Room` takes `simba: boolean`. Checked in Chromium at 1440 and iPhone 15 sizes.
- **Gotcha.** Sevith runs `next dev` on port 3001 (3000 is another project). A second dev server for this repo shares `.next` and makes routes 404, so test against 3001.

## Things to remember

- Sevith's likeness for the 3D figure: big messy black hair, full beard, no glasses, black tee, indigo jeans, tattoo on the right forearm.
- The four cats: Simba (orange explorer), Ash (grey, scared), Pearl (white with a grey patch, chill), Cream (white, Pearl's daughter, chaos). He is most like Simba and Cream.
- Copy voice: credible in headlines, sarcastic in the asides. Keywords go in `*asterisks*` and render through `components/ui/Copy.tsx`.
- No em dashes in site copy. No pastels, no neon, no yellow or lime.
