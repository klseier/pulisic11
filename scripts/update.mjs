// Daily updater: writes data/live.json, which the page merges over assets/data.js.
// Runs in GitHub Actions (Node 20+, no dependencies). Every part is optional:
//   FOOTBALL_DATA_TOKEN  -> Serie A table + Milan fixtures/results (football-data.org, free tier)
//   API_FOOTBALL_KEY     -> Europa League table, USA fixtures, Pulisic's full stats (api-sports.io, free tier)
//   IG_USER_ID + IG_ACCESS_TOKEN -> Instagram public counts via the official Graph API
//                                   "Business Discovery" endpoint (needs your own IG Business/Creator
//                                   account linked to a Facebook Page — see README)
//   FAN_HANDLE / ATHLETE_HANDLE -> usernames (defaults: c.pulisic11 / cmpulisic)
import { readFile, writeFile, mkdir } from "node:fs/promises";

const OUT = new URL("../data/live.json", import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const MILAN_ID = 98; // AC Milan on football-data.org

let live = {};
try { live = JSON.parse(await readFile(OUT, "utf8")); } catch { /* first run */ }
live.updated = today;

async function getJSON(url, headers = {}) {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) }); // 30 s per request
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url.split("?")[0]}`);
  return r.json();
}

/* ---------- football-data.org ---------- */
const FD = process.env.FOOTBALL_DATA_TOKEN;
if (FD) {
  const h = { "X-Auth-Token": FD };
  const base = "https://api.football-data.org/v4";
  const compName = (m) => {
    const n = m.competition?.name || "";
    const md = m.matchday ? ` · MD ${m.matchday}` : "";
    return n + md;
  };
  const name = (t) => (t.id === MILAN_ID ? "AC Milan" : t.shortName || t.name);

  try {
    const st = await getJSON(`${base}/competitions/SA/standings`, h);
    const table = st.standings.find((s) => s.type === "TOTAL").table;
    live.standings = live.standings || {};
    live.standings.serieA = {
      label: `Serie A ${st.season.startDate.slice(0, 4)}/${String(+st.season.startDate.slice(0, 4) + 1).slice(2)}`,
      asOf: today,
      note: { en: `After matchday ${st.season.currentMatchday}`, it: `Dopo la ${st.season.currentMatchday}ª giornata` },
      zones: { cl: [1, 4], el: [5, 5], ecl: [6, 6], rel: [18, 20] },
      rows: table.map((r) => [name(r.team), r.playedGames, r.won, r.draw, r.lost, r.points]),
    };
    console.log("Serie A table: ok");
  } catch (e) { console.warn("Serie A table skipped:", e.message); }

  try {
    const up = await getJSON(`${base}/teams/${MILAN_ID}/matches?status=SCHEDULED,TIMED&limit=8`, h);
    live.fd = live.fd || {};
    live.fd.fixtures = up.matches.map((m) => ({
      team: "milan", comp: compName(m), home: name(m.homeTeam), away: name(m.awayTeam), date: m.utcDate, venue: m.venue || "",
    }));
    const done = await getJSON(`${base}/teams/${MILAN_ID}/matches?status=FINISHED&limit=40`, h);
    live.fd.results = done.matches.slice(-5).reverse().map((m) => ({
      comp: m.competition?.name || "", home: name(m.homeTeam), away: name(m.awayTeam),
      score: `${m.score.fullTime.home}–${m.score.fullTime.away}`, date: m.utcDate.slice(0, 10),
    }));
    console.log(`Milan Serie A fixtures: ${live.fd.fixtures.length}, results: ${live.fd.results.length}`);
  } catch (e) { console.warn("Milan fixtures skipped:", e.message); }

  try {
    // Pulisic's Serie A numbers from the league scorers list (he appears once he has scored)
    const sc = await getJSON(`${base}/competitions/SA/scorers?limit=200`, h);
    const me = sc.scorers.find((x) => /pulisic/i.test(x.player?.name || ""));
    if (me) {
      // playedMatches in this feed counts the team's matches, not his appearances, so it is not used
      live.fd = live.fd || {};
      live.fd.stats = { asOf: today, goals: me.goals ?? 0, assists: me.assists ?? 0 };
      console.log(`Pulisic: ${me.goals} goals, ${me.assists ?? 0} assists`);
    } else {
      console.log("Pulisic not in the scorers list yet — stats left as is.");
    }
  } catch (e) { console.warn("Scorers skipped:", e.message); }
} else {
  console.log("FOOTBALL_DATA_TOKEN not set — football data left as is.");
}

/* ---------- API-Football (api-sports.io), free plan: 100 requests/day ----------
   Runs about once a day (and on every manual run) and costs ~12 requests:
   Europa League table, all Milan and USA fixtures/results, Pulisic's appearances,
   starts and shots, and his all-competition Milan totals. */
const AFK = process.env.API_FOOTBALL_KEY;
const AF_EVERY = 20 * 3600e3;
const manual = process.env.GITHUB_EVENT_NAME && process.env.GITHUB_EVENT_NAME !== "schedule";
if (AFK && (manual || !live.af?.at || Date.now() - Date.parse(live.af.at) > AF_EVERY)) {
  const base = "https://v3.football.api-sports.io";
  let used = 0;
  async function af(path) {
    used++;
    const j = await getJSON(base + path, { "x-apisports-key": AFK });
    const errs = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
    if (errs && errs.length) throw new Error(errs.join("; "));
    return j.response;
  }
  const A = live.af || {};
  A.ids = A.ids || {};
  const seasonNow = (() => { const d = new Date(); return d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1; })();
  const round = (r) => (r || "").replace(/^(Regular Season|League Stage|League phase)\s*-\s*/i, "MD ");
  const nm = (t) => (t.id === A.ids.milan ? "AC Milan" : t.id === A.ids.usa ? "USA" : t.name);
  const fx = (m, team) => ({
    team, comp: `${m.league.name}${m.league.round ? " · " + round(m.league.round) : ""}`,
    home: nm(m.teams.home), away: nm(m.teams.away), date: m.fixture.date,
    venue: [m.fixture.venue?.name, m.fixture.venue?.city].filter(Boolean).join(", "),
    timeTbc: m.fixture.status?.short === "TBD" || undefined,
  });
  try {
    if (!A.ids.milan) A.ids.milan = (await af("/teams?name=AC%20Milan"))[0]?.team.id;
    if (!A.ids.usa) A.ids.usa = (await af("/teams?name=USA")).find((x) => x.team.national)?.team.id;
    if (!A.ids.el) A.ids.el = (await af("/leagues?id=3"))[0]?.league.id;
    console.log("API-Football ids:", JSON.stringify(A.ids));

    try {
      const st = await af(`/standings?league=${A.ids.el}&season=${seasonNow}`);
      const tbl = st[0]?.league.standings[0] || [];
      if (tbl.length) {
        A.europaLeague = {
          label: `UEFA Europa League ${seasonNow}/${String(seasonNow + 1).slice(2)}`,
          asOf: today,
          note: { en: `League phase, after matchday ${tbl[0].all.played}`, it: `Fase campionato, dopo la ${tbl[0].all.played}ª giornata` },
          zones: { r16: [1, 8], po: [9, 24], out: [25, 36] },
          rows: tbl.map((r) => [r.rank, nm(r.team), r.all.played, r.all.win, r.all.draw, r.all.lose, r.points]),
        };
        console.log(`Europa League table: ${tbl.length} rows`);
      }
    } catch (e) { console.warn("Europa League table skipped:", e.message); }

    try {
      const next = await af(`/fixtures?team=${A.ids.milan}&next=10`);
      const last = await af(`/fixtures?team=${A.ids.milan}&last=5`);
      A.milanFixtures = next.map((m) => fx(m, "milan"));
      A.milanResults = last.map((m) => ({
        comp: m.league.name, home: nm(m.teams.home), away: nm(m.teams.away),
        score: `${m.goals.home}–${m.goals.away}`, date: m.fixture.date.slice(0, 10),
      }));
      console.log(`Milan fixtures (all competitions): ${A.milanFixtures.length}, results: ${A.milanResults.length}`);
    } catch (e) { console.warn("Milan fixtures (API-Football) skipped:", e.message); }

    try {
      const nextUsa = await af(`/fixtures?team=${A.ids.usa}&next=5`);
      A.usaFixtures = nextUsa.map((m) => fx(m, "usa"));
      console.log(`USA fixtures: ${A.usaFixtures.length}`);
    } catch (e) { console.warn("USA fixtures skipped:", e.message); }

    try {
      if (!A.ids.pulisic) {
        const found = await af(`/players?team=${A.ids.milan}&season=${seasonNow}&search=pulisic`);
        A.ids.pulisic = found[0]?.player.id;
      }
      const milanStats = async (season) => {
        const r = await af(`/players?id=${A.ids.pulisic}&season=${season}`);
        return (r[0]?.statistics || []).filter((x) => x.team.id === A.ids.milan);
      };
      const cur = await milanStats(seasonNow);
      const sa = cur.find((x) => /serie a/i.test(x.league.name));
      if (sa) {
        A.serieA = {
          asOf: today, apps: sa.games.appearences ?? 0, starts: sa.games.lineups ?? 0,
          goals: sa.goals.total ?? 0, assists: sa.goals.assists ?? 0,
          shots: sa.shots.total ?? 0, shotsOnTarget: sa.shots.on ?? 0,
        };
        console.log(`Pulisic Serie A: ${A.serieA.apps} apps (${A.serieA.starts} starts), ${A.serieA.goals} G, ${A.serieA.assists} A`);
      }
      // all-competition Milan totals since he joined (2023/24)
      let apps = 0, goals = 0, assists = 0;
      for (let y = 2023; y <= seasonNow; y++) {
        const list = y === seasonNow ? cur : await milanStats(y);
        list.forEach((x) => { apps += x.games.appearences || 0; goals += x.goals.total || 0; assists += x.goals.assists || 0; });
      }
      if (apps) { A.milanTotals = { apps, goals, assists, asOf: today }; console.log(`Milan totals: ${apps} apps, ${goals} G, ${assists} A`); }
    } catch (e) { console.warn("Pulisic stats (API-Football) skipped:", e.message); }

    A.at = new Date().toISOString();
  } catch (e) { console.warn("API-Football skipped:", e.message); }
  live.af = A;
  console.log(`API-Football requests used this run: ${used}`);
} else if (AFK) {
  console.log("API-Football: already updated in the last 20 h — skipped to save the daily quota.");
} else {
  console.log("API_FOOTBALL_KEY not set — Europa League, USA and full stats left as is.");
}

/* ---------- Wikipedia (official MediaWiki API, free, no key) ----------
   Europa League league-phase table and Pulisic's USA caps/goals.
   Checked every 6 hours. If a page changes its layout and can't be read,
   the previous values are kept and the run continues. */
const WIKI_EVERY = 6 * 3600e3;
if (!live.wiki?.at || manual || Date.now() - Date.parse(live.wiki.at) > WIKI_EVERY) {
  const W = live.wiki || {};
  const UA = { "User-Agent": "pulisic11-fan-site/1.0 (https://github.com/klseier/pulisic11; GitHub Actions)" };
  const wiki = async (page) => {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&redirects=1&prop=text%7Cwikitext&page=${encodeURIComponent(page)}`;
    const j = await getJSON(url, UA);
    if (j.error) throw new Error(`${page}: ${j.error.info}`);
    return j.parse;
  };
  const strip = (h) => h.replace(/<sup[\s\S]*?<\/sup>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, "")
    .replace(/&#160;|&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8211;|&ndash;/g, "–").replace(/&#8722;|&minus;|−/g, "-")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\[[^\]]{1,3}\]/g, "").replace(/\s+/g, " ").trim();

  // 1) Europa League league-phase table: first wikitable with Pos/Team/Pld/W/D/L/Pts headers and 30+ rows
  try {
    const y = (() => { const d = new Date(); return d.getUTCMonth() >= 6 ? d.getUTCFullYear() : d.getUTCFullYear() - 1; })();
    const yy = String((y + 1) % 100).padStart(2, "0");
    let html = "";
    for (const title of [`${y}–${yy} UEFA Europa League league phase`, `${y}–${yy} UEFA Europa League`]) {
      try { html = (await wiki(title)).text; break; } catch (e) { console.warn("Wikipedia:", e.message); }
    }
    let rows = null;
    for (const t of html.match(/<table[^>]*wikitable[\s\S]*?<\/table>/gi) || []) {
      const trs = (t.match(/<tr[\s\S]*?<\/tr>/gi) || []).map((tr) => (tr.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) || []).map(strip));
      const hi = trs.findIndex((c) => c.includes("Pld") && c.includes("Pts") && c.some((x) => /^Pos/.test(x)));
      if (hi < 0) continue;
      const head = trs[hi], col = (k) => head.findIndex((x) => x === k || x.startsWith(k));
      const iPos = col("Pos"), iTeam = col("Team"), iP = col("Pld"), iW = col("W"), iD = col("D"), iL = col("L"), iPts = col("Pts");
      const data = trs.slice(hi + 1).filter((c) => /^\d+$/.test(c[iPos] || "") && /^\d+$/.test(c[iPts] || ""));
      if (data.length >= 30) {
        rows = data.map((c) => [+c[iPos], c[iTeam].replace(/\s*\((H|X|E|C)\)$/, "").replace(/^Milan$/, "AC Milan"), +c[iP], +c[iW], +c[iD], +c[iL], +c[iPts]]);
        break;
      }
    }
    if (rows) {
      W.europaLeague = {
        label: `UEFA Europa League ${y}/${yy}`, asOf: today,
        note: { en: `League phase, after matchday ${Math.max(...rows.map((r) => r[2]))} (Wikipedia)`, it: `Fase campionato, dopo la ${Math.max(...rows.map((r) => r[2]))}ª giornata (Wikipedia)` },
        zones: { r16: [1, 8], po: [9, 24], out: [25, 36] },
        rows,
      };
      console.log(`Europa League table (Wikipedia): ${rows.length} rows, Milan ${JSON.stringify(rows.find((r) => /milan/i.test(r[1])))}`);
    } else console.warn("Europa League table (Wikipedia): table not found — previous values kept.");
  } catch (e) { console.warn("Europa League table (Wikipedia) skipped:", e.message); }

  // 2) Pulisic's senior USA caps and goals from his infobox
  try {
    const pg = await wiki("Christian Pulisic");
    const wt = pg.wikitext || "", html = pg.text || "";
    const param = (name) => { const m = wt.match(new RegExp("\\|\\s*" + name + "\\s*=\\s*([^\\n]*)")); return m ? m[1].split(/\n\s*\|/)[0].trim() : null; };
    const youth = /under|U-?\s?\d{2}\b|olympic/i;
    let caps = NaN, goals = NaN, asOf = today;

    // a) infobox parameters in the wikitext (nationalteamN / nationalcapsN / nationalgoalsN)
    for (let i = 1; i <= 12; i++) {
      const team = param("nationalteam" + i);
      if (team && /United States/i.test(team) && !youth.test(team)) {
        caps = parseInt(param("nationalcaps" + i), 10); goals = parseInt(param("nationalgoals" + i), 10);
      }
    }
    // b) fallback: the rendered infobox, row "United States  90 (33)" (senior team is the last such row)
    if (isNaN(caps)) {
      const box = (html.match(/<table[^>]*infobox[\s\S]*?<\/table>/i) || [""])[0];
      const rows = (box.match(/<tr[\s\S]*?<\/tr>/gi) || []).map((r) => strip(r.replace(/<\/t[hd]>/gi, " ")));
      const hits = rows.filter((r) => /United States/i.test(r) && !youth.test(r) && /\d+\s*\(\s*\d+\s*\)/.test(r));
      if (hits.length) {
        const m = hits[hits.length - 1].match(/(\d+)\s*\(\s*(\d+)\s*\)\s*$/) || hits[hits.length - 1].match(/(\d+)\s*\(\s*(\d+)\s*\)/);
        caps = parseInt(m[1], 10); goals = parseInt(m[2], 10);
      }
      const upd = rows.find((r) => /National team caps and goals correct as of/i.test(r)) ||
                  (strip(html).match(/National team caps and goals correct as of ([^.]+?\d{4})/i) || [])[0];
      const dm = upd && upd.match(/(\d{1,2} [A-Z][a-z]+ \d{4})/);
      if (dm) { const d = Date.parse(dm[1] + " UTC"); if (!isNaN(d)) asOf = new Date(d).toISOString().slice(0, 10); }
    } else {
      const upd = (param("nationalteam-update") || "").replace(/\{\{[^|}]*\|/, "").replace(/[{}]/g, "").replace(/\|/g, " ").trim();
      const d = Date.parse(upd + " UTC");
      if (!isNaN(d)) asOf = new Date(d).toISOString().slice(0, 10);
    }

    if (!isNaN(caps) && !isNaN(goals) && caps > 0) {
      W.usa = { caps, goals, asOf };
      console.log(`USA (Wikipedia): ${caps} caps, ${goals} goals, as of ${asOf}`);
    } else {
      console.warn("USA caps (Wikipedia): senior team row not found — previous values kept. Debug lines below:");
      wt.split("\n").filter((l) => /national|caps|United States/i.test(l)).slice(0, 15).forEach((l) => console.warn("  wt> " + l.slice(0, 160)));
      const box = (html.match(/<table[^>]*infobox[\s\S]*?<\/table>/i) || [""])[0];
      (box.match(/<tr[\s\S]*?<\/tr>/gi) || []).map(strip).filter((r) => /United States|International/i.test(r)).slice(0, 10)
        .forEach((r) => console.warn("  box> " + r.slice(0, 160)));
    }
  } catch (e) { console.warn("USA caps (Wikipedia) skipped:", e.message); }

  W.at = new Date().toISOString();
  live.wiki = W;
} else {
  console.log("Wikipedia: checked in the last 6 h — skipped.");
}

/* ---------- combine both football sources into what the page reads ---------- */
{
  const A = live.af || {}, F = live.fd || {};
  const byDay = new Map();
  const add = (f) => { const k = f.team + "|" + String(f.date).slice(0, 10); if (!byDay.has(k)) byDay.set(k, f); };
  (F.fixtures || []).forEach(add);           // hourly, Serie A
  (A.milanFixtures || []).forEach(add);      // daily, all competitions
  (A.usaFixtures || []).forEach(add);
  if (byDay.size) live.fixtures = [...byDay.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  // Pulisic's goals/assists per match: when the hourly Serie A totals go up, credit the latest finished match
  live.pulisicLog = live.pulisicLog || {};
  if (F.stats) {
    const prev = live.pulisicPrev;
    if (prev) {
      const dg = F.stats.goals - prev.goals, da = F.stats.assists - prev.assists;
      const lastMatch = (F.results || []).filter((r) => r.date <= today && /serie a/i.test(r.comp)).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      if ((dg > 0 || da > 0) && lastMatch) {
        const e = live.pulisicLog[lastMatch.date] || { g: 0, a: 0 };
        e.g += Math.max(0, dg); e.a += Math.max(0, da);
        live.pulisicLog[lastMatch.date] = e;
        console.log(`Pulisic +${Math.max(0, dg)} G, +${Math.max(0, da)} A credited to ${lastMatch.home}–${lastMatch.away} (${lastMatch.date})`);
      }
    }
    live.pulisicPrev = { goals: F.stats.goals, assists: F.stats.assists };
  }
  const note = (e) => {
    const en = [], it = [];
    if (e.g) { en.push(e.g === 1 ? "Goal" : `${e.g} goals`); it.push(e.g === 1 ? "Gol" : `${e.g} gol`); }
    if (e.a) { en.push(e.a === 1 ? "Assist" : `${e.a} assists`); it.push(e.a === 1 ? "Assist" : `${e.a} assist`); }
    return en.length ? { en: en.join(" + "), it: it.join(" + ") } : undefined;
  };

  const res = new Map();
  [...(F.results || []), ...(A.milanResults || [])].forEach((r) => { if (!res.has(r.date)) res.set(r.date, r); });
  if (res.size) live.recentResults = [...res.values()].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5)
    .map((r) => (live.pulisicLog[r.date] ? { ...r, pulisic: note(live.pulisicLog[r.date]) } : r));

  const elTable = A.europaLeague || live.wiki?.europaLeague;
  if (elTable) { live.standings = live.standings || {}; live.standings.europaLeague = elTable; }
  if (live.wiki?.usa) live.intl = live.wiki.usa;

  const cs = A.serieA ? { ...A.serieA } : {};
  if (F.stats) {
    // football-data refreshes goals/assists hourly; keep the higher (newer) count
    cs.goals = Math.max(cs.goals ?? 0, F.stats.goals); cs.assists = Math.max(cs.assists ?? 0, F.stats.assists);
    cs.asOf = A.serieA && A.serieA.asOf > F.stats.asOf ? A.serieA.asOf : F.stats.asOf;
  }
  if (Object.keys(cs).length || A.milanTotals) {
    live.clubStats = {};
    if (Object.keys(cs).length) live.clubStats.currentSeason = cs;
    if (A.milanTotals) live.clubStats.milanTotals = A.milanTotals;
  }
}

/* ---------- Instagram Graph API: Business Discovery ---------- */
// Reads public data of other Business/Creator accounts: counts + recent media
// with images, like and comment counts. The fan page is the main subject.
const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;
const PROFILES = [
  { key: "fanPage", handle: process.env.FAN_HANDLE || "c.pulisic11", limit: 50 },
  { key: "athlete", handle: process.env.ATHLETE_HANDLE || "cmpulisic", limit: 12 },
];

async function discover(handle, limit, withThumb) {
  const mediaFields = ["caption", "media_type", "media_url", "permalink", "timestamp", "like_count", "comments_count"]
    .concat(withThumb ? ["thumbnail_url"] : []).join(",");
  const fields = `business_discovery.username(${handle}){name,biography,profile_picture_url,followers_count,follows_count,media_count,` +
    `media.limit(${limit}){${mediaFields}}}`;
  const url = `https://graph.facebook.com/v26.0/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${IG_ACCESS_TOKEN}`;
  return (await getJSON(url)).business_discovery;
}

/* Hourly like snapshots (data/snapshots.json, not loaded by the page).
   "Trending" compares current likes with the snapshot taken about 24 hours ago. */
const SNAP = new URL("../data/snapshots.json", import.meta.url);
let snaps = {};
try { snaps = JSON.parse(await readFile(SNAP, "utf8")); } catch { /* first run */ }
const DAY = 24 * 3600e3;
const shortcode = (url) => (url.match(/\/(?:p|reel|tv)\/([^/?#]+)/) || [])[1] || url;

function dailyBaseline(list, now) {
  // newest snapshot that is at least 24 h old; while the history is shorter than a day, the oldest one
  const old = list.filter((x) => now - Date.parse(x.at) >= DAY);
  return old.length ? old[old.length - 1] : list[0] || null;
}

let igFailed = false;
if (IG_USER_ID && IG_ACCESS_TOKEN) {
  for (const { key, handle, limit } of PROFILES) {
    try {
      let bd;
      try { bd = await discover(handle, limit, true); } catch { bd = await discover(handle, limit, false); }
      const media = bd.media?.data || [];
      const p = live[key] || {};
      const now = Date.now();
      const list = (snaps[key] || []).slice().sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
      const base = dailyBaseline(list, now);
      p.handle = handle;
      if (bd.name) p.name = bd.name;
      if (bd.profile_picture_url) p.avatar = bd.profile_picture_url;
      if (bd.biography) p.bio = bd.biography.split("\n").filter(Boolean);
      p.followers = bd.followers_count;
      p.following = bd.follows_count;
      p.posts = bd.media_count;
      p.source = `Instagram Graph API, ${today}`;
      p.prevFetchedAt = base ? base.at : null; // start of the trending window
      p.fetchedAt = new Date(now).toISOString();
      p.history = (p.history || []).filter((h) => h.date !== today).concat({ date: today, followers: bd.followers_count });
      p.postsList = media.map((m) => ({
        url: m.permalink,
        date: m.timestamp.slice(0, 10),
        type: m.media_type,
        image: m.media_type === "VIDEO" ? (m.thumbnail_url || null) : (m.media_url || null),
        caption: (m.caption || "").slice(0, 300),
        likes: m.like_count ?? null,
        comments: m.comments_count ?? null,
        likesPrev: base ? (base.likes[shortcode(m.permalink)] ?? null) : null,
      }));
      // store this run and drop snapshots that are no longer needed (keep the last ~day plus the baseline)
      const likes = {};
      media.forEach((m) => { if (typeof m.like_count === "number") likes[shortcode(m.permalink)] = m.like_count; });
      list.push({ at: p.fetchedAt, likes });
      const keepFrom = now - DAY - 2 * 3600e3;
      snaps[key] = list.filter((x) => Date.parse(x.at) >= keepFrom || x === dailyBaseline(list, now));
      live[key] = p;
      console.log(`@${handle}: ${bd.followers_count} followers, ${media.length} posts read`);
    } catch (e) { console.warn(`@${handle} skipped:`, e.message); igFailed = true; }
  }
} else {
  console.log("IG_USER_ID / IG_ACCESS_TOKEN not set — Instagram left as is.");
}

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(live, null, 2) + "\n");
await writeFile(SNAP, JSON.stringify(snaps) + "\n");
console.log("Wrote data/live.json");
// Fail the run (GitHub then e-mails you) when Instagram could not be read, e.g. an expired token.
if (igFailed) {
  console.error("Instagram request failed. If the message mentions the token, generate a new one (see README).");
  process.exitCode = 1;
}
