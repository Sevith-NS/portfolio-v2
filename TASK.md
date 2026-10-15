# TASK

The rebuild, broken into bite-sized tasks. Each one should fit in a single
sitting and has a "done when" line so it can be checked off honestly.
Tick a box when it ships, and log the change in `MEMORY.md`.

Legend: **[S]** needs something from Sevith first.

---

## 0. Just shipped (verify on a real phone)

- [ ] **Pixel scan theme switch.** Done when it runs smoothly on a mid-range Android phone and the scan visibly grows out of the theme button.
- [ ] **Two-colour palette (lapis replaces orange).** Done when every page has been eyeballed in both modes and no orange is left outside the 3D room.
- [ ] **Footer cat scenes.** Done when all five scenes have been watched start to finish on phone width without the cats leaving the card edge.
- [ ] **Cream's laps in the studio.** Done when she never clips through the chair, bench or barbell.

## 1. First impression ("WOW, I want to build sites like him")

- [ ] **Loading screen** in the spirit of pamidordesign.co. Done when it shows once per visit, takes under 1.5s, and is skipped under reduced motion.
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

- [ ] **Decide on Bodoni.** It is now only the logo and three or four big moments. Option A: keep. Option B: drop it and go three families. Done when Sevith picks one.
- [x] **Handwriting removed** everywhere; motto added to /story.
- [ ] **Paper texture.** The grain is on. Done when light mode feels like paper, not screen, without hurting contrast.
- [ ] **Dark mode lapis check.** Done when `#2F5BFF` and `#809BFF` have been looked at on every page and small lapis text is readable.

## 7. Easter eggs

- [ ] **One more egg,** for example the cats reacting to the theme switch. Done when it's discoverable without reading the source.

## 8. Phase 7 (owed): quality and security

- [ ] **Install the Cloudflare security-audit skill** (github.com/cloudflare/security-audit-skill) and run the full audit. Done when every finding is fixed or explicitly accepted.
- [ ] **[S] EmailJS settings:** allowed domains, a rate limit, and `{{message}}` not `{{{message}}}`.
- [ ] **Frontend critique pass** with the design skills (impeccable, taste, redesign). Done when the findings are logged here as tasks.
- [ ] **Mobile-first test pass** on a real phone, per the Google UX course. Done when every page has been used one-handed.
- [ ] **Accessibility pass:** contrast, focus rings, keyboard path, reduced motion. Done when nothing fails WCAG AA.
- [ ] **Performance:** Lighthouse on home and /studio. Done when both score 90 or above on mobile.
