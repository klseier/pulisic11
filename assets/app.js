(function () {
  "use strict";

  var D = window.SITE_DATA;
  var I = window.I18N;
  var COLORS = { goals: "#C0182F", assists: "#3A62A8", line: "#C0182F", milan: "#C0182F", usa: "#3A62A8" };
  var ZONE_COLORS = { cl: "#3A62A8", el: "#E07A1F", ecl: "#1F8A70", rel: "#C0182F", r16: "#1F8A70", po: "#E07A1F", out: "#9A9591" };

  /* ---------- language ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var params = new URLSearchParams(location.search);
  var lang = params.get("lang") || store("lang") || ((navigator.language || "").toLowerCase().indexOf("it") === 0 ? "it" : "en");
  if (!I[lang]) lang = "en";

  function t(key, vars) {
    var s = (I[lang] && I[lang][key]) || I.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function loc(v) { return v && typeof v === "object" && !Array.isArray(v) ? (v[lang] || v.en) : v; }
  function locale() { return lang === "it" ? "it-IT" : "en-GB"; }
  function num(n) { return new Intl.NumberFormat(locale()).format(n); }
  function compact(n) { return new Intl.NumberFormat(locale(), { notation: "compact", maximumFractionDigits: 2 }).format(n); }
  function dateStr(iso, opts) { return new Intl.DateTimeFormat(locale(), opts || { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function compLabel(c) {
    c = loc(c) || "";
    if (lang !== "it") return c;
    return c.replace(/MD (\d+)/, "$1ª giornata").replace("QF 1st leg", "quarti, andata").replace("QF 2nd leg", "quarti, ritorno");
  }

  /* ---------- live data merge (optional data/live.json) ---------- */
  function merge(live) {
    if (!live) return;
    ["fanPage", "athlete"].forEach(function (key) {
      var L = live[key], P = D[key];
      if (!L) return;
      ["followers", "following", "posts", "name", "bio", "source", "avatar", "fetchedAt", "prevFetchedAt"].forEach(function (k) { if (L[k] != null) P[k] = L[k]; });
      if (L.followers != null) P.followersApprox = false;
      if (L.history && L.history.length) {
        var byDate = {};
        (P.history || []).concat(L.history).forEach(function (h) { byDate[h.date] = h; });
        P.history = Object.keys(byDate).sort().map(function (d) { return byDate[d]; });
      }
      if (L.postsList && L.postsList.length) P.postsList = L.postsList;
    });
    if (live.fixtures && live.fixtures.length) {
      // live fixtures win over snapshot fixtures for the same team on the same day
      function key(f) { return f.team + "|" + String(f.date).slice(0, 10); }
      var seen = {};
      live.fixtures.forEach(function (f) { seen[key(f)] = true; });
      D.fixtures = D.fixtures.filter(function (f) { return !seen[key(f)]; }).concat(live.fixtures);
    }
    if (live.recentResults && live.recentResults.length) {
      // keep hand-written Pulisic notes (assets/data.js) for matches the feed has no note for
      var notes = {};
      D.recentResults.forEach(function (r) { if (r.pulisic) notes[r.date] = r.pulisic; });
      D.recentResults = live.recentResults.map(function (r) {
        return r.pulisic || !notes[r.date] ? r : Object.assign({}, r, { pulisic: notes[r.date] });
      });
    }
    if (live.standings) Object.keys(live.standings).forEach(function (k) { D.standings[k] = live.standings[k]; });
    if (live.clubStats && live.clubStats.currentSeason) {
      var cur = D.clubStats.currentSeason, L2 = live.clubStats.currentSeason;
      ["asOf", "apps", "starts", "goals", "assists", "shots", "shotsOnTarget"].forEach(function (k) { if (L2[k] != null) cur[k] = L2[k]; });
      // fields the feed does not provide are hidden instead of showing stale numbers
      if (L2.apps == null) cur.apps = null;
      if (L2.starts == null) cur.starts = null;
      if (L2.shots == null) cur.shots = null;
      D.clubStats.seasons.forEach(function (x) { if (x.live) { x.apps = cur.apps; x.goals = cur.goals; x.assists = cur.assists; } });
    }
    if (live.clubStats && live.clubStats.milanTotals) D.clubStats.milanTotals = live.clubStats.milanTotals;
    if (live.intl && live.intl.caps) { D.player.caps = live.intl.caps; D.player.intlGoals = live.intl.goals; D.player.intlAsOf = live.intl.asOf; }
    if (live.pulisicLog) D.pulisicLog = live.pulisicLog;
    if (live.news) D.news = live.news;
    if (live.goals && live.goals.list && live.goals.list.length) {
      // the hand-checked archive in data.js is authoritative; the feed only adds matches played after it
      // (and fills in a minute when the archive has none for that match)
      var base = (D.goals && D.goals.list) || [], cut = (D.goals && D.goals.asOf) || "", byDay = {};
      base.forEach(function (g) { byDay[g.date] = g; });
      live.goals.list.forEach(function (g) {
        var cur = byDay[g.date];
        if (cur) { if (!(cur.minutes || []).length && (g.minutes || []).length) byDay[g.date] = Object.assign({}, cur, { minutes: g.minutes }); return; }
        if (g.date > cut) byDay[g.date] = g;
      });
      D.goals = { list: Object.keys(byDay).map(function (k) { return byDay[k]; }), asOf: live.goals.asOf || (D.goals && D.goals.asOf) };
    }
    if (live.updated && live.updated > D.updated) D.updated = live.updated;
  }

  /* ---------- static text ---------- */
  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    document.querySelectorAll("[data-toggle-table]").forEach(function (b) {
      b.textContent = $(b.dataset.toggleTable).hidden ? t("common.showTable") : t("common.hideTable");
    });
  }

  /* ---------- hero ---------- */
  function age(born) {
    var b = new Date(born), n = new Date(), a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
    return a;
  }
  function renderHero() {
    var p = D.player;
    var facts = [
      [t("fact.age"), age(p.born)],
      [t("fact.club"), p.club],
      [t("fact.position"), loc(p.position)],
      [t("fact.contract"), dateStr(p.contractUntil, { month: "short", year: "numeric" })],
      [t("fact.coach"), p.clubCoach],
    ];
    $("heroFacts").innerHTML = facts.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("");
  }

  /* ---------- fixtures ---------- */
  function upcoming() {
    var now = Date.now() - 2 * 3600e3; // keep a match listed until ~2h after kick-off
    return D.fixtures.filter(function (f) { return new Date(f.date).getTime() > now; })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
  }
  function teamsHtml(f) {
    function nm(n) { return /milan|usa/i.test(n) && !/inter/i.test(n) ? '<span class="us">' + esc(n) + "</span>" : esc(n); }
    return nm(f.home) + " – " + nm(f.away);
  }
  var countdownTimer;
  function renderNext() {
    var box = $("nextMatch");
    var f = upcoming()[0];
    var head = '<h2 id="nextTitle" class="w-title">' + esc(t("next.title")) + "</h2>";
    clearInterval(countdownTimer);
    if (!f) { box.innerHTML = head + "<p>" + esc(t("next.none")) + "</p>"; return; }
    box.innerHTML = head +
      '<div class="next-teams">' + esc(f.home) + '<span class="vs">v</span>' + esc(f.away) + "</div>" +
      '<div class="countdown" id="countdown" aria-label="' + esc(t("next.kickoff")) + '"></div>' +
      '<p class="next-meta">' + esc(compLabel(f.comp)) + "<br>" + esc(dateStr(f.date, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })) +
      (f.timeTbc ? " (" + esc(t("matches.tbc")) + ")" : "") + (f.venue ? "<br>" + esc(f.venue) : "") + "</p>";
    function tick() {
      var ms = Math.max(0, new Date(f.date) - Date.now());
      if (Date.now() - new Date(f.date) > 2 * 3600e3) { renderNext(); renderFixtures(); renderMiniFixtures(); return; }
      if (ms === 0) { var el0 = $("countdown"); if (el0) el0.innerHTML = '<span class="live-now">' + esc(t("next.live")) + "</span>"; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      var el = $("countdown");
      if (el) el.innerHTML = d + "<small>" + t("next.days") + "</small> " + h + "<small>" + t("next.hours") + "</small> " + m + "<small>" + t("next.min") + "</small>";
    }
    tick();
    countdownTimer = setInterval(tick, 30000);
  }

  var filter = "all";
  var fixturesOpen = false;
  function renderFixtures() {
    var all = upcoming().filter(function (f) { return filter === "all" || f.team === filter; });
    var list = fixturesOpen ? all : all.slice(0, 5);
    var more = $("fixturesMore");
    if (more) { more.hidden = all.length <= 5; more.textContent = fixturesOpen ? t("common.showLess") : t("common.showAll", { n: all.length }); }
    $("fixtures").innerHTML = list.length ? list.map(function (f) {
      return '<li class="fixture">' +
        '<div class="fx-date">' + esc(dateStr(f.date, { weekday: "short", day: "numeric", month: "short" })) +
        "<small>" + (f.timeTbc ? esc(t("matches.tbc")) : esc(dateStr(f.date, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }))) + "</small></div>" +
        '<div class="fx-teams">' + teamsHtml(f) + '<span class="fx-comp">' + esc(compLabel(f.comp)) + (f.venue ? " · " + esc(f.venue) : "") + "</span></div>" +
        '<span class="badge ' + f.team + '">' + (f.team === "usa" ? "USA" : "Milan") + "</span></li>";
    }).join("") : '<li class="empty fixture">' + esc(t("matches.empty")) + "</li>";

    $("results").innerHTML = D.recentResults.map(function (r) {
      return '<li class="result"><span class="when">' + esc(dateStr(r.date, { day: "numeric", month: "short" })) + " · " + esc(compLabel(r.comp)) + "</span>" +
        "<span>" + esc(r.home) + " – " + esc(r.away) + (r.pulisic ? '<span class="cp">Pulisic: ' + esc(loc(r.pulisic)) + "</span>" : "") + "</span>" +
        '<span class="score">' + esc(r.score) + "</span></li>";
    }).join("");
  }

  /* ---------- standings ---------- */
  var comp = "serieA";
  function zoneOf(pos, zones) {
    for (var z in zones) if (pos >= zones[z][0] && pos <= zones[z][1]) return z;
    return null;
  }
  function renderStandings() {
    var s = D.standings[comp];
    if (!s) { $("standings").innerHTML = ""; return; }
    var rows = s.rows.map(function (r, i) { return r.length === 7 ? r : [i + 1].concat(r); });
    var html = '<div class="standings-wrap"><table><caption>' + esc(s.label) + " — " + esc(loc(s.note) || "") + ". " + esc(t("tables.asOf", { date: dateStr(s.asOf) })) + "</caption>" +
      "<thead><tr><th>#</th><th>" + t("tables.team") + '</th><th title="Played">' + t("tables.p") + "</th><th>" + t("tables.w") + "</th><th>" + t("tables.d") + "</th><th>" + t("tables.l") + "</th><th>" + t("tables.pts") + "</th></tr></thead><tbody>";
    var prev = 0;
    rows.forEach(function (r) {
      if (r[0] - prev > 1 && prev) html += '<tr class="gap"><td colspan="7">⋯</td></tr>';
      prev = r[0];
      var z = zoneOf(r[0], s.zones);
      html += '<tr class="' + (/milan/i.test(r[1]) && !/inter/i.test(r[1]) ? "is-milan" : "") + '">' +
        '<td style="--zone:' + (z ? ZONE_COLORS[z] : "transparent") + '">' + r[0] + "</td><td>" + esc(r[1]) + "</td><td>" + r[2] + "</td><td>" + r[3] + "</td><td>" + r[4] + "</td><td>" + r[5] + '</td><td class="pts">' + r[6] + "</td></tr>";
    });
    html += "</tbody></table></div><div class=\"zones\">" + Object.keys(s.zones).map(function (z) {
      return '<span><i style="background:' + ZONE_COLORS[z] + '"></i>' + esc(t("zone." + z)) + "</span>";
    }).join("") + "</div>";
    $("standings").innerHTML = html;
  }

  /* ---------- tooltip ---------- */
  var tip = $("tooltip");
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = Math.min(window.innerWidth - w - 8, x + 14), top = y - h - 12;
    if (top < 8) top = y + 16;
    tip.style.left = left + "px"; tip.style.top = top + "px";
  }
  function hideTip() { tip.hidden = true; }

  /* ---------- shared SVG helpers ---------- */
  function svgEl(name, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function niceTicks(min, max, n) {
    var span = max - min || Math.abs(max) || 1, step = Math.pow(10, Math.floor(Math.log10(span / n)));
    var err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1;
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
    for (var v = lo; v <= hi + step / 2; v += step) out.push(v);
    return out;
  }
  function sortedHistory(p) { return (p.history || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }

  /* ---------- followers line chart (reused for any profile) ---------- */
  function lineChart(hostId, tableId, noteId, hist) {
    var host = $(hostId);
    host.innerHTML = "";
    var W = 640, H = 230, m = { t: 16, r: 18, b: 28, l: 56 };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    host.appendChild(svg);
    host.setAttribute("aria-label", hist.map(function (h) { return dateStr(h.date) + " " + num(h.followers); }).join("; "));
    if (!hist.length) return;
    var xs = hist.map(function (h) { return new Date(h.date).getTime(); }), ys = hist.map(function (h) { return h.followers; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    if (x0 === x1) { x0 -= 864e5 * 15; x1 += 864e5 * 15; }
    var yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys), pad = Math.max((yMax - yMin) * 0.25, yMax * 0.01);
    var ticks = niceTicks(yMin - pad, yMax + pad, 4), y0 = ticks[0], y1 = ticks[ticks.length - 1];
    function X(v) { return m.l + (v - x0) / (x1 - x0) * (W - m.l - m.r); }
    function Y(v) { return H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b); }
    var g = svgEl("g", { class: "grid" }), ax = svgEl("g", { class: "axis" });
    ticks.forEach(function (v) {
      g.appendChild(svgEl("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v) }));
      var tx = svgEl("text", { x: m.l - 8, y: Y(v) + 4, "text-anchor": "end" }); tx.textContent = compact(v); ax.appendChild(tx);
    });
    var labelIdx = hist.length <= 6 ? hist.map(function (_, i) { return i; }) : [0, Math.floor(hist.length / 2), hist.length - 1];
    labelIdx.forEach(function (i) {
      var anchor = hist.length === 1 ? "middle" : i === 0 ? "start" : i === hist.length - 1 ? "end" : "middle";
      var tx = svgEl("text", { x: X(xs[i]), y: H - 8, "text-anchor": anchor });
      tx.textContent = dateStr(hist[i].date, { day: "numeric", month: "short" }); ax.appendChild(tx);
    });
    svg.appendChild(g); svg.appendChild(ax);
    var d = hist.map(function (h, i) { return (i ? "L" : "M") + X(xs[i]).toFixed(1) + " " + Y(h.followers).toFixed(1); }).join(" ");
    svg.appendChild(svgEl("path", { d: d, fill: "none", stroke: COLORS.line, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    hist.forEach(function (h, i) {
      svg.appendChild(svgEl("circle", { cx: X(xs[i]), cy: Y(h.followers), r: 4.5, fill: h.estimated ? "#fff" : COLORS.line, stroke: h.estimated ? COLORS.line : "#fff", "stroke-width": 2 }));
    });
    var last = hist[hist.length - 1];
    var lbl = svgEl("text", { class: "lbl", x: X(xs[xs.length - 1]) + (hist.length === 1 ? 0 : -8), y: Y(last.followers) - 12, "text-anchor": hist.length === 1 ? "middle" : "end" });
    lbl.textContent = num(last.followers); svg.appendChild(lbl);
    var cross = svgEl("line", { y1: m.t, y2: H - m.b, stroke: "#9A9591", "stroke-width": 1, visibility: "hidden" });
    svg.appendChild(cross);
    var hit = svgEl("rect", { x: m.l, y: 0, width: W - m.l - m.r, height: H, fill: "transparent" });
    svg.appendChild(hit);
    hit.addEventListener("pointermove", function (ev) {
      var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * W, best = 0;
      xs.forEach(function (v, i) { if (Math.abs(X(v) - px) < Math.abs(X(xs[best]) - px)) best = i; });
      cross.setAttribute("x1", X(xs[best])); cross.setAttribute("x2", X(xs[best])); cross.setAttribute("visibility", "visible");
      var h = hist[best];
      showTip(esc(dateStr(h.date)) + "<br><b>" + num(h.followers) + "</b> " + esc(t("ig.followers")) + (h.estimated ? " (" + esc(t("ig.est")) + ")" : ""), ev.clientX, ev.clientY);
    });
    hit.addEventListener("pointerleave", function () { cross.setAttribute("visibility", "hidden"); hideTip(); });
    $(tableId).innerHTML = "<table><thead><tr><th>" + t("chart.date") + "</th><th>" + t("chart.followers") + "</th></tr></thead><tbody>" +
      hist.map(function (h) { return "<tr><td>" + esc(dateStr(h.date)) + (h.estimated ? " (" + esc(t("ig.est")) + ")" : "") + "</td><td>" + num(h.followers) + "</td></tr>"; }).join("") + "</tbody></table>";
    if ($(noteId)) $(noteId).textContent = "";
  }

  /* ---------- Instagram embeds ---------- */
  var embedLoaded = false;
  function loadEmbed() {
    if (window.instgrm) { window.instgrm.Embeds.process(); return; }
    if (embedLoaded) return;
    embedLoaded = true;
    var s = document.createElement("script"); s.async = true; s.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(s);
  }
  function profileUrl(h) { return "https://www.instagram.com/" + h + "/"; }
  function profileFallback(h, height) {
    return '<div class="ig-frame"><iframe src="' + profileUrl(h) + 'embed/" title="@' + esc(h) + '" loading="lazy" style="height:' + height + 'px"></iframe></div>' +
      '<p class="chart-note">' + esc(t("fan.embedFallback")) + ' <a href="' + profileUrl(h) + '" target="_blank" rel="noopener">' + esc(t("fan.open", { h: h })) + "</a></p>";
  }
  function bioHtml(line) {
    return esc(line).replace(/@([A-Za-z0-9._]+)/g, function (_, u) { return '<a href="' + profileUrl(u) + '" target="_blank" rel="noopener">@' + u + "</a>"; });
  }

  /* one post: image tile when an image URL is known, else an official embed */
  function tileHtml(p, big, tr) {
    var meta = '<span class="tile-meta">' +
      (p.likes != null ? "<span>♥ " + compact(p.likes) + "</span>" : "") +
      (p.comments != null ? "<span>💬 " + compact(p.comments) + "</span>" : "") + "</span>";
    var kind = p.type === "VIDEO" ? '<span class="tile-kind">▶ ' + esc(t("fan.video")) + "</span>" : "";
    var alt = (p.caption || "").slice(0, 120);
    var media = p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(alt) + '" loading="lazy" referrerpolicy="no-referrer">' : '<span class="tile-noimg">' + esc(alt || dateStr(p.date)) + "</span>";
    var trend = "";
    if (tr) {
      trend = '<span class="tile-trend' + (tr.rank <= 3 ? " lead" : "") + '">' + (tr.rank <= 3 ? '<b>#' + tr.rank + "</b>" : "") +
        "+" + num(tr.gain) + " ♥" + (tr.isNew ? " · " + esc(t("trend.new")) : "") + "</span>";
    }
    return '<a class="tile' + (big ? " big" : "") + (tr && tr.rank <= 3 ? " is-lead" : "") + '" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + media + kind + trend +
      '<span class="tile-foot"><span class="tile-date">' + esc(dateStr(p.date, { day: "numeric", month: "short" })) + "</span>" + meta + "</span></a>";
  }
  function embedHtml(p) {
    return '<div class="embed-cell"><blockquote class="instagram-media" data-instgrm-permalink="' + esc(p.url) + '" data-instgrm-version="14"><a href="' + esc(p.url) + '">' + esc(p.url) + "</a></blockquote>" +
      (p.likes != null ? '<p class="embed-meta">♥ ' + num(p.likes) + (p.comments != null ? " · 💬 " + num(p.comments) : "") + "</p>" : "") + "</div>";
  }

  /* ---------- FAN PAGE (main section) ---------- */
  var FEED_FIRST = 13, feedSort = "date", feedShown = FEED_FIRST; // 13 = one 2x2 tile + 12 tiles fills a 4-column grid
  function fanPosts() { return (D.fanPage.postsList || []).slice(); }

  function renderFanHead() {
    var f = D.fanPage, h = f.handle, url = profileUrl(h);
    $("fanTitle").textContent = "@" + h;
    $("fanAvatarLink").href = url; $("fanFollow").href = url;
    renderAvatars(f);
    $("fanName").textContent = f.name + " — " + loc(f.category);
    var counts = [
      [num(f.posts), t("fan.posts")],
      [(f.followersApprox ? "≈ " : "") + num(f.followers), t("fan.followers")],
      [num(f.following), t("fan.following")],
    ];
    var hist = sortedHistory(f), delta = "";
    if (hist.length > 1) {
      var diff = f.followers - hist[0].followers;
      if (diff !== 0) delta = '<li class="ig-delta ' + (diff < 0 ? "down" : "up") + '">' + (diff >= 0 ? "▲ +" : "▼ ") + num(diff) + " " + esc(t("ig.change", { d: "", date: dateStr(hist[0].date) }).trim()) + "</li>";
    }
    $("fanCounts").innerHTML = counts.map(function (c) { return "<li><strong>" + esc(c[0]) + "</strong> " + esc(c[1]) + "</li>"; }).join("") + delta;
    $("fanBio").innerHTML = (f.bio || []).map(function (l) { return "<p>" + bioHtml(l) + "</p>"; }).join("");
  }

  /* coin avatar: striped "11" flips over to the real profile picture once it has loaded */
  var coinShown = null;
  function renderAvatars(f) {
    var coin = $("fanCoin"), back = $("fanCoinBack");
    if (!coin || !f.avatar) return;
    if (coinShown === f.avatar) return; // already loaded; keep state across language switches
    var i = new Image();
    i.alt = "@" + f.handle; i.referrerPolicy = "no-referrer"; i.decoding = "async";
    i.onload = function () {
      back.innerHTML = ""; back.appendChild(i); coinShown = f.avatar;
      setTimeout(function () { coin.classList.add("flipped"); }, 700);
    };
    i.src = f.avatar;
  }

  /* hero photo card: the fan page's most-liked post of the last 7 days (else the latest with an image) */
  function renderHeroCard() {
    var card = $("heroCard");
    if (!card) return;
    var posts = fanPosts().filter(function (p) { return p.image; });
    if (!posts.length) { card.hidden = true; return; }
    var newest = posts.reduce(function (m, p) { return p.date > m ? p.date : m; }, "");
    var weekAgo = new Date(new Date(newest) - 7 * 864e5).toISOString().slice(0, 10);
    var week = posts.filter(function (p) { return p.date >= weekAgo && p.likes != null; });
    var pick, label;
    if (week.length) { pick = week.sort(function (a, b) { return b.likes - a.likes; })[0]; label = t("hero.cardLabel"); }
    else { pick = posts.sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0]; label = t("hero.cardLatest"); }
    var img = new Image();
    img.alt = (pick.caption || "").slice(0, 120); img.referrerPolicy = "no-referrer"; img.decoding = "async";
    img.onload = function () { card.hidden = false; };
    img.onerror = function () { card.hidden = true; };
    $("heroCardImg").innerHTML = ""; $("heroCardImg").appendChild(img);
    img.src = pick.image;
    card.href = pick.url;
    $("heroCardLabel").textContent = label;
    $("heroCardLikes").textContent = pick.likes != null ? "♥ " + num(pick.likes) : "";
  }

  /* "new post" ribbon: shown while the fan page's newest post is under 24h old */
  function postTime(p) { return Date.parse(p.ts || (p.date + "T12:00:00Z")); }
  function agoStr(ms) {
    var h = Math.floor(ms / 3600e3);
    if (h < 1) return t("new.justNow");
    return t("new.hoursAgo", { n: h });
  }
  function renderHeroNew() {
    var el = $("heroNew");
    if (!el) return;
    var posts = fanPosts();
    if (!posts.length) { el.hidden = true; return; }
    var p = posts.sort(function (a, b) { return postTime(b) - postTime(a); })[0];
    var age = Date.now() - postTime(p);
    if (!(age < 864e5) || age < -36e5) { el.hidden = true; return; }
    el.href = p.url;
    $("heroNewLabel").textContent = p.type === "VIDEO" ? t("new.reel") : t("new.post");
    $("heroNewAgo").textContent = p.ts ? agoStr(Math.max(0, age)) : t("new.today");
    var box = $("heroNewImg"); box.innerHTML = "";
    if (p.image) {
      var img = new Image(); img.alt = ""; img.referrerPolicy = "no-referrer"; img.decoding = "async";
      img.onerror = function () { box.innerHTML = ""; };
      box.appendChild(img); img.src = p.image;
    }
    el.hidden = false;
  }

  /* achievements badge: goals and assists for Milan, with the next round milestone */
  function milanKnownGoals() {
    var tot = D.clubStats.milanTotals || {}, g = tot.goals || 0, log = D.pulisicLog || {};
    Object.keys(log).forEach(function (d) { if (!tot.asOf || d > tot.asOf) g += log[d].g || 0; });
    return g;
  }
  function milanCareer() {
    var tot = D.clubStats.milanTotals || {}, g = tot.goals || 0, a = tot.assists || 0;
    var log = D.pulisicLog || {};
    Object.keys(log).forEach(function (d) { if (!tot.asOf || d > tot.asOf) { g += log[d].g || 0; a += log[d].a || 0; } });
    var G = D.goals;
    if (G && !G.partial && G.list) {
      var lt = G.list.reduce(function (n, x) { return n + goalCount(x); }, 0);
      if (lt > g) g = lt;
    }
    return { goals: g, assists: a };
  }
  function renderHeroAch() {
    var el = $("heroAch");
    if (!el) return;
    var c = milanCareer();
    if (!c.goals && !c.assists) { el.hidden = true; return; }
    function cell(n, label, step, key) {
      var next = (Math.floor(n / step) + 1) * step, pct = Math.round(((n % step) / step) * 100);
      var hit = n > 0 && n % step === 0;
      return '<span class="ach-cell' + (hit ? " hit" : "") + '"><b class="ach-n">' + n + '</b><span class="ach-l">' + esc(label) + "</span>" +
        '<span class="ach-bar" aria-hidden="true"><i style="width:' + (hit ? 100 : pct) + '%"></i></span>' +
        '<span class="ach-next">' + esc(hit ? t("ach.reached", { n: n }) : t("ach.toGo", { k: next - n, n: next })) + "</span></span>";
    }
    el.innerHTML = '<span class="ach-head">' + esc(t("ach.title")) + "</span>" +
      '<span class="ach-row">' + cell(c.goals, t("stats.goals"), 10, "g") + cell(c.assists, t("stats.assists"), 10, "a") + "</span>";
    el.setAttribute("aria-label", t("ach.title") + ": " + c.goals + " " + t("stats.goals") + ", " + c.assists + " " + t("stats.assists"));
    el.hidden = false;
  }

  /* trending: likes gained since the previous update */
  function trendInfo() {
    var f = D.fanPage;
    if (!f.prevFetchedAt) return null;
    var prevDay = String(f.prevFetchedAt).slice(0, 10);
    var list = fanPosts().filter(function (p) { return p.likes != null; }).map(function (p) {
      var isNew = p.likesPrev == null && p.date >= prevDay;
      var gain = p.likesPrev != null ? p.likes - p.likesPrev : (isNew ? p.likes : null);
      return { post: p, gain: gain, isNew: isNew };
    }).filter(function (x) { return x.gain != null; });
    if (!list.length) return null;
    list.sort(function (a, b) { return b.gain - a.gain; });
    return list;
  }

  function renderFanKpis() {
    var f = D.fanPage, posts = fanPosts().filter(function (p) { return p.likes != null; });
    var box = $("fanKpis");
    if (!posts.length) { box.hidden = true; return; }
    box.hidden = false;
    var now = Date.now(), last30 = fanPosts().filter(function (p) { return now - new Date(p.date) < 30 * 864e5; }).length;
    var avgL = posts.reduce(function (s, p) { return s + p.likes; }, 0) / posts.length;
    var withC = posts.filter(function (p) { return p.comments != null; });
    var avgC = withC.length ? withC.reduce(function (s, p) { return s + p.comments; }, 0) / withC.length : 0;
    var er = f.followers ? (avgL + avgC) / f.followers * 100 : 0;
    var byDay = [0, 0, 0, 0, 0, 0, 0].map(function () { return { s: 0, n: 0 }; });
    posts.forEach(function (p) { var d = new Date(p.date).getDay(); byDay[d].s += p.likes; byDay[d].n++; });
    var best = -1, bestAvg = -1;
    byDay.forEach(function (b, i) { if (b.n && b.s / b.n > bestAvg) { bestAvg = b.s / b.n; best = i; } });
    var top = posts.slice().sort(function (a, b) { return b.likes - a.likes; })[0];
    var items = [
      [t("fan.kpi30"), last30],
      [t("fan.kpiLikes"), num(Math.round(avgL))],
      [t("fan.kpiComments"), num(Math.round(avgC))],
      [t("fan.kpiEr"), er.toFixed(1) + "%"],
      [t("fan.kpiDay"), best >= 0 ? t("days").split(",")[best] : "—"],
      [t("fan.kpiTop"), '<a href="' + esc(top.url) + '" target="_blank" rel="noopener">♥ ' + num(top.likes) + "</a>"],
    ];
    box.innerHTML = items.map(function (i) { return "<li><span>" + esc(i[0]) + "</span><strong>" + i[1] + "</strong></li>"; }).join("") +
      '<li class="kpi-basis">' + esc(t("fan.kpiBasis", { n: posts.length })) + "</li>";
  }

  function renderFanFeed() {
    var f = D.fanPage, posts = fanPosts(), more = $("feedMore");
    if (!posts.length) {
      $("fanFeed").innerHTML = profileFallback(f.handle, 720);
      more.hidden = true;
      document.querySelector(".feed-bar .tabs").hidden = true;
      return;
    }
    document.querySelector(".feed-bar .tabs").hidden = false;
    var note = $("trendNote"), trendMap = null;
    note.hidden = true;
    if (feedSort === "trend") {
      var tl = trendInfo();
      note.hidden = false;
      if (tl) {
        trendMap = {};
        tl.forEach(function (x, i) { trendMap[x.post.url] = { gain: x.gain, isNew: x.isNew, rank: i + 1 }; });
        posts = tl.map(function (x) { return x.post; });
        note.textContent = t("trend.note", { date: dateStr(D.fanPage.prevFetchedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) });
      } else {
        note.textContent = t("trend.wait");
        posts.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      }
    } else {
      posts.sort(function (a, b) {
        if (feedSort === "date") return a.date < b.date ? 1 : -1;
        return (b[feedSort] || 0) - (a[feedSort] || 0);
      });
    }
    var shown = posts.slice(0, feedShown), allImages = shown.every(function (p) { return p.image; });
    if (allImages) {
      $("fanFeed").innerHTML = '<div class="grid-feed">' + shown.map(function (p, i) { return tileHtml(p, i === 0, trendMap && trendMap[p.url]); }).join("") + "</div>";
    } else {
      $("fanFeed").innerHTML = '<div class="embed-feed">' + shown.map(function (p) { return p.image ? tileHtml(p) : embedHtml(p); }).join("") + "</div>";
      loadEmbed();
    }
    more.hidden = posts.length <= feedShown;
  }

  function renderLikesChart() {
    var host = $("likesChart"), posts = fanPosts().filter(function (p) { return p.likes != null; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(-20);
    host.innerHTML = "";
    host.closest(".chart-card").hidden = !posts.length;
    if (!posts.length) { $("likesTable").innerHTML = ""; return; }
    var W = 640, H = 230, m = { t: 22, r: 8, b: 28, l: 48 };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    host.appendChild(svg);
    host.setAttribute("aria-label", posts.map(function (p) { return dateStr(p.date) + " " + num(p.likes); }).join("; "));
    var max = Math.max.apply(null, posts.map(function (p) { return p.likes; })), ticks = niceTicks(0, max, 4), y1 = ticks[ticks.length - 1];
    function Y(v) { return H - m.b - v / y1 * (H - m.t - m.b); }
    var g = svgEl("g", { class: "grid" }), ax = svgEl("g", { class: "axis" });
    ticks.forEach(function (v) {
      g.appendChild(svgEl("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v) }));
      var tx = svgEl("text", { x: m.l - 8, y: Y(v) + 4, "text-anchor": "end" }); tx.textContent = compact(v); ax.appendChild(tx);
    });
    svg.appendChild(g); svg.appendChild(ax);
    var band = (W - m.l - m.r) / posts.length, bw = Math.max(4, Math.min(26, band - 2));
    var bestIdx = 0; posts.forEach(function (p, i) { if (p.likes > posts[bestIdx].likes) bestIdx = i; });
    posts.forEach(function (p, i) {
      var x = m.l + band * i + (band - bw) / 2, y = Y(p.likes), h = H - m.b - y, r = Math.min(4, h, bw / 2);
      var d = "M" + x + " " + (H - m.b) + " V" + (y + r) + " Q" + x + " " + y + " " + (x + r) + " " + y + " H" + (x + bw - r) + " Q" + (x + bw) + " " + y + " " + (x + bw) + " " + (y + r) + " V" + (H - m.b) + " Z";
      svg.appendChild(svgEl("path", { d: h > 0 ? d : "", fill: i === bestIdx ? "#8E0F22" : COLORS.line }));
      if (i === bestIdx || i === posts.length - 1) {
        var lb = svgEl("text", { class: "lbl", x: x + bw / 2, y: y - 6, "text-anchor": "middle" }); lb.textContent = compact(p.likes); svg.appendChild(lb);
      }
      if (i === 0 || i === posts.length - 1) {
        var tx = svgEl("text", { x: x + bw / 2, y: H - 8, "text-anchor": i === 0 ? "start" : "end" }); tx.textContent = dateStr(p.date, { day: "numeric", month: "short" }); ax.appendChild(tx);
      }
      var hit = svgEl("rect", { x: m.l + band * i, y: m.t, width: band, height: H - m.t - m.b, fill: "transparent", style: "cursor:pointer" });
      hit.addEventListener("pointermove", function (ev) {
        showTip(esc(dateStr(p.date)) + "<br>♥ <b>" + num(p.likes) + "</b>" + (p.comments != null ? " · 💬 <b>" + num(p.comments) + "</b>" : "") + (p.caption ? "<br>" + esc(p.caption.slice(0, 80)) : ""), ev.clientX, ev.clientY);
      });
      hit.addEventListener("pointerleave", hideTip);
      hit.addEventListener("click", function () { window.open(p.url, "_blank", "noopener"); });
      svg.appendChild(hit);
    });
    $("likesNote").textContent = "";
    $("likesTable").innerHTML = "<table><thead><tr><th>" + t("chart.date") + "</th><th>" + t("ig.likes") + "</th><th>" + t("ig.comments") + "</th></tr></thead><tbody>" +
      posts.map(function (p) { return '<tr><td><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(dateStr(p.date)) + "</a></td><td>" + num(p.likes) + "</td><td>" + (p.comments != null ? num(p.comments) : "—") + "</td></tr>"; }).join("") + "</tbody></table>";
  }

  function renderFan() {
    renderFanHead(); renderFanKpis(); renderFanFeed(); renderLikesChart(); renderHeroCard(); renderHeroNew();
    lineChart("fanFollowersChart", "fanFollowersTable", "fanFollowersNote", sortedHistory(D.fanPage));
  }

  /* ---------- ATHLETE widget ---------- */
  function renderAthlete() {
    var a = D.athlete, h = a.handle, posts = (a.postsList || []).slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; }).slice(0, 6);
    var av = $("athAvatar");
    if (av && a.avatar) {
      var im = new Image(); im.alt = ""; im.referrerPolicy = "no-referrer"; im.decoding = "async";
      im.onload = function () { av.hidden = false; };
      im.onerror = function () { av.hidden = true; };
      av.innerHTML = ""; av.appendChild(im); im.src = a.avatar; av.href = profileUrl(h);
    }
    $("athSub").innerHTML = esc(t(posts.length ? "ath.sub" : "ath.subNoPosts", { h: h })) + ' <a href="' + profileUrl(h) + '" target="_blank" rel="noopener">instagram.com/' + esc(h) + "</a>";
    var hist = sortedHistory(a), delta = "";
    if (hist.length > 1) {
      var diff = a.followers - hist[0].followers;
      if (diff !== 0) delta = '<li class="ig-delta ' + (diff < 0 ? "down" : "up") + '">' + (diff >= 0 ? "▲ +" : "▼ ") + num(diff) + " " + esc(t("ig.change", { d: "", date: dateStr(hist[0].date) }).trim()) + "</li>";
    }
    $("athCounts").innerHTML = "<li><strong>" + compact(a.followers) + "</strong> " + esc(t("fan.followers")) + "</li><li><strong>" + num(a.posts) + "</strong> " + esc(t("fan.posts")) + "</li>" + delta;
    if (!posts.length) { $("athFeed").innerHTML = profileFallback(h, 420); return; }
    if (posts.every(function (p) { return p.image; })) {
      $("athFeed").innerHTML = '<div class="strip">' + posts.map(function (p) { return tileHtml(p); }).join("") + "</div>";
    } else {
      $("athFeed").innerHTML = '<div class="embed-feed">' + posts.slice(0, 3).map(embedHtml).join("") + "</div>";
      loadEmbed();
    }
  }

  /* ---------- club stats ---------- */
  function renderStats() {
    var cs = D.clubStats, c = cs.currentSeason;
    $("statsSub").textContent = t("stats.sub", { date: dateStr(c.asOf) });
    var items = [
      [t("stats.apps"), c.apps, ""], [t("stats.starts"), c.starts, ""],
      [t("stats.goals"), c.goals, "hl"], [t("stats.assists"), c.assists, ""],
      [t("stats.shots"), c.shots == null ? null : c.shots + " <small>(" + c.shotsOnTarget + ")</small>", ""],
      [t("stats.ga90"), c.apps ? ((c.goals + c.assists) / c.apps).toFixed(2) : null, ""],
    ].filter(function (i) { return i[1] != null; });
    $("seasonStats").innerHTML = '<div style="grid-column:1/-1;border-bottom:0;padding-bottom:0"><dt>' + esc(c.label) + "</dt></div>" +
      items.map(function (i) { return '<div class="' + i[2] + '"><dt>' + esc(i[0]) + "</dt><dd>" + i[1] + "</dd></div>"; }).join("");
    var tot = cs.milanTotals;
    $("milanTotals").textContent = t("stats.totals", { a: tot.apps, g: tot.goals, as: tot.assists, date: dateStr(tot.asOf) });
    renderSeasonsChart();
  }

  function renderSeasonsChart() {
    var seasons = D.clubStats.seasons, host = $("seasonsChart");
    host.innerHTML = "";
    $("seasonsLegend").innerHTML = '<span><i style="background:' + COLORS.goals + '"></i>' + esc(t("stats.goals")) + '</span><span><i style="background:' + COLORS.assists + '"></i>' + esc(t("stats.assists")) + "</span>";
    var W = 640, H = 250, m = { t: 20, r: 8, b: 40, l: 32 };
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    host.appendChild(svg);
    host.setAttribute("aria-label", t("stats.chartTitle") + ": " + seasons.map(function (s) { return s.season + " " + s.goals + "/" + s.assists; }).join("; "));
    var max = Math.max.apply(null, seasons.map(function (s) { return Math.max(s.goals, s.assists); }));
    var ticks = niceTicks(0, max, 4), y1 = ticks[ticks.length - 1];
    function Y(v) { return H - m.b - v / y1 * (H - m.t - m.b); }
    var g = svgEl("g", { class: "grid" }), ax = svgEl("g", { class: "axis" });
    ticks.forEach(function (v) {
      g.appendChild(svgEl("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v) }));
      var tx = svgEl("text", { x: m.l - 8, y: Y(v) + 4, "text-anchor": "end" }); tx.textContent = v; ax.appendChild(tx);
    });
    svg.appendChild(g); svg.appendChild(ax);
    var band = (W - m.l - m.r) / seasons.length, bw = Math.min(34, band * 0.28);
    seasons.forEach(function (s, i) {
      var cx = m.l + band * i + band / 2;
      [["goals", -1], ["assists", 1]].forEach(function (k) {
        var v = s[k[0]], x = cx + (k[1] < 0 ? -bw - 1 : 1), y = Y(v), h = H - m.b - y;
        var r = Math.min(4, h);
        var path = "M" + x + " " + (H - m.b) + " V" + (y + r) + " Q" + x + " " + y + " " + (x + r) + " " + y + " H" + (x + bw - r) + " Q" + (x + bw) + " " + y + " " + (x + bw) + " " + (y + r) + " V" + (H - m.b) + " Z";
        var bar = svgEl("path", { d: h > 0 ? path : "", fill: COLORS[k[0]], opacity: s.live ? 0.55 : 1 });
        svg.appendChild(bar);
        var lb = svgEl("text", { class: "lbl", x: x + bw / 2, y: y - 6, "text-anchor": "middle" }); lb.textContent = v; svg.appendChild(lb);
        var hit = svgEl("rect", { x: x - 4, y: m.t, width: bw + 8, height: H - m.t - m.b, fill: "transparent" });
        hit.addEventListener("pointermove", function (ev) {
          showTip("<b>" + esc(s.season) + "</b>" + (s.live ? " (" + esc(t("stats.inProgress")) + ")" : "") + "<br>" + esc(t("stats.goals")) + ": <b>" + s.goals + "</b><br>" + esc(t("stats.assists")) + ": <b>" + s.assists + "</b><br>" + esc(t("stats.apps")) + ": <b>" + (s.apps == null ? "—" : s.apps) + "</b>", ev.clientX, ev.clientY);
        });
        hit.addEventListener("pointerleave", hideTip);
        svg.appendChild(hit);
      });
      var tx = svgEl("text", { x: cx, y: H - m.b + 18, "text-anchor": "middle" }); tx.textContent = s.season; ax.appendChild(tx);
      if (s.live) { var t2 = svgEl("text", { x: cx, y: H - m.b + 32, "text-anchor": "middle" }); t2.textContent = t("stats.inProgress"); ax.appendChild(t2); }
    });
    $("seasonsTable").innerHTML = "<table><thead><tr><th>" + t("stats.season") + "</th><th>" + t("stats.apps") + "</th><th>" + t("stats.goals") + "</th><th>" + t("stats.assists") + "</th></tr></thead><tbody>" +
      seasons.map(function (s) { return "<tr><td>" + esc(s.season) + "</td><td>" + (s.apps == null ? "—" : s.apps) + "</td><td>" + s.goals + "</td><td>" + s.assists + "</td></tr>"; }).join("") + "</tbody></table>";
  }

  /* ---------- profile ---------- */
  function renderProfile() {
    $("career").innerHTML = D.career.map(function (c, i) {
      return '<li class="' + (i === D.career.length - 1 ? "now" : "") + '"><span class="yrs">' + esc(c.years) + '</span><span class="club">' + esc(c.club) + "</span></li>";
    }).join("");
    var p = D.player;
    $("intl").textContent = t("profile.intl", { caps: p.caps, goals: p.intlGoals, date: dateStr(p.intlAsOf), coach: p.nationalCoach });
    $("honours").innerHTML = D.honours.map(function (h) {
      return '<li><span class="t">' + esc(h.title) + '</span><span class="y">' + esc(h.year) + '</span><span class="tm">' + esc(h.team) + "</span></li>";
    }).join("");
    $("updated").textContent = t("foot.updated", { date: dateStr(D.updated) });
    $("sources").innerHTML = D.sources.map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a></li>"; }).join("");
  }

  /* ---------- sidebar mini widgets ---------- */
  /* latest news headlines (language of the page, falling back to the other one) */
  function renderNews() {
    var w = $("wNews"), N = D.news || {};
    if (!w) return;
    var list = (N[lang] && N[lang].length ? N[lang] : N[lang === "it" ? "en" : "it"]) || [];
    if (!list.length) { w.hidden = true; return; }
    function ago(iso) {
      var ms = Date.now() - Date.parse(iso);
      if (!(ms >= 0)) return "";
      var h = Math.floor(ms / 3600e3);
      return h < 1 ? t("w.agoNow") : h < 24 ? t("w.agoH", { n: h }) : t("w.agoD", { n: Math.floor(h / 24) });
    }
    $("newsList").innerHTML = list.slice(0, 5).map(function (n) {
      return '<li><a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + esc(n.title) + '</a><span class="news-meta">' +
        esc(n.source || "") + (n.at ? " · " + esc(ago(n.at)) : "") + "</span></li>";
    }).join("");
    w.hidden = false;
  }

  function renderMiniFixtures() {
    var list = upcoming().slice(1, 5);
    $("miniFixtures").innerHTML = list.map(function (f) {
      return '<li><span class="mf-date">' + esc(dateStr(f.date, { day: "numeric", month: "short" })) + '</span><span class="mf-teams">' + teamsHtml(f) +
        '<span class="mf-comp">' + esc(compLabel(f.comp)) + '</span></span><span class="dot ' + f.team + '" aria-label="' + (f.team === "usa" ? "USA" : "Milan") + '"></span></li>';
    }).join("") || '<li class="empty">' + esc(t("matches.empty")) + "</li>";
  }
  function renderMiniTable() {
    var s = D.standings.serieA;
    if (!s) return;
    var rows = s.rows.map(function (r, i) { return r.length === 7 ? r : [i + 1].concat(r); });
    var top = rows.slice(0, 5), mil = rows.filter(function (r) { return /milan/i.test(r[1]) && !/inter/i.test(r[1]); })[0];
    if (mil && mil[0] > 5) top.push(mil);
    $("miniTableNote").textContent = loc(s.note) || "";
    $("miniTable").innerHTML = "<thead><tr><th>#</th><th>" + t("tables.team") + "</th><th>" + t("tables.p") + "</th><th>" + t("tables.pts") + "</th></tr></thead><tbody>" +
      top.map(function (r) {
        var z = zoneOf(r[0], s.zones);
        return '<tr class="' + (r === mil ? "is-milan" : "") + '"><td style="--zone:' + (z ? ZONE_COLORS[z] : "transparent") + '">' + r[0] + "</td><td>" + esc(r[1]) + "</td><td>" + r[2] + '</td><td class="pts">' + r[6] + "</td></tr>";
      }).join("") + "</tbody>";
  }
  function renderMiniStats() {
    var c = D.clubStats.currentSeason;
    $("miniStatsNote").textContent = c.label;
    var items = [[t("stats.apps"), c.apps, ""], [t("stats.goals"), c.goals, "hl"], [t("stats.assists"), c.assists, ""]]
      .filter(function (i) { return i[1] != null; });
    $("miniStats").innerHTML = items.map(function (i) { return '<div class="' + i[2] + '"><dt>' + esc(i[0]) + "</dt><dd>" + i[1] + "</dd></div>"; }).join("");
  }

  /* ---------- goals for Milan ---------- */
  var goalSeason = "all", goalComp = "all", goalsShown = 5;
  function compGroup(c) { return /serie a/i.test(c) ? "sa" : /league/i.test(c) ? "eu" : "cup"; }
  var GROUP_LABEL = { sa: "Serie A", eu: "UEFA", cup: "Coppa Italia / Supercoppa" };
  function goalCount(g) { return Math.max(g.count || 1, (g.minutes || []).length); }
  function isMilan(n) { return /milan/i.test(n) && !/inter/i.test(n); }

  function nthLabel(end, count) {
    return count > 1 ? t("goals.nthMany", { a: end - count + 1, b: end }) : t("goals.nth", { n: end });
  }
  function renderGoals() {
    var G = D.goals;
    if (!G || !G.list) return;
    var list = G.list.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var total = list.reduce(function (n, g) { return n + goalCount(g); }, 0);

    // the list counts as complete only when it adds up to his known total for Milan
    var known = milanKnownGoals();
    G.partial = total < known;
    $("goalsSub").textContent = G.partial ? t("goals.subPartial", { n: total, total: known }) : t("goals.sub");
    var by = { sa: 0, eu: 0, cup: 0 };
    list.forEach(function (g) { by[compGroup(g.comp)] += goalCount(g); });
    $("goalsSummary").innerHTML = "<strong>" + esc(t("goals.summary", { n: total, m: list.length })) + "</strong>" +
      Object.keys(by).filter(function (k) { return by[k]; }).map(function (k) { return '<span class="gs-item"><i class="gdot ' + k + '"></i>' + esc(GROUP_LABEL[k]) + " " + by[k] + "</span>"; }).join("");

    var seasons = [];
    list.forEach(function (g) { if (seasons.indexOf(g.season) < 0) seasons.push(g.season); });
    if (seasons.length < 2) goalSeason = "all";
    $("goalSeasons").innerHTML = seasons.length < 2 ? "" : [["all", t("goals.all")]].concat(seasons.map(function (x) { return [x, x]; })).map(function (o) {
      return '<button role="tab" type="button" data-gseason="' + esc(o[0]) + '" aria-selected="' + (goalSeason === o[0]) + '">' + esc(o[1]) + "</button>";
    }).join("");
    var groups = Object.keys(by).filter(function (k) { return by[k]; });
    if (groups.length < 2) goalComp = "all";
    $("goalComps").innerHTML = groups.length < 2 ? "" : [["all", t("goals.allComps")]].concat(groups.map(function (k) { return [k, GROUP_LABEL[k]]; })).map(function (o) {
      return '<button role="tab" type="button" data-gcomp="' + o[0] + '" aria-selected="' + (goalComp === o[0]) + '">' + esc(o[1]) + "</button>";
    }).join("");

    var asc = list.slice().reverse(), running = 0, nth = {};
    asc.forEach(function (g) { running += goalCount(g); nth[g.date + g.minutes.join()] = running; });
    var shown = list.filter(function (g) { return (goalSeason === "all" || g.season === goalSeason) && (goalComp === "all" || compGroup(g.comp) === goalComp); });
    $("goalList").innerHTML = shown.length ? shown.slice(0, goalsShown).map(function (g) {
      var n = goalCount(g), tag = n === 2 ? t("goals.brace") : n >= 3 ? t("goals.hat") : "";
      var team = function (x) { return isMilan(x) ? '<span class="us">' + esc(x) + "</span>" : esc(x); };
      var mins = g.minutes.length ? g.minutes.map(function (m) { return '<span class="gmin">' + esc(m.replace("(pen.)", "(" + t("goals.pen") + ")")) + "</span>"; }).join("") : '<span class="gmin muted">' + new Array(goalCount(g) + 1).join("⚽") + '</span>';
      return '<li class="goal"><span class="g-date">' + esc(dateStr(g.date, { day: "numeric", month: "short" })) + "<small>" + esc(String(g.date).slice(0, 4)) + "</small></span>" +
        '<span class="g-match">' + team(g.home) + " – " + team(g.away) + (g.score ? ' <b class="g-score">' + esc(g.score) + "</b>" : "") +
        '<span class="g-comp"><i class="gdot ' + compGroup(g.comp) + '"></i>' + esc(g.comp) + (tag ? " · " + esc(tag) : "") + (G.partial ? "" : " · " + esc(nthLabel(nth[g.date + g.minutes.join()], n))) + "</span></span>" +
        '<span class="g-mins">' + mins + "</span></li>";
    }).join("") : '<li class="empty">' + esc(t("goals.empty")) + "</li>";
    $("goalsMore").hidden = shown.length <= 5;
    $("goalsMore").textContent = goalsShown >= shown.length ? t("common.showLess") : t("common.showAll", { n: shown.length });

    var last = list[0], w = $("wGoal");
    if (!last) { w.hidden = true; return; }
    w.hidden = false;
    var opp = isMilan(last.home) ? last.away : last.home;
    $("lastGoal").innerHTML = '<p class="lg-opp">⚽ ' + esc(opp) + (last.minutes.length ? ' <span class="lg-min">' + esc(last.minutes.join(", ")) + "</span>" : "") + "</p>" +
      '<p class="w-sub">' + esc(last.home + " – " + last.away + (last.score ? " " + last.score : "")) + "<br>" + esc(last.comp) + ", " + esc(dateStr(last.date)) + "</p>" +
      (G.partial ? "" : '<p class="lg-nth">' + esc(nthLabel(total, goalCount(last))) + "</p>");
  }

  /* shrink the nickname until both words fit between the surname and the end of "Christian" */
  function fitNick() {
    var el = document.querySelector(".hero-nick"), h1 = document.querySelector(".hero-name");
    if (!el || !h1) return;
    var base = parseFloat(getComputedStyle(h1).fontSize);
    function tryFit(minEm) {
      var em = 0.15;
      el.style.fontSize = base * em + "px";
      while (el.scrollWidth > el.clientWidth + 1 && em > minEm) { em -= 0.005; el.style.fontSize = base * em + "px"; }
      return el.scrollWidth <= el.clientWidth + 1;
    }
    el.classList.remove("no-stars");
    if (!tryFit(0.11)) { el.classList.add("no-stars"); tryFit(0.07); }
  }
  window.addEventListener("resize", fitNick);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNick);

  function renderAll() {
    applyStatic(); renderHero(); renderNext(); renderFan(); renderAthlete();
    renderFixtures(); renderStandings(); renderStats(); renderProfile();
    renderMiniFixtures(); renderNews(); renderMiniTable(); renderMiniStats(); renderGoals(); renderHeroAch(); fitNick();
  }

  /* ---------- events ---------- */
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang; store("lang", lang);
      var u = new URL(location.href); u.searchParams.set("lang", lang); history.replaceState(null, "", u);
      renderAll();
    });
  });
  document.querySelectorAll("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      renderFixtures();
    });
  });
  document.querySelectorAll("[data-comp]").forEach(function (b) {
    b.addEventListener("click", function () {
      comp = b.dataset.comp;
      document.querySelectorAll("[data-comp]").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      renderStandings();
    });
  });
  document.querySelectorAll("[data-toggle-table]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = $(b.dataset.toggleTable); el.hidden = !el.hidden;
      b.textContent = el.hidden ? t("common.showTable") : t("common.hideTable");
    });
  });

  document.querySelectorAll("[data-sort]").forEach(function (b) {
    b.addEventListener("click", function () {
      feedSort = b.dataset.sort; feedShown = FEED_FIRST;
      document.querySelectorAll("[data-sort]").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      renderFanFeed();
    });
  });
  $("feedMore").addEventListener("click", function () { feedShown += 12; renderFanFeed(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-gseason],[data-gcomp]");
    if (!b) return;
    if (b.dataset.gseason) goalSeason = b.dataset.gseason; else goalComp = b.dataset.gcomp;
    goalsShown = 5; renderGoals();
  });
  $("goalsMore").addEventListener("click", function () {
    var open = goalsShown < 1000; goalsShown = open ? 1000 : 5; renderGoals();
    if (!open) $("goals").scrollIntoView({ block: "start" });
  });
  if ($("fixturesMore")) $("fixturesMore").addEventListener("click", function () {
    fixturesOpen = !fixturesOpen; renderFixtures();
    if (!fixturesOpen) $("matches").scrollIntoView({ block: "start" });
  });

  renderAll();

  if (location.protocol !== "file:") {
    fetch("data/live.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (live) { if (live) { merge(live); renderAll(); } })
      .catch(function () { /* snapshot only */ });
  }
})();
