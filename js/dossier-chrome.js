/* Shared dossier header. Written during parse so every tabbed page
   shows the same mast, status line, and section tabs. */
(function () {
  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  var section = "record";
  if (path === "/professional" || path.indexOf("/professional/") === 0) section = "professional";
  else if (path === "/passion" || path.indexOf("/passion/") === 0) section = "passion";
  else if (path === "/personal" || path.indexOf("/personal/") === 0 || path === "/talks" || path.indexOf("/talks/") === 0) section = "personal";

  function tab(id, href, label) {
    var on = section === id;
    return '<a href="' + href + '"' + (on ? ' class="is-current" aria-current="page"' : "") + ">" + label + "</a>";
  }

  document.write(
    '<header class="dossier-head">' +
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
})();
