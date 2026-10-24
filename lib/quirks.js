// lib/quirks.js
// Pros and cons for The Verdict, named like Darkest Dungeon quirks. Each quirk is scored
// against the rest of the squad (standard deviations from the average), with `better`
// saying which end is the good one: the far good end is a positive quirk, the far bad
// end a negative one. Lines are fragments without a subject, so they read the same for anyone.
import { formatStat as f } from "./utils.js";

const pct = (v) => f("percent", v);

// `good` / `bad` describe each end ({ name, line }); a quirk can have just one.
// `skipRoles` leaves out mains whose job makes the stat meaningless (supports and damage).
// Quirks sharing a `group` never both appear on one side of a card.
const QUIRKS = [
	{
		key: "winRate",
		better: "high",
		value: (s) => s.winRate,
		good: {
			name: "Favoured by the Flame",
			when: (s) => s.winRate > 0.5,
			line: (s) => `${pct(s.winRate)} win rate across ${s.games} games. Hope burns bright around this one.`,
		},
		bad: {
			name: "Forsaken",
			when: (s) => s.winRate < 0.5,
			line: (s) => `${pct(s.winRate)} win rate across ${s.games} games. The Flame gutters, and the road grows long.`,
		},
	},
	{
		key: "kda",
		better: "high",
		value: (s) => s.kda,
		good: {
			name: "Steady Hand",
			line: (s) => `${f("decimal2", s.kda)} KDA. Death is a stranger, and a rude one at that.`,
		},
		bad: {
			name: "Reckless",
			line: (s) => `${f("decimal2", s.kda)} KDA. Courts Death's Door like a lovesick fool.`,
		},
	},
	{
		key: "kills",
		group: "violence",
		better: "high",
		skipRoles: ["UTILITY"],
		value: (s) => s.kills,
		good: {
			name: "Bloodlust",
			line: (s) => `${f("decimal", s.kills)} kills a game, ${s.mostKills} in the bloodiest.`,
		},
		bad: {
			name: "Faint of Heart",
			line: (s) => `${f("decimal", s.kills)} kills a game. Leaves the killing to sterner souls.`,
		},
	},
	{
		key: "dmgDealt",
		group: "violence",
		better: "high",
		skipRoles: ["UTILITY"],
		value: (s) => s.dmgDealt,
		good: {
			name: "Ruinous Strikes",
			line: (s) => `${f("thousands", s.dmgDealt)} damage to champions a game. Leaves nothing standing.`,
		},
		bad: {
			name: "Feeble Blows",
			line: (s) => `${f("thousands", s.dmgDealt)} damage to champions a game. The enemy barely notices.`,
		},
	},
	{
		key: "dmgPerKill",
		better: "low",
		value: (s) => s.dmgPerKill,
		good: {
			name: "Deathblow Specialist",
			line: (s) => `${f("thousands", s.dmgPerKill)} damage per kill. Arrives precisely in time for the final blow.`,
		},
	},
	{
		key: "deaths",
		group: "dying",
		better: "low",
		value: (s) => s.deaths,
		good: {
			name: "Clings to Life",
			line: (s) => `Only ${f("decimal", s.deaths)} deaths a game. Refuses to give the grave its due.`,
		},
		bad: {
			name: "Death Wish",
			line: (s) => `${f("decimal", s.deaths)} deaths a game, ${s.mostDeaths} on the worst night. The grave keeps a chair warm.`,
		},
	},
	{
		key: "timeSpentDead",
		group: "dying",
		better: "low",
		value: (s) => s.timeSpentDead,
		bad: {
			name: "Familiar of the Grey",
			line: (s) =>
				`${f("duration", s.timeSpentDead)} a game spent dead, ${f("hours", s.totals.timeSpentDead)} all told. Knows the grey screen by its first name.`,
		},
	},
	{
		key: "killParticipation",
		group: "presence",
		better: "high",
		value: (s) => s.killParticipation,
		good: {
			name: "Ever in the Fray",
			line: (s) => `${pct(s.killParticipation)} kill participation. No skirmish is fought without them.`,
		},
		bad: {
			name: "Far From the Fight",
			line: (s) => `${pct(s.killParticipation)} kill participation. The battle is joined; they are elsewhere.`,
		},
	},
	{
		key: "assists",
		group: "presence",
		better: "high",
		value: (s) => s.assists,
		good: {
			name: "Loyal Retainer",
			line: (s) => `${f("decimal", s.assists)} assists a game. Holds the enemy still while others feast.`,
		},
		bad: {
			name: "Lone Wolf",
			line: (s) => `${f("decimal", s.assists)} assists a game. Allies are a rumour, seldom confirmed.`,
		},
	},
	{
		key: "dmgTaken",
		better: "high",
		value: (s) => s.dmgTaken + s.dmgMitigated,
		good: {
			name: "Iron Hide",
			line: (s) =>
				`${f("thousands", s.dmgTaken)} damage taken and ${f("thousands", s.dmgMitigated)} shrugged off a game. A wall of flesh and spite.`,
		},
	},
	{
		key: "vision",
		group: "vision",
		modes: ["sr"],
		better: "high",
		value: (s) => s.vision,
		good: {
			name: "Torchbearer",
			line: (s) => `${f("decimal", s.vision)} vision score a game. Carries the light where others fear to tread.`,
		},
		bad: {
			name: "Night Blind",
			line: (s) => `${f("decimal", s.vision)} vision score a game. Wanders the dark and is surprised by it every time.`,
		},
	},
	{
		key: "controlWards",
		group: "vision",
		modes: ["sr"],
		better: "high",
		value: (s) => s.controlWards,
		bad: {
			name: "Miserly",
			line: (s) =>
				`${s.totals.controlWards} control ward${s.totals.controlWards === 1 ? "" : "s"} in ${s.games} games. Seventy-five gold is seventy-five gold.`,
		},
	},
	{
		key: "ccTime",
		group: "control",
		better: "high",
		value: (s) => s.ccTime,
		good: {
			name: "Shackler",
			line: (s) => `${f("duration", s.ccTime)} of crowd control a game. The enemy moves when permitted, and not before.`,
		},
	},
	{
		key: "bombas",
		group: "control",
		better: "high",
		value: (s) => s.bombas,
		good: {
			name: "Into the Pit",
			line: (s) => `${f("decimal2", s.bombas)} enemies a game dragged into the team for the kill. Delivers them personally.`,
		},
	},
	{
		key: "csDiff10",
		group: "lane",
		modes: ["sr"],
		better: "high",
		skipRoles: ["UTILITY"],
		value: (s) => s.csDiff10,
		good: {
			name: "Lane Tyrant",
			when: (s) => s.csDiff10 > 0,
			line: (s) => `${f("signedDecimal", s.csDiff10)} CS on the lane opponent at 10 minutes. The lane is a fiefdom.`,
		},
		bad: {
			name: "Pays the Tithe",
			when: (s) => s.csDiff10 < 0,
			line: (s) => `${f("signedDecimal", s.csDiff10)} CS at 10 minutes against the lane opponent. Tribute, paid in full.`,
		},
	},
	{
		key: "goldDiff",
		group: "lane",
		modes: ["sr"],
		better: "high",
		skipRoles: ["UTILITY"],
		value: (s) => s.goldDiff,
		good: {
			name: "Gilded",
			when: (s) => s.goldDiff > 0,
			line: (s) => `${f("signedInteger", s.goldDiff)} gold on the lane opponent a game. Hoards it like a dragon.`,
		},
		bad: {
			name: "Squanders the Purse",
			when: (s) => s.goldDiff < 0,
			line: (s) => `${f("signedInteger", s.goldDiff)} gold against the lane opponent a game. Coin slips through the fingers.`,
		},
	},
	{
		key: "towerDmg",
		group: "siege",
		modes: ["sr"],
		better: "high",
		skipRoles: ["UTILITY"],
		value: (s) => s.towerDmg,
		good: {
			name: "Siege Engine",
			line: (s) =>
				`${f("thousands", s.towerDmg)} tower damage and ${f("decimal", s.turretPlates)} plates a game. Stone walls are a suggestion.`,
		},
		bad: {
			name: "Fears the Stone",
			line: (s) => `${f("thousands", s.towerDmg)} tower damage a game. Treats turrets with the reverence of a pilgrim.`,
		},
	},
	{
		key: "soloTurrets",
		group: "siege",
		modes: ["sr"],
		better: "high",
		value: (s) => s.soloTurrets,
		good: {
			name: "Wanderer",
			line: (s) => `${f("decimal2", s.soloTurrets)} towers a game taken alone, late. Walks a lonely road, and razes it.`,
		},
	},
	{
		key: "soloKills",
		better: "high",
		value: (s) => s.soloKills,
		good: {
			name: "Duellist",
			line: (s) => `${f("decimal", s.soloKills)} solo kills a game. Single combat, settled with prejudice.`,
		},
	},
	{
		key: "skillshotsHit",
		better: "high",
		value: (s) => s.skillshotsHit,
		good: {
			name: "Eagle Eye",
			line: (s) => `${f("decimal", s.skillshotsHit)} skillshots landed a game. The aim is true and the target is doomed.`,
		},
	},
	{
		key: "skillshotsDodged",
		better: "high",
		value: (s) => s.skillshotsDodged,
		good: {
			name: "Evasive",
			line: (s) =>
				`${f("decimal", s.skillshotsDodged)} skillshots dodged a game, ${f("decimal", s.lastSecondDodges)} at the last instant. Not there when the blow lands.`,
		},
	},
	{
		key: "objectives",
		modes: ["sr"],
		better: "high",
		value: (s) => s.dragonTakedowns + s.baronTakedowns + (s.objectivesStolen / s.games) * 4,
		good: {
			name: "Dragon Slayer",
			line: (s) =>
				`${f("decimal2", s.dragonTakedowns)} dragons a game and ${s.objectivesStolen} objectives stolen. What the pit holds belongs to them.`,
		},
	},
	{
		key: "teamHealing",
		group: "mercy",
		better: "high",
		value: (s) => s.healsOnTeammates + s.shieldsOnTeammates,
		good: {
			name: "Field Medic",
			line: (s) =>
				`${f("integer", s.healsOnTeammates + s.shieldsOnTeammates)} healed and shielded on allies a game. Mends what others break.`,
		},
	},
	{
		key: "saves",
		group: "mercy",
		better: "high",
		value: (s) => s.saves,
		good: {
			name: "Guardian",
			line: (s) => `${s.totals.saves} allies pulled back from Death's Door. Owed a great deal, thanked rarely.`,
		},
	},
	{
		key: "firstBloodRate",
		better: "high",
		value: (s) => s.firstBloodRate,
		good: {
			name: "First to the Kill",
			line: (s) => `In on first blood in ${pct(s.firstBloodRate)} of games. The opening act is theirs.`,
		},
	},
	{
		key: "largestSpree",
		better: "high",
		value: (s) => s.largestSpree,
		good: {
			name: "Rampage",
			line: (s) => `A killing spree of ${f("decimal", s.largestSpree)} on an average night, ${s.bestSpree} at the peak.`,
		},
	},
	{
		key: "multikills",
		better: "high",
		value: (s) => (s.pentas * 4 + s.quadras) / s.games,
		good: {
			name: "Executioner",
			when: (s) => s.pentas + s.quadras > 0,
			line: (s) =>
				`${s.quadras} quadra${s.quadras === 1 ? "" : "s"}${s.pentas ? ` and ${s.pentas} penta${s.pentas === 1 ? "" : "s"}` : ""}. The bodies are counted in batches.`,
		},
	},
	{
		key: "outnumberedKills",
		better: "high",
		value: (s) => s.outnumberedKills / s.games,
		good: {
			name: "Defiant",
			line: (s) => `${s.outnumberedKills} kills while outnumbered. Odds are for accountants.`,
		},
	},
	{
		key: "champPool",
		group: "pool",
		better: "low",
		// Pool size grows with games played, so compare it per sqrt(games)
		value: (s) => s.champPool / Math.sqrt(s.games),
		bad: {
			name: "Fickle",
			line: (s) => `${s.champPool} different champions in ${s.games} games. Wears faces like a travelling mummer.`,
		},
	},
	{
		key: "mainShare",
		group: "pool",
		better: "low",
		weight: 0.9,
		value: (s) => (s.topChamps[0] ? s.topChamps[0].games / s.games : null),
		bad: {
			name: "Single-Minded",
			when: (s) => s.topChamps[0].games / s.games > 0.6,
			line: (s) =>
				`${s.topChamps[0].games} of ${s.games} games on ${s.topChamps[0].name}. Should the enemy ban it, only the void remains.`,
		},
	},
	{
		key: "teammateImpact",
		better: "high",
		weight: 1.2,
		value: (s) => s.teammateImpact,
		good: {
			name: "Beacon of Hope",
			when: (s) => s.teammateImpact >= 0.02,
			line: (s) =>
				`The squad wins ${f("decimal", s.teammateImpact * 100)} points more often with them than the same stack without.`,
		},
		bad: {
			name: "Millstone",
			when: (s) => s.teammateImpact <= -0.02,
			line: (s) =>
				`The squad wins ${f("decimal", -s.teammateImpact * 100)} points less often with them than the same stack without.`,
		},
	},
	{
		key: "surrenders",
		better: "low",
		weight: 0.8,
		value: (s) => (s.games > s.wins ? s.totals.surrenders / (s.games - s.wins) : null),
		good: {
			name: "Unyielding",
			line: (s) =>
				`Only ${pct(s.totals.surrenders / (s.games - s.wins))} of losses end in surrender. Fights on long past reason.`,
		},
		bad: {
			name: "Quick to Yield",
			line: (s) => `${pct(s.totals.surrenders / (s.games - s.wins))} of losses end in surrender. The white flag is always close at hand.`,
		},
	},
	{
		key: "lateGames",
		better: "low",
		weight: 0.8,
		value: (s) => s.lateGames / s.games,
		bad: {
			name: "Sleepless",
			line: (s) =>
				`${s.lateGames} games begun after midnight. Stress mounts in the small hours, and still they queue.`,
		},
	},
];

// Quirks need to stand out at least this much (in standard deviations) to make the card
const MIN_SCORE = 0.5;
const PER_SIDE = 4;
// Everyone gets at least one pro and two cons, however mild. Nobody is perfect.
const MIN_PROS = 1;
const MIN_CONS = 2;

// puuid -> { pros: [{ name, line }], cons: [{ name, line }] } for the ranked players
// (entries: [{ player, stat }]) in one mode
export function scoreQuirks(entries, modeKey) {
	const scored = new Map(entries.map((e) => [e.player.puuid, []]));
	for (const quirk of QUIRKS) {
		if (quirk.modes && !quirk.modes.includes(modeKey)) continue;
		const values = entries
			.filter((e) => !quirk.skipRoles?.includes(e.stat.mainRole))
			.map((e) => [e, quirk.value(e.stat)])
			.filter(([, v]) => Number.isFinite(v));
		if (values.length < 3) continue;
		const mean = values.reduce((n, [, v]) => n + v, 0) / values.length;
		const sd = Math.sqrt(values.reduce((n, [, v]) => n + (v - mean) ** 2, 0) / values.length);
		// Measured from the median: one support's vision score shouldn't make everyone else blind
		const sorted = values.map(([, v]) => v).sort((a, b) => a - b);
		const mid = sorted.length / 2;
		const median = sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2;
		if (!sd) continue;
		for (const [e, v] of values) {
			// Positive when on the good end, whichever direction that is
			const z = ((v - median) / sd) * (quirk.better === "low" ? -1 : 1) * (quirk.weight ?? 1);
			const side = z > 0 ? quirk.good : quirk.bad;
			if (!side || (side.when && !side.when(e.stat))) continue;
			scored.get(e.player.puuid).push({ quirk, side, z });
		}
	}

	return new Map(
		entries.map(({ player, stat }) => {
			const list = scored.get(player.puuid);
			const pick = (candidates, min) => {
				const seen = new Set();
				const out = [];
				for (const c of candidates) {
					const group = c.quirk.group ?? c.quirk.key;
					if (seen.has(group) || (out.length >= min && Math.abs(c.z) < MIN_SCORE)) continue;
					seen.add(group);
					out.push({ name: c.side.name, line: c.side.line(stat) });
					if (out.length === PER_SIDE) break;
				}
				return out;
			};
			return [
				player.puuid,
				{
					pros: pick(list.filter((c) => c.z > 0).sort((a, b) => b.z - a.z), MIN_PROS),
					cons: pick(list.filter((c) => c.z < 0).sort((a, b) => a.z - b.z), MIN_CONS),
				},
			];
		})
	);
}
