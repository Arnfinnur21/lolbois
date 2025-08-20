import "dotenv/config";
import { writeFileSync } from "fs";
import { getMatchDetails } from "../lib/riot.js"; // adjust path if needed

const puuid =
	"_3NJosF1cHM30zXPdeL6VyXDcJxq57fU7qdaNl1DNBX_9KSKaVKar80vq_E5MJW8T8HMU5RwP3p7tg";
const region = "europe"; // routing for EUNE/EUW
const apiKey = process.env.RIOT_API_KEY;

// helper for IDs
async function getMatchIds(puuid, count = 1) {
	const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(
		puuid
	)}/ids?count=${count}`;
	const res = await fetch(url, { headers: { "X-Riot-Token": apiKey } });
	if (!res.ok) throw new Error(`Failed to fetch ids: ${res.status}`);
	return res.json();
}

async function main() {
	const ids = await getMatchIds(puuid, 1);
	const latestId = ids[0];
	if (!latestId) throw new Error("No matches found");

	const match = await getMatchDetails(latestId);
	writeFileSync("recent-match.json", JSON.stringify(match, null, 2));
	console.log(`✅ Wrote ${latestId} to recent-match.json`);
}

main().catch((err) => {
	console.error("❌ Error:", err);
	process.exit(1);
});
