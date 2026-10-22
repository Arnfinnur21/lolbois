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

// Season bests: the biggest single-game value per player
const MAXES = {
	bestSpree: (p) => p.largestKillingSpree,
	biggestCrit: (p) => p.largestCriticalStrike,
	// Only games they won count as coming back
	biggestComeback: (p) => (p.win ? p.challenges?.maxKillDeficit : 0),
	biggestCsLead: (p) => p.challenges?.maxCsAdvantageOnLaneOpponent,
};

// Rare events read better as season counts than as fractions per game
const TOTAL_ONLY = [
	"pentas",
	"quadras",
	"outnumberedKills",
	"killsUnderOwnTurret",
	"killsNearEnemyTurret",
	"objectivesStolen",
];

function emptyTotals() {
	return {
		games: 0,
		sums: Object.fromEntries(Object.keys(SUMS).map((key) => [key, 0])),
		maxes: Object.fromEntries(Object.keys(MAXES).map((key) => [key, 0])),
		champs: new Map(),
		items: new Map(),
	};
}

function addParticipant(t, p, items) {
	t.games++;
	for (const [key, get] of Object.entries(SUMS)) t.sums[key] += get(p) ?? 0;
	for (const [key, get] of Object.entries(MAXES)) t.maxes[key] = Math.max(t.maxes[key], get(p) ?? 0);

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
	return {
		...perGame,
		...t.maxes,
		games: g,
		wins: s.wins,
		winRate: round(s.wins / g, 4),
		firstBloodRate: round(s.firstBloods / g, 4),
		firstTowerRate: round(s.firstTowers / g, 4),
		kda: round((s.kills + s.assists) / Math.max(s.deaths, 1)),
		dmgPerKill: s.kills ? Math.round(s.dmgDealt / s.kills) : null,
		totals: { ...s },
		topChamps: topEntries(t.champs, 3).map(([id, c]) => ({ ...champ(id), games: c.games, wins: c.wins })),
		favItem: favItem
			? { id: Number(favItem[0]), name: items[favItem[0]]?.name ?? "", games: favItem[1].games }
			: null,
	};
}

export function aggregate({ matches, roster, modes, champions, items, seasonStart, minGames, minDuoGames }) {
	const startMs = new Date(seasonStart).getTime();
	const rosterIds = new Set(roster.map((p) => p.puuid));
	const out = {};

	for (const [key, mode] of Object.entries(modes)) {
		const modeMatches = matches.filter(
			(m) =>
				mode.queues.includes(m.queueId) &&
				m.gameCreation >= startMs &&
				m.gameDuration >= MIN_GAME_SECONDS
		);

		const totals = new Map();
		const duos = new Map();
		const squadTeams = {}; // stack size -> { games, wins }
		const squadGames = {}; // puuid -> stack size -> { games, wins }
		const groupChamps = new Map();

		for (const m of modeMatches) {
			const ours = m.participants.filter((p) => rosterIds.has(p.puuid));
			for (const p of ours) {
				if (!totals.has(p.puuid)) totals.set(p.puuid, emptyTotals());
				addParticipant(totals.get(p.puuid), p, items);
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

			// Every pair of roster players on the same team
			for (let i = 0; i < ours.length; i++) {
				for (let j = i + 1; j < ours.length; j++) {
					const [a, b] = [ours[i], ours[j]];
					if (a.teamId !== b.teamId) continue;
					const pairKey = [a.puuid, b.puuid].sort().join("|");
					const duo = duos.get(pairKey) ?? { games: 0, wins: 0 };
					duo.games++;
					if (a.win) duo.wins++;
					duos.set(pairKey, duo);
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
			duos: [...duos.entries()]
				.filter(([, d]) => d.games >= minDuoGames)
				.map(([pairKey, d]) => ({
					players: pairKey.split("|"),
					games: d.games,
					wins: d.wins,
					winRate: round(d.wins / d.games, 4),
				}))
				.sort((a, b) => b.winRate - a.winRate || b.games - a.games),
			squadTeams,
			squadGames,
			groupChamps: topEntries(groupChamps, 5).map(([id, c]) => ({
				...(champions[id] ?? { id: null, name: "Unknown" }),
				games: c.games,
				wins: c.wins,
			})),
		};
	}

	return { seasonStart, minGames, minDuoGames, modes: out };
}
