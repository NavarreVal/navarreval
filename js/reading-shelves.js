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
    const image = httpUrl(typeof book.image === "string" ? book.image : "");
    if (image) {
      const img = el("img");
      img.alt = "";
      // Open Library answers 404 when default=false and it has no cover.
      img.onerror = function () {
        img.remove();
      };
      img.src = image;
      card.append(img);
    }
    const strong = el("strong");
    strong.textContent = typeof book.title === "string" ? book.title : "";
    const meta = el("span");
    const author = typeof book.author === "string" ? book.author : "";
    meta.textContent = author + starSuffix(book.rating);
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
