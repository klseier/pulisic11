/* "On this day" → Instagram story (1080×1920), drawn in the browser.
   Hidden feature: press and hold the "On this day" tile for ~0.7 s. */
(function () {
  "use strict";
  var W = 1080, H = 1920, PAD = 90;
  var DISPLAY = '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
  var TEXT = '"Public Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
  var THEMES = {
    milan:  { bg: "#1D1A1B", fg: "#FFFFFF", accent: "#FF4B5F", muted: "rgba(255,255,255,.58)", dash: "rgba(255,255,255,.26)", corner: "#FF4B5F", ghost: "rgba(255,255,255,.06)", mark: "11", pat: "rgba(255,255,255,.028)", patKind: "none",
              stripe: function (c) { stripes(c, ["#C0182F", "#1D1A1B"], [70, 30]); } },
    usa:    { bg: "#1F3566", fg: "#FFFFFF", accent: "#FF6B7D", muted: "rgba(255,255,255,.64)", dash: "rgba(255,255,255,.28)", corner: "#FFFFFF", ghost: "rgba(255,255,255,.07)", mark: "★", pat: "rgba(255,255,255,.032)", patKind: "none",
              stripe: function (c) { stripes(c, ["#C0182F", "#FFFFFF"], [50, 50]); } },
    career: { bg: "#F6F3EE", fg: "#231F20", accent: "#C0182F", muted: "#7A736C", dash: "rgba(35,31,32,.24)", corner: "#231F20", ghost: "rgba(35,31,32,.05)", mark: "11", pat: "rgba(35,31,32,.014)", patKind: "none",
              stripe: function (c) { c.fillStyle = "#231F20"; c.fillRect(0, 0, W, 28); } }
  };
  function stripes(c, cols, widths) {
    for (var x = 0, i = 0; x < W; i++) { c.fillStyle = cols[i % 2]; c.fillRect(x, 0, widths[i % 2], 28); x += widths[i % 2]; }
  }
  // faint texture over the whole canvas; "none" | "diag" | "pin" | "dots"
  function pattern(c, th, kind) {
    if (kind === "none") return;
    c.save();
    c.strokeStyle = c.fillStyle = th.pat;
    if (kind === "diag") {
      c.lineWidth = 34;
      for (var x = -H; x < W + H; x += 120) { c.beginPath(); c.moveTo(x, H); c.lineTo(x + H * 0.58, 0); c.stroke(); }
    } else if (kind === "rossoneri") {
      // Milan shirt: wide vertical red bands, just visible on the black
      c.fillStyle = "rgba(192,24,47,.10)";
      for (var xr = 60; xr < W; xr += 240) c.fillRect(xr, 0, 120, H);
    } else if (kind === "usa") {
      // USA "Waldo" shirt / flag: wide horizontal bands, plus a faint field of stars in the top corner
      c.fillStyle = "rgba(255,255,255,.04)";
      for (var yr = 0; yr < H; yr += 220) c.fillRect(0, yr, W, 110);
      c.fillStyle = "rgba(255,255,255,.05)"; c.font = "400 34px " + TEXT; c.textAlign = "center"; c.textBaseline = "middle";
      for (var sy = 0; sy < 5; sy++) for (var sx = 0; sx < 6 - (sy % 2); sx++) c.fillText("★", W - 470 + sx * 80 + (sy % 2) * 40, 90 + sy * 70);
    } else if (kind === "pin") {
      for (var x2 = 0; x2 < W; x2 += 90) c.fillRect(x2 + 40, 0, 10, H);
    } else if (kind === "dots") {
      for (var y = 30; y < H; y += 36) for (var x3 = (y / 36 % 2) * 18; x3 < W; x3 += 36) { c.beginPath(); c.arc(x3, y, 4.5, 0, 6.29); c.fill(); }
    }
    c.restore();
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  // largest size (≤ max) at which the text fits in one line of the given width
  function fitSize(c, txt, font, max, min, width) {
    for (var s = max; s > min; s -= 2) { c.font = font(s); if (c.measureText(txt).width <= width) return s; }
    return min;
  }
  function wrap(c, txt, width) {
    var words = txt.split(/\s+/), lines = [], cur = "";
    words.forEach(function (w) {
      var test = cur ? cur + " " + w : w;
      if (c.measureText(test).width <= width || !cur) cur = test; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  var FRAME = { x: PAD, y: 560, w: W - 2 * PAD, h: 760 };
  // photo: { img, iw, ih, s (zoom ≥ 1 over "cover"), ox, oy (centre offset in canvas px) }
  function photoRect(ph) {
    var cover = Math.max(FRAME.w / ph.iw, FRAME.h / ph.ih), k = cover * ph.s;
    var dw = ph.iw * k, dh = ph.ih * k;
    return { w: dw, h: dh, x: FRAME.x + FRAME.w / 2 - dw / 2 + ph.ox, y: FRAME.y + FRAME.h / 2 - dh / 2 + ph.oy };
  }
  // keep the photo covering the whole frame: never an empty edge
  function clampPhoto(ph) {
    ph.s = Math.min(Math.max(ph.s, 1), 6);
    var cover = Math.max(FRAME.w / ph.iw, FRAME.h / ph.ih), k = cover * ph.s;
    var mx = (ph.iw * k - FRAME.w) / 2, my = (ph.ih * k - FRAME.h) / 2;
    ph.ox = Math.min(Math.max(ph.ox, -mx), mx); ph.oy = Math.min(Math.max(ph.oy, -my), my);
  }
  function draw(item, photo, target) {
    var CP = window.CP11, th = THEMES[item.type] || THEMES.career;
    var cv = target || document.createElement("canvas"); cv.width = W; cv.height = H;
    var c = cv.getContext("2d");
    c.fillStyle = th.bg; c.fillRect(0, 0, W, H);
    pattern(c, th, item.pattern || th.patKind);
    th.stripe(c);
    c.textBaseline = "alphabetic";

    // top: label, date (one line, always), "N years ago"
    var label = (item.title || CP.t("story.title")).toUpperCase();
    c.font = "800 40px " + TEXT; c.fillStyle = th.accent;
    if ("letterSpacing" in c) c.letterSpacing = "6px";
    c.fillText(label, PAD, 170);
    if ("letterSpacing" in c) c.letterSpacing = "0px";

    var dt = new Date(item.d + "T12:00:00Z"), loc = CP.locale();
    var dm = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: "UTC" }).format(dt).replace(".", "").toUpperCase() + " ";
    var yr = item.d.slice(0, 4);
    var dfont = function (s) { return "900 " + s + "px " + DISPLAY; };
    var ds = fitSize(c, dm + yr, dfont, 200, 90, W - 2 * PAD);
    c.font = dfont(ds);
    c.fillStyle = th.fg; c.fillText(dm, PAD, 190 + ds * 0.86);
    c.fillStyle = th.accent; c.fillText(yr, PAD + c.measureText(dm).width, 190 + ds * 0.86);
    var yrs = new Date().getFullYear() - +yr;
    c.font = "400 44px " + TEXT; c.fillStyle = th.muted;
    var agoTxt = yrs === 1 ? CP.t("otd.ago1") : CP.t("otd.ago", { n: yrs });
    c.fillText((item.week ? CP.t("otd.week") : CP.t("otd.today")) + " · " + agoTxt, PAD, 190 + ds * 0.86 + 70);

    // middle: empty frame for a photo or post (fixed position)
    var fx = FRAME.x, fy = FRAME.y, fw = FRAME.w, fh = FRAME.h;
    c.save(); rr(c, fx, fy, fw, fh, 40); c.clip();
    if (photo) {
      var pr = photoRect(photo);
      c.imageSmoothingQuality = "high";
      c.drawImage(photo.img, pr.x, pr.y, pr.w, pr.h);
    } else {
      c.fillStyle = th.ghost; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = th.mark === "★" ? "400 460px " + TEXT : "900 560px " + DISPLAY;
      c.fillText(th.mark, W / 2, fy + fh / 2 + (th.mark === "★" ? 10 : 30));
    }
    c.restore();
    c.textAlign = "left"; c.textBaseline = "alphabetic";
    if (!photo) { c.setLineDash([22, 16]); c.lineWidth = 5; c.strokeStyle = th.dash; rr(c, fx, fy, fw, fh, 40); c.stroke(); c.setLineDash([]); }
    c.lineWidth = 12; c.strokeStyle = th.corner; c.lineCap = "round";
    var L = 96, r = 40;
    [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]].forEach(function (k) {
      var x = k[0], y = k[1], sx = k[2], sy = k[3];
      c.beginPath(); c.moveTo(x, y + sy * L); c.lineTo(x, y + sy * r); c.arcTo(x, y, x + sx * r, y, r); c.lineTo(x + sx * L, y); c.stroke();
    });

    // bottom third: the fact, as large as fits between the frame and the footer
    var tx = PAD, ty = fy + fh + 90, tw = W - 2 * PAD, tmax = 1760 - ty, size = 76, lines;
    for (; size >= 40; size -= 2) {
      c.font = "600 " + size + "px " + TEXT; lines = wrap(c, item.text, tw);
      if (lines.length * size * 1.25 <= tmax) break;
    }
    c.fillStyle = th.fg;
    lines.forEach(function (ln, i) { c.fillText(ln, tx, ty + size + i * size * 1.25); });

    // footer
    c.font = "600 38px " + TEXT; c.fillStyle = th.muted; c.fillText("@c.pulisic11", PAD, 1850);
    c.font = "900 66px " + DISPLAY; var wCP = c.measureText("CP").width, w11 = c.measureText("11").width;
    c.fillStyle = th.fg; c.fillText("CP", W - PAD - wCP - w11, 1852);
    c.fillStyle = th.accent; c.fillText("11", W - PAD - w11, 1852);
    return cv;
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('900 100px "Big Shoulders Display"'),
      document.fonts.load('800 40px "Public Sans"'), document.fonts.load('600 40px "Public Sans"'), document.fonts.load('400 40px "Public Sans"')
    ]).catch(function () {});
  }

  // ---------- preview sheet: live canvas, optional photo you can drag and pinch inside the frame ----------
  var sheet = null, blobUrl = null, state = null;
  function close() {
    if (!sheet) return;
    sheet.remove(); sheet = null;
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    if (state && state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    state = null;
    document.documentElement.classList.remove("story-open");
    window.CP11.pauseOtd(false);
  }
  // the finished PNG is prepared after every change, so "Share" can hand it over at once (iOS wants that)
  var exportTimer = null;
  function scheduleExport() {
    clearTimeout(exportTimer);
    if (state) state.ready = false;
    exportTimer = setTimeout(function () {
      if (!state) return;
      var st = state;
      st.canvas.toBlob(function (blob) {
        if (!blob || st !== state) return;
        try { st.file = new File([blob], st.name, { type: "image/png" }); } catch (e) { st.file = null; }
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        blobUrl = URL.createObjectURL(blob);
        var a = sheet && sheet.querySelector("a.story-save");
        if (a) a.href = blobUrl;
        st.ready = true;
      }, "image/png");
    }, 250);
  }
  var raf = 0;
  function redraw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { if (state) { draw(state.item, state.photo, state.canvas); scheduleExport(); } });
  }
  function loadPhoto(file) {
    if (!file || !state) return;
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      if (!state) { URL.revokeObjectURL(url); return; }
      // big camera photos are scaled down once, so moving them stays smooth
      var iw = img.naturalWidth, ih = img.naturalHeight, src = img, max = 2400;
      if (Math.max(iw, ih) > max) {
        var k = max / Math.max(iw, ih), off = document.createElement("canvas");
        off.width = Math.round(iw * k); off.height = Math.round(ih * k);
        off.getContext("2d").drawImage(img, 0, 0, off.width, off.height);
        src = off; iw = off.width; ih = off.height;
      }
      if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
      state.photoUrl = url;
      state.photo = { img: src, iw: iw, ih: ih, s: 1, ox: 0, oy: 0 };
      sheet.classList.add("has-photo");
      redraw();
    };
    img.onerror = function () { URL.revokeObjectURL(url); };
    img.src = url;
  }
  // gestures on the preview: one finger / mouse drags, two fingers or the wheel zoom
  function bindGestures(cv) {
    var pts = {}, start = null;
    function toCanvas(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    function inFrame(p) { return p.x >= FRAME.x && p.x <= FRAME.x + FRAME.w && p.y >= FRAME.y && p.y <= FRAME.y + FRAME.h; }
    function snapshot() {
      var ids = Object.keys(pts), ph = state.photo;
      if (ids.length === 1) return { mode: 1, p: pts[ids[0]], ox: ph.ox, oy: ph.oy };
      var a = pts[ids[0]], b = pts[ids[1]];
      return { mode: 2, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, s: ph.s, ox: ph.ox, oy: ph.oy };
    }
    cv.addEventListener("pointerdown", function (e) {
      if (!state || !state.photo) return;
      var p = toCanvas(e);
      if (!Object.keys(pts).length && !inFrame(p)) return;
      cv.setPointerCapture(e.pointerId);
      pts[e.pointerId] = p; start = snapshot();
      e.preventDefault();
    });
    cv.addEventListener("pointermove", function (e) {
      if (!state || !state.photo || !pts[e.pointerId]) return;
      pts[e.pointerId] = toCanvas(e);
      var ph = state.photo, ids = Object.keys(pts);
      if (start.mode === 1 && ids.length === 1) {
        var p = pts[ids[0]];
        ph.ox = start.ox + (p.x - start.p.x); ph.oy = start.oy + (p.y - start.p.y);
      } else if (start.mode === 2 && ids.length >= 2) {
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        zoomAround(ph, start, start.s * d / start.d, start.m);
        ph.ox += m.x - start.m.x; ph.oy += m.y - start.m.y;
      }
      clampPhoto(ph); redraw();
    });
    function up(e) { if (pts[e.pointerId]) { delete pts[e.pointerId]; start = Object.keys(pts).length ? snapshot() : null; } }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", function (e) {
      if (!state || !state.photo) return;
      var p = toCanvas(e); if (!inFrame(p)) return;
      e.preventDefault();
      var ph = state.photo, base = { s: ph.s, ox: ph.ox, oy: ph.oy };
      zoomAround(ph, base, ph.s * Math.exp(-e.deltaY * 0.0015), p);
      clampPhoto(ph); redraw();
    }, { passive: false });
  }
  // zoom so that the point under the fingers stays where it is
  function zoomAround(ph, base, s, at) {
    s = Math.min(Math.max(s, 1), 6);
    var cx = FRAME.x + FRAME.w / 2, cy = FRAME.y + FRAME.h / 2, f = s / base.s;
    ph.s = s;
    ph.ox = (at.x - cx) - (at.x - cx - base.ox) * f;
    ph.oy = (at.y - cy) - (at.y - cy - base.oy) * f;
  }
  function open() {
    var CP = window.CP11, item = CP && CP.otd();
    if (!item || sheet) return;
    CP.pauseOtd(true);
    fontsReady().then(function () {
      var name = "pulisic-" + item.d + ".png";
      var canShare = false;
      try { canShare = !!(navigator.canShare && navigator.canShare({ files: [new File([new Blob(["x"], { type: "image/png" })], name, { type: "image/png" })] })); } catch (e) {}
      sheet = document.createElement("div");
      sheet.className = "story-sheet";
      sheet.innerHTML =
        '<div class="story-box" role="dialog" aria-modal="true">' +
          '<button class="story-x" type="button" aria-label="' + CP.t("story.close") + '">×</button>' +
          '<canvas class="story-img"></canvas>' +
          '<p class="story-tip">' + CP.t("story.tip") + "</p>" +
          '<div class="story-btns">' +
            '<label class="story-btn story-pick">' + CP.t("story.photo") + '<input type="file" accept="image/*" hidden></label>' +
            '<button class="story-btn story-reset" type="button">' + CP.t("story.reset") + "</button>" +
            (canShare ? '<button class="story-btn story-go story-share" type="button">' + CP.t("story.share") + "</button>" : "") +
            '<a class="story-btn story-save' + (canShare ? "" : " story-go") + '" href="#" download="' + name + '">' + CP.t("story.save") + "</a>" +
          "</div>" +
        "</div>";
      document.body.appendChild(sheet);
      document.documentElement.classList.add("story-open");
      var cv = sheet.querySelector("canvas");
      state = { item: item, canvas: cv, photo: null, name: name, file: null, ready: false };
      draw(item, null, cv); scheduleExport(); bindGestures(cv);
      sheet.addEventListener("click", function (e) { if (e.target === sheet || e.target.classList.contains("story-x")) close(); });
      sheet.querySelector("input[type=file]").addEventListener("change", function (e) { loadPhoto(e.target.files && e.target.files[0]); e.target.value = ""; });
      sheet.querySelector(".story-reset").addEventListener("click", function () {
        if (!state || !state.photo) return;
        state.photo.s = 1; state.photo.ox = 0; state.photo.oy = 0; redraw();
      });
      sheet.querySelector("a.story-save").addEventListener("click", function (e) { if (!state || !state.ready) e.preventDefault(); });
      var go = sheet.querySelector(".story-share");
      if (go) go.addEventListener("click", function () {
        if (!state || !state.ready || !state.file) return;
        navigator.share({ files: [state.file] }).catch(function () {});
      });
    });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  // ---------- press and hold the tile ----------
  var tile = document.getElementById("heroOtd");
  if (!tile) return;
  var timer = null, sx = 0, sy = 0;
  function cancel() { clearTimeout(timer); timer = null; tile.classList.remove("otd-press"); }
  tile.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    sx = e.clientX; sy = e.clientY;
    tile.classList.add("otd-press");
    timer = setTimeout(function () {
      timer = null; tile.classList.remove("otd-press");
      if (navigator.vibrate) navigator.vibrate(12);
      open();
    }, 700);
  });
  tile.addEventListener("pointermove", function (e) { if (timer && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) cancel(); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { tile.addEventListener(ev, cancel); });
  tile.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  window.CP11Story = { draw: draw, open: open, close: close };
})();
