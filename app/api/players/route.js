// scripts/buildPlayers.js
const fs   = require('fs');
const riot = require('../lib/riot');
const statsLib = require('../lib/stats');

async function build() {
  // 1. your “roster” of Riot IDs
  const roster = [
    { gameName: 'Nubblys', tagLine: 'EUW' },
    // …
  ];

  // 2. for each summoner, fetch everything in one go
  const fullPlayers = await Promise.all(roster.map(async ({ gameName, tagLine }) => {
    const puuid    = await riot.getPUUIDFromRiotID(gameName, tagLine);
    const sumInfo  = await riot.getSummonerByPuuid(puuid);           // has profileIconId & summonerLevel
    const iconUrl  = riot.getProfileIconUrl(sumInfo.profileIconId);  // your DataDragon helper
    const stats    = await statsLib.getAggregatedStatsByPuuid(puuid);// your match-v5 stats aggregator

    return {
      name:            sumInfo.name,
      puuid:           puuid,
      summonerLevel:   sumInfo.summonerLevel,
      profileIconUrl:  iconUrl,
      ...stats
    };
  }));

  // 3. write out one JSON
  fs.writeFileSync(
    './data/players.full.json',
    JSON.stringify(fullPlayers, null, 2),
    'utf-8'
  );
  console.log('✅ Built players.full.json with', fullPlayers.length, 'entries');
}

build().catch(console.error);
