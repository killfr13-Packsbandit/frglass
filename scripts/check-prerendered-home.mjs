import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Guard the CPU-saving path: the homepage must be built ahead of time,
// while live CMS data remains in the existing dynamic APIs.
const manifest = JSON.parse(await readFile(".next/prerender-manifest.json", "utf8"));
assert.ok(manifest.routes["/"], "Homepage was not prerendered");
assert.equal(manifest.routes["/"].initialRevalidateSeconds, false,
  "Homepage must not require runtime regeneration with the read-only asset cache");
for (const route of ["/api/admin/session", "/api/products", "/api/site-content"]) {
  assert.ok(!manifest.routes[route], route + " must remain dynamic");
}
console.log("Verified prerendered homepage and dynamic admin/CMS endpoints.");
