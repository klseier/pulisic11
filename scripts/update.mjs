// Daily updater: writes data/live.json, which the page merges over assets/data.js.
// Runs in GitHub Actions (Node 20+, no dependencies). Every part is optional:
//   FOOTBALL_DATA_TOKEN  -> Serie A table + Milan fixtures/results (football-data.org, free tier)
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
  const r = await fetch(url, { headers });
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
    live.fixtures = up.matches.map((m) => ({
      team: "milan", comp: compName(m), home: name(m.homeTeam), away: name(m.awayTeam), date: m.utcDate, venue: m.venue || "",
    }));
    const done = await getJSON(`${base}/teams/${MILAN_ID}/matches?status=FINISHED&limit=40`, h);
    live.recentResults = done.matches.slice(-5).reverse().map((m) => ({
      comp: m.competition?.name || "", home: name(m.homeTeam), away: name(m.awayTeam),
      score: `${m.score.fullTime.home}–${m.score.fullTime.away}`, date: m.utcDate.slice(0, 10),
    }));
    console.log(`Milan fixtures: ${live.fixtures.length}, results: ${live.recentResults.length}`);
  } catch (e) { console.warn("Milan fixtures skipped:", e.message); }

  try {
    // Pulisic's Serie A numbers from the league scorers list (he appears once he has scored)
    const sc = await getJSON(`${base}/competitions/SA/scorers?limit=200`, h);
    const me = sc.scorers.find((x) => /pulisic/i.test(x.player?.name || ""));
    if (me) {
      live.clubStats = {
        currentSeason: {
          asOf: today,
          apps: me.playedMatches ?? undefined,
          goals: me.goals ?? 0,
          assists: me.assists ?? 0,
        },
      };
      console.log(`Pulisic: ${me.goals} goals, ${me.assists ?? 0} assists in ${me.playedMatches} matches`);
    } else {
      console.log("Pulisic not in the scorers list yet — stats left as is.");
    }
  } catch (e) { console.warn("Scorers skipped:", e.message); }
} else {
  console.log("FOOTBALL_DATA_TOKEN not set — football data left as is.");
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
  const fields = `business_discovery.username(${handle}){name,biography,followers_count,follows_count,media_count,` +
    `media.limit(${limit}){${mediaFields}}}`;
  const url = `https://graph.facebook.com/v26.0/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${IG_ACCESS_TOKEN}`;
  return (await getJSON(url)).business_discovery;
}

let igFailed = false;
if (IG_USER_ID && IG_ACCESS_TOKEN) {
  for (const { key, handle, limit } of PROFILES) {
    try {
      let bd;
      try { bd = await discover(handle, limit, true); } catch { bd = await discover(handle, limit, false); }
      const media = bd.media?.data || [];
      const p = live[key] || {};
      p.handle = handle;
      if (bd.name) p.name = bd.name;
      if (bd.biography) p.bio = bd.biography.split("\n").filter(Boolean);
      p.followers = bd.followers_count;
      p.following = bd.follows_count;
      p.posts = bd.media_count;
      p.source = `Instagram Graph API, ${today}`;
      p.history = (p.history || []).filter((h) => h.date !== today).concat({ date: today, followers: bd.followers_count });
      p.postsList = media.map((m) => ({
        url: m.permalink,
        date: m.timestamp.slice(0, 10),
        type: m.media_type,
        image: m.media_type === "VIDEO" ? (m.thumbnail_url || null) : (m.media_url || null),
        caption: (m.caption || "").slice(0, 300),
        likes: m.like_count ?? null,
        comments: m.comments_count ?? null,
      }));
      live[key] = p;
      console.log(`@${handle}: ${bd.followers_count} followers, ${media.length} posts read`);
    } catch (e) { console.warn(`@${handle} skipped:`, e.message); igFailed = true; }
  }
} else {
  console.log("IG_USER_ID / IG_ACCESS_TOKEN not set — Instagram left as is.");
}

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(live, null, 2) + "\n");
console.log("Wrote data/live.json");
// Fail the run (GitHub then e-mails you) when Instagram could not be read, e.g. an expired token.
if (igFailed) {
  console.error("Instagram request failed. If the message mentions the token, generate a new one (see README).");
  process.exitCode = 1;
}
