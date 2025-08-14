// scripts/buildPlayers.js
import fs   from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { getPUUIDFromRiotID, getSummonerByPuuid } from '../lib/riot.js';
import { getAggregatedStatsByPuuid }             from '../lib/stats.js';
import { getProfileIconUrl }                     from '../lib/ddragon.js';

async function buildPlayers() {
  const roster = JSON.parse(
    fs.readFileSync(path.resolve('data/players.json'), 'utf-8')
  );

  const full = [];
  for (const { gameName, tagLine } of roster) {
    try {
      const puuid   = await getPUUIDFromRiotID(gameName, tagLine); // 1 request
      const summ    = await getSummonerByPuuid(puuid); // 1 request
      const stats   = await getAggregatedStatsByPuuid(puuid); // 2 x count requests
      const iconUrl = getProfileIconUrl(summ.profileIconId); // synchronous now - 0 requests

      full.push({
        name:           summ.name || gameName,           // ← should never be undefined
        puuid,
        summonerLevel:  summ.summonerLevel,
        profileIconUrl: iconUrl,            // ← a string, not {}
        ...stats
      });

      console.log(`✅ Fetched ${gameName}`);
    } catch (err) {
      console.error(`❌ ${gameName}#${tagLine}: ${err.message}`);
    }
  }

  const out = path.resolve('data/players.full.json');
  fs.writeFileSync(out, JSON.stringify(full, null, 2), 'utf-8');
  console.log(`\n🏁 Built ${full.length} players → ${out}`);
}

buildPlayers().catch(err => {
  console.error(err);
  process.exit(1);
});
