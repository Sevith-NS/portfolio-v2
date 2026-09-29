import type { SceneId } from "@/components/three/StudioRoom";

// The rooms cycle on a shared clock: every 5 minutes, everyone sees the next one.
export const SCENE_MS = 5 * 60 * 1000;

export const scenes: { id: SceneId; title: string; note: string }[] = [
  { id: "design", title: "At the design desk", note: "Nudging spacing until it feels right. Type specimens pinned above the monitor." },
  { id: "editing", title: "In the edit bay", note: "Cutting video one frame at a time, because timing is everything." },
  { id: "trading", title: "Trading corner", note: "Charts, coffee and a lamp that stays on too late." },
  { id: "sports", title: "Out playing", note: "Sports, because the screen can wait." },
  { id: "cinema", title: "Movie night", note: "Watching films for the story and the cinematography." },
  { id: "cooking", title: "In the kitchen", note: "Cooking something new, following the recipe roughly." },
  { id: "panic", title: "Thinking about the future", note: "And sometimes panicking about it. Honestly." },
  { id: "ideas", title: "Brainstorming room", note: "Half-formed ideas go up on the whiteboard first. Most of them come back down." },
];

// Whiteboard notes for the brainstorming room; three are picked at a time. Keep each line short (~12 chars).
export const ideas = [
  "Docs that\nanswer back",
  "Release notes\nas a podcast",
  "Leftovers\nrecipe app",
  "Trading\njournal",
  "One-take\nshort film",
  "AI study\nbuddy",
  "Portfolio\nv3?",
  "Changelog\nbot",
  "Football\nscheduler",
  "Film diary\napp",
  "Voice notes\nto tasks",
  "Docs QA\nlinter",
];
