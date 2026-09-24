function panelFromHash() {
  const id = (location.hash || "").replace(/^#/, "");
  if (id === "personal") return id;
  return "landing";
}

function directionFor(id) {
  const link = document.querySelector('[data-panel][href="#' + id + '"]');
  return link ? link.dataset.direction : null;
}

function showHistoryPanel(id) {
  if (typeof window.showSitePanel !== "function") return;
  if (id === "personal") {
    const personal = document.getElementById("personal");
    if (personal && personal.classList.contains("active")) return;
    window.showSitePanel("personal", directionFor(id));
    window.scrollTo(0, 0);
    return;
  }
  window.showSitePanel(id, directionFor(id));
}

function landingUrl() {
  return location.pathname + location.search;
}

document.addEventListener("DOMContentLoaded", () => {
  const initial = panelFromHash();
  if (initial !== "landing") showHistoryPanel(initial);

  document.querySelectorAll("[data-panel]").forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const id = href.replace(/^#/, "");
      if (!id || id === "landing") return;
      const next = landingUrl() + "#" + id;
      // Compare the URL, not the active panel. The panel switch runs first and
      // would otherwise make this look like a no-op and skip the history entry.
      if (location.pathname + location.search + location.hash === next) return;
      // Section hashes are real destinations, so Back can return to the previous view.
      history.pushState({ panel: id }, "", next);
    });
  });

  document.querySelectorAll(".back-btn").forEach((btn) => {
    if (btn.tagName === "A") return;
    btn.addEventListener("click", () => {
      // Pop a section entry this page pushed. A hash opened directly, or an
      // overlay sitting on top of one, is not its own trip — clear it in place.
      if (history.state && history.state.panel && history.state.panel !== "landing") {
        history.back();
        return;
      }
      if (location.hash) history.replaceState({ panel: "landing" }, "", landingUrl());
      if (typeof window.showSitePanel === "function") window.showSitePanel("landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  window.addEventListener("popstate", () => {
    showHistoryPanel(panelFromHash());
  });
});
