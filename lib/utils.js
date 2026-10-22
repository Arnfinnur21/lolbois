//lib/utils.js

// Each category ranks by the per-game `selector` by default. Ones with `total` also get
// a Total toggle that ranks by stat.totals[total.key] instead. `perGame: false` stats
// are already season counts, so anyone with a game qualifies.
// Support mains get greyed out with a note in lane-diff categories, where supports don't compete
const SUPPORT_NOTE = { role: "UTILITY", note: "(telst ekki maður cmon mane)" };

export const STAT_DESCRIPTORS = {
	killers: {
		key: "killers",
		eyebrow: "Most kills per game",
		title: "Killers",
		flavor: "Kill first, ask questions never.",
		selector: "kills",
		order: "max",
		format: "decimal",
		total: { key: "kills", eyebrow: "Most kills", format: "integer" },
	},
	helpers: {
		key: "helpers",
		eyebrow: "Assists per game",
		title: "Hey, I Helped",
		flavor: "I also did something.",
		selector: "assists",
		order: "max",
		format: "decimal",
		total: { key: "assists", eyebrow: "Most assists", format: "integer" },
	},
	winners: {
		key: "winners",
		eyebrow: "Highest win rate",
		title: "Winners",
		flavor: "Carry or get carried. A W is a W.",
		selector: "winRate",
		order: "max",
		format: "percent",
		secondary: (s) => `${s.wins}W ${s.games - s.wins}L`,
		total: {
			key: "wins",
			eyebrow: "Most wins",
			format: "integer",
			secondary: (s) => `${formatStat("percent", s.winRate)} win rate`,
		},
	},
	marinators: {
		key: "marinators",
		eyebrow: "Damage dealt per game",
		title: "Marinators",
		shape: "blast",
		flavor: "Just preppin' em for ya.",
		selector: "dmgDealt",
		order: "max",
		format: "thousands",
		total: { key: "dmgDealt", eyebrow: "Most damage dealt", format: "compact" },
	},
	bahamuts: {
		key: "bahamuts",
		eyebrow: "Damage taken per game",
		title: "Bahamuts",
		shape: "shield",
		flavor: "Absolute fkn units.",
		selector: "dmgTaken",
		order: "max",
		format: "thousands",
		total: { key: "dmgTaken", eyebrow: "Most damage taken", format: "compact" },
	},
	biggestInters: {
		key: "biggestInters",
		eyebrow: "Most deaths per game",
		title: "Biggest Inters",
		flavor: "Proudly sponsored by the enemy team.",
		selector: "deaths",
		order: "max",
		format: "decimal",
		total: { key: "deaths", eyebrow: "Most deaths", format: "integer" },
	},
	killstealers: {
		key: "killstealers",
		eyebrow: "Least damage per kill",
		title: "Killstealers",
		flavor: "Why do the work when you can take the credit?",
		selector: "dmgPerKill",
		order: "min",
		format: "thousands",
		secondary: (s) => `${s.totals.kills.toLocaleString("en-GB")} kills`,
	},
	greyScreen: {
		key: "greyScreen",
		eyebrow: "Time spent dead per game",
		title: "Grey Screen Enjoyers",
		shape: "skull",
		flavor: "Professional spectators of their own games.",
		selector: "timeSpentDead",
		order: "max",
		format: "duration",
		total: { key: "timeSpentDead", eyebrow: "Most time spent dead", format: "hours" },
	},
	mentalWarfare: {
		key: "mentalWarfare",
		eyebrow: "CC inflicted per game",
		title: "Mental Warfare",
		shape: "wave",
		flavor: "Stunned, rooted, slowed and humbled.",
		selector: "ccTime",
		order: "max",
		format: "duration",
		total: { key: "ccTime", eyebrow: "Most CC inflicted", format: "hours" },
	},
	visionAndies: {
		key: "visionAndies",
		eyebrow: "Vision score per game",
		title: "Vision Andies",
		flavor: "Lighting up the map so the rest can face-check anyway.",
		selector: "vision",
		order: "max",
		format: "decimal",
		modes: ["sr"],
		total: { key: "vision", eyebrow: "Most vision score", format: "integer" },
	},
	pentaMachines: {
		key: "pentaMachines",
		eyebrow: "Pentas / quadras this season",
		title: "Multikill Machines",
		flavor: "Five for five, or at least four. Quadras break the ties.",
		selector: "pentas",
		tiebreak: "quadras",
		order: "max",
		perGame: false,
		display: (s) => `${s.pentas} / ${s.quadras}`,
		secondary: (s) => `${s.games} games`,
	},
	firstBlood: {
		key: "firstBlood",
		eyebrow: "First blood involvement",
		title: "First Blood Hunters",
		flavor: "Early game menace, late game who knows.",
		selector: "firstBloodRate",
		order: "max",
		format: "percent",
		secondary: (s) => `${s.totals.firstBloods} first bloods`,
		total: {
			key: "firstBloods",
			eyebrow: "Most first bloods",
			format: "integer",
			secondary: (s) => `${formatStat("percent", s.firstBloodRate)} of games`,
		},
	},
	legendary: {
		key: "legendary",
		eyebrow: "Longest killing spree per game",
		title: "Legendary",
		flavor: "Somebody stop them.",
		selector: "largestSpree",
		order: "max",
		format: "decimal",
		secondary: (s) => `Best: ${s.bestSpree}`,
		total: {
			label: "Best",
			select: (s) => s.bestSpree,
			eyebrow: "Longest killing spree",
			format: "integer",
			secondary: (s) => `${formatStat("decimal", s.largestSpree)} per game`,
		},
	},
	wtfDamage: {
		key: "wtfDamage",
		eyebrow: "Biggest single crit",
		title: "WTF Was That Damage!?!?!?",
		shape: "blast",
		flavor: "BOP!",
		selector: "biggestCrit",
		order: "max",
		perGame: false,
		format: "integer",
	},
	ambulance: {
		key: "ambulance",
		eyebrow: "Kills while outnumbered",
		title: "Call an Ambulance",
		flavor: "But not for me.",
		selector: "outnumberedKills",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: (s) => `${formatStat("decimal2", s.outnumberedKills / s.games)} per game`,
	},
	bomba: {
		key: "bomba",
		eyebrow: "Enemies kicked into the team for a kill, per game",
		title: "Bomba",
		flavor: "Oppa.",
		selector: "bombas",
		order: "max",
		format: "decimal2",
		total: { key: "bombas", eyebrow: "Enemies kicked into the team for a kill", format: "integer" },
	},
	saviour: {
		key: "saviour",
		eyebrow: "Teammates saved from death per game",
		title: "He Did This for Y'all Mane",
		defaultView: "total",
		flavor: "I gotchu bro.",
		selector: "saves",
		order: "max",
		format: "decimal2",
		total: { key: "saves", eyebrow: "Teammates saved from death", format: "integer" },
	},
	state: {
		key: "state",
		eyebrow: "Kills under your own tower",
		title: "State?!?",
		flavor: "This is private p r o p e r t y.",
		selector: "killsUnderOwnTurret",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: (s) => `${formatStat("decimal2", s.killsUnderOwnTurret / s.games)} per game`,
	},
	private: {
		key: "private",
		eyebrow: "Kills near the enemy tower",
		title: "Private?!?",
		flavor: "This is state p r o p e r t y.",
		selector: "killsNearEnemyTurret",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: (s) => `${formatStat("decimal2", s.killsNearEnemyTurret / s.games)} per game`,
	},
	yoink: {
		key: "yoink",
		eyebrow: "Objectives stolen",
		title: "YOINK!",
		flavor: "Gotta be quicker than that buddy.",
		selector: "objectivesStolen",
		order: "max",
		perGame: false,
		format: "integer",
	},
	yoinkBuffs: {
		key: "yoinkBuffs",
		eyebrow: "Buffs stolen per game",
		title: "y o i n k",
		flavor: "mine now.",
		selector: "buffsStolen",
		order: "max",
		format: "decimal2",
		total: { key: "buffsStolen", eyebrow: "Buffs stolen", format: "integer" },
	},
	goldDiff: {
		key: "goldDiff",
		eyebrow: "Gold lead over the lane opponent per game",
		title: "Gold Diff",
		valueIcon: "gold",
		flavor: "Rich get richer.",
		selector: "goldDiff",
		order: "max",
		format: "signedInteger",
		total: { key: "goldDiff", eyebrow: "Total gold lead over lane opponents", format: "signedCompact" },
		roleNote: SUPPORT_NOTE,
	},
	farmDiff: {
		key: "farmDiff",
		eyebrow: "CS lead over the lane opponent at 10 min",
		title: "Farm Diff",
		valueIcon: "cs",
		flavor: "Every minion counts.",
		selector: "csDiff10",
		order: "max",
		format: "signedDecimal",
		total: { key: "csDiff10", eyebrow: "Total CS lead at 10 min", format: "signedInteger" },
		roleNote: SUPPORT_NOTE,
	},
	comeback: {
		key: "comeback",
		eyebrow: "Biggest kill deficit turned into a win",
		title: "Ain't Over Till It's Over",
		flavor: "Never FF.",
		selector: "biggestComeback",
		order: "max",
		perGame: false,
		display: (s) => `${s.biggestComeback} kills`,
		secondary: () => "down, and still won",
	},
	dogwater: {
		key: "dogwater",
		eyebrow: "Biggest CS lead over the lane opponent",
		title: "Plunderer",
		valueIcon: "cs",
		flavor: "The Eternal Freeze",
		selector: "biggestCsLead",
		order: "max",
		perGame: false,
		display: (s) => `+${Math.round(s.biggestCsLead)}`,
		secondary: (s) => `${formatStat("decimal", s.cs)} CS per game`,
	},
	killParticipation: {
		key: "killParticipation",
		eyebrow: "Kill participation per game",
		title: "Yep I Was There",
		flavor: "All over the place.",
		selector: "killParticipation",
		order: "max",
		format: "percent",
		secondary: (s) => `${formatStat("percent", s.seasonKillParticipation)} over the season`,
		total: {
			label: "Season",
			select: (s) => s.seasonKillParticipation,
			eyebrow: "Kill participation over the whole season",
			format: "percent",
			secondary: (s) =>
				`${formatStat("integer", s.totals.kills + s.totals.assists)} of ${formatStat("integer", s.totals.teamKills)} team kills`,
		},
	},
	happyFeet: {
		key: "happyFeet",
		eyebrow: "Skillshots dodged per game",
		title: "Happy Feet",
		flavor: "Clean with it.",
		selector: "skillshotsDodged",
		order: "max",
		format: "decimal",
		total: { key: "skillshotsDodged", eyebrow: "Skillshots dodged", format: "integer" },
	},
	readLikeABook: {
		key: "readLikeABook",
		eyebrow: "Last-second dodges per game",
		title: "Read Like a Book",
		flavor: "Crazy clean with it.",
		selector: "lastSecondDodges",
		order: "max",
		format: "decimal",
		total: { key: "lastSecondDodges", eyebrow: "Last-second dodges", format: "integer" },
	},
	lateLurkers: {
		key: "lateLurkers",
		eyebrow: "Games started after midnight",
		title: "Late Lurkers",
		flavor: "Farðu bara að sofa bro.",
		selector: "lateGames",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: (s) => `${formatStat("percent", s.lateGames / s.games)} of their games`,
	},
	grinders: {
		key: "grinders",
		eyebrow: "Most games in one day",
		title: "Grinders",
		flavor: "Ain't no stoppin.",
		selector: "mostGamesInDay",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: () => "games in a single day",
	},
	oof: {
		key: "oof",
		eyebrow: "Longest losing streak",
		title: "Oof",
		flavor: "Rough.",
		selector: "loseStreak",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: () => "losses in a row",
	},
	baeng: {
		key: "baeng",
		eyebrow: "Longest winning streak",
		title: "Bæng",
		flavor: "This shit ain't nothin to me man.",
		selector: "winStreak",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: () => "wins in a row",
	},
	blandIPoka: {
		key: "blandIPoka",
		eyebrow: "Different champions played",
		title: "Bland í Poka Meisters",
		flavor: "Bro pickaðu eh tvo og lærðu það.",
		selector: "champPool",
		order: "max",
		perGame: false,
		format: "integer",
		secondary: (s) => (s.topChamps[0] ? `Mostly ${s.topChamps[0].name} (${s.topChamps[0].games})` : `${s.games} games`),
	},
	anchor: {
		key: "anchor",
		eyebrow: "Drags the squad's win rate down",
		title: "The Anchor",
		flavor:
			"The squad's win rate with them, against what the same size stack wins without them. Queue up at your own risk.",
		selector: "teammateImpact",
		order: "min",
		signed: true,
		format: "signedPercent",
		unrankedNote: "Not enough games with the squad to rank",
		secondary: (s) =>
			`${formatStat("percent", s.impactWithRate)} with · ${formatStat("percent", s.impactExpectedRate)} expected`,
	},
};

// The Total-toggle version of a descriptor: ranks total.select(stat), or stat.totals[total.key],
// read from `__total`
export function totalDescriptor(descriptor) {
	const { total } = descriptor;
	return {
		...descriptor,
		eyebrow: total.eyebrow,
		selector: "__total",
		format: total.format,
		display: undefined,
		perGame: false,
		secondary: total.secondary ?? ((s) => `${displayValue(descriptor, s)} per game`),
	};
}

// Second line under a value: the descriptor's own, or the season total when it has one
export const secondaryText = (descriptor, stat) =>
	descriptor.secondary
		? descriptor.secondary(stat)
		: descriptor.total
			? `${formatStat(descriptor.total.format, stat.totals[descriptor.total.key])} total`
			: `${stat.games} games`;

// Sorts qualified players by the descriptor; unqualified ones go last
export function rankBy(entries, descriptor) {
	const { selector, order, tiebreak } = descriptor;
	const dir = order === "min" ? 1 : -1;
	const qualified = entries.filter((e) => e.qualified);
	const rest = entries.filter((e) => !e.qualified).sort((a, b) => b.stat.games - a.stat.games);
	qualified.sort(
		(a, b) =>
			dir * (a.stat[selector] - b.stat[selector]) ||
			(tiebreak ? b.stat[tiebreak] - a.stat[tiebreak] : 0) ||
			b.stat.games - a.stat.games
	);
	return [...qualified, ...rest];
}

const sign = (v) => (v > 0 ? "+" : v < 0 ? "−" : "");

// The note to show after a player's name in this category, if their main role gets one
export const roleNoteFor = (descriptor, stat) =>
	descriptor.roleNote && stat.mainRole === descriptor.roleNote.role ? descriptor.roleNote.note : null;

const FORMATTERS = {
	decimal: (v) => v.toFixed(1),
	decimal2: (v) => v.toFixed(2),
	integer: (v) => Math.round(v).toLocaleString("en-GB"),
	compact: (v) =>
		new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v),
	hours: (v) => formatHours(v),
	percent: (v) => `${(v * 100).toFixed(1)}%`,
	signedInteger: (v) => `${sign(v)}${Math.abs(Math.round(v)).toLocaleString("en-GB")}`,
	signedDecimal: (v) => `${sign(v)}${Math.abs(v).toFixed(1)}`,
	signedCompact: (v) =>
		`${sign(v)}${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Math.abs(v))}`,
	signedPercent: (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(1)}%`,
	thousands: (v) => `${(v / 1000).toFixed(1)}k`,
	duration: (v) => formatDuration(v),
};

export const displayValue = (descriptor, stat) =>
	descriptor.display ? descriptor.display(stat) : formatStat(descriptor.format, stat[descriptor.selector]);

export const formatStat = (format, value) =>
	value == null ? "—" : (FORMATTERS[format] ?? String)(value);

// 95.4 -> "1:35"
export const formatDuration = (seconds) => {
	const s = Math.round(seconds);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// 20108 -> "5h 35m"
export const formatHours = (seconds) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const formatDate = (iso) =>
	new Date(iso).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
