// lib/stats.js
import { getItemIconUrl } from "./ddragon.js";
import { getMatchIds, getMatchDetails } from "./riot.js";
import { sumPings, rankBy, findMostFrequent } from "./utils.js";

export async function getAggregatedStatsByPuuid(puuid, count = 80) {
	const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
	const totals = {
		kills: 0,
		deaths: 0,
		assists: 0,
		dmgDealt: 0,
		dmgTaken: 0,
		vision: 0,
		pings: 0,
		ccTime: 0,
		timeSpentDead: 0,
		dmgPerKill: 0,
		kda: 0,
		favItem: [],
	};

	const ids = await getMatchIds(puuid, count);
	for (const id of ids) {
		const match = await getMatchDetails(id);
		const p = match.info.participants.find((x) => x.puuid === puuid);
		if (!p) continue;
		totals.kills += p.kills;
		totals.deaths += p.deaths;
		totals.assists += p.assists;
		totals.dmgDealt += p.totalDamageDealtToChampions;
		totals.dmgTaken += p.totalDamageTaken;
		totals.vision += p.visionScore;
		totals.pings += sumPings(p);
		totals.ccTime += p.timeCCingOthers;
		totals.timeSpentDead += p.totalTimeSpentDead;
		totals;
		p.challenges?.legendaryItemUsed &&
			totals.favItem.push(...p.challenges.legendaryItemUsed);
	}
	if (totals?.favItem?.length) {
		totals.favItem = getItemIconUrl(findMostFrequent(totals.favItem));
	}
	totals.dmgPerKill = Math.round(totals.dmgDealt / totals.kills);
	console.log("⏸️ Sleeping 2 minutes to respect Riot limits...");
	await sleep(2 * 60 * 1000);
	return totals;
}
