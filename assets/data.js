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
    seasonTotals: { label: "2026/27", goals: 4, assists: 1, asOf: "2026-11-10" }, // all competitions this season (Flashscore); Serie A goals after asOf are added automatically
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
  // "On this day": milestones of his career and his time at Milan. Every Milan goal from the goals list
  // below is added automatically, so only the moments that are not goals (or deserve more words) live here.
  history: [
    { d: "1998-09-18", t: "career", en: "Born in Hershey, Pennsylvania", it: "Nasce a Hershey, in Pennsylvania" },
    { d: "2016-01-30", t: "career", en: "Bundesliga debut for Borussia Dortmund, aged 17", it: "Debutto in Bundesliga con il Borussia Dortmund, a 17 anni" },
    { d: "2016-03-28", t: "usa", en: "Debut for the USA, against Guatemala", it: "Debutto con gli USA, contro il Guatemala" },
    { d: "2016-04-17", t: "career", en: "First Bundesliga goal, against Hamburg", it: "Primo gol in Bundesliga, contro l'Amburgo" },
    { d: "2016-05-28", t: "usa", en: "First goal for the USA, against Bolivia", it: "Primo gol con gli USA, contro la Bolivia" },
    { d: "2016-09-14", t: "career", en: "Champions League debut: assist in a 6–0 win at Legia, the youngest Dortmund player ever to start in the competition", it: "Debutto in Champions: assist nel 6–0 al Legia, il più giovane titolare del Dortmund nella competizione" },
    { d: "2017-03-08", t: "career", en: "First Champions League goal: a chip against Benfica sends Dortmund into the quarter-finals", it: "Primo gol in Champions: un pallonetto al Benfica porta il Dortmund ai quarti" },
    { d: "2017-05-27", t: "career", en: "Wins the DFB-Pokal with Dortmund", it: "Vince la Coppa di Germania con il Dortmund" },
    { d: "2017-10-10", t: "usa", en: "Scores in a 2–1 loss in Trinidad, but the USA miss the 2018 World Cup", it: "Segna nel 2–1 subito a Trinidad, ma gli USA mancano il Mondiale 2018" },
    { d: "2018-05-28", t: "usa", en: "Captains the USA for the first time, aged 19", it: "Prima volta capitano degli USA, a 19 anni" },
    { d: "2019-01-02", t: "career", en: "Joins Chelsea in a record deal for an American player", it: "Passa al Chelsea, record per un giocatore americano" },
    { d: "2019-07-07", t: "usa", en: "Gold Cup final lost 1–0 to Mexico; named Young Player of the tournament", it: "Finale di Gold Cup persa 1–0 col Messico; miglior giovane del torneo" },
    { d: "2019-08-11", t: "career", en: "Chelsea debut, off the bench at Old Trafford", it: "Debutto con il Chelsea, dalla panchina all'Old Trafford" },
    { d: "2019-10-26", t: "career", en: "Hat-trick for Chelsea at Burnley", it: "Tripletta con il Chelsea a Burnley" },
    { d: "2020-08-01", t: "career", en: "First American man to score in an FA Cup final, against Arsenal at Wembley", it: "Primo americano a segnare in una finale di FA Cup, contro l'Arsenal a Wembley" },
    { d: "2021-04-27", t: "career", en: "Scores in a Champions League semi-final, against Real Madrid", it: "Segna in semifinale di Champions League contro il Real Madrid" },
    { d: "2021-05-29", t: "career", en: "Wins the Champions League with Chelsea", it: "Vince la Champions League con il Chelsea" },
    { d: "2021-06-06", t: "usa", en: "Winning penalty in the Nations League final against Mexico", it: "Rigore decisivo nella finale di Nations League contro il Messico" },
    { d: "2021-08-11", t: "career", en: "Wins the UEFA Super Cup with Chelsea", it: "Vince la Supercoppa UEFA con il Chelsea" },
    { d: "2021-11-12", t: "usa", en: "“Man in the Mirror”: first-touch header in a 2–0 win over Mexico", it: "«Man in the Mirror»: gol di testa al primo pallone nel 2–0 al Messico" },
    { d: "2021-11-20", t: "career", en: "Back from injury, scores off the bench in Chelsea’s 3–0 win at Leicester", it: "Rientrato dall'infortunio, segna dalla panchina nel 3–0 del Chelsea a Leicester" },
    { d: "2022-02-12", t: "career", en: "Wins the Club World Cup with Chelsea", it: "Vince il Mondiale per club con il Chelsea" },
    { d: "2022-03-27", t: "usa", en: "First hat-trick for the USA: 5–1 against Panama, World Cup all but sealed", it: "Prima tripletta con gli USA: 5–1 a Panama, Mondiale quasi certo" },
    { d: "2022-11-21", t: "usa", en: "World Cup debut, with the assist for Weah against Wales", it: "Debutto al Mondiale, con l'assist per Weah contro il Galles" },
    { d: "2022-11-29", t: "usa", en: "World Cup winner against Iran sends the USA through", it: "Gol decisivo all'Iran: USA agli ottavi del Mondiale" },
    { d: "2023-06-15", t: "usa", en: "Brace in a 3–0 win over Mexico in the Nations League semi-final", it: "Doppietta nel 3–0 al Messico in semifinale di Nations League" },
    { d: "2023-06-18", t: "usa", en: "Wins the Nations League again, against Canada", it: "Vince di nuovo la Nations League, contro il Canada" },
    { d: "2023-07-13", t: "milan", en: "Signs for Milan and takes the No. 11 shirt", it: "Firma con il Milan e prende la maglia numero 11" },
    { d: "2023-08-21", t: "milan", en: "Milan debut, and a goal straight away at Bologna", it: "Debutto con il Milan e gol subito a Bologna" },
    { d: "2023-08-26", t: "milan", en: "First goal at San Siro, in a 4–1 win over Torino", it: "Primo gol a San Siro, nel 4–1 al Torino" },
    { d: "2023-09-06", t: "milan", en: "Voted Milan’s MVP of the month for August, his first month at the club", it: "Eletto MVP rossonero di agosto, il suo primo mese al Milan" },
    { d: "2023-09-16", t: "milan", en: "First Milan derby, started on the right wing", it: "Primo derby di Milano, titolare sulla fascia destra" },
    { d: "2023-12-13", t: "milan", en: "First Champions League goal for Milan, in a 2–1 win at Newcastle", it: "Primo gol in Champions con il Milan, nel 2–1 a Newcastle" },
    { d: "2024-01-12", t: "milan", en: "Named Serie A Player of the Month for December 2023, his first in Italy", it: "Eletto miglior giocatore di dicembre 2023 della Serie A, il primo in Italia" },
    { d: "2024-01-18", t: "usa", en: "Voted U.S. Soccer Male Player of the Year for the fourth time, tying Landon Donovan’s record", it: "Miglior giocatore USA dell'anno per la quarta volta, come Landon Donovan" },
    { d: "2024-03-07", t: "milan", en: "First Europa League goal, against Slavia Prague", it: "Primo gol in Europa League, contro lo Slavia Praga" },
    { d: "2024-03-24", t: "usa", en: "Third Nations League title with the USA", it: "Terza Nations League vinta con gli USA" },
    { d: "2024-05-11", t: "milan", en: "First brace for Milan, in a 5–1 win over Cagliari", it: "Prima doppietta con il Milan, nel 5–1 al Cagliari" },
    { d: "2024-06-23", t: "usa", en: "Goal after 3 minutes and an assist in the Copa América opener against Bolivia", it: "Gol dopo 3 minuti e assist all'esordio in Copa América contro la Bolivia" },
    { d: "2024-09-17", t: "milan", en: "Scores after 3 minutes against Liverpool in the Champions League", it: "Gol dopo 3 minuti contro il Liverpool in Champions League" },
    { d: "2024-09-22", t: "milan", en: "Opens the scoring in a derby win over Inter", it: "Apre le marcature nel derby vinto contro l'Inter" },
    { d: "2024-10-04", t: "milan", en: "Named Milan’s MVP for September", it: "Eletto MVP rossonero di settembre" },
    { d: "2024-11-05", t: "milan", en: "Sets up the opener as Milan win 3–1 at the Bernabéu", it: "Assist per il vantaggio: il Milan vince 3–1 al Bernabéu" },
    { d: "2024-11-18", t: "usa", en: "Opens the scoring with a volley as the USA beat Jamaica 4–2 and reach the Nations League finals", it: "Apre le marcature al volo: gli USA battono 4–2 la Giamaica e vanno alle finali di Nations League" },
    { d: "2025-01-03", t: "milan", en: "Penalty equaliser against Juventus: Milan reach the Supercoppa final", it: "Rigore del pareggio contro la Juventus: Milan in finale di Supercoppa" },
    { d: "2025-01-06", t: "milan", en: "Scores in the final as Milan win the Supercoppa against Inter", it: "Segna in finale: il Milan vince la Supercoppa contro l'Inter" },
    { d: "2025-02-01", t: "milan", en: "Voted Milan’s MVP for January, the month of the Supercoppa", it: "Eletto MVP rossonero di gennaio, il mese della Supercoppa" },
    { d: "2025-03-08", t: "milan", en: "Brace in a 3–2 comeback at Lecce: Man of the Match, rated 9.06 by WhoScored", it: "Doppietta nella rimonta 3–2 a Lecce: migliore in campo, 9.06 per WhoScored" },
    { d: "2025-05-14", t: "milan", en: "Plays in the Coppa Italia final, lost 1–0 to Bologna", it: "In campo nella finale di Coppa Italia, persa 1–0 col Bologna" },
    { d: "2025-05-24", t: "milan", en: "100th appearance for Milan, against Monza", it: "100ª presenza con il Milan, contro il Monza" },
    { d: "2025-10-03", t: "milan", en: "Voted Milan’s MVP for September: four goals in four games", it: "Eletto MVP rossonero di settembre: quattro gol in quattro partite" },
    { d: "2025-10-09", t: "milan", en: "Named Serie A Player of the Month for September", it: "Eletto miglior giocatore di settembre della Serie A" },
    { d: "2025-10-19", t: "milan", en: "Receives the Serie A Player of the Month award for September at San Siro", it: "Riceve a San Siro il premio di miglior giocatore di settembre della Serie A" },
    { d: "2025-11-23", t: "milan", en: "Scores the only goal of the derby against Inter", it: "Decide il derby contro l'Inter con l'unico gol" },
    { d: "2025-12-08", t: "milan", en: "Off the bench despite a fever: brace in a 3–2 comeback at Torino, named MVP", it: "Entra dalla panchina con la febbre: doppietta nella rimonta 3–2 a Torino, MVP" },
    { d: "2026-06-12", t: "usa", en: "Assist as the USA beat Paraguay 4–1 at their home World Cup", it: "Assist nel 4–1 degli USA al Paraguay, al Mondiale in casa" },
    { d: "2026-07-01", t: "usa", en: "USA beat Bosnia 2–0: their first World Cup knockout win since 2002", it: "USA-Bosnia 2–0: prima vittoria a eliminazione diretta al Mondiale dal 2002" },
    { d: "2026-07-06", t: "usa", en: "World Cup round of 16: the USA lose 4–1 to Belgium in Seattle", it: "Ottavi del Mondiale: gli USA perdono 4–1 col Belgio a Seattle" },
  ],

  /* Every assist for Milan (25, checked against the Flashscore season totals). Used by "On this day". */
  assists: {
    asOf: "2026-11-10",
    list: [
      { date: "2023-09-27", comp: "Serie A", opp: "Cagliari", n: 1 },
      { date: "2023-10-29", comp: "Serie A", opp: "Napoli", n: 1 },
      { date: "2023-12-09", comp: "Serie A", opp: "Atalanta", n: 1 },
      { date: "2023-12-17", comp: "Serie A", opp: "Monza", n: 1 },
      { date: "2024-01-02", comp: "Coppa Italia", opp: "Cagliari", n: 1 },
      { date: "2024-01-07", comp: "Serie A", opp: "Empoli", n: 1 },
      { date: "2024-02-18", comp: "Serie A", opp: "Monza", n: 1 },
      { date: "2024-03-14", comp: "Europa League", opp: "Slavia Prague", n: 1 },
      { date: "2024-05-05", comp: "Serie A", opp: "Genoa", n: 1 },
      { date: "2024-05-25", comp: "Serie A", opp: "Salernitana", n: 1 },
      { date: "2024-08-31", comp: "Serie A", opp: "Lazio", n: 1 },
      { date: "2024-09-14", comp: "Serie A", opp: "Venezia", n: 1 },
      { date: "2024-10-19", comp: "Serie A", opp: "Udinese", n: 1 },
      { date: "2024-11-05", comp: "Champions League", opp: "Real Madrid", n: 1 },
      { date: "2024-11-30", comp: "Serie A", opp: "Empoli", n: 1 },
      { date: "2025-02-08", comp: "Serie A", opp: "Empoli", n: 2 },
      { date: "2025-04-05", comp: "Serie A", opp: "Fiorentina", n: 1 },
      { date: "2025-04-11", comp: "Serie A", opp: "Udinese", n: 1 },
      { date: "2025-05-09", comp: "Serie A", opp: "Bologna", n: 1 },
      { date: "2025-09-20", comp: "Serie A", opp: "Udinese", n: 1 },
      { date: "2025-09-28", comp: "Serie A", opp: "Napoli", n: 1 },
      { date: "2026-03-21", comp: "Serie A", opp: "Torino", n: 1 },
      { date: "2026-05-17", comp: "Serie A", opp: "Genoa", n: 1 },
      { date: "2026-09-12", comp: "Serie A", opp: "Lazio", n: 1 },
    ],
  },
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

  // goal/assist banners (48 h). The updater adds these itself; a hand-made one is only needed when the automatic check missed it.
  events: [
    { team: "usa", g: 2, a: 0, total: 35, at: "2026-11-14T23:20:00Z" }, // brace vs Haiti, CONCACAF Nations League QF 1st leg
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
