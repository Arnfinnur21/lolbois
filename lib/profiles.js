// lib/profiles.js
// Player profiles for The Verdict. Every trait is scored against the rest of the squad
// (how many standard deviations above or below), so each player's most extreme traits
// become their title and lines. Lines are fragments without a subject, so they read the
// same for anyone. Pros and cons come from lib/quirks.js.
import { formatStat as f } from "./utils.js";
import { teammateImpact } from "./categories.js";
import { scoreQuirks } from "./quirks.js";

const pct = (v) => f("percent", v);
const points = (v) => `${Math.abs(v * 100).toFixed(1)} points`;

// value(stat) -> number or null. `high` / `low` describe each end: a `title` makes it a
// possible headline, `when` limits it (no "funds the enemy" for someone still ahead).
// Traits sharing a `group` never both appear on one card. `weight` scales its score.
const TRAITS = [
	{
		key: "kills",
		value: (s) => s.kills,
		high: {
			title: "The Executioner",
			line: (s) => `${f("decimal", s.kills)} kills a game, ${s.mostKills} in the best one. Shares the lane, never the gold.`,
		},
		low: {
			title: "The Pacifist",
			line: (s) => `${f("decimal", s.kills)} kills a game. Lets the enemy live, presumably out of kindness.`,
		},
	},
	{
		key: "deaths",
		group: "dying",
		value: (s) => s.deaths,
		high: {
			title: "The Feeder",
			line: (s) =>
				`${f("decimal", s.deaths)} deaths a game, and ${s.mostDeaths} in one memorable outing. The enemy jungler's favourite camp.`,
		},
		low: {
			title: "The Survivor",
			line: (s) => `Only ${f("decimal", s.deaths)} deaths a game. Values life, mainly their own.`,
		},
	},
	{
		key: "timeSpentDead",
		group: "dying",
		value: (s) => s.timeSpentDead,
		high: {
			title: "The Spectator",
			line: (s) =>
				`${f("duration", s.timeSpentDead)} a game on the grey screen, ${f("hours", s.totals.timeSpentDead)} this season. Great view of the fights, apparently.`,
		},
	},
	{
		key: "assists",
		value: (s) => s.assists,
		high: {
			title: "The Accomplice",
			line: (s) => `${f("decimal", s.assists)} assists a game. Never the killer, always at the scene.`,
		},
		low: {
			title: "The Lone Wolf",
			line: (s) => `${f("decimal", s.assists)} assists a game. Teamwork is a rumour.`,
		},
	},
	{
		key: "kda",
		value: (s) => s.kda,
		high: {
			title: "The Accountant",
			line: (s) => `${f("decimal2", s.kda)} KDA. Plays for the scoreboard, and the scoreboard is grateful.`,
		},
	},
	{
		key: "dmgDealt",
		value: (s) => s.dmgDealt,
		high: {
			title: "The Artillery",
			line: (s) => `${f("thousands", s.dmgDealt)} damage a game. Every fight is a fireworks show.`,
		},
		low: {
			title: "Decorative Damage",
			line: (s) => `${f("thousands", s.dmgDealt)} damage a game. At the fights in spirit.`,
		},
	},
	{
		key: "dmgTaken",
		value: (s) => s.dmgTaken,
		high: {
			title: "The Punching Bag",
			line: (s) => `${f("thousands", s.dmgTaken)} damage soaked a game. Facetanks everything, including feedback.`,
		},
	},
	{
		key: "dmgPerKill",
		value: (s) => s.dmgPerKill,
		low: {
			title: "The Vulture",
			line: (s) => `${f("thousands", s.dmgPerKill)} damage per kill. Shows up exactly in time for the last hit.`,
		},
		high: {
			line: (s) => `${f("thousands", s.dmgPerKill)} damage per kill. Does the work, someone else gets the kill.`,
		},
	},
	{
		key: "vision",
		modes: ["sr"],
		value: (s) => s.vision,
		high: {
			title: "The Lighthouse",
			line: (s) => `${f("decimal", s.vision)} vision score a game. Sees everything coming, stops none of it.`,
		},
		low: {
			title: "Blind Faith",
			line: (s) =>
				`${f("decimal", s.vision)} vision score and ${f("decimal2", s.controlWards)} control wards a game. Wards are for people with trust issues.`,
		},
	},
	{
		key: "pings",
		value: (s) => s.pings,
		high: {
			title: "Air Traffic Control",
			line: (s) => `${f("decimal", s.pings)} pings a game. The team hears them in their sleep.`,
		},
		low: {
			title: "The Monk",
			line: (s) => `${f("decimal", s.pings)} pings a game. Suffers in silence.`,
		},
	},
	{
		key: "ccTime",
		value: (s) => s.ccTime,
		high: {
			title: "The Warden",
			line: (s) => `${f("duration", s.ccTime)} of crowd control a game. Nobody moves without permission.`,
		},
	},
	{
		key: "csDiff10",
		group: "lane",
		modes: ["sr"],
		// Supports don't farm, so their lane diffs say nothing
		value: (s) => (s.mainRole === "UTILITY" ? null : s.csDiff10),
		high: {
			title: "The Lane Bully",
			when: (s) => s.csDiff10 > 0,
			line: (s) => `${f("signedDecimal", s.csDiff10)} CS on the lane opponent at 10 minutes. That laner needs a hug.`,
		},
		low: {
			title: "The Donor",
			when: (s) => s.csDiff10 < 0,
			line: (s) => `${f("signedDecimal", s.csDiff10)} CS at 10 minutes. Funds the enemy laner generously.`,
		},
	},
	{
		key: "goldDiff",
		group: "lane",
		modes: ["sr"],
		value: (s) => (s.mainRole === "UTILITY" ? null : s.goldDiff),
		high: {
			title: "The Bank",
			when: (s) => s.goldDiff > 0,
			line: (s) => `${f("signedInteger", s.goldDiff)} gold on the lane opponent a game. Interest compounds.`,
		},
		low: {
			title: "The Charity",
			when: (s) => s.goldDiff < 0,
			line: (s) => `${f("signedInteger", s.goldDiff)} gold against the lane opponent a game. Generous to a fault.`,
		},
	},
	{
		key: "soloKills",
		value: (s) => s.soloKills,
		high: {
			title: "The Duelist",
			line: (s) => `${f("decimal", s.soloKills)} solo kills a game. Doesn't need you. Never did.`,
		},
	},
	{
		key: "skillshotsDodged",
		value: (s) => s.skillshotsDodged,
		high: {
			title: "The Matrix",
			line: (s) => `${f("decimal", s.skillshotsDodged)} skillshots dodged a game. Simply not there when it lands.`,
		},
	},
	{
		key: "skillshotsHit",
		value: (s) => s.skillshotsHit,
		high: {
			title: "The Sniper",
			line: (s) => `${f("decimal", s.skillshotsHit)} skillshots landed a game. Aim assist? Never heard of it.`,
		},
		low: {
			line: (s) => `${f("decimal", s.skillshotsHit)} skillshots landed a game. The rest are still flying.`,
		},
	},
	{
		key: "towerDmg",
		group: "towers",
		modes: ["sr"],
		value: (s) => s.towerDmg,
		high: {
			title: "The Wrecking Ball",
			line: (s) => `${f("thousands", s.towerDmg)} tower damage a game. Towers fear this one more than champions do.`,
		},
		low: {
			line: (s) => `${f("thousands", s.towerDmg)} tower damage a game. Treats turrets as scenery.`,
		},
	},
	{
		key: "soloTurrets",
		group: "towers",
		modes: ["sr"],
		value: (s) => s.soloTurrets,
		high: {
			title: "The Split Pusher",
			line: (s) => `${f("decimal2", s.soloTurrets)} solo towers a game late on. Team fights are someone else's problem.`,
		},
	},
	{
		key: "objectivesStolen",
		value: (s) => s.objectivesStolen / s.games,
		high: {
			title: "The Thief",
			line: (s) => `${s.objectivesStolen} objectives stolen this season. Smite is in safe hands, just not the enemy's.`,
		},
	},
	{
		key: "teamHealing",
		value: (s) => s.healsOnTeammates + s.shieldsOnTeammates,
		high: {
			title: "The Nurse",
			line: (s) =>
				`${f("integer", s.healsOnTeammates + s.shieldsOnTeammates)} healed and shielded a game. Keeps everyone alive, thanked by nobody.`,
		},
	},
	{
		key: "champPool",
		group: "pool",
		// Pool size grows with games played, so compare it per sqrt(games)
		value: (s) => s.champPool / Math.sqrt(s.games),
		high: {
			title: "The Tourist",
			line: (s) => `${s.champPool} different champions. Has a main the way a hotel has guests.`,
		},
	},
	{
		key: "mainShare",
		group: "pool",
		value: (s) => (s.topChamps[0] ? s.topChamps[0].games / s.games : null),
		high: {
			title: "The One-Trick",
			line: (s) => `${s.topChamps[0].games} of ${s.games} games on ${s.topChamps[0].name}. Has found the one.`,
		},
	},
	{
		key: "winRate",
		value: (s) => s.winRate,
		high: {
			title: "The Carry",
			when: (s) => s.winRate > 0.5,
			line: (s) => `${pct(s.winRate)} win rate. Bring snacks, they bring LP.`,
		},
		low: {
			title: "The Weight",
			when: (s) => s.winRate < 0.5,
			line: (s) => `${pct(s.winRate)} win rate. A character-building experience for everyone involved.`,
		},
	},
	{
		key: "lateGames",
		weight: 0.8,
		value: (s) => s.lateGames / s.games,
		high: {
			title: "The Night Owl",
			line: (s) => `${pct(s.lateGames / s.games)} of games start after midnight. Sleep is a skill issue.`,
		},
	},
	{
		key: "mostGamesInDay",
		value: (s) => s.mostGamesInDay,
		high: {
			title: "The Grinder",
			line: (s) => `${s.mostGamesInDay} games in a single day. Grass not found.`,
		},
	},
	{
		key: "loseStreak",
		value: (s) => s.loseStreak,
		high: {
			title: "The Unbreakable",
			line: (s) => `Lost ${s.loseStreak} in a row once, then queued again. Admirable, medically speaking.`,
		},
	},
	{
		key: "surrenders",
		value: (s) => (s.games > s.wins ? s.totals.surrenders / (s.games - s.wins) : null),
		high: {
			title: "The White Flag",
			line: (s) => `${pct(s.totals.surrenders / (s.games - s.wins))} of losses end in a surrender. Knows when to fold.`,
		},
		low: {
			line: (s) =>
				`Only ${pct(s.totals.surrenders / (s.games - s.wins))} of losses end in a surrender. Watches the nexus explode every time.`,
		},
	},
	{
		key: "firstBloodRate",
		value: (s) => s.firstBloodRate,
		high: {
			title: "The Opening Act",
			line: (s) => `In on first blood in ${pct(s.firstBloodRate)} of games. Early game merchant.`,
		},
	},
	{
		key: "killParticipation",
		value: (s) => s.killParticipation,
		high: {
			title: "The Omnipresent",
			line: (s) => `${pct(s.killParticipation)} kill participation. Can't have a fight without them. Literally.`,
		},
		low: {
			title: "The Hermit",
			line: (s) => `${pct(s.killParticipation)} kill participation. Off farming somewhere, at peace.`,
		},
	},
	{
		key: "bestSpree",
		value: (s) => s.bestSpree,
		high: {
			title: "The Rampage",
			line: (s) => `Best killing spree: ${s.bestSpree}. One good game away from a montage.`,
		},
	},
	{
		key: "biggestCrit",
		weight: 0.7,
		value: (s) => s.biggestCrit,
		high: {
			title: "The Gambler",
			line: (s) => `${f("integer", s.biggestCrit)} damage in a single crit. That's not skill, that's gambling.`,
		},
	},
	{
		key: "multikills",
		value: (s) => (s.pentas + s.quadras / 4) / s.games,
		high: {
			title: "The Highlight Reel",
			when: (s) => s.pentas > 0,
			line: (s) => `${s.pentas} penta${s.pentas === 1 ? "" : "s"} and ${s.quadras} quadras this season. Clip it.`,
		},
	},
	{
		key: "outnumberedKills",
		value: (s) => s.outnumberedKills / s.games,
		high: {
			title: "The Outlaw",
			line: (s) => `${s.outnumberedKills} kills while outnumbered. Does the maths, ignores it.`,
		},
	},
	{
		key: "bombas",
		value: (s) => s.bombas,
		high: {
			title: "The Bouncer",
			line: (s) => `${f("decimal2", s.bombas)} enemies a game kicked into the team for a kill. Oppa.`,
		},
	},
	{
		key: "saves",
		value: (s) => s.saves,
		high: {
			title: "The Guardian Angel",
			line: (s) => `${s.totals.saves} teammates saved from death. Owed at least ${s.totals.saves} drinks.`,
		},
	},
	{
		key: "dragonTakedowns",
		modes: ["sr"],
		value: (s) => s.dragonTakedowns,
		high: {
			title: "The Dragon Tamer",
			line: (s) => `${f("decimal2", s.dragonTakedowns)} dragons a game. Collects souls like stamps.`,
		},
	},
	{
		key: "teammateImpact",
		weight: 1.3,
		value: (s) => s.teammateImpact,
		high: {
			title: "The Lucky Charm",
			when: (s) => s.teammateImpact >= 0.03,
			line: (s) =>
				`The squad wins ${points(s.teammateImpact)} more often with them than the same stack without. Bring them everywhere.`,
		},
		low: {
			title: "The Anchor",
			when: (s) => s.teammateImpact <= -0.03,
			line: (s) =>
				`The squad wins ${points(s.teammateImpact)} less often with them than the same stack without. Nothing personal. Well, slightly.`,
		},
	},
];

// For a player with nothing extreme enough, or whose best titles went to someone more extreme
const FALLBACK = {
	title: "The Enigma",
	line: () => "Squarely average at everything. Suspiciously so.",
};

// Traits need to stand out at least this much (in standard deviations) to be mentioned
const MIN_SCORE = 0.6;
const LINES_PER_CARD = 3;

// [{ player, stat, title, headline, lines, pros, cons, partners, records }] for everyone with
// enough games in the mode, most games first, plus the names of those without enough games
export function buildProfiles(site, modeKey) {
	const mode = site.modes[modeKey];
	if (!mode) return { profiles: [], unranked: [] };
	const impact = teammateImpact(site, modeKey);
	const entries = site.players
		.filter((player) => mode.stats[player.puuid])
		.map((player) => ({ player, stat: { ...mode.stats[player.puuid], ...impact[player.puuid] } }));
	const ranked = entries.filter((e) => e.stat.games >= site.minGames);
	const unranked = entries.filter((e) => e.stat.games < site.minGames).map((e) => e.player.name);
	if (ranked.length < 3) return { profiles: [], unranked: entries.map((e) => e.player.name) };

	// Every player's traits, scored by distance from the squad average
	const candidates = new Map(ranked.map((e) => [e.player.puuid, []]));
	for (const trait of TRAITS) {
		if (trait.modes && !trait.modes.includes(modeKey)) continue;
		const values = ranked.map((e) => [e, trait.value(e.stat)]).filter(([, v]) => Number.isFinite(v));
		if (values.length < 3) continue;
		const mean = values.reduce((n, [, v]) => n + v, 0) / values.length;
		const sd = Math.sqrt(values.reduce((n, [, v]) => n + (v - mean) ** 2, 0) / values.length);
		if (!sd) continue;
		for (const [e, v] of values) {
			const z = (v - mean) / sd;
			const side = z > 0 ? trait.high : trait.low;
			if (!side || (side.when && !side.when(e.stat))) continue;
			candidates.get(e.player.puuid).push({ trait, side, score: Math.abs(z) * (trait.weight ?? 1) });
		}
	}
	for (const list of candidates.values()) list.sort((a, b) => b.score - a.score);

	// Headlines go out most extreme first, so each title belongs to whoever earns it most
	const headline = new Map();
	const usedTitles = new Set();
	const byScore = [...candidates.entries()]
		.flatMap(([puuid, list]) => list.filter((c) => c.side.title && c.score >= MIN_SCORE).map((c) => ({ puuid, c })))
		.sort((a, b) => b.c.score - a.c.score);
	for (const { puuid, c } of byScore) {
		if (headline.has(puuid) || usedTitles.has(c.side.title)) continue;
		headline.set(puuid, c);
		usedTitles.add(c.side.title);
	}

	const quirks = scoreQuirks(ranked, modeKey);
	const profiles = ranked.map(({ player, stat }) => {
		const top = headline.get(player.puuid);
		const seen = new Set(top ? [top.trait.group ?? top.trait.key] : []);
		const rest = [];
		for (const c of candidates.get(player.puuid)) {
			const group = c.trait.group ?? c.trait.key;
			if (c.score < MIN_SCORE || seen.has(group)) continue;
			seen.add(group);
			rest.push(c.side.line(stat));
			if (rest.length === LINES_PER_CARD) break;
		}
		const lead = top ?? { side: FALLBACK };
		return {
			player,
			stat,
			title: lead.side.title,
			headline: lead.side.line(stat),
			lines: rest,
			...quirks.get(player.puuid),
			partners: rankPartners(mode, player.puuid, stat, site),
			records: personalRecords(stat, ranked, modeKey),
		};
	});

	return { profiles: profiles.sort((a, b) => b.stat.games - a.stat.games), unranked };
}

// Win rate together is pulled toward the player's own win rate by this many games, so
// 8 of 13 together doesn't outrank 80 of 139: a pairing has to keep it up to stand out
const PARTNER_PRIOR_GAMES = 50;

// Every teammate with enough games together, best pairing first: [{ player, games, wins,
// winRate, withoutRate, edge, kda, pure, bond }]. `edge` is the volume-weighted win rate
// over the player's own, and sets the order. `bond` is a Darkest Dungeon relationship:
// warm for the top two with a winning record together, sour for losing records that
// also drag the player below their own win rate.
function rankPartners(mode, puuid, stat, site) {
	const mine = mode.partners?.[puuid] ?? {};
	const list = Object.entries(mine)
		.filter(([, p]) => p.games >= site.minDuoGames)
		.map(([id, p]) => {
			const apart = stat.games - p.games;
			return {
				player: site.players.find((pl) => pl.puuid === id),
				games: p.games,
				wins: p.wins,
				winRate: p.wins / p.games,
				withoutRate: apart > 0 ? (stat.wins - p.wins) / apart : null,
				edge: (p.wins + PARTNER_PRIOR_GAMES * stat.winRate) / (p.games + PARTNER_PRIOR_GAMES) - stat.winRate,
				kda: (p.kills + p.assists) / Math.max(p.deaths, 1),
				pure: p.pureGames >= site.minDuoGames ? { games: p.pureGames, wins: p.pureWins } : null,
			};
		})
		.filter((p) => p.player)
		.sort((a, b) => b.edge - a.edge);

	return list.map((p, i) => ({
		...p,
		bond:
			i < 2 && p.winRate >= 0.5
				? ["Amorous", "Hopeful"][i]
				: p.winRate < 0.5 && p.edge < 0
					? i === list.length - 1 && p.edge < -0.02
						? "Hateful"
						: "Resentful"
					: null,
	}));
}

const MULTIKILLS = ["", "Single", "Double", "Triple", "Quadra", "Penta"];

// Single-game bests (with the champion and result from stat.records) and streaks
const RECORDS = [
	{ key: "mostKills", label: "Most kills" },
	{ key: "mostDamage", label: "Most damage", format: "thousands" },
	{ key: "bestSpree", label: "Longest spree" },
	{ key: "bestMultikill", label: "Biggest multikill", display: (v) => MULTIKILLS[v] ?? v },
	{ key: "biggestCrit", label: "Biggest crit", format: "integer" },
	{ key: "mostAssists", label: "Most assists" },
	{ key: "mostVision", label: "Most vision", modes: ["sr"] },
	{ key: "biggestComeback", label: "Won from", display: (v) => `−${v}`, note: "kills down" },
	{ key: "mostDeaths", label: "Most deaths" },
	{ key: "winStreak", label: "Win streak", streak: true },
	{ key: "loseStreak", label: "Losing streak", streak: true },
	{ key: "mostGamesInDay", label: "Games in a day", streak: true },
];

// [{ key, label, value, champ, win, squadBest }]; squadBest when nobody ranked beats it
function personalRecords(stat, ranked, modeKey) {
	const valueOf = (s, r) => (r.streak ? s[r.key] : s.records?.[r.key]?.value) ?? 0;
	return RECORDS.filter((r) => !r.modes || r.modes.includes(modeKey))
		.map((r) => {
			const value = valueOf(stat, r);
			const record = r.streak ? null : stat.records?.[r.key];
			return {
				key: r.key,
				label: r.label,
				note: r.note ?? (r.streak ? (r.key === "mostGamesInDay" ? "one sitting" : "in a row") : null),
				value: r.display ? r.display(value) : f(r.format ?? "integer", value),
				champ: record?.champ ?? null,
				win: record?.win ?? null,
				squadBest: value > 0 && ranked.every((e) => valueOf(e.stat, r) <= value),
				empty: !value,
			};
		})
		.filter((r) => !r.empty);
}
