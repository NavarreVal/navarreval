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

// Stable across reloads. The shelf walk nudges only when the previous book
// already took this index, so neighbors in a row do not share a cloth.
export function hashCoverIndex(title, author) {
  const text = title + "\n" + author;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % COVER_COLOR_COUNT;
}

export function assignCoverIndex(title, author, previousIndex) {
  const index = hashCoverIndex(title, author);
  if (previousIndex == null || index !== previousIndex) return index;
  return (index + 1) % COVER_COLOR_COUNT;
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

export function renderBooks(grid, books) {
  let previousIndex = null;
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
    const index = assignCoverIndex(text.title, text.author, previousIndex);
    previousIndex = index;
    const image = httpUrl(typeof book.image === "string" ? book.image : "");
    if (image) {
      const img = el("img");
      img.alt = text.title || text.author ? "" : "Book";
      img.setAttribute("data-cover", String(index));
      // Open Library answers 404 when default=false and it has no cover.
      // Append first so a synchronous error can swap the image in place.
      img.onerror = function () {
        const stored = Number(img.getAttribute("data-cover"));
        img.replaceWith(coverPlaceholder(book, stored));
      };
      card.append(img);
      img.src = image;
    } else {
      card.append(coverPlaceholder(book, index));
    }
    const strong = el("strong");
    strong.textContent = text.title;
    const meta = el("span");
    meta.textContent = text.author + starSuffix(book.rating);
    card.append(strong, meta);
    grid.appendChild(card);
  });
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

export function startReadingShelves() {
  const root = globalThis.document;
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll(".shelf").forEach(loadShelf);
}
