// Phone photos to the gallery. Drop originals into photos-src/gallery (gitignored,
// never served) and run `npm run gallery`. Each one is turned upright, shrunk and
// saved to public/gallery as webp, with its EXIF (GPS location included) left
// behind. Name a file for what it shows (cream-on-the-desk.jpg): the name is its
// alt text. public/gallery mirrors photos-src/gallery, so a photo deleted or
// renamed there comes down here on the next run.
import assert from "node:assert";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import sharp from "sharp"; // ships with Next

const src = "photos-src/gallery", out = "public/gallery";
mkdirSync(out, { recursive: true });
const made = new Set();

for (const file of readdirSync(src)) {
  if (!/\.(jpe?g|png|webp|avif)$/i.test(file)) {
    console.log(`skip ${file} (HEIC? export it as JPEG)`);
    continue;
  }
  const name = file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[\s_]+/g, "-");
  const photo = sharp(`${src}/${file}`).rotate(); // bakes in the phone's orientation; sharp drops metadata unless asked
  await photo.clone().resize(2000, 2000, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${out}/${name}.webp`);
  await photo.clone().resize(720, 720, { fit: "outside", withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${out}/${name}.thumb.webp`);
  for (const f of [`${name}.webp`, `${name}.thumb.webp`]) {
    assert(!(await sharp(`${out}/${f}`).metadata()).exif, `${f} kept its EXIF`);
    made.add(f);
  }
  console.log(`ok ${name}`);
}

// An empty source folder never empties the gallery.
if (!made.size) throw new Error(`no photos in ${src}, so ${out} is left as it is`);
for (const f of readdirSync(out)) {
  if (made.has(f)) continue;
  rmSync(`${out}/${f}`);
  console.log(`removed ${f}`);
}
