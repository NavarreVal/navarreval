/* Shared dossier header. Written during parse so every tabbed page
   shows the same mast, status line, section tabs, and site search. */
(function () {
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    reduceMotion = false;
  }
  if (!reduceMotion && typeof IntersectionObserver === "function") {
    document.documentElement.classList.add("js");
  }

  document.write('<link rel="stylesheet" href="/css/ui-extras.css?v=2">');

  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  var section = "record";
  if (path === "/professional" || path.indexOf("/professional/") === 0) section = "professional";
  else if (path === "/passion" || path.indexOf("/passion/") === 0) section = "passion";
  else if (path === "/personal" || path.indexOf("/personal/") === 0 || path === "/talks" || path.indexOf("/talks/") === 0) section = "personal";

  var theme = "crt";
  if (path === "/talks" || path.indexOf("/talks/") === 0) theme = "talks";
  else if (path.indexOf("/passion/photography") === 0 || path.indexOf("/passion/religious") === 0) theme = "paper";
  else if (path.indexOf("/passion/shooting") === 0) theme = "shoot";

  function tab(id, href, label) {
    var on = section === id;
    return '<a href="' + href + '"' + (on ? ' class="is-current" aria-current="page"' : "") + ">" + label + "</a>";
  }

  document.write(
    '<header class="dossier-head search-theme-' + theme + '">' +
      '<form class="dossier-search" role="search" action="/" novalidate>' +
        '<div class="site-search-field">' +
          '<label class="site-search-label" for="site-search">Search all</label>' +
          '<input id="site-search" class="site-search-input" type="search" name="q" placeholder="Search all" aria-label="Search all" role="combobox" aria-expanded="false" aria-controls="site-search-list" aria-autocomplete="list" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search">' +
          '<kbd class="site-search-kbd" aria-hidden="true">Ctrl K</kbd>' +
          '<ul id="site-search-list" class="site-search-list" role="listbox" hidden></ul>' +
        "</div>" +
        '<p class="site-search-status" role="status"></p>' +
      "</form>" +
      '<div class="dossier-mast">' +
        '<div class="mast-brand">' +
          '<a class="dossier-mark" href="/" aria-label="Navarre Valdivieso, home">' +
            '<img src="/assets/signature.png?v=2" alt="">' +
          "</a>" +
          '<div class="mast-title">' +
            '<p class="mast-system">NavarreVal Personal Record</p>' +
            '<p class="mast-file">File <span>NV-VAL-01</span></p>' +
          "</div>" +
        "</div>" +
        '<ul class="mast-status" aria-label="Link status">' +
          '<li><i class="led on" aria-hidden="true"></i> Standby</li>' +
          '<li><i class="led" aria-hidden="true"></i> Connection established</li>' +
          '<li><i class="led" aria-hidden="true"></i> Record live</li>' +
        "</ul>" +
      "</div>" +
      '<div class="dossier-nav">' +
        '<nav class="dossier-tabs" aria-label="Record sections">' +
          tab("record", "/", "Record") +
          tab("professional", "/professional/", "Professional") +
          tab("passion", "/passion/", "Passion") +
          tab("personal", "/personal/", "Personal") +
        "</nav>" +
        '<div class="dossier-social">' +
          '<a href="https://www.linkedin.com/in/NavarreVal" target="_blank" rel="noopener" title="LinkedIn">' +
            '<img src="/images/icons/linkedin.svg" alt="LinkedIn">' +
          "</a>" +
          '<a href="https://github.com/NavarreVal" target="_blank" rel="noopener" title="GitHub">' +
            '<img src="/images/icons/github.svg" alt="GitHub">' +
          "</a>" +
          '<a href="https://uintahvalley.com" target="_blank" rel="noopener" title="Uintah Valley">' +
            '<img src="/images/icons/globe.svg" alt="Uintah Valley">' +
          "</a>" +
        "</div>" +
      "</div>" +
    "</header>"
  );

  document.write('<script src="/js/ui-extras.js?v=1" defer></' + "script>");
})();
