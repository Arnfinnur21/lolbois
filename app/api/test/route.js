// app/api/test/route.js
import { NextResponse } from 'next/server';
import { getPUUID } from '../../../lib/riot';

export async function GET(req) {
  try {
    const name = req.nextUrl.searchParams.get('name') || 'Nubblys';
    const puuid = await getPUUID(name);
    return NextResponse.json({ ok: true, puuid });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
  }
}
