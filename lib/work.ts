// Shared by client and server components.
const names: Record<string, string> = {
  re: "React", tail: "Tailwind", javascript: "JavaScript", next: "Next.js", gemini: "Gemini", clerk: "Clerk",
  neon: "Neon", ts: "TypeScript", nodejs: "Node.js", aws: "AWS", mongodb: "MongoDB", fm: "Framer Motion",
  html5: "HTML", css: "CSS", php: "PHP", stripe: "Stripe", python: "Python",
};

export const stack = (icons: string[]) =>
  icons.map((i) => names[i.replace(/^\//, "").replace(/\.(svg|png)$/, "")] ?? "").filter(Boolean);

export const tintClass: Record<string, string> = {
  lapis: "bg-tint-lapis", sage: "bg-tint-sage", stone: "bg-tint-stone", butter: "bg-tint-butter",
  blush: "bg-tint-blush", mint: "bg-tint-mint", rose: "bg-tint-rose",
  amber: "bg-tint-amber", garnet: "bg-tint-garnet", clover: "bg-tint-clover",
};

// Compressed 1280px WebP copies of the screenshots in public/reel (made from the PNGs with ffmpeg).
export const webp = (img: string) => (img ? `/reel/${img.replace(/^\//, "").replace(/\.png$/i, "").toLowerCase()}.webp` : "");
