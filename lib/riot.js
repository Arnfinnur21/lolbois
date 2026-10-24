// lib/riot.js
import { RateLimiter, sleep } from "./rateLimiter.js";

export const PLATFORM = "eun1"; // platform routing for summoner API
export const REGION = "europe"; // continent routing for account + match API

const limiter = new RateLimiter();

function apiKey() {
	const key = (process.env.RIOT_API_KEY || "").trim();
	if (!key) throw new Error("Missing RIOT_API_KEY");
	return key;
}

async function fetchRiot(url, attempt = 0) {
	await limiter.acquire();
	const res = await fetch(url, { headers: { "X-Riot-Token": apiKey() } });
	limiter.update(res.headers.get("x-app-rate-limit"));

	if (res.status === 429 && attempt < 6) {
		const wait = Number(res.headers.get("retry-after") || 10) * 1000;
		console.log(`⏳ Rate limited, waiting ${wait / 1000}s...`);
		limiter.pause(wait);
		return fetchRiot(url, attempt + 1);
	}
	if (res.status >= 500 && attempt < 3) {
		await sleep(2 ** attempt * 1000);
		return fetchRiot(url, attempt + 1);
	}
	if (!res.ok) {
		const err = new Error(`Riot fetch failed: ${res.status} ${url}`);
		err.status = res.status;
		throw err;
	}
	return res.json();
}

export async function getPUUIDFromRiotID(gameName, tagLine) {
	const url =
		`https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
		`${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
	const data = await fetchRiot(url);
	return data.puuid;
}

export async function getSummonerByPuuid(puuid) {
	const url = `https://${PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(
		puuid
	)}`;
	return fetchRiot(url); // { profileIconId, summonerLevel, ... }
}

export async function getMatchIds(puuid, { queue, startTime, endTime, start = 0, count = 100 } = {}) {
	const params = new URLSearchParams({ start, count });
	if (queue != null) params.set("queue", queue);
	if (startTime != null) params.set("startTime", startTime);
	if (endTime != null) params.set("endTime", endTime);
	const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(
		puuid
	)}/ids?${params}`;
	return fetchRiot(url);
}

// Pages through every match id for a queue between startTime and endTime (epoch seconds)
export async function getAllMatchIds(puuid, queue, startTime, endTime) {
	const all = [];
	for (let start = 0; ; start += 100) {
		const page = await getMatchIds(puuid, { queue, startTime, endTime, start, count: 100 });
		all.push(...page);
		if (page.length < 100) break;
	}
	return all;
}

export async function getMatchDetails(matchId) {
	const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
	return fetchRiot(url);
}
