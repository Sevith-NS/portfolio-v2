# MEMORY

What this portfolio is, how it is built, and what changed. Newest first.
Work lives on branch `esdee`, uncommitted until Sevith asks. The open work is
in `TASK.md`.

---

## The site at a glance

| Area | Now |
|---|---|
| Direction | **Drill cover / zine, cut like an edit.** The whole site plays like the esdee and fast-cut edits on scroll: hard cuts, flash frames, tracking boxes, photocopied stills, torn bone pages |
| Colour | `lib/theme.ts` only. Void `#000000` page, bone `#EDEAE3` paper and text, blood `#D0021B` for hits only (stamps, REC, playhead, marker, cursor). Smoke `#8C8984` and grit `#57534D` for secondary text, soot `#1C1C1C` and dust `#CFCBC2` for rules |
| Tones | A scene is `.tone-void` (black) or `.tone-bone` (a negative page). Components use `fg`, `bg`, `mute`, `line`, which flip per tone |
| Type | Two families. **Anton** (`.title`) for anything big, **IBM Plex Mono** for everything you read. HUD labels are lowercase mono (`.hud`), like file names and timecodes |
| Frame | Letterbox: a black top bar (logo, work, story, contact, sound) and a black timeline bar at the bottom (REC, scene name, a scrubber with a tick per `data-scene`, blood playhead, timecode) |
| Motion | `Reveal` = hard cut in held frames (negative, slice, slam). Scene director flashes and punches in when a `data-scene` crosses mid-screen. Page change = "cut to" slate. framer-motion + Lenis + CSS only, no GSAP |
| Home | Title card over the reel video, the scroll reel (16 shots), Who (bone page), the tapes (work in film strips), Process (pinned triptych), Contact |
| /story | B-roll: blood duotone opening, bone Hello, chapters on a track, prints taped down, the crew (cats), type specimen, rolling credits |
| /work/[slug] | Director's cut: slate, bone brief, monitors for the walkthrough, verdict, next tape |
| Sound | "Dirty" (EsDeeKid) behind the top bar toggle, starts at 61.2s, keeps playing across pages. Sevith accepted the copyright risk |
| Cursor | A blood crosshair; a tracking box snaps around anything clickable, labelled from `data-cursor` |
| Gone | /studio and the 3D room, light mode, pixel cats, the cream easter egg, lapis, Archivo, Bodoni, Geist, phosphor icons, three.js |

## Session: 17 Oct 2026, the rebuild

Sevith loved the first esdee pass and asked for a whole new portfolio around
it: new type, new colour, every component new, content kept. His calls:
drill cover / zine, black + bone + blood, condensed heavy + mono, nothing
from the old component set, the edit feel on every page (not just the
landing), "Dirty" behind a toggle, drop /studio, harder asides with the same
facts.

- Rendered the reel as a real video, cut to the beat of "Dirty" (143.5 BPM,
  drop anchored at 66.22s on beat 12): `Desktop/sevith_reel_final_v7.mp4`,
  1080p, 21.7s. A 720p silent copy is the hero background
  (`public/reel/reel.mp4`, 2.1MB).
- New: `components/chrome/` (TopBar, Timeline, Cursor, Sound),
  `components/home/` (Title, HeroVideo, Who, Tapes, Process),
  `components/Contact.tsx`, `components/edit/` (Xerox, Marker, Torn, plus the
  reworked CutLayer, Reel, TrackBox), `ui/Specimen`.
- Removed: the 3D studio and its models, ThemeToggle, FloatingNav, PixelCats,
  EasterEggs, CreamHint, PixelDissolve, RiseSheet, GlassPaint, Highlight,
  BrowserFrame, TypeSpecimen, the old home sections. Uninstalled three,
  @react-three/*, next-themes, @phosphor-icons/react.
- Kept and restyled: Form (now a bone "call sheet"), CopyEmail, ZoomImage,
  DemoVideo, Prompt, Copy, TransitionProvider, SmoothScroll, Reveal.

## Things to remember

- The four cats: Simba (orange explorer, starts every fight), Ash (grey,
  scared), Pearl (white with a grey patch, chill), Cream (white, Pearl's
  daughter, chaos). He is half Simba, half Cream.
- Copy voice: credible headlines, sarcastic asides. Keywords go in
  `*asterisks*` and render through `components/ui/Copy.tsx`.
- No em dashes in site copy. No handwriting fonts (red marker strokes are SVG
  shapes, not lettering).
- Motto: "Gotta stack up the Gandhis for a Porsche 911 GT3 RS."
- `ART-DIRECTION.md` is the retired After Hours direction. Its intake quotes
  (Q1 to Q115) are still Sevith's own words and a source of facts; its visual
  rules are not.
- `todo: true` blocks in `data/` are prompts to Sevith. They show in dev only
  and are stripped from production.
