// lib/ddragon.js
const LATEST_VERSION = "14.14.1";

export function getProfileIconUrl(iconId) {
	return `https://ddragon.leagueoflegends.com/cdn/${LATEST_VERSION}/img/profileicon/${iconId}.png`;
}
export function getItemIconUrl(iconId) {
	return `https://ddragon.leagueoflegends.com/cdn/${LATEST_VERSION}/img/item/${iconId}.png`;
}
