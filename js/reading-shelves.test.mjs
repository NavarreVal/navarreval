import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  BOOKS_URL,
  PROFILE,
  WORKER,
  booksFromExport,
  booksFromRss,
  httpUrl,
  loadShelf,
  resetBooksFileCache,
  starSuffix,
} from "./reading-shelves.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function leaf(name, text) {
  return {
    tagName: name,
    localName: name,
    textContent: text,
    getElementsByTagName() {
      return [];
    },
  };
}

function parent(name, kids) {
  return {
    tagName: name,
    localName: name,
    textContent: "",
    getElementsByTagName(tag) {
      const out = [];
      for (const kid of kids) {
        if (kid.tagName === tag) out.push(kid);
        out.push(...kid.getElementsByTagName(tag));
      }
      return out;
    },
  };
}

function documentFrom(root, extra = []) {
  return {
    documentElement: root,
    getElementsByTagName(tag) {
      const out = [];
      if (root.tagName === tag) out.push(root);
      out.push(...root.getElementsByTagName(tag));
      for (const node of extra) {
        if (node.tagName === tag) out.push(node);
      }
      return out;
    },
  };
}

function rss(items) {
  const channel = parent("channel", items.map(fields => parent("item", fields.map(
    ([name, text]) => leaf(name, text)
  ))));
  return documentFrom(parent("rss", [channel]));
}

function createElement(tag) {
  const node = {
    tag,
    className: "",
    children: [],
    removed: false,
    attrs: {},
    _text: null,
  };
  Object.defineProperty(node, "textContent", {
    get() {
      if (node.children.length) {
        return node.children.map(child => (
          typeof child === "string" ? child : child.textContent
        )).join("");
      }
      return node._text == null ? "" : node._text;
    },
    set(value) {
      node._text = String(value);
      node.children = [];
    },
  });
  for (const name of ["href", "target", "rel", "src", "alt"]) {
    Object.defineProperty(node, name, {
      get() { return node.attrs[name] || ""; },
      set(value) { node.attrs[name] = String(value); },
    });
  }
  node.append = (...kids) => {
    node._text = null;
    node.children.push(...kids);
  };
  node.replaceChildren = (...kids) => {
    node._text = null;
    node.children = [...kids];
  };
  node.appendChild = (kid) => {
    node._text = null;
    node.children.push(kid);
    return kid;
  };
  node.remove = () => {
    node.removed = true;
  };
  return node;
}

function section(shelf, count) {
  const node = createElement("section");
  node.dataset = { shelf, count: String(count) };
  const status = createElement("p");
  status.className = "shelf-status";
  status.textContent = "Loading…";
  const grid = createElement("div");
  grid.className = "shelf-grid";
  node.append(status, grid);
  node.querySelector = (sel) => {
    if (sel === ".shelf-status") return status;
    if (sel === ".shelf-grid") return grid;
    return null;
  };
  return { node, status, grid };
}

function anchorIn(status) {
  return status.children.find(child => child && child.tag === "a");
}

async function withPage(fetchImpl, parserImpl, run) {
  const previous = {
    fetch: globalThis.fetch,
    DOMParser: globalThis.DOMParser,
    document: globalThis.document,
  };
  resetBooksFileCache();
  globalThis.fetch = fetchImpl;
  globalThis.DOMParser = parserImpl;
  globalThis.document = { createElement };
  try {
    await run();
  } finally {
    resetBooksFileCache();
    globalThis.fetch = previous.fetch;
    globalThis.DOMParser = previous.DOMParser;
    globalThis.document = previous.document;
  }
}

test("httpUrl keeps http(s) and drops other schemes", () => {
  assert.equal(httpUrl(""), "");
  assert.equal(httpUrl("javascript:alert(1)"), "");
  assert.equal(httpUrl("data:text/html,hi"), "");
  assert.equal(
    httpUrl("https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false"),
    "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false"
  );
  assert.equal(
    httpUrl("https://www.goodreads.com/book/show/61439040"),
    "https://www.goodreads.com/book/show/61439040"
  );
});

test("starSuffix accepts a rating of 1-5 and treats 0 as none", () => {
  assert.equal(starSuffix(0), "");
  assert.equal(starSuffix("0"), "");
  assert.equal(starSuffix(""), "");
  assert.equal(starSuffix(5), " · ★★★★★");
  assert.equal(starSuffix("3"), " · ★★★");
});

test("booksFromRss rejects a non-feed and keeps an empty channel", () => {
  const html = documentFrom(parent("html", []), [parent("parsererror", [])]);
  assert.equal(booksFromRss(html), null);
  assert.equal(booksFromRss(documentFrom(parent("html", []))), null);
  assert.equal(booksFromRss(documentFrom(parent("rss", []))), null);
  const broken = documentFrom(parent("rss", [parent("channel", [])]), [leaf("parsererror", "bad")]);
  assert.equal(booksFromRss(broken), null);
  assert.deepEqual(booksFromRss(rss([])), []);
  const books = booksFromRss(rss([[
    ["title", "  The Dispossessed  "],
    ["author_name", "Ursula K. Le Guin"],
    ["link", "https://www.goodreads.com/book/show/13651"],
    ["book_image_url", "https://i.gr-assets.com/example.jpg"],
    ["user_rating", "5"],
  ]]));
  assert.equal(books.length, 1);
  assert.equal(books[0].title, "The Dispossessed");
  assert.equal(books[0].author, "Ursula K. Le Guin");
  assert.equal(books[0].rating, "5");
  assert.equal(books[0].image, "https://i.gr-assets.com/example.jpg");
});

test("booksFromExport uses only a shelf the file actually has", () => {
  const data = {
    generated: "2026-11-01",
    shelves: {
      read: [
        { title: "A", author: "One", image: "", link: "https://example.com/a", rating: 4 },
        { title: "B", author: "Two", image: "", link: "https://example.com/b", rating: 0 },
      ],
    },
  };
  assert.equal(booksFromExport(data, "currently-reading"), null);
  assert.equal(booksFromExport(data, "favorites"), null);
  assert.equal(booksFromExport({ shelves: { read: "nope" } }, "read"), null);
  assert.deepEqual(booksFromExport(data, "read").map(book => book.title), ["A", "B"]);
  assert.deepEqual(booksFromExport({ shelves: { read: [] } }, "read"), []);
  assert.equal(booksFromExport(null, "read"), null);
});

test("a present JSON shelf renders up to data-count and skips the worker", async () => {
  const calls = [];
  const payload = {
    generated: "2026-11-01",
    shelves: {
      "currently-reading": [
        {
          title: "First",
          author: "Ada",
          image: "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false",
          link: "https://www.goodreads.com/book/show/1",
          rating: 5,
        },
        {
          title: "Second",
          author: "Bea",
          image: "javascript:alert(1)",
          link: "javascript:alert(1)",
          rating: 0,
        },
        { title: "Third", author: "Cy", image: "", link: "", rating: 2 },
      ],
    },
  };
  await withPage(async (url) => {
    calls.push(String(url));
    if (url === BOOKS_URL) {
      return { ok: true, status: 200, json: async () => payload, text: async () => "{}" };
    }
    throw new Error("worker should not be called");
  }, class {
    parseFromString() {
      throw new Error("parser should not be called");
    }
  }, async () => {
    const shelf = section("currently-reading", 2);
    await loadShelf(shelf.node);
    assert.deepEqual(calls, [BOOKS_URL]);
    assert.equal(shelf.status.removed, true);
    assert.equal(shelf.grid.children.length, 2);
    assert.equal(shelf.grid.children[0].children[1].textContent, "First");
    assert.equal(shelf.grid.children[0].children[2].textContent, "Ada · ★★★★★");
    assert.equal(
      shelf.grid.children[0].children[0].attrs.src,
      "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false"
    );
    assert.equal(shelf.grid.children[1].attrs.href, undefined);
    assert.equal(shelf.grid.children[1].children[0].textContent, "Second");
    assert.equal(shelf.grid.children[1].children[1].textContent, "Bea");
  });
});

test("an empty JSON shelf stays empty instead of calling the worker", async () => {
  const calls = [];
  await withPage(async (url) => {
    calls.push(String(url));
    return {
      ok: true,
      status: 200,
      json: async () => ({ generated: "2026-11-01", shelves: { read: [] } }),
      text: async () => "{}",
    };
  }, class {}, async () => {
    const shelf = section("read", 24);
    await loadShelf(shelf.node);
    assert.deepEqual(calls, [BOOKS_URL]);
    assert.equal(shelf.status.removed, true);
    assert.equal(shelf.node.children.at(-1).textContent, "Nothing on this shelf right now.");
  });
});

test("a missing export falls back to the worker, and a non-RSS body is an error", async () => {
  const calls = [];
  await withPage(async (url) => {
    calls.push(String(url));
    if (url === BOOKS_URL) return { ok: false, status: 404, json: async () => ({}), text: async () => "" };
    return {
      ok: true,
      status: 200,
      json: async () => { throw new Error("html"); },
      text: async () => "<html><title>Page not found</title></html>",
    };
  }, class {
    parseFromString() {
      return documentFrom(parent("html", []), [leaf("parsererror", "not xml")]);
    }
  }, async () => {
    const one = section("read", 24);
    const two = section("favorites", 20);
    await Promise.all([loadShelf(one.node), loadShelf(two.node)]);
    assert.equal(calls.filter(url => url === BOOKS_URL).length, 1);
    assert.equal(calls.filter(url => url.startsWith(WORKER)).length, 2);
    for (const shelf of [one, two]) {
      assert.equal(shelf.status.removed, false);
      assert.equal(
        shelf.status.textContent,
        "Shelves are temporarily unavailable. See my shelves on Goodreads."
      );
      const link = anchorIn(shelf.status);
      assert.equal(link.attrs.href, PROFILE);
      assert.equal(link.attrs.target, "_blank");
      assert.equal(link.attrs.rel, "noopener");
      assert.equal(link.textContent, "See my shelves on Goodreads");
    }
  });
});

test("a worker error status and a real empty channel stay distinct", async () => {
  await withPage(async (url) => {
    if (url === BOOKS_URL) return { ok: false, status: 404, text: async () => "" };
    return { ok: false, status: 502, text: async () => "" };
  }, class {
    parseFromString() {
      throw new Error("should not parse");
    }
  }, async () => {
    const shelf = section("favorites", 20);
    await loadShelf(shelf.node);
    assert.equal(shelf.status.textContent.includes("See my shelves on Goodreads"), true);
    assert.equal(anchorIn(shelf.status).attrs.href, PROFILE);
  });

  await withPage(async (url) => {
    if (url === BOOKS_URL) return { ok: false, status: 404, text: async () => "" };
    return { ok: true, status: 200, text: async () => "<rss></rss>" };
  }, class {
    parseFromString() {
      return rss([]);
    }
  }, async () => {
    const shelf = section("read", 24);
    await loadShelf(shelf.node);
    assert.equal(shelf.status.removed, true);
    assert.equal(shelf.node.children.at(-1).textContent, "Nothing on this shelf right now.");
  });
});

test("the page and the CSP stay on text nodes and allow Open Library covers", () => {
  const html = fs.readFileSync(path.join(ROOT, "passion/reading.html"), "utf8");
  const source = fs.readFileSync(path.join(ROOT, "js/reading-shelves.js"), "utf8");
  const headers = fs.readFileSync(path.join(ROOT, "_headers"), "utf8");
  assert.equal(html.includes("innerHTML"), false);
  assert.equal(source.includes("innerHTML"), false);
  assert.equal(html.includes("/review/list/"), false);
  assert.equal(source.includes("/review/list/"), false);
  assert.match(html, /\/js\/reading-shelves\.js\?v=1/);
  const csp = headers.split("\n").find(line => line.includes("Content-Security-Policy-Report-Only"));
  assert.match(csp, /img-src[^;]*https:\/\/covers\.openlibrary\.org/);
});
