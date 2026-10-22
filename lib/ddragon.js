// lib/ddragon.js
const CDN = "https://ddragon.leagueoflegends.com/cdn";

export async function getLatestVersion() {
	const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
	if (!res.ok) throw new Error(`DDragon versions ${res.status}`);
	const [latest] = await res.json();
	return latest;
}

// championId (number) -> { id: "MonkeyKing", name: "Wukong" }
export async function getChampions(version) {
	const res = await fetch(`${CDN}/${version}/data/en_US/champion.json`);
	if (!res.ok) throw new Error(`DDragon champions ${res.status}`);
	const { data } = await res.json();
	return Object.fromEntries(
		Object.values(data).map((c) => [c.key, { id: c.id, name: c.name }])
	);
}

// itemId -> { name, completed } where completed = a finished (non-component) item
export async function getItems(version) {
	const res = await fetch(`${CDN}/${version}/data/en_US/item.json`);
	if (!res.ok) throw new Error(`DDragon items ${res.status}`);
	const { data } = await res.json();
	return Object.fromEntries(
		Object.entries(data).map(([id, it]) => [
			id,
			{
				name: it.name,
				completed: !it.into?.length && it.gold?.total >= 2000 && !it.tags?.includes("Boots"),
			},
		])
	);
}

export const profileIconUrl = (version, iconId) =>
	`${CDN}/${version}/img/profileicon/${iconId}.png`;
export const itemIconUrl = (version, itemId) => `${CDN}/${version}/img/item/${itemId}.png`;
export const championIconUrl = (version, champId) =>
	`${CDN}/${version}/img/champion/${champId}.png`;
export const mapIconUrl = (version, mapId) => `${CDN}/${version}/img/map/map${mapId}.png`;
export const championLoadingUrl = (champId) => `${CDN}/img/champion/loading/${champId}_0.jpg`;
export const championCenteredUrl = (champId) => `${CDN}/img/champion/centered/${champId}_0.jpg`;
