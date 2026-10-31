/* Lazy search engine. Loaded on first focus, with MiniSearch and the index. */

let pending = null;

function libs() {
  if (!pending) {
    pending = Promise.all([
      import("/js/search-shared.mjs?v=1"),
      import("/js/vendor/minisearch-7.2.0.min.js"),
      fetch("/search-index.json?v=1").then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
    ]).then(function (parts) {
      var shared = parts[0];
      var MiniSearch = parts[1].default;
      return {
        shared: shared,
        mini: MiniSearch.loadJSON(parts[2], shared.miniSearchOptions())
      };
    });
  }
  return pending;
}

export function search(raw) {
  return libs().then(function (loaded) {
    return loaded.shared.runSearch(loaded.mini, raw);
  });
}
