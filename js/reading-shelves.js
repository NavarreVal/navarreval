// Reading shelves: /passion/books.json first, then the Goodreads worker.
// A non-RSS worker body is a failure, not an empty shelf.

export const PROFILE = "https://www.goodreads.com/user/show/12968726-navarre-valdivieso";
export const WORKER = "https://goodreads-shelves.navarreval.workers.dev";
export const BOOKS_URL = "/passion/books.json";

let booksFilePromise = null;

export function resetBooksFileCache() {
  booksFilePromise = null;
}

export function httpUrl(value) {
  if (typeof value !== "string" || !value) return "";
  try {
    const base = typeof location !== "undefined" && location.origin
      ? location.origin
      : "https://navarreval.com";
    const url = new URL(value, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch (err) {
    return "";
  }
}

export function starSuffix(rating) {
  const text = rating == null || rating === "" ? "" : String(rating);
  if (!/^[1-5]$/.test(text)) return "";
  return " · " + "★".repeat(Number(text));
}

export function tagText(parent, name) {
  const found = parent.getElementsByTagName(name)[0];
  return found && found.textContent ? found.textContent.trim() : "";
}

// null means the document is not a usable feed. [] is a real empty channel.
export function booksFromRss(xml) {
  if (!xml || typeof xml.getElementsByTagName !== "function") return null;
  if (xml.getElementsByTagName("parsererror").length) return null;
  const root = xml.documentElement;
  const rootName = root && String(root.localName || root.tagName || "").toLowerCase();
  if (rootName !== "rss") return null;
  if (!xml.getElementsByTagName("channel").length) return null;
  return Array.from(xml.getElementsByTagName("item")).map(item => ({
    title: tagText(item, "title"),
    author: tagText(item, "author_name"),
    image: tagText(item, "book_large_image_url")
      || tagText(item, "book_medium_image_url")
      || tagText(item, "book_image_url"),
    link: tagText(item, "link"),
    rating: tagText(item, "user_rating")
  }));
}

// null means this shelf is not in the file. [] means the shelf is present and empty.
export function booksFromExport(data, shelf) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const shelves = data.shelves;
  if (!shelves || typeof shelves !== "object" || Array.isArray(shelves)) return null;
  if (!Object.prototype.hasOwnProperty.call(shelves, shelf)) return null;
  const list = shelves[shelf];
  if (!Array.isArray(list)) return null;
  return list.filter(book => book && typeof book === "object");
}

function limited(books, count) {
  const limit = Number(count);
  if (!Number.isFinite(limit) || limit < 0) return books;
  return books.slice(0, limit);
}

function el(tag) {
  return globalThis.document.createElement(tag);
}

function profileAnchor(label) {
  const link = el("a");
  link.href = PROFILE;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = label;
  return link;
}

export function showUnavailable(status) {
  status.replaceChildren();
  status.append("Shelves are temporarily unavailable. ", profileAnchor("See my shelves on Goodreads"), ".");
}

function showEmpty(section) {
  const empty = el("p");
  empty.className = "shelf-status";
  empty.textContent = "Nothing on this shelf right now.";
  section.append(empty);
}

function bookText(book) {
  return {
    title: typeof book.title === "string" ? book.title : "",
    author: typeof book.author === "string" ? book.author : ""
  };
}

export const COVER_COLOR_COUNT = 10;
const COVER_MIN_TRACK = 140;

// FNV-1a over the title plus the author. The same book keeps the same
// preferred cloth across reloads.
export function hashCoverIndex(title, author) {
  const text = title + "\n" + author;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % COVER_COLOR_COUNT;
}

export function chooseCoverIndex(preferred, used) {
  if (!used || !used.has(preferred)) return preferred;
  for (let step = 1; step < COVER_COLOR_COUNT; step++) {
    const next = (preferred + step) % COVER_COLOR_COUNT;
    if (!used.has(next)) return next;
  }
  return preferred;
}

// columnCount is how many cards fit in one row. Every card in that row
// reserves a cloth, so a placeholder will not match another placeholder
// earlier in the same row, not only the card directly before it.
export function assignShelfColors(entries, columnCount) {
  const columns = Math.max(1, columnCount || entries.length || 1);
  const colors = new Array(entries.length);
  for (let i = 0; i < entries.length; i++) {
    const rowStart = i - (i % columns);
    const used = new Set();
    for (let j = rowStart; j < i; j++) used.add(colors[j]);
    colors[i] = chooseCoverIndex(
      hashCoverIndex(entries[i].title, entries[i].author),
      used
    );
  }
  return colors;
}

function columnCountFor(grid, cardCount) {
  const width = Number(grid && grid.clientWidth) || 0;
  if (!width) return Math.max(1, cardCount || 1);
  let gap = 16;
  if (typeof getComputedStyle === "function") {
    const parsed = parseFloat(getComputedStyle(grid).columnGap);
    if (Number.isFinite(parsed)) gap = parsed;
  }
  return Math.max(1, Math.floor((width + gap) / (COVER_MIN_TRACK + gap)));
}

function nodeList(node) {
  if (!node || !node.children) return [];
  return Array.from(node.children);
}

function coverParts(card) {
  const frame = nodeList(card).find(child => (
    child && String(child.className || "").includes("book-cover-frame")
  ));
  if (!frame) return null;
  const placeholder = nodeList(frame).find(child => (
    String(child.className || "").includes("book-placeholder")
  ));
  const img = nodeList(frame).find(child => child.tag === "img" || child.tagName === "IMG");
  const titleEl = nodeList(placeholder).find(child => (
    String(child.className || "").includes("book-placeholder-title")
  ));
  const authorEl = nodeList(placeholder).find(child => (
    String(child.className || "").includes("book-placeholder-author")
  ));
  return { placeholder, img, titleEl, authorEl };
}

export function recolorGrid(grid) {
  const cards = nodeList(grid).filter(child => (
    child && String(child.className || "").split(" ").includes("book")
  ));
  if (!cards.length) return;
  const entries = cards.map(card => {
    const parts = coverParts(card);
    return {
      title: parts && parts.titleEl ? parts.titleEl.textContent : "",
      author: parts && parts.authorEl ? parts.authorEl.textContent : ""
    };
  });
  const colors = assignShelfColors(entries, columnCountFor(grid, cards.length));
  cards.forEach((card, i) => {
    const parts = coverParts(card);
    if (parts && parts.placeholder) {
      parts.placeholder.setAttribute("data-cover", String(colors[i]));
    }
  });
}

// Same box as a real cover. The card already prints the title and author,
// so this stand-in is decorative when both of those are present.
export function coverPlaceholder(book, index) {
  const text = bookText(book);
  const cover = el("div");
  cover.className = "book-cover book-placeholder";
  const chosen = Number.isInteger(index) ? index : hashCoverIndex(text.title, text.author);
  cover.setAttribute("data-cover", String(chosen));
  const title = el("p");
  title.className = "book-placeholder-title";
  title.textContent = text.title;
  const author = el("p");
  author.className = "book-placeholder-author";
  author.textContent = text.author;
  cover.append(title, author);
  if (text.title && text.author) {
    cover.setAttribute("aria-hidden", "true");
  } else {
    const label = [text.title, text.author].filter(Boolean).join(", ") || "Book";
    cover.setAttribute("role", "img");
    cover.setAttribute("aria-label", label);
  }
  return cover;
}

function dropFailedCover(img, grid) {
  img.remove();
  recolorGrid(grid);
}

export function renderBooks(grid, books) {
  books.forEach(book => {
    const card = el("a");
    card.className = "book";
    const link = httpUrl(typeof book.link === "string" ? book.link : "");
    if (link) {
      card.href = link;
      card.target = "_blank";
      card.rel = "noopener";
    }
    const text = bookText(book);
    const frame = el("div");
    frame.className = "book-cover-frame";
    // The cloth sits under the image, so a slow or missing cover is never a blank box.
    frame.append(coverPlaceholder(book));
    const image = httpUrl(typeof book.image === "string" ? book.image : "");
    if (image) {
      const img = el("img");
      img.alt = text.title || text.author ? "" : "Book";
      img.onerror = function () {
        dropFailedCover(img, grid);
      };
      img.onload = function () {
        if (!img.naturalWidth) dropFailedCover(img, grid);
      };
      frame.append(img);
      img.src = image;
    }
    const strong = el("strong");
    strong.textContent = text.title;
    const meta = el("span");
    meta.textContent = text.author + starSuffix(book.rating);
    card.append(frame, strong, meta);
    grid.appendChild(card);
  });
  recolorGrid(grid);
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(function () {
      recolorGrid(grid);
    });
  }
}

function paint(section, status, grid, books) {
  status.remove();
  if (!books.length) {
    showEmpty(section);
    return;
  }
  renderBooks(grid, books);
}

function loadBooksFile() {
  if (!booksFilePromise) {
    booksFilePromise = globalThis.fetch(BOOKS_URL).then(async res => {
      if (!res.ok) return null;
      try {
        return await res.json();
      } catch (err) {
        return null;
      }
    }).catch(() => null);
  }
  return booksFilePromise;
}

async function loadWorker(section, status, grid, shelf, count) {
  const feed = WORKER + "?shelf=" + encodeURIComponent(shelf) + "&count=" + count;
  try {
    const res = await globalThis.fetch(feed);
    if (!res.ok) throw new Error(String(res.status));
    const xml = new globalThis.DOMParser().parseFromString(await res.text(), "text/xml");
    const books = booksFromRss(xml);
    if (books === null) throw new Error("feed");
    paint(section, status, grid, limited(books, count));
  } catch (err) {
    showUnavailable(status);
  }
}

export async function loadShelf(section) {
  const shelf = section.dataset.shelf;
  const count = section.dataset.count || "20";
  const status = section.querySelector(".shelf-status");
  const grid = section.querySelector(".shelf-grid");
  if (!status || !grid) return;

  try {
    const data = await loadBooksFile();
    const fromFile = booksFromExport(data, shelf);
    if (fromFile !== null) {
      paint(section, status, grid, limited(fromFile, count));
      return;
    }
  } catch (err) {
    // The export was unusable. Fall through to the worker.
  }

  await loadWorker(section, status, grid, shelf, count);
}

let resizeBound = false;

function bindCoverResize() {
  if (resizeBound || typeof window === "undefined") return;
  resizeBound = true;
  window.addEventListener("resize", function () {
    const root = globalThis.document;
    if (!root || typeof root.querySelectorAll !== "function") return;
    root.querySelectorAll(".shelf-grid").forEach(recolorGrid);
  });
}

export function startReadingShelves() {
  const root = globalThis.document;
  if (!root || typeof root.querySelectorAll !== "function") return;
  bindCoverResize();
  root.querySelectorAll(".shelf").forEach(loadShelf);
}
