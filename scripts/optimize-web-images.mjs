import { readdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

// Preserve the exact bytes from /public in the deployed OpenNext assets.
// This avoids quality loss from resizing or recompressing glass photography.
const sourceRoot = await realpath("public");
const outputRoot = await realpath(".open-next/assets");
if (sourceRoot === outputRoot || outputRoot.startsWith(sourceRoot + path.sep)) {
  throw new Error("Image output must be separate from the public originals.");
}

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function* images(directory, prefix = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) yield* images(path.join(directory, entry.name), relative);
    else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) yield relative;
  }
}

let count = 0;
let bytes = 0;
for await (const relative of images(sourceRoot)) {
  const original = await readFile(path.join(sourceRoot, relative));
  const target = await realpath(path.join(outputRoot, relative));
  if (!target.startsWith(outputRoot + path.sep)) throw new Error(`Unsafe output: ${relative}`);
  await writeFile(target, original);
  count++;
  bytes += original.length;
  if (count % 20 === 0) console.log(`Prepared ${count} original-quality web images`);
}

if (!count) throw new Error("No public images found; check the build working directory.");
console.log(JSON.stringify({ images: count, originalQuality: true, bytes }));
