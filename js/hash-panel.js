document.addEventListener("DOMContentLoaded", () => {
  const id = (location.hash || "").replace(/^#/, "");
  if (!id || id === "landing") return;
  const next = document.getElementById(id);
  if (!next || !next.classList.contains("panel")) return;

  document.querySelectorAll(".panel.active").forEach((panel) => {
    panel.classList.remove("active");
  });
  next.classList.add("active");
});
