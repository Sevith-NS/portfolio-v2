---
name: Sevith Sadashiva · Portfolio
description: A product builder's studio sketchbook. Oat paper by day, lapis-navy by night, one lapis accent for decisions, actions and the curtain.
colors:
  lapis: "#2440A8"
  on-lapis: "#F7F3EC"
  oat-paper: "#EFE9DE"
  oat-sheet: "#F7F3EC"
  ink: "#161B2D"
  ink-2: "#404558"
  ink-3: "#606372"
  rule: "#D8CEBC"
  tint-sage: "#CDD6C4"
  tint-butter: "#E8DFBA"
  tint-blush: "#EAD4C8"
  tint-lapis: "#CBD2EC"
  tint-stone: "#DED6C8"
  tint-rose: "#E8CDD2"
  tint-mint: "#C8DED4"
  lapis-night: "#96ACFF"
  on-lapis-night: "#0D142C"
  paper-night: "#0D142C"
  sheet-night: "#141D3C"
  ink-night: "#EFE9DE"
  ink-2-night: "#C4C0B6"
  ink-3-night: "#989CAE"
  rule-night: "#2A365C"
  tint-sage-night: "#223036"
  tint-butter-night: "#303034"
  tint-blush-night: "#342838"
  tint-lapis-night: "#1E2C5C"
  tint-stone-night: "#262A3E"
  tint-rose-night: "#32243C"
  tint-mint-night: "#1C323C"
  error: "#D9480F"
  error-night: "#FF8A5B"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Geist, sans-serif"
    fontSize: "clamp(2.9rem, 7vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Bricolage Grotesque, Geist, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "Bricolage Grotesque, Geist, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Bricolage Grotesque, Geist, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"ss01\", \"cv11\""
  body-small:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.375
  note:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.25rem
    fontFeature: "\"tnum\""
  script:
    fontFamily: "Nothing You Could Do, cursive"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  focus: "4px"
  field: "12px"
  card: "16px"
  menu: "24px"
  plate: "28px"
  stage: "32px"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-md: "32px"
  grid-gap: "32px"
  header-to-content: "56px"
  row: "32px"
  row-md: "40px"
  section: "80px"
  section-md: "96px"
  ruling-cell: "24px"
  page-max: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.lapis}"
    textColor: "{colors.on-lapis}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body-small}"
  button-ghost:
    backgroundColor: "{colors.oat-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body-small}"
  input:
    backgroundColor: "{colors.oat-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
    typography: "{typography.body}"
  chip:
    backgroundColor: "{colors.oat-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    typography: "{typography.body-small}"
  chip-selected:
    backgroundColor: "{colors.lapis}"
    textColor: "{colors.on-lapis}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.oat-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px"
  project-plate:
    backgroundColor: "{colors.tint-lapis}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
  studio-door:
    backgroundColor: "{colors.lapis}"
    textColor: "{colors.on-lapis}"
    rounded: "{rounded.plate}"
    padding: "32px"
  curtain:
    backgroundColor: "{colors.lapis}"
    textColor: "{colors.on-lapis}"
    typography: "{typography.display}"
  nav:
    backgroundColor: "{colors.oat-sheet}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 20px"
---

# Design System: Sevith Sadashiva · Portfolio

## Overview

**Creative North Star: "The Studio Sketchbook"**

A product builder's sketchbook, bound in oat paper and lapis. The work reads like a well-run product: hairline-ruled rows, a mono margin, figures set large and tabular, case studies laid out like briefs. The margins show the person: a handwritten lapis note here and there, a type specimen you can play with, a small 3D studio that changes scene every five minutes. The three words are curious, precise, warm, and every surface tries to be all three at once.

The ground is warm oat paper (light, the default) or deep lapis-navy (dark), with a faint 24px ruling fixed behind the page that fades out toward the bottom. On that ground, a single lapis accent does all the pointing: primary actions, the headline decision of each role, the highlighter stroke, the active scene, and the film-slate curtain that closes over the page between routes. Projects sit on softly tinted plates, each its own quiet color from a seven-tint family, with the product screenshot floating up out of the plate.

Motion is Premium and cinematic, not busy. Page changes play like a film slate: a lapis curtain wipes up, names the destination and a scene number, then wipes away on the same curve. Three signature 3D pieces (the hero monogram, the film reel, the studio room) carry the spectacle; everything else moves with restraint and stops entirely under reduced motion.

**Key Characteristics:**
- Oat paper and lapis-navy grounds, one lapis accent, seven soft tints for project plates.
- Bricolage Grotesque display, Geist body, Geist Mono notes, Nothing You Could Do for margin scribbles.
- Hairline rules instead of cards for lists of facts; cards only where a thing is an object (form, working document, type specimen).
- A film-slate lapis curtain between pages: clip-path wipe, 620ms, one curve in and out.
- Three 3D signature pieces in oat clay and lapis gloss, and no others.

## Colors

A warm neutral paper world with one saturated voice (lapis) and a family of desaturated tints that only ever hold projects.

### Primary
- **Lapis** (#2440A8; night #96ACFF): the single accent. Primary buttons, the highlighter stroke behind decided phrases, the headline-result chip in Experience, the first tag of a working document, the active studio scene chip, the studio door, the case-study bullet dashes, the email link in the footer, the tinted footer wordmark (at 12% opacity), and the full-bleed page-transition curtain. Text on lapis is **Lapis Ground** (#F7F3EC; night #0D142C).

### Neutral
- **Oat Paper** (#EFE9DE; night Lapis Navy #0D142C): the page ground and field background.
- **Oat Sheet** (#F7F3EC; night #141D3C): raised surfaces (form, type specimen, working document, nav pill, chips, the reel stage at 60%).
- **Ink** (#161B2D; night #EFE9DE): headings and primary text. A blue-black, never pure black.
- **Ink 2** (#404558; night #C4C0B6): supporting paragraphs and section notes.
- **Ink 3** (#606372; night #989CAE): mono notes, dates, captions, placeholders.
- **Rule** (#D8CEBC; night #2A365C): every hairline, border, inactive chip outline, progress track and scrollbar thumb.
- **Error** (#D9480F; night #FF8A5B): form validation icon and invalid field border only.

### Tints (project plates)
- **Sage** (#CDD6C4), **Butter** (#E8DFBA), **Blush** (#EAD4C8), **Lapis Mist** (#CBD2EC), **Stone** (#DED6C8), **Rose** (#E8CDD2), **Mint** (#C8DED4). Night versions are deep, low-chroma navies of the same hue family (see frontmatter). Each project owns one tint; its plate, its case-study hero and its "Next case study" card all use it. Lapis Mist at 40% also grounds the studio room stage.

### Named Rules
**The Single Lapis Rule.** Lapis is the only accent and it means "act here" or "this was decided". It marks actions, decisions and the curtain. If a lapis element is neither clickable nor a decision, it should be ink.

**The Tint Family Rule.** Project plates use the tint family, one tint per project, carried through to its case study. Tints never hold UI chrome, text blocks or buttons, and a plate is never solid lapis.

## Typography

**Display Font:** Bricolage Grotesque (with Geist, sans-serif)
**Body Font:** Geist (with ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono (with ui-monospace)
**Script Font:** Nothing You Could Do (with cursive)

**Character:** A warm, slightly quirky grotesque for everything that speaks (names, section titles, outcomes, figures) set tight and heavy, against a neutral, precise Geist for reading, with Geist Mono as the notebook's margin voice. The script face is a pen in the margin, never a typeface for content.

### Hierarchy
- **Display** (600, 2.9rem to 5.5rem, 0.95, -0.045em): the hero name and case-study titles (up to 6rem there), the curtain destination title (3rem to 6rem), and the "Next case study" title.
- **Headline** (600, 2.25rem to 3.75rem, 1.02, -0.035em, balanced wrap): every section title ("Things I've built.", "How I work.", "Let's build something."). Short, sentence case, ends with a period.
- **Statement** (Bricolage 500, 1.25rem to 1.5rem, snug, -0.02em): project outcomes under plates, the hero subline (up to 2.6rem), case-study outcome line.
- **Figure** (Bricolage 600, 2.25rem to 3rem, -0.04em, tabular): the resume ledger in the hero.
- **Title** (Geist 600, 1.5rem to 1.75rem, 1.25, -0.02em): role titles in Experience, phase titles in Approach (up to 2.25rem).
- **Body / Lead** (Geist 400, 1rem / 1.125rem, 1.625): paragraphs, capped at 52 to 60ch.
- **Note** (Geist Mono 400, 0.75rem, 1.25rem line, tabular): dates, margin labels, stack lists, frame and scene counters, footer meta.
- **Script** (Nothing You Could Do 400, 1.5rem to 2.3rem, rotated about -2deg, lapis): margin scribbles.

### Named Rules
**The No Kicker Rule.** No labels above headings. A heading stands alone; context goes in the margin note beside it (the section header is title left, note right) or in the body below.

**The Mono Stack Rule.** Tech stacks are written as Geist Mono text ("Next.js, TypeScript, Tailwind"), never as logos or icon rows.

**The Ledger Rule.** Every number on the page comes from the resume (260+, 25+, 30+, 4, 30%, 10%) and is set tabular. Nothing is rounded up or invented.

**The Margin Scribble Rule.** Handwritten lapis scribbles are margin annotations only, at most one per section, and never carry information a visitor needs. They write themselves on with a left-to-right mask wipe (1.6s) when scrolled into view.

## Layout

A 1240px page column with 16px gutters (32px from md), on a 12-column grid. Sections sit 80px apart (96px from md). The recurring spread is a **section header**: headline across 8 columns, a short ink-2 note in columns 10 to 12, aligned to the bottom; content starts 56px below. Lists of facts are rows on hairlines: a mono margin label in 3 columns, the statement in 9 (About, Experience, case-study rows use 4 and 8). Projects run as a wide featured plate (21:9 on desktop) followed by a two-column grid of 4:3 plates. Approach pins a working-document card in the right five columns while phases scroll on the left. Below md everything collapses to one column and the margin labels drop away or stack above; nothing scrolls horizontally. The hero fills 100dvh with copy in 7 columns and the monogram in 5, then a timeline and the ledger on hairlines beneath.

**The Hairline Rule.** Structure comes from 1px Rule lines and whitespace, not from boxes. A new card needs a reason to be an object.

## Elevation & Depth

Flat by default, with depth reserved for things that float. Surfaces separate by tone (Paper vs Sheet vs tint) and hairlines. Soft, long, ink-tinted shadows appear only under the floating screenshot on a plate, the pinned working document, and the nav pill. Real depth lives in the three WebGL pieces, lit softly with contact shadows, in oat clay and lapis gloss.

### Shadow Vocabulary
- **Screenshot float** (`box-shadow: 0 24px 48px -24px rgb(22 27 45 / 0.45)`; case-study hero `0 32px 64px -28px rgb(22 27 45 / 0.5)`): under the product image rising out of a tinted plate.
- **Working document** (`box-shadow: 0 24px 48px -32px rgb(0 0 0 / 0.35)`): the Approach artifact card.
- **Nav float** (`box-shadow: 0 8px 24px -12px rgb(22 27 45 / 0.22)`, with 12px backdrop blur): the floating nav pill; the mobile menu uses `0 16px 40px -20px rgb(22 27 45 / 0.35)`.

### Named Rules
**The Three Pieces Rule.** 3D is used for the three signature pieces only: the hero "S" monogram (lapis clear-coat letter, oat clay forms, turns toward the cursor), the film reel (projects as frames on a turning film strip), and the studio room (isometric voxel room with shader-textured blocks and a lights switch, 8 scenes). Each pauses when off screen, caps DPR at 1.75, and respects reduced motion (no drift, no auto-advance, no pointer chase). No fourth 3D object.

## Shapes

Soft, generous corners that scale with the object: pills (9999px) for every button, chip and the nav; 12px for fields; 16px for cards (form, working document); 24px for the mobile menu; 28px for project plates and the studio door; 32px for large stages (the reel, the case-study hero, the studio room, the next-case card). Screenshots on plates round only their top corners and bleed off the bottom edge. Dots (7px) mark timeline entries, filled lapis with a soft ring for the current one. Hairline dashes (12px to 20px) replace bullets.

## Components

### Buttons
- **Shape:** full pill (9999px), 44px tall, 20px side padding, 15px medium label, optional 16px Phosphor icon.
- **Primary:** Lapis ground, Lapis Ground text. One or two per view: Download resume, Open case study, Send note, Visit live site.
- **Hover / Focus:** primary lightens to 90% lapis; ghost border darkens from Rule to Ink; press scales to 0.98; 200ms ease-out. Focus is a 2px Ink outline, 3px offset.
- **Ghost:** Sheet at 60% with a Rule hairline, Ink text. Used for secondary actions and icon-only prev/next arrows.

### Chips
- **Style:** Sheet ground, Rule hairline, Ink text, pill. Interests in Off the clock hover to a lapis border and lapis text.
- **State:** selected scene chip in the studio fills lapis; working-document tags are mono pills, the first (the decision) filled lapis.

### Cards / Containers
- **Corner Style:** 16px (form, working document), 28px (type specimen, studio door).
- **Background:** Oat Sheet on Oat Paper.
- **Shadow Strategy:** none, except the working document (see Elevation).
- **Border:** 1px Rule.
- **Internal Padding:** 20px mobile, 32px desktop.

### Inputs / Fields
- **Style:** Paper ground inside a Sheet card, 1px Rule border, 12px radius, 12px by 16px padding, visible label above in 14px medium Ink.
- **Focus:** border shifts to Ink (form) or Lapis (type specimen).
- **Error:** border and fill-icon in Error orange, message in Ink beneath, focus moves to the first invalid field.

### Navigation
- **Style:** a floating pill (max 52rem) 16px from the top: Sheet at 85% with blur, Rule hairline, wordmark "sevith." with a lapis period, 14px Geist links in Ink 2. The active link sits on a 10% lapis pill that glides between links. It hides on scroll down and returns on scroll up; on mobile a menu drops beneath as a 24px-radius Sheet panel with display-face links and a lapis dot for the active item.

### Film-Slate Curtain (signature)
Every internal navigation routes through a full-bleed lapis curtain: it wipes up from the bottom with `clip-path` (620ms, cubic-bezier(0.76, 0, 0.24, 1)), names the destination bottom-left in the Display face and "Scene NN" bottom-right in mono, then wipes off the top on the same curve once the route renders. One transition at a time; modifier clicks and reduced motion skip it.

**The One Curtain Rule.** The motion personality is Premium, with one curtain curve: cubic-bezier(0.76, 0, 0.24, 1) at 620ms, used in and out. In-page reveals use a soft expo-out (cubic-bezier(0.16, 1, 0.3, 1)) or light springs; nothing bounces, and nothing competes with the curtain.

### Project Plate (signature)
A tinted 28px plate (21:9 featured, 4:3 otherwise) with the screenshot floating up from the bottom edge, lifting 8px on hover. Below: the outcome in the Statement style, then a mono line of title, year and stack, and a round arrow button that fills lapis on hover. Projects without a screenshot show their name large in lapis on the plate.

### Highlighter
A lapis stroke drawn behind a decided phrase (900ms expo-out), turning its text Lapis Ground. Used once in the hero ("design, define and ship"); the same idea as a static chip marks each role's headline result.

### Footer Wordmark
The sign-off: "sevith." in the Display face at 700, up to 17.5rem, -0.07em, in lapis at 12% opacity, sitting under the contact block like an end card.

## Do's and Don'ts

### Do:
- **Do** keep lapis (#2440A8 / #96ACFF) for actions, decisions and the curtain only.
- **Do** give every project one tint from the family and carry it into its case study.
- **Do** write tech stacks as Geist Mono text.
- **Do** take every number from the resume and set it tabular.
- **Do** put context in the margin note beside a heading, never above it.
- **Do** use one curtain curve, cubic-bezier(0.76, 0, 0.24, 1) at 620ms, for page transitions, and make every motion stop under reduced motion.
- **Do** separate content with 1px Rule hairlines before reaching for a card.

### Don't:
- **Don't** add a second accent color, gradients, or a colored text highlight that isn't lapis.
- **Don't** use more than one scribble per section, or put needed information in a scribble.
- **Don't** put labels, kickers or eyebrows above headings.
- **Don't** show technology logos or icon rows for stacks.
- **Don't** invent metrics, testimonials or client logos.
- **Don't** add 3D beyond the monogram, the reel and the studio room, or let any of them animate under reduced motion.
- **Don't** use pure black or pure white; ink is #161B2D and paper is #EFE9DE.
