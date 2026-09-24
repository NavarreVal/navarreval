// CRT boot for the landing dossier.
// Plays once per tab (sessionStorage nv-dossier-boot).
// Head script adds html.boot-skip for reduced motion, section redirects, and replays.
(function () {
  const root = document.documentElement;
  const boot = document.getElementById("crt-boot");

  if (!boot || root.classList.contains("boot-skip")) {
    if (boot) boot.remove();
    root.classList.add("boot-clear");
    return;
  }

  const log = document.getElementById("crt-log");
  const sr = document.getElementById("crt-sr");
  const lines = [
    { text: "Initializing", cps: 26, pause: 260 },
    { text: "Loading code", cps: 26, pause: 220 },
    { text: "> link navarreval", cps: 44, pause: 100 },
    { text: "> file NV-VAL-01", cps: 44, pause: 100 },
    { text: "> connection established", cps: 44, pause: 180 },
    { text: "ACCESS GRANTED", cps: 20, pause: 560, hot: true }
  ];

  let stopped = false;
  let finished = false;
  let cursorHold = null;

  function lockPage() {
    ["landing", "professional", "passion", "personal"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("inert", "");
    });
    const chrome = document.querySelector(".dossier-head");
    if (chrome) chrome.setAttribute("inert", "");
  }

  function unlockPage() {
    ["landing", "professional", "passion"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.removeAttribute("inert");
    });
    const chrome = document.querySelector(".dossier-head");
    if (chrome) chrome.removeAttribute("inert");
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      const timer = window.setTimeout(done, ms);
      const poll = window.setInterval(() => {
        if (stopped) done();
      }, 32);
      function done() {
        window.clearTimeout(timer);
        window.clearInterval(poll);
        resolve();
      }
    });
  }

  function makeCursor() {
    const cursor = document.createElement("span");
    cursor.className = "crt-cursor";
    cursor.setAttribute("aria-hidden", "true");
    return cursor;
  }

  function finish(skipped) {
    if (finished) return;
    finished = true;
    stopped = true;
    document.removeEventListener("keydown", onSkip, true);
    boot.removeEventListener("pointerdown", onSkip);
    try {
      sessionStorage.setItem("nv-dossier-boot", "1");
    } catch (err) {
      /* storage can be blocked; the boot still ends */
    }
    if (sr) sr.textContent = "Personal record ready";
    unlockPage();
    root.classList.add("boot-clear");
    if (!skipped && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("boot-live");
    }
    boot.classList.add("is-done");
    const removeBoot = () => {
      if (boot.parentNode) boot.remove();
    };
    boot.addEventListener("animationend", removeBoot, { once: true });
    window.setTimeout(removeBoot, 700);
  }

  function onSkip(event) {
    if (finished) return;
    if (event.type === "keydown") {
      const key = event.key;
      if (key === "Shift" || key === "Control" || key === "Alt" || key === "Meta") return;
      event.preventDefault();
    }
    finish(true);
  }

  async function run() {
    lockPage();
    document.addEventListener("DOMContentLoaded", lockPage);
    document.addEventListener("keydown", onSkip, true);
    boot.addEventListener("pointerdown", onSkip);

    const hold = document.createElement("div");
    hold.className = "crt-line";
    cursorHold = makeCursor();
    hold.appendChild(cursorHold);
    log.appendChild(hold);

    await sleep(560);
    if (stopped) return;

    for (const line of lines) {
      if (stopped) return;
      if (cursorHold && cursorHold.parentNode) cursorHold.remove();
      const row = document.createElement("div");
      row.className = line.hot ? "crt-line hot" : "crt-line";
      const text = document.createElement("span");
      const cursor = makeCursor();
      cursorHold = cursor;
      row.append(text, cursor);
      log.appendChild(row);

      const step = 1000 / line.cps;
      for (let i = 1; i <= line.text.length; i += 1) {
        if (stopped) return;
        text.textContent = line.text.slice(0, i);
        await sleep(step);
      }
      if (stopped) return;
      await sleep(line.pause);
    }

    if (!stopped) finish(false);
  }

  run().catch(() => finish(true));
})();
