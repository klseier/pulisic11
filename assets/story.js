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

  function draw(item) {
    var CP = window.CP11, th = THEMES[item.type] || THEMES.career;
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
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
    var fx = PAD, fy = 560, fw = W - 2 * PAD, fh = 760;
    c.save(); rr(c, fx, fy, fw, fh, 40); c.clip();
    c.fillStyle = th.ghost; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = th.mark === "★" ? "400 460px " + TEXT : "900 560px " + DISPLAY;
    c.fillText(th.mark, W / 2, fy + fh / 2 + (th.mark === "★" ? 10 : 30));
    c.restore();
    c.textAlign = "left"; c.textBaseline = "alphabetic";
    c.setLineDash([22, 16]); c.lineWidth = 5; c.strokeStyle = th.dash; rr(c, fx, fy, fw, fh, 40); c.stroke(); c.setLineDash([]);
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

  // ---------- preview sheet ----------
  var sheet = null, blobUrl = null;
  function close() {
    if (!sheet) return;
    sheet.remove(); sheet = null;
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    document.documentElement.classList.remove("story-open");
    window.CP11.pauseOtd(false);
  }
  function open() {
    var CP = window.CP11, item = CP && CP.otd();
    if (!item || sheet) return;
    CP.pauseOtd(true);
    fontsReady().then(function () {
      var cv = draw(item);
      cv.toBlob(function (blob) {
        if (!blob) { CP.pauseOtd(false); return; }
        var name = "pulisic-" + item.d + ".png", file = null;
        try { file = new File([blob], name, { type: "image/png" }); } catch (e) {}
        var canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
        blobUrl = URL.createObjectURL(blob);
        sheet = document.createElement("div");
        sheet.className = "story-sheet";
        sheet.innerHTML =
          '<div class="story-box" role="dialog" aria-modal="true">' +
            '<button class="story-x" type="button" aria-label="' + CP.t("story.close") + '">×</button>' +
            '<img class="story-img" alt="" src="' + blobUrl + '">' +
            '<div class="story-btns">' +
              (canShare ? '<button class="story-btn story-go" type="button">' + CP.t("story.share") + "</button>" : "") +
              '<a class="story-btn' + (canShare ? "" : " story-go") + '" href="' + blobUrl + '" download="' + name + '">' + CP.t("story.save") + "</a>" +
            "</div>" +
          "</div>";
        document.body.appendChild(sheet);
        document.documentElement.classList.add("story-open");
        sheet.addEventListener("click", function (e) { if (e.target === sheet || e.target.classList.contains("story-x")) close(); });
        var go = sheet.querySelector("button.story-go");
        if (go) go.addEventListener("click", function () {
          navigator.share({ files: [file] }).catch(function () {});
        });
      }, "image/png");
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
