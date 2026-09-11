(function injectSiteCredit() {
  function mount() {
    if (document.querySelector(".site-credit")) return;

    const credit = document.createElement("footer");
    credit.className = "site-credit";
    credit.setAttribute("role", "contentinfo");
    credit.innerHTML =
      'Built by <a href="https://navarreval.com/">Navarre</a> and The ' +
      '<a href="https://x.ai/bot" target="_blank" rel="noopener">Grok Bot</a> ' +
      "crew of the SS Argus - Gad Kyrath XO";

    // Home (full-viewport panels) and Passion stubs use slim chrome
    // so the line stays visible without colliding with Return / Top rows.
    if (document.querySelector("#landing, body > .panel")) {
      credit.classList.add("site-credit--chrome");
    }

    document.body.appendChild(credit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
