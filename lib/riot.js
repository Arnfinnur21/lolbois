// lib/riot.js
const KEY = (process.env.RIOT_API_KEY || '').trim();
if (!KEY) throw new Error('Missing RIOT_API_KEY');

const ACCOUNT_REGION = 'europe'; // continent routing for account API
const MATCH_REGION   = 'europe'; // continent routing for match API

async function fetchRiot(url) {
  const res = await fetch(url, {
    headers: {
      'X-Riot-Token':    KEY,
      'User-Agent':      'LOLBOIS/1.0',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  console.log(
    `\n${url}`,
    "\nApp Limit:", res.headers.get("x-app-rate-limit"),
    "\nApp Count:", res.headers.get("x-app-rate-limit-count"),
    "\nMethod Limit:", res.headers.get("x-method-rate-limit"),
    "\nMethod Count:", res.headers.get("x-method-rate-limit-count")
  );
  if (!res.ok) throw new Error(`Riot fetch failed: ${res.status}`);
  return res.json();
}

export async function getPUUIDFromRiotID(gameName, tagLine) {
  const url = `https://${ACCOUNT_REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
              `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const data = await fetchRiot(url);
  return data.puuid;
}

export async function getSummonerByPuuid(puuid) {
  const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
  const res = await fetch(url, { headers: { 'X-Riot-Token': KEY } });
  if (!res.ok) throw new Error(`Riot ${res.status}`);
  return res.json(); // <-- this has `.name`
}

export async function getMatchIds(puuid, count) {
  const url = `https://${MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  return fetchRiot(url);
}

export async function getMatchDetails(matchId) {
  const url = `https://${MATCH_REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return fetchRiot(url);
}
