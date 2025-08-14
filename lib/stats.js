// lib/stats.js
import { getMatchIds, getMatchDetails } from './riot.js';
import { sumPings, rankBy } from './utils.js';

export async function getAggregatedStatsByPuuid(puuid, count = 10) {
  const totals = {
    kills: 0, deaths: 0, assists: 0,
    dmgDealt: 0, dmgTaken: 0,
    vision: 0, pings: 0, ccTime: 0, timeSpentDead: 0, dmgPerKill: 0,
  };
  
  const ids = await getMatchIds(puuid, count);

  for (const id of ids) {
    const match = await getMatchDetails(id);
    const p = match.info.participants.find(x => x.puuid === puuid);
    if (!p) continue;
    totals.kills    += p.kills;
    totals.deaths   += p.deaths;
    totals.assists  += p.assists;
    totals.dmgDealt += p.totalDamageDealtToChampions;
    totals.dmgTaken += p.totalDamageTaken;
    totals.vision   += p.visionScore;
    totals.pings    += sumPings(p)
    totals.ccTime   += p.totalTimeCCDealt;
    totals.timeSpentDead   += p.totalTimeSpentDead;
  }
  totals.dmgPerKill = Math.round(totals.dmgDealt / totals.kills);


  return totals;
}
