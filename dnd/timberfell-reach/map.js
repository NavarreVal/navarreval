(function () {
  // Zoom this many times past the fitted region map, with the view center
  // inside a town's area, and that town map replaces the region.
  var ENTER = 3.2;
  var REGION_SRC = "../maps/timberfell-reach.jpg";
  var REGION_ALT = "Region map of Timberfell Reach";
  var TOWNS = [
    { name: "Wardholm", src: "../maps/wardholm.jpg", area: [250, 420, 530, 630] },
    { name: "Deepwood", src: "../maps/deepwood.jpg", area: [180, 880, 430, 1060] },
    { name: "Sister's Rest", src: "../maps/sisters-rest.jpg", area: [460, 730, 720, 910] },
    { name: "Adara", src: "../maps/adara.jpg", area: [1400, 390, 1700, 610] },
    { name: "Gort", src: "../maps/gort.jpg", area: [1600, 640, 1800, 820] },
    { name: "Mullagh", src: "../maps/mullagh.jpg", area: [1280, 700, 1540, 910] },
    { name: "Silverfield", src: "../maps/silverfield.jpg", area: [1460, 940, 1820, 1180] },
    { name: "Greatstump", src: "../maps/greatstump.jpg", area: [800, 1120, 1120, 1360] },
    { name: "Wolfden", src: "../maps/wolfden.jpg", area: [1160, 1240, 1480, 1480] },
    { name: "Skymill", src: "../maps/skymill.jpg", area: [2000, 1400, 2340, 1660] },
    { name: "Kinbrace", src: "../maps/kinbrace.jpg", area: [1500, 1540, 1820, 1780] },
    { name: "Abbots Cove", src: "../maps/abbots-cove.jpg", area: [920, 1860, 1220, 2160] }
  ];

  var viewer = document.getElementById("viewer");
  var image = document.getElementById("map-image");
  var label = document.getElementById("viewer-label");

  var mode = "region";
  var town = null;
  var loading = false;
  var loadToken = 0;
  var imgW = 0;
  var imgH = 0;
  var scale = 1;
  var x = 0;
  var y = 0;
  var fitted = true;
  var anchor = null;
  var active = new Map();
  var drag = null;
  var pinch = null;

  function viewSize() {
    return { w: viewer.clientWidth, h: viewer.clientHeight };
  }

  function fitScale() {
    var v = viewSize();
    return Math.min(v.w / imgW, v.h / imgH);
  }

  function apply() {
    image.style.width = imgW + "px";
    image.style.height = imgH + "px";
    image.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) scale(" + scale + ")";
    var v = viewSize();
    anchor = { x: (v.w / 2 - x) / scale, y: (v.h / 2 - y) / scale };
  }

  function clampPan() {
    var v = viewSize();
    var dw = imgW * scale;
    var dh = imgH * scale;
    // Fitted zoom stays centered. Past that, keep the focal point and still
    // let edge towns reach the middle of a wide window.
    if (scale <= fitScale() * 1.001) {
      x = (v.w - dw) / 2;
      y = (v.h - dh) / 2;
      return;
    }
    if (dw <= v.w) {
      if (x < 0) x = 0;
      if (x > v.w - dw) x = v.w - dw;
    } else {
      var minX = v.w - dw - v.w * 0.35;
      var maxX = v.w * 0.35;
      if (x < minX) x = minX;
      if (x > maxX) x = maxX;
    }
    if (dh <= v.h) {
      if (y < 0) y = 0;
      if (y > v.h - dh) y = v.h - dh;
    } else {
      var minY = v.h - dh - v.h * 0.35;
      var maxY = v.h * 0.35;
      if (y < minY) y = minY;
      if (y > maxY) y = maxY;
    }
  }

  function fitImage() {
    var v = viewSize();
    scale = fitScale();
    x = (v.w - imgW * scale) / 2;
    y = (v.h - imgH * scale) / 2;
    fitted = true;
    image.style.visibility = "visible";
    apply();
  }

  function loadMap(src, alt, done) {
    var token = ++loadToken;
    image.alt = alt;
    image.onload = function () {
      if (token !== loadToken) return;
      imgW = image.naturalWidth;
      imgH = image.naturalHeight;
      done();
    };
    image.src = src;
    if (image.complete && image.naturalWidth && token === loadToken) {
      image.onload = null;
      imgW = image.naturalWidth;
      imgH = image.naturalHeight;
      done();
    }
  }

  function viewCenter() {
    var v = viewSize();
    return { x: (v.w / 2 - x) / scale, y: (v.h / 2 - y) / scale };
  }

  function townAt(px, py) {
    for (var i = 0; i < TOWNS.length; i++) {
      var area = TOWNS[i].area;
      if (px >= area[0] && px <= area[2] && py >= area[1] && py <= area[3]) return TOWNS[i];
    }
    return null;
  }

  function considerTownAt(px, py) {
    if (mode !== "region" || loading) return;
    if (scale < fitScale() * ENTER) return;
    var hit = townAt(px, py);
    if (hit) enterTown(hit);
  }

  function considerTown() {
    var c = viewCenter();
    considerTownAt(c.x, c.y);
  }

  function enterTown(next) {
    if (loading || mode === "town") return;
    loading = true;
    mode = "town";
    town = next;
    image.style.visibility = "hidden";
    loadMap(next.src, next.name + " town map", function () {
      loading = false;
      label.hidden = false;
      label.textContent = next.name;
      fitImage();
    });
  }

  function exitTown() {
    if (mode !== "town" || loading) return;
    var back = town;
    mode = "region";
    town = null;
    label.hidden = true;
    loading = true;
    pinch = null;
    drag = null;
    viewer.classList.remove("is-panning");
    image.style.visibility = "hidden";
    loadMap(REGION_SRC, REGION_ALT, function () {
      loading = false;
      var v = viewSize();
      scale = fitScale() * ENTER * 0.82;
      var cx = (back.area[0] + back.area[2]) / 2;
      var cy = (back.area[1] + back.area[3]) / 2;
      x = v.w / 2 - cx * scale;
      y = v.h / 2 - cy * scale;
      fitted = false;
      clampPan();
      image.style.visibility = "visible";
      apply();
    });
  }

  function zoomAt(cx, cy, next) {
    if (loading || !imgW) return;
    var min = fitScale();
    if (mode === "town" && next < min * 0.995) {
      exitTown();
      return;
    }
    var max = min * (mode === "town" ? 5 : 8);
    if (next < min) next = min;
    if (next > max) next = max;
    var wx = (cx - x) / scale;
    var wy = (cy - y) / scale;
    scale = next;
    x = cx - wx * scale;
    y = cy - wy * scale;
    fitted = false;
    clampPan();
    apply();
    if (mode === "region") considerTownAt(wx, wy);
  }

  function pinchZoom(midX, midY, next, wx, wy) {
    if (loading || !imgW) return;
    var min = fitScale();
    if (mode === "town" && next < min * 0.995) {
      exitTown();
      return;
    }
    var max = min * (mode === "town" ? 5 : 8);
    if (next < min) next = min;
    if (next > max) next = max;
    scale = next;
    x = midX - wx * scale;
    y = midY - wy * scale;
    fitted = false;
    clampPan();
    apply();
  }

  document.addEventListener("wheel", function (event) {
    if (event.target.closest && event.target.closest("a")) return;
    event.preventDefault();
    var rect = viewer.getBoundingClientRect();
    var dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    if (event.deltaMode === 2) dy *= viewSize().h;
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, scale * Math.exp(-dy * 0.0016));
  }, { passive: false });

  viewer.addEventListener("pointerdown", function (event) {
    if (loading) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    try { viewer.setPointerCapture(event.pointerId); } catch (err) { /* already released */ }
    active.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (active.size >= 2) {
      pinch = startPinch();
      drag = null;
      viewer.classList.remove("is-panning");
      return;
    }
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ox: x,
      oy: y,
      moved: false
    };
    viewer.classList.add("is-panning");
  });

  function startPinch() {
    var pts = Array.from(active.values());
    var rect = viewer.getBoundingClientRect();
    var mx = (pts[0].x + pts[1].x) / 2 - rect.left;
    var my = (pts[0].y + pts[1].y) / 2 - rect.top;
    return {
      dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
      scale: scale,
      wx: (mx - x) / scale,
      wy: (my - y) / scale
    };
  }

  viewer.addEventListener("pointermove", function (event) {
    if (!active.has(event.pointerId)) return;
    active.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (active.size >= 2 && pinch) {
      var pts = Array.from(active.values());
      var rect = viewer.getBoundingClientRect();
      var mx = (pts[0].x + pts[1].x) / 2 - rect.left;
      var my = (pts[0].y + pts[1].y) / 2 - rect.top;
      var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchZoom(mx, my, pinch.scale * (dist / pinch.dist), pinch.wx, pinch.wy);
      return;
    }
    if (!drag || drag.id !== event.pointerId) return;
    var dx = event.clientX - drag.x;
    var dy = event.clientY - drag.y;
    if (dx * dx + dy * dy > 16) drag.moved = true;
    x = drag.ox + dx;
    y = drag.oy + dy;
    fitted = false;
    clampPan();
    apply();
  });

  function endPointer(event) {
    var wasDrag = drag && drag.id === event.pointerId;
    var moved = wasDrag && drag.moved;
    var wasPinch = active.size >= 2;
    active.delete(event.pointerId);
    if (wasDrag) {
      drag = null;
      viewer.classList.remove("is-panning");
      if (moved && mode === "region") considerTown();
    }
    if (active.size < 2) {
      if (wasPinch && pinch && mode === "region") considerTownAt(pinch.wx, pinch.wy);
      pinch = null;
    }
    if (active.size === 1) {
      var id = active.keys().next().value;
      var point = active.get(id);
      drag = { id: id, x: point.x, y: point.y, ox: x, oy: y, moved: true };
      viewer.classList.add("is-panning");
    }
  }

  viewer.addEventListener("pointerup", endPointer);
  viewer.addEventListener("pointercancel", endPointer);

  window.addEventListener("resize", function () {
    if (loading || !imgW) return;
    if (fitted) {
      fitImage();
      return;
    }
    if (!anchor) return;
    var v = viewSize();
    var min = fitScale();
    if (scale < min) scale = min;
    x = v.w / 2 - anchor.x * scale;
    y = v.h / 2 - anchor.y * scale;
    clampPan();
    apply();
  });

  loadMap(REGION_SRC, REGION_ALT, function () {
    fitImage();
  });
})();
