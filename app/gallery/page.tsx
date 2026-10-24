import type { Metadata } from "next";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp"; // ships with Next; reads each photo's shape for the scatter
import { navItems } from "@/data";
import { FloatingNav } from "@/components/ui/FloatingNav";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Sevith's phone, on one plane you can drag in any direction.",
};

// Whatever `npm run gallery` left in public/gallery, read at build time.
async function photos() {
  const dir = path.join(process.cwd(), "public", "gallery");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".webp") && !f.endsWith(".thumb.webp"))
    .sort();
  return Promise.all(
    files.map(async (f) => {
      const name = f.slice(0, -".webp".length);
      // From a buffer: a file sharp keeps open blocks the next `npm run gallery` on Windows.
      const { width = 1, height = 1 } = await sharp(readFileSync(path.join(dir, `${name}.thumb.webp`))).metadata();
      return { src: `/gallery/${f}`, thumb: `/gallery/${name}.thumb.webp`, alt: name.replace(/-/g, " "), w: width, h: height };
    }),
  );
}

export default async function GalleryPage() {
  return (
    <main id="main" className="relative z-[1]">
      <FloatingNav navItems={navItems} />
      <h1 className="sr-only">Gallery</h1>
      <Gallery photos={await photos()} />
    </main>
  );
}
