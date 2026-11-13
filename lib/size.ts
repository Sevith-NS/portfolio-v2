import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp"; // ships with Next

// A picture's own size, read on the server at build time, for files under public/.
// Without it a lazy picture loads in at full height as you scroll and the page grows.
// From a buffer: a file sharp keeps open blocks re-exports on Windows.
export const size = async (src: string) => {
  const { width, height } = await sharp(readFileSync(path.join(process.cwd(), "public", src))).metadata();
  return { w: width!, h: height! };
};
