// lib/aggregate.js
// Turns cached matches into the per-mode stats the site renders. No I/O.
import { MIN_GAME_SECONDS } from "./modes.js";

const round = (n, dp = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** dp) / 10 ** dp : null);

const topEntries = (map, n) =>
	[...map.entries()].sort((a, b) => b[1].games - a[1].games).slice(0, n);

// Every stat summed per player. The site gets each one as a total (stat.totals[key])
// and a per-game average (stat[key]), so a new category only needs a descriptor.
const SUMS = {
	wins: (p) => (p.win ? 1 : 0),
	kills: (p) => p.kills,
	deaths: (p) => p.deaths,
	assists: (p) => p.assists,
	dmgDealt: (p) => p.totalDamageDealtToChampions,
	dmgTaken: (p) => p.totalDamageTaken,
	dmgMitigated: (p) => p.damageSelfMitigated,
	vision: (p) => p.visionScore,
	wardsPlaced: (p) => p.wardsPlaced,
	wardsKilled: (p) => p.wardsKilled,
	controlWards: (p) => p.detectorWardsPlaced,
	ccTime: (p) => p.timeCCingOthers,
	timeSpentDead: (p) => p.totalTimeSpentDead,
	pings: (p) => p.pings,
	enemyMissingPings: (p) => p.enemyMissingPings,
	pentas: (p) => p.pentaKills,
	quadras: (p) => p.quadraKills,
	firstBloods: (p) => (p.firstBloodKill || p.firstBloodAssist ? 1 : 0),
	firstTowers: (p) => (p.firstTowerKill || p.firstTowerAssist ? 1 : 0),
	towerDmg: (p) => p.damageDealtToBuildings,
	turretTakedowns: (p) => p.turretTakedowns,
	turretPlates: (p) => p.challenges?.turretPlatesTaken,
	// Towers taken late with no teammates nearby; Riot leaves the field out when it's 0
	soloTurrets: (p) => p.challenges?.soloTurretsLategame,
	objectiveDmg: (p) => p.damageDealtToObjectives,
	dragonTakedowns: (p) => p.challenges?.dragonTakedowns,
	baronTakedowns: (p) => p.challenges?.baronTakedowns,
	objectivesStolen: (p) => p.objectivesStolen,
	gold: (p) => p.goldEarned,
	cs: (p) => (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0),
	healsOnTeammates: (p) => p.totalHealsOnTeammates,
	shieldsOnTeammates: (p) => p.totalDamageShieldedOnTeammates,
	soloKills: (p) => p.challenges?.soloKills,
	skillshotsDodged: (p) => p.challenges?.skillshotsDodged,
	lastSecondDodges: (p) => p.challenges?.dodgeSkillShotsSmallWindow,
	skillshotsHit: (p) => p.challenges?.skillshotsHit,
	surrenders: (p) => (p.gameEndedInSurrender && !p.win ? 1 : 0),
	timePlayed: (p) => p.timePlayed,
	largestSpree: (p) => p.largestKillingSpree,
	outnumberedKills: (p) => p.challenges?.outnumberedKills,
	killsUnderOwnTurret: (p) => p.challenges?.killsUnderOwnTurret,
	killsNearEnemyTurret: (p) => p.challenges?.killsNearEnemyTurret,
	bombas: (p) => p.challenges?.knockEnemyIntoTeamAndKill,
	saves: (p) => p.challenges?.saveAllyFromDeath,
	buffsStolen: (p) => p.challenges?.buffsStolen,
	killParticipation: (p) => p.challenges?.killParticipation,
	// Kills by everyone on their team, for season-long kill participation
	teamKills: (p, match) =>
		match.participants.filter((o) => o.teamId === p.teamId).reduce((n, o) => n + (o.kills ?? 0), 0),
	// Started between 00:00 and 04:59 Iceland time (UTC all year)
	lateGames: (p, match) => (new Date(match.gameCreation).getUTCHours() < 5 ? 1 : 0),
	// Every ping type Riot tracks, keyed by its API name
	...Object.fromEntries(
		[
			"allInPings",
			"assistMePings",
			"basicPings",
			"commandPings",
			"dangerPings",
			"enemyMissingPings",
			"enemyVisionPings",
			"getBackPings",
			"holdPings",
			"needVisionPings",
			"onMyWayPings",
			"pushPings",
			"retreatPings",
			"visionClearedPings",
		].map((key) => [key, (p) => p[key]])
	),
};

// Season bests: the biggest single-game value per player. Each also keeps the game it
// came from (stat.records[key]: champion, result, date) for The Verdict.
const MAXES = {
	bestSpree: (p) => p.largestKillingSpree,
	biggestCrit: (p) => p.largestCriticalStrike,
	mostKills: (p) => p.kills,
	mostDeaths: (p) => p.deaths,
	// Only games they won count as coming back
	biggestComeback: (p) => (p.win ? p.challenges?.maxKillDeficit : 0),
	biggestCsLead: (p) => p.challenges?.maxCsAdvantageOnLaneOpponent,
	mostAssists: (p) => p.assists,
	mostDamage: (p) => p.totalDamageDealtToChampions,
	mostCs: (p) => (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0),
	mostVision: (p) => p.visionScore,
	bestMultikill: (p) => p.largestMultiKill,
	longestGame: (p, match) => match.gameDuration,
};

// Rare events read better as season counts than as fractions per game
const TOTAL_ONLY = [
	"pentas",
	"quadras",
	"outnumberedKills",
	"killsUnderOwnTurret",
	"killsNearEnemyTurret",
	"objectivesStolen",
	"lateGames",
];

// Longest run of losses and wins, plus the busiest day, from a player's games in time order
function streaks(results) {
	const sorted = [...results].sort((a, b) => a.time - b.time);
	let loseStreak = 0;
	let winStreak = 0;
	let losing = 0;
	let winning = 0;
	const perDay = new Map();
	for (const { time, win } of sorted) {
		losing = win ? 0 : losing + 1;
		winning = win ? winning + 1 : 0;
		loseStreak = Math.max(loseStreak, losing);
		winStreak = Math.max(winStreak, winning);
		const day = new Date(time).toISOString().slice(0, 10); // Iceland date (UTC)
		perDay.set(day, (perDay.get(day) ?? 0) + 1);
	}
	return { loseStreak, winStreak, mostGamesInDay: Math.max(0, ...perDay.values()) };
}

function emptyTotals() {
	return {
		games: 0,
		sums: Object.fromEntries(Object.keys(SUMS).map((key) => [key, 0])),
		maxes: Object.fromEntries(Object.keys(MAXES).map((key) => [key, { value: 0 }])),
		// Lane diffs average over games that had a lane opponent, not all games
		diffs: Object.fromEntries(Object.keys(LANE_DIFFS).map((key) => [key, { sum: 0, games: 0 }])),
		roles: new Map(),
		results: [],
		champs: new Map(),
		items: new Map(),
	};
}

// The enemy in the same position, for lane-vs-lane diffs (none in modes without positions)
const laneOpponent = (p, match) =>
	p.teamPosition
		? match.participants.find((o) => o.teamId !== p.teamId && o.teamPosition === p.teamPosition)
		: undefined;

const csAt10 = (p) =>
	p.challenges?.laneMinionsFirst10Minutes == null
		? null
		: p.challenges.laneMinionsFirst10Minutes + (p.challenges.jungleCsBefore10Minutes ?? 0);

// Diffs against the lane opponent; they need the whole match, so they sit outside SUMS
const LANE_DIFFS = {
	goldDiff: (p, opp) => p.goldEarned - opp.goldEarned,
	csDiff10: (p, opp) => (csAt10(p) == null || csAt10(opp) == null ? null : csAt10(p) - csAt10(opp)),
};

function addParticipant(t, p, match, items) {
	t.games++;
	for (const [key, get] of Object.entries(SUMS)) t.sums[key] += get(p, match) ?? 0;
	t.results.push({ time: match.gameCreation, win: p.win });
	const opp = laneOpponent(p, match);
	for (const [key, get] of Object.entries(LANE_DIFFS)) {
		const diff = opp ? get(p, opp) : null;
		if (diff == null) continue;
		t.diffs[key].sum += diff;
		t.diffs[key].games++;
	}
	if (p.teamPosition) t.roles.set(p.teamPosition, (t.roles.get(p.teamPosition) ?? 0) + 1);
	for (const [key, get] of Object.entries(MAXES)) {
		const value = get(p, match) ?? 0;
		if (value > t.maxes[key].value) {
			t.maxes[key] = { value, championId: p.championId, win: p.win, time: match.gameCreation };
		}
	}

	const champ = t.champs.get(p.championId) ?? { games: 0, wins: 0 };
	champ.games++;
	if (p.win) champ.wins++;
	t.champs.set(p.championId, champ);

	// Prefer Riot's own legendary list; fall back to completed items in the final build
	const finalBuild = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5];
	const legendaries = p.legendaryItemUsed?.length
		? p.legendaryItemUsed
		: finalBuild.filter((id) => items[id]?.completed);
	for (const id of new Set(legendaries)) {
		t.items.set(id, { games: (t.items.get(id)?.games ?? 0) + 1 });
	}
}

function finalise(t, champions, items) {
	const g = t.games;
	const s = t.sums;
	const champ = (id) => champions[id] ?? { id: null, name: "Unknown" };
	const [favItem] = topEntries(t.items, 1);
	const perGame = Object.fromEntries(
		Object.keys(SUMS).map((key) => [key, TOTAL_ONLY.includes(key) ? s[key] : round(s[key] / g)])
	);
	const laneDiffs = Object.fromEntries(
		Object.entries(t.diffs).map(([key, d]) => [key, d.games ? round(d.sum / d.games, 1) : null])
	);
	const [mainRole] = [...t.roles.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
	return {
		...perGame,
		...Object.fromEntries(Object.entries(t.maxes).map(([key, m]) => [key, m.value])),
		...laneDiffs,
		mainRole: mainRole ?? null,
		...streaks(t.results),
		champPool: t.champs.size,
		killParticipation: round(s.killParticipation / g, 4),
		seasonKillParticipation: s.teamKills ? round((s.kills + s.assists) / s.teamKills, 4) : null,
		games: g,
		wins: s.wins,
		winRate: round(s.wins / g, 4),
		firstBloodRate: round(s.firstBloods / g, 4),
		firstTowerRate: round(s.firstTowers / g, 4),
		kda: round((s.kills + s.assists) / Math.max(s.deaths, 1)),
		dmgPerKill: s.kills ? Math.round(s.dmgDealt / s.kills) : null,
		totals: { ...s, ...Object.fromEntries(Object.entries(t.diffs).map(([key, d]) => [key, d.sum])) },
		topChamps: topEntries(t.champs, 3).map(([id, c]) => ({ ...champ(id), games: c.games, wins: c.wins })),
		favItem: favItem
			? { id: Number(favItem[0]), name: items[favItem[0]]?.name ?? "", games: favItem[1].games }
			: null,
		records: Object.fromEntries(
			Object.entries(t.maxes)
				.filter(([, m]) => m.value > 0)
				.map(([key, m]) => [
					key,
					{ value: round(m.value, 1), champ: champ(m.championId), win: m.win, date: new Date(m.time).toISOString() },
				])
		),
	};
}

// Pairs with enough games together, best win rate first
function rankDuos(pairs, minDuoGames) {
	return [...pairs.entries()]
		.filter(([, d]) => d.games >= minDuoGames)
		.map(([pairKey, d]) => ({
			players: pairKey.split("|"),
			games: d.games,
			wins: d.wins,
			winRate: round(d.wins / d.games, 4),
		}))
		.sort((a, b) => b.winRate - a.winRate || b.games - a.games);
}

// One season's games (seasonEnd is exclusive; null for the current season)
export function aggregate({ matches, roster, modes, champions, items, seasonStart, seasonEnd, minDuoGames }) {
	const startMs = new Date(seasonStart).getTime();
	const endMs = seasonEnd ? new Date(seasonEnd).getTime() : Infinity;
	const rosterIds = new Set(roster.map((p) => p.puuid));
	const out = {};

	for (const [key, mode] of Object.entries(modes)) {
		const modeMatches = matches.filter(
			(m) =>
				mode.queues.includes(m.queueId) &&
				m.gameCreation >= startMs &&
				m.gameCreation < endMs &&
				m.gameDuration >= MIN_GAME_SECONDS
		);

		const totals = new Map();
		const duos = new Map();
		const pureDuos = new Map();
		const squadTeams = {}; // stack size -> { games, wins }
		const squadGames = {}; // puuid -> stack size -> { games, wins }
		const partners = {}; // puuid -> teammate puuid -> how they did together
		const groupChamps = new Map();

		for (const m of modeMatches) {
			const ours = m.participants.filter((p) => rosterIds.has(p.puuid));
			for (const p of ours) {
				if (!totals.has(p.puuid)) totals.set(p.puuid, emptyTotals());
				addParticipant(totals.get(p.puuid), p, m, items);
				const gc = groupChamps.get(p.championId) ?? { games: 0, wins: 0 };
				gc.games++;
				if (p.win) gc.wins++;
				groupChamps.set(p.championId, gc);
			}

			// Squad games: a team with 2+ of the squad on it, counted once per team and
			// split by stack size (bigger flex stacks win less, so sizes are compared separately)
			for (const teamId of new Set(ours.map((p) => p.teamId))) {
				const team = ours.filter((p) => p.teamId === teamId);
				const size = team.length;
				if (size < 2) continue;
				const st = (squadTeams[size] ??= { games: 0, wins: 0 });
				st.games++;
				if (team[0].win) st.wins++;
				for (const p of team) {
					const sg = ((squadGames[p.puuid] ??= {})[size] ??= { games: 0, wins: 0 });
					sg.games++;
					if (p.win) sg.wins++;
				}
			}

			// Every pair of roster players on the same team (any stack), and separately the
			// games where those two were the only squad members on their team (pure duos)
			for (let i = 0; i < ours.length; i++) {
				for (let j = i + 1; j < ours.length; j++) {
					const [a, b] = [ours[i], ours[j]];
					if (a.teamId !== b.teamId) continue;
					const pairKey = [a.puuid, b.puuid].sort().join("|");
					const squadOnTeam = ours.filter((p) => p.teamId === a.teamId).length;
					for (const map of squadOnTeam === 2 ? [duos, pureDuos] : [duos]) {
						const duo = map.get(pairKey) ?? { games: 0, wins: 0 };
						duo.games++;
						if (a.win) duo.wins++;
						map.set(pairKey, duo);
					}
					// Each side's own K/D/A with the other, for who brings out the best in whom
					for (const [p, other] of [[a, b], [b, a]]) {
						const pt = ((partners[p.puuid] ??= {})[other.puuid] ??= {
							games: 0,
							wins: 0,
							kills: 0,
							deaths: 0,
							assists: 0,
							pureGames: 0,
							pureWins: 0,
						});
						pt.games++;
						pt.kills += p.kills;
						pt.deaths += p.deaths;
						pt.assists += p.assists;
						if (p.win) pt.wins++;
						if (squadOnTeam === 2) {
							pt.pureGames++;
							if (p.win) pt.pureWins++;
						}
					}
				}
			}
		}

		out[key] = {
			label: mode.label,
			map: mode.map,
			totalGames: modeMatches.filter((m) => m.participants.some((p) => rosterIds.has(p.puuid))).length,
			stats: Object.fromEntries(
				[...totals.entries()].map(([puuid, t]) => [puuid, finalise(t, champions, items)])
			),
			duos: rankDuos(duos, minDuoGames),
			pureDuos: rankDuos(pureDuos, minDuoGames),
			squadTeams,
			squadGames,
			partners,
			groupChamps: topEntries(groupChamps, 5).map(([id, c]) => ({
				...(champions[id] ?? { id: null, name: "Unknown" }),
				games: c.games,
				wins: c.wins,
			})),
		};
	}

	return { seasonStart, seasonEnd, modes: out };
}
