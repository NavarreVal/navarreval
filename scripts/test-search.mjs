/* Abstract-query checks for the committed search index.
   Run: node scripts/test-search.mjs */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MiniSearch from "../js/vendor/minisearch-7.2.0/dist/es/index.js";
import { miniSearchOptions, runSearch } from "../js/search-shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(ROOT, "search-index.json");
const raw = fs.readFileSync(indexPath, "utf8");
const mini = MiniSearch.loadJSON(raw, miniSearchOptions());

const forbidden = ["/passion/blog", "/bucket-list", "/dnd"];
for (const bit of forbidden) {
  if (raw.includes(bit)) {
    console.error("Index contains excluded path " + bit);
    process.exit(1);
  }
}

const cases = [
  { q: "faith", top: ["/passion/religious"], also: "/talks", within: 6 },
  { q: "gospel", top: ["/passion/religious"], also: "/talks", within: 6 },
  { q: "camera", top: ["/passion/photography"] },
  { q: "pictures", top: ["/passion/photography"] },
  { q: "pics", top: ["/passion/photography"] },
  { q: "job", top: ["/professional"] },
  { q: "resume", top: ["/professional"] },
  { q: "career", top: ["/professional"] },
  { q: "games", top: ["/passion/video-games"] },
  { q: "3d", top: ["/passion/3d-printing"] },
  { q: "printer", top: ["/passion/3d-printing"] },
  { q: "photograpy", top: ["/passion/photography"] },
  { q: "camra", top: ["/passion/photography"] },
  { q: "carreer", top: ["/professional"] },
  { q: "religous", top: ["/passion/religious", "/talks"] },
  { q: "gosple", top: ["/passion/religious", "/talks"] },
  { q: "scrum", top: ["/professional"] },
  { q: "atonement", top: ["/talks/an-infinite-atonement"] },
  { q: "vanilla", top: ["/passion/vanilla"] },
  { q: "music", top: ["/passion/music"] }
];

function urls(hits) {
  return hits.map((hit) => hit.url);
}

function starts(url, prefixes) {
  return prefixes.some((prefix) => url === prefix || url.startsWith(prefix + "/") || url.startsWith(prefix));
}

let failed = 0;
const rows = [];
console.log("| Query | Top results | Pass |");
console.log("| --- | --- | --- |");
for (const item of cases) {
  const hits = runSearch(mini, item.q);
  const list = urls(hits);
  const topUrl = list[0] || "(none)";
  const topOk = list.length > 0 && starts(list[0], item.top);
  let alsoOk = true;
  if (item.also) {
    const window = list.slice(0, item.within || 6);
    alsoOk = window.some((url) => url.includes(item.also));
  }
  const banned = list.some((url) => forbidden.some((bit) => url.includes(bit)));
  const pass = topOk && alsoOk && !banned;
  if (!pass) failed += 1;
  const shown = list.slice(0, 4).map((url, i) => {
    const hit = hits[i];
    return url + " (" + Math.round(hit.score) + ")";
  }).join(", ");
  const note = pass ? "pass" : "FAIL";
  rows.push({ q: item.q, shown, note, list });
  console.log("| " + item.q + " | " + (shown || "(none)") + " | " + note + " |");
}

if (failed) {
  console.error("\n" + failed + " search queries failed");
  process.exit(1);
}
console.log("\n" + cases.length + " queries passed");
