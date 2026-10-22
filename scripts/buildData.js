// scripts/buildData.js
// Fetches every roster match this season (cached + de-duplicated) and writes data/site.json.
//   npm run gen-data              fetch new matches, then aggregate
//   npm run gen-data -- --offline aggregate from the cache only (no Riot API calls)
import fs from "fs";
import path from "path";
import "dotenv/config";

import {
	getPUUIDFromRiotID,
	getSummonerByPuuid,
	getAllMatchIds,
	getMatchDetails,
} from "../lib/riot.js";
import {
	loadMatches,
	appendMatch,
	rewriteMatches,
	trimMatch,
	readCacheJson,
	writeCacheJson,
	CACHE_VERSION,
} from "../lib/matchCache.js";
import { getLatestVersion, getChampions, getItems, getChampionSkins } from "../lib/ddragon.js";
import { aggregate } from "../lib/aggregate.js";
import { MODES, SEASON_START, MIN_GAMES, MIN_DUO_GAMES } from "../lib/modes.js";

const OFFLINE = process.argv.includes("--offline");
const CONCURRENCY = 4;
const ID_OVERLAP_SECS = 2 * 24 * 60 * 60; // re-list a little before the last run to be safe

const seasonStartSecs = Math.floor(new Date(SEASON_START).getTime() / 1000);
const allQueues = [...new Set(Object.values(MODES).flatMap((m) => m.queues))];
const fmtMins = (ms) => `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;

async function resolveRoster() {
	const roster = JSON.parse(fs.readFileSync(path.resolve("data/players.json"), "utf-8"));
	const accounts = readCacheJson("accounts.json", {});
	const players = [];
	const failed = [];

	for (const { gameName, tagLine } of roster) {
		const riotId = `${gameName}#${tagLine}`;
		try {
			if (!OFFLINE) {
				// PUUIDs are encrypted per API app, so a new key means new PUUIDs. Always
				// re-resolve, and keep the old ones as aliases so cached matches still count.
				const prev = accounts[riotId];
				const puuid = await getPUUIDFromRiotID(gameName, tagLine);
				const aliases = new Set(prev?.aliases ?? []);
				if (prev?.puuid && prev.puuid !== puuid) aliases.add(prev.puuid);
				aliases.delete(puuid);
				const summ = await getSummonerByPuuid(puuid);
				accounts[riotId] = {
					puuid,
					aliases: [...aliases],
					iconId: summ.profileIconId,
					level: summ.summonerLevel,
				};
			}
			if (!accounts[riotId]) throw new Error("not in cache, run without --offline first");
			players.push({ name: gameName, tag: tagLine, riotId, ...accounts[riotId] });
		} catch (err) {
			console.error(`❌ ${riotId}: ${err.message}`);
			failed.push(riotId);
		}
	}

	writeCacheJson("accounts.json", accounts);
	if (failed.length) {
		throw new Error(`Couldn't resolve ${failed.join(", ")}. data/site.json was left untouched.`);
	}
	return players;
}

// Maps every PUUID a roster player has had (one per API app) to their current one
function normalisePuuids(matches, players) {
	const current = new Map();
	for (const p of players) {
		current.set(p.puuid, p.puuid);
		for (const alias of p.aliases ?? []) current.set(alias, p.puuid);
	}
	return matches.map((m) => ({
		...m,
		participants: m.participants.map((part) =>
			current.has(part.puuid) ? { ...part, puuid: current.get(part.puuid) } : part
		),
	}));
}

async function collectMatchIds(players) {
	const idCache = readCacheJson("ids.json", {});
	const ids = new Set();

	for (const player of players) {
		for (const queue of allQueues) {
			// Keyed by Riot ID, since PUUIDs change with the API key
			const cacheKey = `${player.riotId}:${queue}`;
			const legacyKey = [player.puuid, ...(player.aliases ?? [])]
				.map((puuid) => `${puuid}:${queue}`)
				.find((key) => idCache[key]);
			let entry = idCache[cacheKey] ?? idCache[legacyKey];
			if (legacyKey) delete idCache[legacyKey];
			if (entry?.seasonStart !== SEASON_START) entry = { seasonStart: SEASON_START, ids: [] };

			if (!OFFLINE) {
				const since = entry.fetchedAt
					? Math.max(seasonStartSecs, entry.fetchedAt - ID_OVERLAP_SECS)
					: seasonStartSecs;
				const fetchedAt = Math.floor(Date.now() / 1000);
				const fresh = await getAllMatchIds(player.puuid, queue, since);
				entry = { ...entry, fetchedAt, ids: [...new Set([...fresh, ...entry.ids])] };
			}
			idCache[cacheKey] = entry;
			entry.ids.forEach((id) => ids.add(id));
		}
		const count = allQueues.reduce((n, q) => n + (idCache[`${player.riotId}:${q}`]?.ids.length ?? 0), 0);
		console.log(`📋 ${player.name}: ${count} games this season`);
	}

	writeCacheJson("ids.json", idCache);
	return ids;
}

async function fetchMissing(ids, cached) {
	// Matches cached by an older trimMatch lack fields newer stats need, so refetch them
	const missing = [...ids].filter((id) => (cached.get(id)?.v ?? 1) < CACHE_VERSION);
	console.log(`\n🔎 ${ids.size} unique games, ${ids.size - missing.length} cached, ${missing.length} to fetch`);
	if (!missing.length) return;

	const started = Date.now();
	let done = 0;
	let next = 0;
	let fatal = null;

	async function worker() {
		while (next < missing.length && !fatal) {
			const id = missing[next++];
			try {
				const trimmed = trimMatch(await getMatchDetails(id));
				appendMatch(trimmed);
				cached.set(id, trimmed);
			} catch (err) {
				if (err.status === 401 || err.status === 403) fatal = err;
				else console.error(`⚠️  ${id}: ${err.message}`);
			}
			done++;
			if (done % 10 === 0 || done === missing.length) {
				const eta = ((Date.now() - started) / done) * (missing.length - done);
				console.log(`⬇️  ${done}/${missing.length}  ETA ${fmtMins(eta)}`);
			}
		}
	}

	await Promise.all(Array.from({ length: CONCURRENCY }, worker));
	if (fatal) {
		throw new Error(
			`Riot rejected the API key (${fatal.status}). Dev keys expire every 24h, so grab a new one. ` +
				`Everything fetched so far is cached.`
		);
	}
}

async function loadDDragon() {
	try {
		const version = await getLatestVersion();
		const ddragon = { version, champions: await getChampions(version), items: await getItems(version) };
		writeCacheJson("ddragon.json", ddragon);
		return ddragon;
	} catch (err) {
		const cached = readCacheJson("ddragon.json", null);
		if (!cached) throw err;
		console.warn(`⚠️  DDragon unreachable, using cached ${cached.version}`);
		return cached;
	}
}

// A champion's skin list, from DDragon or the cache when offline
async function championSkins(version, champId) {
	const cache = readCacheJson("skins.json", {});
	const key = `${version}:${champId}`;
	try {
		cache[key] = await getChampionSkins(version, champId);
		writeCacheJson("skins.json", cache);
	} catch (err) {
		if (!cache[key]) throw err;
	}
	return cache[key];
}

// data/portraits.json -> { puuid: { id, name, skins: [skin numbers] } }
async function resolvePortraits(players, ddragon) {
	const file = path.resolve("data/portraits.json");
	if (!fs.existsSync(file)) return {};
	const config = JSON.parse(fs.readFileSync(file, "utf-8"));
	const champions = Object.values(ddragon.champions);
	const out = {};

	for (const player of players) {
		const entry = config[player.name] ?? config[player.riotId];
		if (!entry) continue;
		const wantedChamp = String(entry.champion).toLowerCase();
		const champ = champions.find((c) => c.id.toLowerCase() === wantedChamp || c.name.toLowerCase() === wantedChamp);
		if (!champ) {
			console.warn(`⚠️  portraits.json: no champion called "${entry.champion}" (${player.name})`);
			continue;
		}
		const skins = await championSkins(ddragon.version, champ.id);
		const nums = (entry.skins?.length ? entry.skins : ["default"]).flatMap((wanted) => {
			const skin = skins.find((s) => s.name.toLowerCase() === String(wanted).toLowerCase());
			if (!skin) console.warn(`⚠️  portraits.json: ${champ.name} has no skin "${wanted}" (${player.name})`);
			return skin ? [skin.num] : [];
		});
		out[player.puuid] = { id: champ.id, name: champ.name, skins: nums.length ? nums : [0] };
	}
	return out;
}

async function main() {
	const started = Date.now();
	const players = await resolveRoster();
	const ids = await collectMatchIds(players);
	const cached = loadMatches();
	if (!OFFLINE) {
		await fetchMissing(ids, cached);
		rewriteMatches(cached);
	}

	const ddragon = await loadDDragon();
	const portraits = await resolvePortraits(players, ddragon);
	const result = aggregate({
		matches: normalisePuuids(
			[...cached.values()].filter((m) => ids.has(m.id)),
			players
		),
		roster: players,
		modes: MODES,
		champions: ddragon.champions,
		items: ddragon.items,
		seasonStart: SEASON_START,
		minGames: MIN_GAMES,
		minDuoGames: MIN_DUO_GAMES,
	});

	const site = {
		generatedAt: new Date().toISOString(),
		ddragonVersion: ddragon.version,
		players: players.map(({ puuid, name, tag, iconId, level }) => ({
			puuid,
			name,
			tag,
			iconId,
			level,
			...(portraits[puuid] && { portrait: portraits[puuid] }),
		})),
		...result,
	};
	const out = path.resolve("data/site.json");
	fs.writeFileSync(out, JSON.stringify(site, null, "\t"), "utf-8");

	const summary = Object.values(site.modes).map((m) => `${m.label}: ${m.totalGames}`).join(", ");
	console.log(`\n🏁 Wrote ${out} (${summary}) in ${fmtMins(Date.now() - started)}`);
}

main().catch((err) => {
	console.error(`\n❌ ${err.message}`);
	process.exit(1);
});
