/* Search shell, reading progress, back to top, scramble text, scroll reveal.
   The search index and MiniSearch load on first focus. */
(function () {
  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    reduce = false;
  }

  var REVEAL = [
    "#personal .crew-card",
    ".photo-wall button",
    ".print-card",
    ".print-frame",
    ".games-page .shelf",
    ".music-page .shelf ~ .shelf",
    ".read-page .shelf ~ .shelf",
    ".teach-card",
    ".wd-project:nth-child(n+3)",
    ".vanilla-row",
    ".nas-stack-row",
    ".nas-skills",
    "#professional .timeline-hud",
    "#professional .mobile-timeline",
    ".collection-card:nth-child(n+4)",
    ".talk .notes",
    ".band ~ .band",
    ".faq-block",
    ".next-block",
    ".shoot .intro-split",
    ".shoot .pair-match",
    ".shoot .feature",
    ".shoot .split"
  ].join(",");

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function bootBlocking() {
    var boot = document.getElementById("crt-boot");
    if (!boot) return false;
    var root = document.documentElement;
    if (root.classList.contains("boot-skip") || root.classList.contains("boot-clear")) return false;
    return !boot.classList.contains("is-done");
  }

  function typingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return !!el.isContentEditable;
  }

  document.addEventListener("keydown", function (event) {
    var key = event.key;
    var command = (event.metaKey || event.ctrlKey) && !event.altKey && key.toLowerCase() === "k";
    var slash = key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey;
    if (!command && !slash) return;
    if (bootBlocking()) return;
    if (slash && typingTarget(event.target)) return;
    var input = document.getElementById("site-search");
    if (!input) return;
    event.preventDefault();
    input.focus();
    if (typeof input.select === "function") input.select();
  }, true);

  ready(function () {
    setupSearch();
    setupProgress();
    setupToTop();
    setupScramble();
    setupReveal();
  });

  function setupSearch() {
    var input = document.getElementById("site-search");
    var list = document.getElementById("site-search-list");
    var form = input && input.closest("form");
    var status = form && form.querySelector(".site-search-status");
    var kbd = form && form.querySelector(".site-search-kbd");
    if (!input || !list || !form) return;

    if (kbd && /Mac|iPhone|iPad/i.test(navigator.userAgent || "")) kbd.textContent = "⌘K";

    var engine = null;
    var timer = 0;
    var ticket = 0;
    var active = -1;

    function loadEngine() {
      if (!engine) engine = import("/js/site-search-engine.mjs?v=1");
      return engine;
    }

    function setStatus(text) {
      if (status) status.textContent = text || "";
    }

    function closeList() {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      active = -1;
    }

    function openList() {
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    function options() {
      return list.querySelectorAll('[role="option"]');
    }

    function setActive(index) {
      var items = options();
      if (!items.length) {
        active = -1;
        input.removeAttribute("aria-activedescendant");
        return;
      }
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      active = index;
      for (var i = 0; i < items.length; i += 1) {
        items[i].setAttribute("aria-selected", i === active ? "true" : "false");
      }
      input.setAttribute("aria-activedescendant", items[active].id);
      if (items[active].scrollIntoView) items[active].scrollIntoView({ block: "nearest" });
    }

    function highlight(node, text, query) {
      var terms = String(query || "").toLowerCase().match(/[a-z0-9]{2,}/g) || [];
      if (!terms.length) {
        node.textContent = text;
        return;
      }
      var pattern = new RegExp("(" + terms.map(function (term) {
        return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }).join("|") + ")", "ig");
      var bits = String(text || "").split(pattern);
      for (var i = 0; i < bits.length; i += 1) {
        if (!bits[i]) continue;
        var lower = bits[i].toLowerCase();
        var marked = false;
        for (var t = 0; t < terms.length; t += 1) {
          if (lower === terms[t]) marked = true;
        }
        if (marked) {
          var mark = document.createElement("mark");
          mark.textContent = bits[i];
          node.appendChild(mark);
        } else {
          node.appendChild(document.createTextNode(bits[i]));
        }
      }
    }

    function showNote(text) {
      list.replaceChildren();
      var item = document.createElement("li");
      item.className = "site-search-note";
      item.setAttribute("role", "presentation");
      item.textContent = text;
      list.appendChild(item);
      openList();
      setStatus(text);
      active = -1;
      input.removeAttribute("aria-activedescendant");
    }

    function render(hits, query) {
      list.replaceChildren();
      if (!hits.length) {
        showNote("No matches");
        return;
      }
      for (var i = 0; i < hits.length; i += 1) {
        var hit = hits[i];
        var link = document.createElement("a");
        link.id = "site-search-opt-" + i;
        link.href = hit.url || "/";
        link.setAttribute("role", "option");
        link.setAttribute("aria-selected", i === 0 ? "true" : "false");
        var section = document.createElement("span");
        section.className = "site-search-section";
        section.textContent = hit.section || "Page";
        var title = document.createElement("span");
        title.className = "site-search-title";
        highlight(title, hit.title || hit.url, query);
        link.append(section, title);
        if (hit.excerpt) {
          var excerpt = document.createElement("span");
          excerpt.className = "site-search-excerpt";
          excerpt.textContent = hit.excerpt;
          link.appendChild(excerpt);
        }
        list.appendChild(link);
      }
      active = 0;
      input.setAttribute("aria-activedescendant", "site-search-opt-0");
      openList();
      setStatus(hits.length + (hits.length === 1 ? " result" : " results"));
    }

    function go(href) {
      if (href) location.href = href;
    }

    function schedule() {
      window.clearTimeout(timer);
      var query = input.value.trim();
      var mine = ++ticket;
      if (query.length < 2) {
        closeList();
        setStatus("");
        return;
      }
      setStatus("Searching");
      showNote("Searching");
      timer = window.setTimeout(function () {
        loadEngine().then(function (mod) {
          return mod.search(query);
        }).then(function (hits) {
          if (mine !== ticket || input.value.trim() !== query) return;
          render(hits, query);
        }).catch(function () {
          if (mine !== ticket) return;
          showNote("Search is unavailable");
        });
      }, 70);
    }

    input.addEventListener("focus", function () {
      loadEngine();
      if (input.value.trim().length >= 2) schedule();
    });
    input.addEventListener("input", schedule);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var items = options();
      var chosen = items[active] || items[0];
      if (chosen) go(chosen.getAttribute("href"));
    });
    list.addEventListener("mousedown", function (event) {
      if (event.target.closest && event.target.closest("a")) event.preventDefault();
    });
    input.addEventListener("keydown", function (event) {
      var items = options();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (list.hidden) {
          if (input.value.trim().length >= 2) schedule();
          return;
        }
        setActive(active + 1);
      } else if (event.key === "ArrowUp") {
        if (list.hidden) return;
        event.preventDefault();
        setActive(active - 1);
      } else if (event.key === "Home" && !list.hidden) {
        event.preventDefault();
        setActive(0);
      } else if (event.key === "End" && !list.hidden) {
        event.preventDefault();
        setActive(items.length - 1);
      } else if (event.key === "Enter") {
        var chosen = items[active] || items[0];
        if (chosen && !list.hidden) {
          event.preventDefault();
          go(chosen.getAttribute("href"));
        }
      } else if (event.key === "Escape") {
        if (!list.hidden) {
          event.preventDefault();
          event.stopPropagation();
          closeList();
        } else {
          input.blur();
        }
      }
    });
    document.addEventListener("pointerdown", function (event) {
      if (!form.contains(event.target)) closeList();
    });
  }

  function setupProgress() {
    var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    var talk = path === "/talks" || path.indexOf("/talks/") === 0;
    var religious = path === "/passion/religious" || path === "/passion/religious.html";
    if (!talk && !religious) return;
    var bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var supported = window.CSS && (
      CSS.supports("animation-timeline: scroll(root)") ||
      CSS.supports("animation-timeline: scroll()")
    );
    if (supported) {
      bar.classList.add(CSS.supports("animation-timeline: scroll(root)") ? "is-scroll-root" : "is-scroll");
      return;
    }
    var onScroll = function () {
      var root = document.documentElement;
      var max = root.scrollHeight - root.clientHeight;
      var amount = max > 0 ? root.scrollTop / max : 0;
      bar.style.transform = "scaleX(" + amount + ")";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupToTop() {
    var sentinel = document.createElement("div");
    sentinel.className = "to-top-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    document.body.prepend(sentinel);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "to-top";
    button.setAttribute("aria-label", "Back to top");
    button.hidden = true;
    button.appendChild(document.createComment(" From Uiverse.io by vinodjangid07 "));
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("aria-hidden", "true");
    var icon = document.createElementNS("http://www.w3.org/2000/svg", "path");
    icon.setAttribute("d", "M6 14.5 12 8.5l6 6");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "2.2");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    svg.appendChild(icon);
    button.appendChild(svg);
    document.body.appendChild(button);

    if (typeof IntersectionObserver === "function") {
      var watcher = new IntersectionObserver(function (entries) {
        button.hidden = entries[0].isIntersecting;
      });
      watcher.observe(sentinel);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  function setupScramble() {
    if (reduce) return;
    var nodes = document.querySelectorAll("[data-scramble]");
    if (!nodes.length) return;
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    function arm(el) {
      var text = (el.getAttribute("aria-label") || el.textContent || "").trim();
      if (!text || el.getAttribute("data-scramble-done") === "1") return;
      var started = false;
      var watcher = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        el.setAttribute("data-scramble-done", "1");
        watcher.disconnect();
        run(el, text);
      }, { threshold: 0.6 });
      watcher.observe(el);
    }

    function run(el, text) {
      el.setAttribute("aria-label", text);
      var sr = document.createElement("span");
      sr.className = "scramble-sr";
      sr.textContent = text;
      var visual = document.createElement("span");
      visual.className = "scramble-visual";
      visual.setAttribute("aria-hidden", "true");
      visual.textContent = text;
      el.textContent = "";
      el.append(sr, visual);
      var frame = 0;
      var timer = window.setInterval(function () {
        var shown = "";
        for (var i = 0; i < text.length; i += 1) {
          var ch = text.charAt(i);
          if (ch === " " || /[^\w]/.test(ch) || frame > i * 3) shown += ch;
          else shown += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        visual.textContent = shown;
        frame += 1;
        if (frame > text.length * 3 + 2) {
          window.clearInterval(timer);
          visual.textContent = text;
        }
      }, 32);
    }

    function start() {
      for (var i = 0; i < nodes.length; i += 1) arm(nodes[i]);
    }

    var root = document.documentElement;
    var boot = document.getElementById("crt-boot");
    if (!boot || root.classList.contains("boot-clear") || root.classList.contains("boot-skip")) {
      start();
      return;
    }
    var bootWatch = new MutationObserver(function () {
      if (root.classList.contains("boot-clear") || root.classList.contains("boot-skip")) {
        bootWatch.disconnect();
        start();
      }
    });
    bootWatch.observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  function setupReveal() {
    if (!document.documentElement.classList.contains("js")) return;
    if (typeof IntersectionObserver !== "function") return;
    var nodes = document.querySelectorAll(REVEAL);
    if (!nodes.length) return;
    var watcher = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i += 1) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add("is-in");
        watcher.unobserve(entries[i].target);
      }
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    for (var n = 0; n < nodes.length; n += 1) watcher.observe(nodes[n]);
  }
})();
