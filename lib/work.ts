// Shared by client and server components.
const names: Record<string, string> = {
  re: "React", tail: "Tailwind", javascript: "JavaScript", next: "Next.js", gemini: "Gemini", clerk: "Clerk",
  neon: "Neon", ts: "TypeScript", nodejs: "Node.js", aws: "AWS", fm: "Framer Motion", python: "Python",
  three: "Three.js", gsap: "GSAP",
};

export const stack = (icons: string[]) =>
  icons.map((i) => names[i.replace(/^\//, "").replace(/\.(svg|png)$/, "")] ?? "").filter(Boolean);

// Compressed 1280px WebP copies of the screenshots in public/reel (made from the PNGs with ffmpeg).
export const webp = (img: string) => (img ? `/reel/${img.replace(/^\//, "").replace(/\.png$/i, "").toLowerCase()}.webp` : "");
