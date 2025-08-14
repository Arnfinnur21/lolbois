// lib/ddragon.js
const LATEST_VERSION = '14.14.1'; // pin it or fetch once separately

export function getProfileIconUrl(iconId) {
  return `https://ddragon.leagueoflegends.com/cdn/${LATEST_VERSION}/img/profileicon/${iconId}.png`;
}
