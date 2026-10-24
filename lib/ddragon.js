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
// [{ num, name }] for every skin (and chroma) of a champion; num 0 is "default"
export async function getChampionSkins(version, champId) {
	const res = await fetch(`${CDN}/${version}/data/en_US/champion/${champId}.json`);
	if (!res.ok) throw new Error(`DDragon ${champId} ${res.status}`);
	const { data } = await res.json();
	return data[champId].skins.map(({ num, name }) => ({ num, name }));
}

export const championLoadingUrl = (champId, skin = 0) => `${CDN}/img/champion/loading/${champId}_${skin}.jpg`;
export const championCenteredUrl = (champId, skin = 0) => `${CDN}/img/champion/centered/${champId}_${skin}.jpg`;
export const championSplashUrl = (champId, skin = 0) => `${CDN}/img/champion/splash/${champId}_${skin}.jpg`;

// Art for a player's portrait: their champion and skins from data/portraits.json,
// otherwise their most played champion's default skin. `srcs` ({ url, zoom, focus })
// fades between skins in a ShapeFrame.
export function portraitArt(player, stat) {
	if (player.portrait) {
		const { id, name, skins } = player.portrait;
		return { name, srcs: skins.map(({ num, ...crop }) => ({ url: championCenteredUrl(id, num), ...crop })) };
	}
	const champ = stat?.topChamps[0];
	return champ?.id ? { name: champ.name, srcs: [{ url: championCenteredUrl(champ.id) }] } : { name: null, srcs: [] };
}
