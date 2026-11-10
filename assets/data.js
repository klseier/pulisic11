/*
 * SNAPSHOT DATA — edit this file to update the site by hand.
 * If the optional GitHub Action is enabled (see README), it writes data/live.json,
 * and the page merges those fresher values over this snapshot automatically.
 *
 * Dates: ISO 8601 with time-zone offset. The page converts kick-off times
 * to each visitor's local time.
 */
window.SITE_DATA = {
  updated: "2026-11-09",

  player: {
    name: "Christian Pulisic",
    shirt: 11,
    born: "1998-09-18",
    birthplace: "Hershey, Pennsylvania, USA",
    heightCm: 177,
    foot: { en: "Both", it: "Ambidestro" },
    position: { en: "Winger / attacking midfielder", it: "Ala / trequartista" },
    club: "AC Milan",
    clubCoach: "Rúben Amorim",
    contractUntil: "2031-06-30",
    nickname: "Captain America",
    nationalTeam: "USA",
    nationalCoach: "Mauricio Pochettino",
    caps: 90,
    intlGoals: 33,
    intlAsOf: "2026-10-30",
  },

  /* ---------------------------------------------------------------
   * FAN PAGE — the main subject of the site
   * history: follower snapshots (one line per check). The updater adds
   *   one per day automatically once it is enabled.
   * postsList: filled automatically by the updater (with images, likes,
   *   comments). You can also paste posts by hand:
   *   { url: "https://www.instagram.com/p/SHORTCODE/", date: "2026-11-08", likes: 812, comments: 24 }
   *   Hand-added posts without an "image" are shown as official Instagram embeds.
   * ------------------------------------------------------------- */
  fanPage: {
    handle: "c.pulisic11",
    name: "Christian Pulisic FP",
    category: { en: "Personal blog", it: "Blog personale" },
    bio: [
      "📁 Fanpage of @cmpulisic 🇺🇸 | @acmilan ❤️🖤",
      "⚽ Season 2026/27 → 4G – 1A",
      "🎯 Total score for AC Milan → 46G / 25A",
    ],
    followers: 15700,
    followersApprox: true,
    following: 54,
    posts: 241,
    source: "instagram.com/c.pulisic11, 9 Nov 2026",
    history: [
      { date: "2026-11-09", followers: 15700, estimated: true },
    ],
    postsList: [],
  },

  /* ---------------------------------------------------------------
   * THE ATHLETE'S OWN PROFILE — shown as a separate compact widget
   * ------------------------------------------------------------- */
  athlete: {
    handle: "cmpulisic",
    name: "Christian Pulisic",
    followers: 7706907,
    following: 563,
    posts: 282,
    source: "HypeAuditor / Instastatistics, Nov 2026",
    history: [
      { date: "2026-11-09", followers: 7706907 },
    ],
    postsList: [],
  },

  /* ---------------------------------------------------------------
   * FIXTURES — upcoming matches for Milan and the USA
   * ------------------------------------------------------------- */
  fixtures: [
    { team: "usa", comp: "CONCACAF Nations League · QF 1st leg", home: "Haiti", away: "USA", date: "2026-11-14T16:30:00-05:00", venue: "Nu Stadium, Miami" },
    { team: "usa", comp: "CONCACAF Nations League · QF 2nd leg", home: "USA", away: "Haiti", date: "2026-11-17T19:00:00-05:00", venue: "TQL Stadium, Cincinnati" },
    { team: "milan", comp: "Serie A · MD 12", home: "AC Milan", away: "Frosinone", date: "2026-11-22T18:00:00+01:00", venue: "San Siro, Milano" },
    { team: "milan", comp: "Europa League · MD 5", home: "Olympiacos", away: "AC Milan", date: "2026-11-26T21:00:00+01:00", venue: "Piraeus", timeTbc: true },
    { team: "milan", comp: "Serie A · MD 13", home: "Cagliari", away: "AC Milan", date: "2026-11-30T20:45:00+01:00", venue: "Cagliari" },
    { team: "milan", comp: "Serie A · MD 14", home: "AC Milan", away: "Parma", date: "2026-12-06T20:45:00+01:00", venue: "San Siro, Milano" },
    { team: "milan", comp: "Europa League · MD 6", home: "AC Milan", away: "Sunderland", date: "2026-12-10T21:00:00+01:00", venue: "San Siro, Milano", timeTbc: true },
    { team: "milan", comp: "Europa League · MD 7", home: "Levski Sofia", away: "AC Milan", date: "2027-01-21T21:00:00+01:00", venue: "Sofia" },
    { team: "milan", comp: "Europa League · MD 8", home: "AC Milan", away: "Ararat-Armenia", date: "2027-01-28T21:00:00+01:00", venue: "San Siro, Milano" },
  ],

  recentResults: [
    { comp: "Serie A", home: "Genoa", away: "AC Milan", score: "1–2", date: "2026-11-08", pulisic: { en: "Goal (19')", it: "Gol (19')" } },
    { comp: "Europa League", home: "AC Milan", away: "Ferencváros", score: "0–2", date: "2026-11-05" },
    { comp: "Serie A", home: "AC Milan", away: "Inter", score: "3–1", date: "2026-10-31", pulisic: { en: "Goal (4')", it: "Gol (4')" } },
    { comp: "Serie A", home: "AC Milan", away: "Bologna", score: "2–4", date: "2026-10-28" },
    { comp: "Serie A", home: "Udinese", away: "AC Milan", score: "0–2", date: "2026-10-25", pulisic: { en: "Goal (6')", it: "Gol (6')" } },
  ],

  /* ---------------------------------------------------------------
   * STANDINGS
   * ------------------------------------------------------------- */
  standings: {
    serieA: {
      label: "Serie A 2026/27",
      asOf: "2026-11-08",
      note: { en: "After matchday 11", it: "Dopo l'11ª giornata" },
      zones: { cl: [1, 4], el: [5, 5], ecl: [6, 6], rel: [18, 20] },
      rows: [
        ["Lazio", 11, 9, 2, 0, 29], ["Inter", 11, 9, 1, 1, 28], ["Roma", 11, 8, 3, 0, 27],
        ["AC Milan", 11, 7, 3, 1, 24], ["Como", 11, 7, 2, 2, 23], ["Frosinone", 11, 6, 2, 3, 20],
        ["Juventus", 11, 5, 3, 3, 18], ["Bologna", 11, 5, 2, 4, 17], ["Cagliari", 11, 5, 1, 5, 16],
        ["Napoli", 11, 4, 3, 4, 15], ["Torino", 11, 4, 2, 5, 14], ["Atalanta", 11, 4, 2, 5, 14],
        ["Genoa", 11, 4, 1, 6, 13], ["Lecce", 11, 3, 1, 7, 10], ["Fiorentina", 11, 2, 3, 6, 9],
        ["Parma", 11, 2, 2, 7, 8], ["Sassuolo", 11, 2, 2, 7, 8], ["Monza", 11, 2, 1, 8, 7],
        ["Venezia", 11, 2, 0, 9, 6], ["Udinese", 11, 1, 2, 8, 5],
      ],
    },
    europaLeague: {
      label: "UEFA Europa League 2026/27",
      asOf: "2026-11-05",
      note: { en: "League phase, after matchday 4 — top 6 and Milan", it: "Fase campionato, dopo la 4ª giornata — prime 6 e Milan" },
      zones: { r16: [1, 8], po: [9, 24], out: [25, 36] },
      rows: [
        [1, "Benfica", 4, 4, 0, 0, 12], [2, "Bournemouth", 4, 4, 0, 0, 12], [3, "Ferencváros", 4, 4, 0, 0, 12],
        [4, "Union SG", 4, 3, 1, 0, 10], [5, "Juventus", 4, 3, 1, 0, 10], [6, "Olympiacos", 4, 3, 1, 0, 10],
        [26, "AC Milan", 4, 1, 0, 3, 3],
      ],
    },
  },

  /* ---------------------------------------------------------------
   * CLUB STATS (Serie A by season, Milan only)
   * ------------------------------------------------------------- */
  clubStats: {
    currentSeason: {
      label: "Serie A 2026/27",
      asOf: "2026-11-08",
      apps: 8, starts: 6, goals: 4, assists: 1, shots: 11, shotsOnTarget: 7, yellow: 2,
    },
    milanTotals: { apps: 145, goals: 46, assists: 25, asOf: "2026-11-10" }, // Flashscore, 10 Nov 2026: 145 apps, 46 G, 25 A (matches the fan page bio)
    seasons: [
      { season: "2023/24", apps: 36, goals: 12, assists: 8 },
      { season: "2024/25", apps: 34, goals: 11, assists: 9 },
      { season: "2025/26", apps: 30, goals: 8, assists: 4 },
      { season: "2026/27", apps: 8, goals: 4, assists: 1, live: true },
    ],
  },

  /* ---------------------------------------------------------------
   * GOALS FOR MILAN — filled automatically from Wikipedia's season articles.
   * This seed covers 2026/27 so far and is shown until the full list loads.
   * ------------------------------------------------------------- */
  goals: {
    partial: false,
    asOf: "2026-11-10",
    list: [
      {"date": "2026-11-08", "comp": "Serie A", "home": "Genoa", "away": "AC Milan", "score": "1–2", "minutes": ["19'"], "season": "2026/27"},
      {"date": "2026-10-31", "comp": "Serie A", "home": "AC Milan", "away": "Inter", "score": "3–1", "minutes": ["4'"], "season": "2026/27"},
      {"date": "2026-10-25", "comp": "Serie A", "home": "Udinese", "away": "AC Milan", "score": "0–2", "minutes": ["6'"], "season": "2026/27"},
      {"date": "2026-09-20", "comp": "Serie A", "home": "AC Milan", "away": "Lecce", "score": "3–0", "minutes": ["14'"], "season": "2026/27"},
      {"date": "2025-12-28", "comp": "Serie A", "home": "AC Milan", "away": "Hellas Verona", "score": "3–0", "minutes": ["45+1'"], "season": "2025/26"},
      {"date": "2025-12-08", "comp": "Serie A", "home": "Torino", "away": "AC Milan", "score": "2–3", "minutes": ["67'", "77'"], "season": "2025/26"},
      {"date": "2025-11-23", "comp": "Serie A", "home": "Inter", "away": "AC Milan", "score": "0–1", "minutes": ["54'"], "season": "2025/26"},
      {"date": "2025-09-28", "comp": "Serie A", "home": "AC Milan", "away": "Napoli", "score": "2–1", "minutes": ["31'"], "season": "2025/26"},
      {"date": "2025-09-23", "comp": "Coppa Italia", "home": "AC Milan", "away": "Lecce", "score": "3–0", "minutes": ["64'"], "season": "2025/26"},
      {"date": "2025-09-20", "comp": "Serie A", "home": "Udinese", "away": "AC Milan", "score": "0–3", "minutes": ["40'", "53'"], "season": "2025/26"},
      {"date": "2025-08-29", "comp": "Serie A", "home": "Lecce", "away": "AC Milan", "score": "0–2", "minutes": ["86'"], "season": "2025/26"},
      {"date": "2025-08-17", "comp": "Coppa Italia", "home": "AC Milan", "away": "Bari", "score": "2–0", "minutes": ["48'"], "season": "2025/26"},
      {"date": "2025-05-09", "comp": "Serie A", "home": "AC Milan", "away": "Bologna", "score": "3–1", "minutes": ["79'"], "season": "2024/25"},
      {"date": "2025-04-27", "comp": "Serie A", "home": "Venezia", "away": "AC Milan", "score": "0–2", "minutes": ["5'"], "season": "2024/25"},
      {"date": "2025-03-15", "comp": "Serie A", "home": "AC Milan", "away": "Como", "score": "2–1", "minutes": ["53'"], "season": "2024/25"},
      {"date": "2025-03-08", "comp": "Serie A", "home": "Lecce", "away": "AC Milan", "score": "2–3", "minutes": ["73' (pen.)", "81'"], "season": "2024/25"},
      {"date": "2025-01-29", "comp": "Champions League", "home": "Dinamo Zagreb", "away": "AC Milan", "score": "2–1", "minutes": ["53'"], "season": "2024/25"},
      {"date": "2025-01-26", "comp": "Serie A", "home": "AC Milan", "away": "Parma", "score": "3–2", "minutes": ["38'"], "season": "2024/25"},
      {"date": "2025-01-06", "comp": "Supercoppa Italiana", "home": "Inter", "away": "AC Milan", "score": "2–3", "minutes": ["80'"], "season": "2024/25"},
      {"date": "2025-01-03", "comp": "Supercoppa Italiana", "home": "Juventus", "away": "AC Milan", "score": "1–2", "minutes": ["71' (pen.)"], "season": "2024/25"},
      {"date": "2024-11-26", "comp": "Champions League", "home": "Slovan Bratislava", "away": "AC Milan", "score": "2–3", "minutes": ["21'"], "season": "2024/25"},
      {"date": "2024-10-22", "comp": "Champions League", "home": "AC Milan", "away": "Club Brugge", "score": "3–1", "minutes": ["34'"], "season": "2024/25"},
      {"date": "2024-10-06", "comp": "Serie A", "home": "Fiorentina", "away": "AC Milan", "score": "2–1", "minutes": ["60'"], "season": "2024/25"},
      {"date": "2024-09-27", "comp": "Serie A", "home": "AC Milan", "away": "Lecce", "score": "3–0", "minutes": ["43'"], "season": "2024/25"},
      {"date": "2024-09-22", "comp": "Serie A", "home": "Inter", "away": "AC Milan", "score": "1–2", "minutes": ["10'"], "season": "2024/25"},
      {"date": "2024-09-17", "comp": "Champions League", "home": "AC Milan", "away": "Liverpool", "score": "1–3", "minutes": ["3'"], "season": "2024/25"},
      {"date": "2024-09-14", "comp": "Serie A", "home": "AC Milan", "away": "Venezia", "score": "4–0", "minutes": ["25' (pen.)"], "season": "2024/25"},
      {"date": "2024-08-24", "comp": "Serie A", "home": "Parma", "away": "AC Milan", "score": "2–1", "minutes": ["66'"], "season": "2024/25"},
      {"date": "2024-05-11", "comp": "Serie A", "home": "AC Milan", "away": "Cagliari", "score": "5–1", "minutes": ["59'", "86'"], "season": "2023/24"},
      {"date": "2024-04-06", "comp": "Serie A", "home": "AC Milan", "away": "Lecce", "score": "3–0", "minutes": ["6'"], "season": "2023/24"},
      {"date": "2024-03-17", "comp": "Serie A", "home": "Hellas Verona", "away": "AC Milan", "score": "1–3", "minutes": ["50'"], "season": "2023/24"},
      {"date": "2024-03-14", "comp": "Europa League", "home": "Slavia Prague", "away": "AC Milan", "score": "1–3", "minutes": ["33'"], "season": "2023/24"},
      {"date": "2024-03-10", "comp": "Serie A", "home": "AC Milan", "away": "Empoli", "score": "1–0", "minutes": ["40'"], "season": "2023/24"},
      {"date": "2024-03-07", "comp": "Europa League", "home": "AC Milan", "away": "Slavia Prague", "score": "4–2", "minutes": ["85'"], "season": "2023/24"},
      {"date": "2024-02-18", "comp": "Serie A", "home": "Monza", "away": "AC Milan", "score": "4–2", "minutes": ["88'"], "season": "2023/24"},
      {"date": "2023-12-30", "comp": "Serie A", "home": "AC Milan", "away": "Sassuolo", "score": "1–0", "minutes": ["59'"], "season": "2023/24"},
      {"date": "2023-12-13", "comp": "Champions League", "home": "Newcastle United", "away": "AC Milan", "score": "1–2", "minutes": ["59'"], "season": "2023/24"},
      {"date": "2023-12-02", "comp": "Serie A", "home": "AC Milan", "away": "Frosinone", "score": "3–1", "minutes": ["50'"], "season": "2023/24"},
      {"date": "2023-10-07", "comp": "Serie A", "home": "Genoa", "away": "AC Milan", "score": "0–1", "minutes": ["87'"], "season": "2023/24"},
      {"date": "2023-09-30", "comp": "Serie A", "home": "AC Milan", "away": "Lazio", "score": "2–0", "minutes": ["60'"], "season": "2023/24"},
      {"date": "2023-08-26", "comp": "Serie A", "home": "AC Milan", "away": "Torino", "score": "4–1", "minutes": ["33'"], "season": "2023/24"},
      {"date": "2023-08-21", "comp": "Serie A", "home": "Bologna", "away": "AC Milan", "score": "0–2", "minutes": ["21'"], "season": "2023/24"},
    ],
  },

  career: [
    { years: "2015–2019", club: "Borussia Dortmund", country: "DE" },
    { years: "2019–2023", club: "Chelsea", country: "EN" },
    { years: "2023–", club: "AC Milan", country: "IT" },
  ],

  honours: [
    { year: "2017", title: "DFB-Pokal", team: "Borussia Dortmund" },
    { year: "2021", title: "UEFA Champions League", team: "Chelsea" },
    { year: "2021", title: "UEFA Super Cup", team: "Chelsea" },
    { year: "2024/25", title: "Supercoppa Italiana", team: "AC Milan" },
    { year: "2021, 2023, 2024", title: "CONCACAF Nations League", team: "USA" },
  ],

  sources: [
    { name: "ESPN — player stats & Genoa 1–2 Milan", url: "https://www.espn.com/soccer/player/_/id/225607/christian-pulisic" },
    { name: "AC Milan — fixtures", url: "https://www.acmilan.com/" },
    { name: "U.S. Soccer — November camp (via SI)", url: "https://www.si.com/soccer/usmnt-november-2026-roster-confirmed-full-list-players-stars-schedule" },
    { name: "Instagram — @c.pulisic11 (fan page)", url: "https://www.instagram.com/c.pulisic11/" },
    { name: "HypeAuditor — @cmpulisic", url: "https://hypeauditor.com/instagram/cmpulisic/" },
    { name: "bet365 News / WH News — Serie A table", url: "https://news.bet365.it/" },
  ],
};
