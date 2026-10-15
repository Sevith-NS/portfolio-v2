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
| Light palette | Two colours: oat `#EFE9DE` page, black text, lapis `#002DB4` for every highlight |
| Dark palette | Two colours: near-black page, white text, lapis `#2F5BFF` for fills and `#809BFF` for small accent text |
| Fonts | Four families: Archivo (wide caps), Geist Sans (body), Geist Mono (labels), Bodoni Moda (logo and a few big statements). No handwriting anywhere |
| Theme switch | A slow pixel scan that spreads out from the theme button, a quote, then a second scan from the same button clears it |
| Page change | Curtain names the next page. Near-black in dark mode, oat with black type in light mode, lapis glow in both |
| Motto | "Gotta stack up the Gandhis for a Porsche 911 GT3 RS." on /story, under the sign-off |
| Studio | One night-time room in 3D. Cream loafs on the desk and runs laps when clicked |
| Footer | Pixel Simba and Cream on the contact card's edge, playing a five-scene loop |
| Easter egg | Type `cream` anywhere. The footer shows the five keys and lights them up as you type |

---

## Session: 15 Oct 2026

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

## Things to remember

- Sevith's likeness for the 3D figure: big messy black hair, full beard, no glasses, black tee, indigo jeans, tattoo on the right forearm.
- The four cats: Simba (orange explorer), Ash (grey, scared), Pearl (white with a grey patch, chill), Cream (white, Pearl's daughter, chaos). He is most like Simba and Cream.
- Copy voice: credible in headlines, sarcastic in the asides. Keywords go in `*asterisks*` and render through `components/ui/Copy.tsx`.
- No em dashes in site copy. No pastels, no neon, no yellow or lime.
