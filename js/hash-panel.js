function panelFromHash() {
  const id = (location.hash || "").replace(/^#/, "");
  if (id === "personal" || id === "passion" || id === "professional") return id;
  return "landing";
}

function currentPanelId() {
  const active = document.querySelector(".panel.active");
  return active ? active.id : "landing";
}

function directionFor(id) {
  if (id === "landing") return "top";
  const link = document.querySelector('.nav-link[href="#' + id + '"]');
  return link ? link.dataset.direction : null;
}

function showHistoryPanel(id) {
  if (id === currentPanelId()) return;
  if (typeof window.showSitePanel === "function") {
    window.showSitePanel(id, directionFor(id));
    return;
  }
  const next = document.getElementById(id);
  if (!next || !next.classList.contains("panel")) return;
  document.querySelectorAll(".panel.active").forEach((panel) => {
    panel.classList.remove("active");
  });
  next.classList.add("active");
}

function landingUrl() {
  return location.pathname + location.search;
}

document.addEventListener("DOMContentLoaded", () => {
  const initial = panelFromHash();
  if (initial !== "landing") showHistoryPanel(initial);

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").replace(/^#/, "");
      if (!id || id === "landing") return;
      const next = landingUrl() + "#" + id;
      // Compare the URL, not the active panel. The panel switch runs first and
      // would otherwise make this look like a no-op and skip the history entry.
      if (location.pathname + location.search + location.hash === next) return;
      // Section hashes are real destinations, so Back can return to the previous view.
      history.pushState({ panel: id }, "", next);
    });
  });

  document.querySelectorAll(".panel .back-btn").forEach((btn) => {
    if (btn.tagName === "A") return;
    btn.addEventListener("click", () => {
      // Pop a section entry this page pushed. A hash opened directly, or an
      // overlay sitting on top of one, is not its own trip — clear it in place.
      if (history.state && history.state.panel && history.state.panel !== "landing") {
        history.back();
        return;
      }
      if (location.hash) history.replaceState({ panel: "landing" }, "", landingUrl());
    });
  });

  window.addEventListener("popstate", () => {
    showHistoryPanel(panelFromHash());
  });
});
