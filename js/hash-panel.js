function panelFromHash() {
  return (location.hash || "").replace(/^#/, "");
}

function setPanelHash(id) {
  const next =
    !id || id === "landing"
      ? location.pathname + location.search
      : location.pathname + location.search + "#" + id;
  if (location.pathname + location.search + location.hash !== next) {
    history.replaceState(null, "", next);
  }
}

function activatePanel(id) {
  const next = document.getElementById(id);
  if (!next || !next.classList.contains("panel")) return;
  document.querySelectorAll(".panel.active").forEach((panel) => {
    panel.classList.remove("active");
  });
  next.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const initial = panelFromHash();
  if (initial && initial !== "landing") activatePanel(initial);

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").replace(/^#/, "");
      setPanelHash(id);
    });
  });

  document.querySelectorAll(".panel .back-btn").forEach((btn) => {
    if (btn.tagName === "A") return;
    btn.addEventListener("click", () => setPanelHash("landing"));
  });
});
