// Renders assets/img/*.jpg from placeholder-generator.html via a headless
// browser and exports each <canvas> to a real JPEG file.
//
// Requires the `playwright` package and a Chromium build available to it —
// neither is vendored here (dev-only tool, not a runtime dependency of the
// site). From this directory:
//   npm install playwright && npx playwright install chromium
//   node export-images.mjs
//
// Edit `specs` below to change moods, seeds, sizes, or add new slots — same
// seed always reproduces the same composition (see placeholder-generator.html).

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "..", "assets", "img");
fs.mkdirSync(OUT, { recursive: true });

const specs = [
  { id: "gallery-01-the-vows",       w: 1000, h: 1300, moodKey: "gold",  seed: 101 },
  { id: "gallery-02-study-12",       w: 1200, h: 800,  moodKey: "taupe", seed: 202 },
  { id: "gallery-03-morning-light",  w: 1000, h: 700,  moodKey: "slate", seed: 303 },
  { id: "gallery-04-campaign-02",    w: 1000, h: 700,  moodKey: "amber", seed: 404 },
  { id: "gallery-05-the-long-table", w: 1600, h: 800,  moodKey: "blush", seed: 505 },
  { id: "gallery-06-ember-journal",  w: 1200, h: 800,  moodKey: "umber", seed: 606 },
  { id: "gallery-07-reception",      w: 1200, h: 800,  moodKey: "gold",  seed: 707 },
  { id: "gallery-08-study-4",        w: 1000, h: 1300, moodKey: "taupe", seed: 808 },
  { id: "gallery-09-ceremony-light", w: 1600, h: 800,  moodKey: "slate", seed: 909 },
  { id: "about-mara-voss",           w: 900,  h: 1125, moodKey: "amber", seed: 1010 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("console error:", m.text()); });
page.on("pageerror", (e) => console.log("pageerror:", e.message));

await page.goto("file://" + path.join(here, "placeholder-generator.html"));

const ids = await page.evaluate((specs) => window.renderAll(specs), specs);
console.log("rendered:", ids);

for (const spec of specs) {
  const dataUrl = await page.evaluate((id) => {
    const c = window.__canvases[id];
    return c.toDataURL("image/jpeg", 0.9);
  }, spec.id);
  const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
  const outPath = path.join(OUT, `${spec.id}.jpg`);
  fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
  const stat = fs.statSync(outPath);
  console.log(`wrote ${outPath} (${(stat.size / 1024).toFixed(0)} KB)`);
}

await browser.close();
