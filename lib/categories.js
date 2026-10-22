// lib/categories.js
import { STAT_DESCRIPTORS, rankBy, totalDescriptor } from "./utils.js";

const MAX_LISTED = 8;

// Page order. A nested pair shares one section, side by side.
const LAYOUT = [
	"killers",
	"helpers",
	"legendary",
	"winners",
	["marinators", "bahamuts"],
	"wtfDamage",
	"biggestInters",
	"killstealers",
	"ambulance",
	"bomba",
	"greyScreen",
	"mentalWarfare",
	"visionAndies",
	"saviour",
	["state", "private"],
	["yoink", "yoinkBuffs"],
	"comeback",
	"dogwater",
	"pentaMachines",
	"firstBlood",
	"anchor",
];

// Groups built categories into page blocks: { categories: [one] } or { categories: [a, b] }.
// A pair whose partner was filtered out falls back to a single section.
export function layoutCategories(categories) {
	const byKey = new Map(categories.map((c) => [c.descriptor.key, c]));
	return LAYOUT.map((item) => ({
		categories: [item].flat().map((key) => byKey.get(key)).filter(Boolean),
	})).filter((block) => block.categories.length);
}

// Ranked categories for one mode of data/site.json
export function buildCategories(site, modeKey) {
	const mode = site.modes[modeKey];
	if (!mode) return [];
	const impact = teammateImpact(site, modeKey);
	const entries = site.players
		.filter((player) => mode.stats[player.puuid]?.games)
		.map((player) => ({ player, stat: { ...mode.stats[player.puuid], ...impact[player.puuid] } }));

	const rank = (descriptor, list) => {
		const minGames = descriptor.perGame === false ? 1 : site.minGames;
		return rankBy(
			list.map((e) => ({
				...e,
				qualified: e.stat.games >= minGames && e.stat[descriptor.selector] != null,
			})),
			descriptor
		).slice(0, MAX_LISTED);
	};

	return Object.values(STAT_DESCRIPTORS)
		.filter((d) => !d.modes || d.modes.includes(modeKey))
		.map((descriptor) => {
			const ranked = rank(descriptor, entries);
			if (!descriptor.total) return { descriptor, ranked };

			// Same category ranked by season totals (or bests), for the toggle
			const totalView = totalDescriptor(descriptor);
			const select = descriptor.total.select ?? ((s) => s.totals[descriptor.total.key]);
			const withTotals = entries.map((e) => ({ ...e, stat: { ...e.stat, __total: select(e.stat) } }));
			return { descriptor, ranked, total: { descriptor: totalView, ranked: rank(totalView, withTotals) } };
		})
		// Skip categories nobody qualifies for, or where the leader has nothing (e.g. zero pentas)
		.filter(({ descriptor, ranked }) => {
			const leader = ranked[0];
			if (!leader?.qualified) return false;
			if (descriptor.signed) return true;
			return leader.stat[descriptor.selector] > 0 || (descriptor.tiebreak && leader.stat[descriptor.tiebreak] > 0);
		});
}

// How a player shifts the squad's win rate. Squad games (2+ of the squad on one team)
// with them are compared against squad games without them of the same stack size,
// since 5-stacks lose far more than duos. Solo queue doesn't count either way.
export function teammateImpact(site, modeKey) {
	const { squadTeams, squadGames } = site.modes[modeKey];
	if (!squadTeams) return {};

	return Object.fromEntries(
		Object.entries(squadGames)
			.map(([puuid, sizes]) => {
				let games = 0;
				let wins = 0;
				let expectedWins = 0;
				for (const [size, own] of Object.entries(sizes)) {
					const otherGames = squadTeams[size].games - own.games;
					if (otherGames < site.minDuoGames) continue; // no baseline for this stack size
					games += own.games;
					wins += own.wins;
					expectedWins += own.games * ((squadTeams[size].wins - own.wins) / otherGames);
				}
				return [puuid, { games, wins, expectedWins }];
			})
			.filter(([, a]) => a.games >= site.minGames)
			.map(([puuid, a]) => [
				puuid,
				{
					teammateImpact: (a.wins - a.expectedWins) / a.games,
					impactWithRate: a.wins / a.games,
					impactExpectedRate: a.expectedWins / a.games,
				},
			])
	);
}

// Modes nobody has played this season stay hidden until someone does
export function activeModeKeys(site) {
	return Object.keys(site.modes).filter((key) => site.modes[key].totalGames > 0);
}

export function playerById(site, puuid) {
	return site.players.find((p) => p.puuid === puuid);
}
