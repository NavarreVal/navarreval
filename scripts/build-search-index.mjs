/* Build /search-index.json from public HTML.
   Pages has no build step, so commit the generated file.
   Run: node scripts/build-search-index.mjs

   Indexed: pages reached from the public nav (home, Professional,
   Passion and its visible cards, Personal, Talks), plus /bucket-list/.
   The bucket-list page keeps its noindex robots meta (it stays out of
   Google). Only this on-site index should find it. Its stops live in
   destinations.js, so that visible copy is folded into the page body.
   Excluded: /passion/blog/*, the blog listing, other noindex pages,
   and /dnd/. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MiniSearch from "../js/vendor/minisearch-7.2.0/dist/es/index.js";
import { miniSearchOptions } from "../js/search-shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const concepts = JSON.parse(fs.readFileSync(path.join(ROOT, "data/search-concepts.json"), "utf8"));

const SECTIONS = {
  "/": "Record",
  "/professional": "Professional",
  "/passion": "Passion",
  "/personal": "Personal",
  "/talks": "Talks",
  "/passion/3d-printing": "3D Printing",
  "/passion/vanilla": "Vanilla",
  "/passion/photography": "Photography",
  "/passion/teaching": "Teaching",
  "/passion/religious": "Religious",
  "/passion/reading": "Reading",
  "/passion/writing": "Writing",
  "/passion/nas": "NAS",
  "/passion/web-design": "Web Design",
  "/passion/music": "Music",
  "/passion/shooting": "Shooting",
  "/passion/video-games": "Video Games",
  "/privacy": "Privacy",
  "/copyright": "Copyright",
  "/bucket-list": "Bucket List"
};

function isBlocked(urlPath) {
  const p = urlPath.length > 1 && urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;
  if (p === "/passion/blog" || p.startsWith("/passion/blog/")) return true;
  if (p === "/passion/blog-archive" || p.startsWith("/passion/blog-archive")) return true;
  if (p === "/dnd" || p.startsWith("/dnd/")) return true;
  if (p === "/404") return true;
  return false;
}

function siteSearchDespiteNoindex(urlPath) {
  const p = urlPath.length > 1 && urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;
  return p === "/bucket-list";
}

function isNoindex(html) {
  return /<meta\b[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(html)
    || /<meta\b[^>]*content\s*=\s*["'][^"']*noindex[^"']*["'][^>]*name\s*=\s*["']robots["']/i.test(html);
}

function decode(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(html) {
  return decode(String(html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function visibleHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<title[\s\S]*?<\/title>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ");
}

function ogDescription(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/\bproperty\s*=\s*["']og:description["']/i.test(tag)) continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (content) return decode(content[1]).replace(/\s+/g, " ").trim();
  }
  return "";
}

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!new RegExp("\\bname\\s*=\\s*[\"']" + name + "[\"']", "i").test(tag)) continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (content) return decode(content[1]).replace(/\s+/g, " ").trim();
  }
  return "";
}

function canonicalPath(html, fallback) {
  const link = html.match(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i);
  if (!link) return fallback;
  const href = link[0].match(/\bhref\s*=\s*["']([^"']+)["']/i);
  if (!href) return fallback;
  try {
    let p = new URL(href[1]).pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p || "/";
  } catch (err) {
    return fallback;
  }
}

function cleanTitle(title) {
  const cleaned = stripTags(title).replace(/\s*\|\s*J\.\s*Navarre Valdivieso\s*$/i, "").trim();
  return cleaned || "Page";
}

function urlToFile(urlPath) {
  const rel = urlPath === "/" ? "" : urlPath.replace(/^\//, "");
  const candidates = rel
    ? [rel, rel + ".html", path.posix.join(rel, "index.html")]
    : ["index.html"];
  for (const candidate of candidates) {
    const abs = path.join(ROOT, candidate);
    if (candidate.endsWith(".html") && fs.existsSync(abs) && fs.statSync(abs).isFile()) return candidate;
  }
  return null;
}

function resolveHref(href, fromFile) {
  if (!href) return null;
  const raw = href.trim();
  if (!raw || raw.startsWith("#") || /^mailto:/i.test(raw) || /^javascript:/i.test(raw)) return null;
  if (raw.startsWith("//")) return null;
  try {
    const dir = path.posix.dirname("/" + fromFile.replace(/\\/g, "/"));
    const base = "https://navarreval.com" + (dir.endsWith("/") ? dir : dir + "/");
    const url = new URL(raw, base);
    if (!/^https?:$/i.test(url.protocol)) return null;
    if (url.hostname !== "navarreval.com" && url.hostname !== "www.navarreval.com") return null;
    let p = decodeURIComponent(url.pathname);
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p || "/";
  } catch (err) {
    return null;
  }
}

function unescapeJsString(value) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\");
}

function quotedField(block, key) {
  const re = new RegExp("(?:^|[\\n,{])\\s*" + key + "\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"", "m");
  const match = block.match(re);
  return match ? unescapeJsString(match[1]) : "";
}

function quotedList(block, key) {
  const re = new RegExp("(?:^|[\\n,{])\\s*" + key + "\\s*:\\s*\\[([\\s\\S]*?)\\]", "m");
  const match = block.match(re);
  if (!match) return [];
  const bits = [];
  const str = /"((?:\\.|[^"\\])*)"/g;
  let item;
  while ((item = str.exec(match[1]))) bits.push(unescapeJsString(item[1]));
  return bits;
}

/* Stops are rendered from destinations.js, not the HTML shell.
   Index the copy a visitor actually sees. Skip notes: that field
   mirrors the sheet and is never shown. */
function bucketListText() {
  const js = fs.readFileSync(path.join(ROOT, "bucket-list/destinations.js"), "utf8");
  const start = js.indexOf("var DESTINATIONS = [");
  const end = js.indexOf("var LIVERIES", start);
  if (start < 0 || end < 0) return "";
  const bits = [];
  const hero = js.match(/var HERO_LINE = "((?:\\.|[^"\\])*)"/);
  if (hero) bits.push(unescapeJsString(hero[1]));
  for (const obj of js.slice(start, end).split(/\n    \{/)) {
    for (const key of ["name", "city", "category", "tagline", "alt"]) {
      const value = quotedField(obj, key);
      if (value) bits.push(value);
    }
    bits.push(...quotedList(obj, "facts"));
  }
  return bits.join(" ");
}

function timelineText() {
  const js = fs.readFileSync(path.join(ROOT, "js/main.js"), "utf8");
  const start = js.indexOf("const timelineEvents");
  if (start < 0) return "";
  const end = js.indexOf("let currentMode", start);
  const chunk = js.slice(start, end > start ? end : start + 80000);
  const bits = [];
  const re = /(?:title|label|role|desc):\s*"((?:\\.|[^"\\])*)"/g;
  let match;
  while ((match = re.exec(chunk))) {
    bits.push(match[1].replace(/\\n/g, " ").replace(/\\"/g, "\"").replace(/<[^>]+>/g, " "));
  }
  return bits.join(" ");
}

function conceptFor(url) {
  const page = (concepts.pages && concepts.pages[url]) || {};
  const extra = [];
  for (const row of concepts.inherit || []) {
    if (row.prefix && url.startsWith(row.prefix) && row.keywords) extra.push(row.keywords);
  }
  if (page.keywords) extra.push(page.keywords);
  return {
    lead: page.lead || "",
    keywords: extra.join(" ")
  };
}

function discover() {
  const queue = ["/", "/professional", "/passion", "/personal", "/bucket-list"];
  const seenFiles = new Set();
  const pages = [];
  const seenUrls = new Set();

  while (queue.length) {
    const startUrl = queue.shift();
    if (!startUrl || isBlocked(startUrl)) continue;
    const file = urlToFile(startUrl);
    if (!file || seenFiles.has(file)) continue;
    const html = fs.readFileSync(path.join(ROOT, file), "utf8");
    seenFiles.add(file);
    if (isNoindex(html) && !siteSearchDespiteNoindex(startUrl)) continue;
    const url = canonicalPath(html, startUrl);
    if (isBlocked(url) || seenUrls.has(url)) continue;
    seenUrls.add(url);

    const hrefs = html.match(/\bhref\s*=\s*["'][^"']+["']/gi) || [];
    for (const attr of hrefs) {
      const href = attr.match(/["']([^"']+)["']/)[1];
      const next = resolveHref(href, file);
      if (!next || isBlocked(next)) continue;
      queue.push(next);
    }

    const title = cleanTitle((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1]);
    const plain = visibleHtml(html);
    const headings = [];
    const headingRe = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
    let heading;
    while ((heading = headingRe.exec(plain))) headings.push(stripTags(heading[2]));
    let body = stripTags(plain).slice(0, 14000);
    if (url === "/professional") body = (body + " " + timelineText()).slice(0, 18000);
    if (url === "/bucket-list") body = (body + " " + bucketListText()).slice(0, 18000);
    const description = metaContent(html, "description") || ogDescription(html);
    const concept = conceptFor(url);
    pages.push({
      id: url,
      url,
      title,
      section: SECTIONS[url] || (url.startsWith("/talks/") ? "Talks" : "Page"),
      lead: concept.lead,
      headings: headings.join(" ").slice(0, 2000),
      keywords: concept.keywords,
      description,
      body,
      excerpt: (description || body).slice(0, 180)
    });
  }
  return pages;
}

const docs = discover().sort((a, b) => a.url.localeCompare(b.url));
const missing = Object.keys(concepts.pages).filter((url) => !docs.some((doc) => doc.url === url));
if (missing.length) {
  console.warn("Concept pages not in the crawl:", missing.join(", "));
}
const mini = new MiniSearch(miniSearchOptions());
mini.addAll(docs);
const out = path.join(ROOT, "search-index.json");
const serialized = mini.toJSON();
fs.writeFileSync(out, typeof serialized === "string" ? serialized : JSON.stringify(serialized));
console.log("Indexed " + docs.length + " pages -> search-index.json");
for (const doc of docs) console.log("  " + doc.url + "  [" + doc.section + "]  " + doc.title);
