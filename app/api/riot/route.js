// app/api/riot/route.js
import { NextResponse } from 'next/server';
import { getSummonerByName, getRankedStatsById, getAramMatchIds } from '../../../lib/riot';

export const dynamic = 'force-dynamic';

/**
 * GET /api/riot?name={summonerName}&queue={ranked|aram}
 * Always uses EUNE; strips any # suffix
 */
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const nameParam = searchParams.get('name');
    const queue = (searchParams.get('queue') || 'ranked').toLowerCase();

    if (!nameParam) {
      return NextResponse.json(
        { error: 'Missing `name` query parameter' },
        { status: 400 }
      );
    }

    // Strip region suffix
    const rawName = nameParam.split('#')[0].trim();
    const summoner = await getSummonerByName(rawName);

    if (queue === 'aram') {
      const aramMatchIds = await getAramMatchIds(summoner.puuid, 5);
      return NextResponse.json(
        { summoner, aramMatchIds },
        { status: 200, next: { revalidate: 3600 } }
      );
    }

    const ranked = await getRankedStatsById(summoner.id);
    return NextResponse.json(
      { summoner, ranked },
      { status: 200, next: { revalidate: 3600 } }
    );
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
};