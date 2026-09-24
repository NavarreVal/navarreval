(function () {
  var slot = document.querySelector("[data-uplink]");
  var uplink = slot && slot.querySelector(".uplink");
  var term = uplink && uplink.querySelector(".uplink-term");
  var ipEl = uplink && uplink.querySelector(".uplink-ip");
  var lockEl = uplink && uplink.querySelector(".uplink-lock");
  var source = document.getElementById("uplink-lines");
  if (!slot || !uplink || !term || !ipEl || !lockEl || !source) return;

  var raw = source.innerHTML || (source.content && source.content.textContent) || "";
  var listing = raw.replace(/^\s+/, "").replace(/\s+$/, "");
  if (!listing) return;

  var CHAR_MS = 48;
  var NL_MS = 88;
  var HOLD_MS = 700;
  var SCROLL_MS = 1600;
  var HEX_MS = 6400;
  var HEX_TICK = 48;
  var TRACE_MS = 6800;
  var TRACE_CHAR = 78;
  var typeWrite = 0;
  var i;
  for (i = 0; i < listing.length; i += 1) {
    typeWrite += listing.charAt(i) === "\n" ? NL_MS : CHAR_MS;
  }
  var typeDur = typeWrite + HOLD_MS + SCROLL_MS;

  var active = false;
  var raf = 0;
  var running = false;
  var lastNow = 0;
  var phase = "type";
  var elapsed = 0;
  var painted = null;
  var wantCursor = null;
  var hexRows = [];
  var hexAt = 0;
  var hexBuilt = -1;
  var traceAddr = "";

  function setActive(on) {
    if (active === on) return;
    active = on;
    slot.classList.toggle("is-paused", !on);
    if (on) startClock();
    else stopClock();
  }

  function startClock() {
    if (running) return;
    running = true;
    lastNow = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stopClock() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function frame(now) {
    if (!active || !uplink.isConnected) {
      running = false;
      raf = 0;
      return;
    }
    var dt = now - lastNow;
    lastNow = now;
    if (dt < 0) dt = 0;
    if (dt > 40) dt = 40;
    elapsed += dt;
    if (phase === "type") renderType();
    else if (phase === "hex") renderHex();
    else renderTrace();
    raf = requestAnimationFrame(frame);
  }

  function paint(text, cursor) {
    if (text === painted && cursor === wantCursor) return;
    painted = text;
    wantCursor = cursor;
    term.textContent = text || "";
    if (!cursor) return;
    var mark = document.createElement("span");
    mark.className = "uplink-cursor";
    term.appendChild(mark);
  }

  function nextHex() {
    var bytes = [];
    var n;
    for (n = 0; n < 6; n += 1) {
      bytes.push(("0" + (Math.random() * 256 | 0).toString(16)).slice(-2));
    }
    var off = ("000000" + hexAt.toString(16)).slice(-6);
    hexAt += 6;
    return off + "  " + bytes.join(" ");
  }

  function docIp() {
    var prefix = Math.random() < 0.5 ? "203.0.113." : "198.51.100.";
    return prefix + (1 + Math.floor(Math.random() * 254));
  }

  function renderType() {
    uplink.classList.remove("is-trace");
    lockEl.classList.remove("is-on");
    var t = 0;
    var count = 0;
    var n;
    for (n = 0; n < listing.length; n += 1) {
      var step = listing.charAt(n) === "\n" ? NL_MS : CHAR_MS;
      if (t + step > elapsed) break;
      t += step;
      count += 1;
    }
    paint(listing.slice(0, count), true);
    var after = elapsed - typeWrite;
    if (after < HOLD_MS) term.style.transform = "";
    else {
      var p = Math.min(1, (after - HOLD_MS) / SCROLL_MS);
      term.style.transform = "translateY(-" + (p * 110) + "%)";
    }
    if (elapsed >= typeDur) enterHex();
  }

  function visibleRows() {
    var stage = term.parentElement;
    var cs = getComputedStyle(term);
    var lh = parseFloat(cs.lineHeight);
    if (!lh) lh = parseFloat(cs.fontSize) * 1.35;
    var n = Math.round((stage.clientHeight || 0) / lh);
    if (n < 6) n = 6;
    if (n > 28) n = 28;
    return n;
  }

  function enterHex() {
    phase = "hex";
    elapsed = 0;
    hexRows = [];
    hexBuilt = -1;
    hexAt = (Math.random() * 4096) | 0;
    hexAt -= hexAt % 6;
    term.style.transform = "";
    painted = null;
  }

  function renderHex() {
    uplink.classList.remove("is-trace");
    term.style.transform = "";
    var ticks = Math.floor(elapsed / HEX_TICK);
    var n;
    if (hexBuilt < 0) {
      var rows = visibleRows();
      for (n = 0; n < rows; n += 1) hexRows.push(nextHex());
      hexBuilt = 0;
    }
    while (hexBuilt < ticks) {
      hexRows.shift();
      hexRows.push(nextHex());
      hexBuilt += 1;
    }
    paint(hexRows.join("\n"), false);
    if (elapsed >= HEX_MS) enterTrace();
  }

  function enterTrace() {
    phase = "trace";
    elapsed = 0;
    traceAddr = docIp();
    ipEl.textContent = "";
    lockEl.classList.remove("is-on");
    painted = null;
    term.style.transform = "";
  }

  function renderTrace() {
    uplink.classList.add("is-trace");
    var count = Math.min(traceAddr.length, Math.floor(elapsed / TRACE_CHAR));
    var shown = traceAddr.slice(0, count);
    if (ipEl.textContent !== shown) ipEl.textContent = shown;
    lockEl.classList.toggle("is-on", elapsed >= traceAddr.length * TRACE_CHAR + 340);
    if (elapsed >= TRACE_MS) {
      phase = "type";
      elapsed = 0;
      traceAddr = "";
      ipEl.textContent = "";
      lockEl.classList.remove("is-on");
      term.style.transform = "";
      painted = null;
    }
  }

  var seen = false;
  if ("IntersectionObserver" in window) {
    var watch = new IntersectionObserver(function (entries) {
      seen = !!(entries[0] && entries[0].isIntersecting);
      setActive(seen && !document.hidden);
    });
    watch.observe(slot);
  } else {
    seen = true;
  }

  document.addEventListener("visibilitychange", function () {
    setActive(seen && !document.hidden);
  });

  setActive(seen && !document.hidden);
})();
