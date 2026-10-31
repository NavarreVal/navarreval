/* Shared by the index build, the node test, and the lazy browser engine.
   Keep processTerm identical at index time and query time. */

const STOP = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "were",
  "have", "has", "you", "your", "but", "not", "its", "his", "her", "our",
  "they", "them", "what", "when", "who", "how", "all", "can", "will", "just",
  "about", "into", "than", "then", "also", "been", "their", "there", "would",
  "could", "should", "because", "while", "where", "which", "some", "such",
  "only", "other", "more", "most", "very", "over", "under", "after", "before",
  "being", "does", "did", "had", "any", "each", "via", "out", "get", "got"
]);

export function stem(term) {
  let t = term;
  if (t.length > 4 && t.endsWith("ies")) t = t.slice(0, -3) + "y";
  else if (t.length > 4 && /(ches|shes|xes|zes|sses)$/.test(t)) t = t.slice(0, -2);
  else if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us") && !t.endsWith("is")) {
    t = t.slice(0, -1);
  }
  return t;
}

export function processTerm(term) {
  const raw = String(term || "").toLowerCase();
  if (!raw || STOP.has(raw)) return null;
  const t = stem(raw);
  if (!t || t.length < 2 || STOP.has(t)) return null;
  return t;
}

export function miniSearchOptions() {
  return {
    fields: ["title", "lead", "headings", "keywords", "description", "body"],
    storeFields: ["title", "url", "section", "excerpt"],
    processTerm,
    searchOptions: {
      boost: { title: 12, lead: 9, headings: 3, keywords: 4, description: 2.5, body: 0.65 },
      prefix: (term) => term.length >= 2,
      fuzzy: (term) => (term.length <= 3 ? 0 : term.length <= 5 ? 1 : 2),
      combineWith: "OR",
      maxFuzzy: 2
    }
  };
}

const SPLIT = /[\n\r\p{Z}\p{P}]+/u;

export function buildQuery(raw) {
  const parts = String(raw || "").toLowerCase().split(SPLIT).filter(Boolean);
  const kept = parts.filter((part) => processTerm(part));
  if (!kept.length) return null;
  return {
    text: kept.join(" "),
    options: { combineWith: kept.length > 1 ? "AND" : "OR" }
  };
}

export function takeHits(hits, limit) {
  const cap = limit || 8;
  if (!hits || !hits.length) return [];
  const top = hits[0].score || 0;
  const floor = top * 0.22;
  const kept = [];
  for (let i = 0; i < hits.length && kept.length < cap; i += 1) {
    if (hits[i].score >= floor) kept.push(hits[i]);
  }
  return kept;
}

export function runSearch(miniSearch, raw) {
  const spec = buildQuery(raw);
  if (!spec) return [];
  return takeHits(miniSearch.search(spec.text, spec.options));
}
