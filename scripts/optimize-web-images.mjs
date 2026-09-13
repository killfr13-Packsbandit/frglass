import { readdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Only deployment copies are changed. Always encode from public originals so
// repeated builds cannot accumulate JPEG/WebP compression loss.
const sourceRoot = await realpath("public");
const outputRoot = await realpath(".open-next/assets");
if (sourceRoot === outputRoot || outputRoot.startsWith(sourceRoot + path.sep)) {
  throw new Error("Image output must be separate from the public originals.");
}

sharp.concurrency(2);
const formats = { ".jpg": "jpeg", ".jpeg": "jpeg", ".png": "png", ".webp": "webp", ".avif": "avif" };

async function* images(directory, prefix = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) yield* images(path.join(directory, entry.name), relative);
    else if (entry.isFile() && formats[path.extname(entry.name).toLowerCase()]) yield relative;
  }
}

let count = 0;
let reduced = 0;
let before = 0;
let after = 0;
for await (const relative of images(sourceRoot)) {
  const original = await readFile(path.join(sourceRoot, relative));
  const target = await realpath(path.join(outputRoot, relative));
  if (!target.startsWith(outputRoot + path.sep)) throw new Error(`Unsafe output: ${relative}`);
  const metadata = await sharp(original).metadata();
  let result = original;
  // Do not flatten animated WebP/APNG files or change their timing.
  if ((metadata.pages ?? 1) === 1) {
    const encoder = sharp(original)
      .autoOrient()
      .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true });
    const format = formats[path.extname(relative).toLowerCase()];
    if (format === "jpeg") encoder.jpeg({ quality: 85, progressive: true, mozjpeg: true });
    else if (format === "png") encoder.png({ compressionLevel: 9 });
    else if (format === "webp") encoder.webp({ quality: 85 });
    else encoder.avif({ quality: 65 });
    const candidate = await encoder.toBuffer();
    // Already-small images must not become larger just to re-encode them.
    if (candidate.length < original.length) result = candidate;
  }
  await writeFile(target, result);
  count++;
  before += original.length;
  after += result.length;
  if (result !== original) reduced++;
  if (count % 20 === 0) console.log(`Prepared ${count} web images`);
}
if (!count) throw new Error("No public images found; check the build working directory.");
console.log(JSON.stringify({ images: count, reduced, originalBytes: before, deployedBytes: after,
  savedPercent: Number(((1 - after / before) * 100).toFixed(1)) }));
