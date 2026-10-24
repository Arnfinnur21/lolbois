// lib/matchCache.js
// Trimmed matches live in one append-only JSONL file, so an interrupted
// fetch (crash, expired key) keeps everything downloaded so far.
import fs from "fs";
import path from "path";

export const CACHE_DIR = path.resolve("data/cache");
const MATCHES_FILE = path.join(CACHE_DIR, "matches.jsonl");

// Bump when trimMatch keeps more data; older cached matches are re-downloaded
export const CACHE_VERSION = 2;

// Everything Riot sends per participant except the bulky parts no stat uses
const DROP_FIELDS = new Set(["perks", "missions"]);
const DROP_PREFIXES = ["PlayerScore", "SWARM_"];
const keep = (key) => !DROP_FIELDS.has(key) && !DROP_PREFIXES.some((prefix) => key.startsWith(prefix));

const sumPings = (p) =>
	Object.entries(p).reduce(
		(total, [stat, value]) =>
			stat.toLowerCase().includes("pings") && Number.isFinite(value) ? total + value : total,
		0
	);

export function trimMatch(match) {
	const { metadata, info } = match;
	return {
		v: CACHE_VERSION,
		id: metadata.matchId,
		queueId: info.queueId,
		gameCreation: info.gameCreation,
		gameDuration: info.gameDuration,
		participants: info.participants.map((p) => {
			const slim = Object.fromEntries(Object.entries(p).filter(([key]) => keep(key)));
			if (p.challenges) {
				slim.challenges = Object.fromEntries(Object.entries(p.challenges).filter(([key]) => keep(key)));
			}
			slim.pings = sumPings(p);
			slim.legendaryItemUsed = p.challenges?.legendaryItemUsed ?? [];
			return slim;
		}),
	};
}

// Rewrites the JSONL with one line per match, dropping superseded duplicates
export function rewriteMatches(matches) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	const tmp = `${MATCHES_FILE}.tmp`;
	fs.writeFileSync(tmp, [...matches.values()].map((m) => JSON.stringify(m)).join("\n") + "\n", "utf-8");
	try {
		fs.renameSync(tmp, MATCHES_FILE);
	} catch (err) {
		// Windows refuses to rename over a file another process (antivirus, a watcher) has open
		if (err.code !== "EPERM" && err.code !== "EBUSY") throw err;
		fs.copyFileSync(tmp, MATCHES_FILE);
		fs.unlinkSync(tmp);
	}
}

export function loadMatches() {
	const matches = new Map();
	if (!fs.existsSync(MATCHES_FILE)) return matches;
	for (const line of fs.readFileSync(MATCHES_FILE, "utf-8").split("\n")) {
		if (!line.trim()) continue;
		try {
			const m = JSON.parse(line);
			matches.set(m.id, m);
		} catch {
			// half-written last line from an interrupted run
		}
	}
	return matches;
}

export function appendMatch(trimmed) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	fs.appendFileSync(MATCHES_FILE, JSON.stringify(trimmed) + "\n", "utf-8");
}

export function readCacheJson(name, fallback) {
	const file = path.join(CACHE_DIR, name);
	if (!fs.existsSync(file)) return fallback;
	return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function writeCacheJson(name, data) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	fs.writeFileSync(path.join(CACHE_DIR, name), JSON.stringify(data, null, 2), "utf-8");
}
