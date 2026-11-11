import { NextResponse } from 'next/server';
import { getCityPulseStats } from '@/services/db/stats';

export async function GET() {
  try {
    const stats = await getCityPulseStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    console.error('[/api/stats GET]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil statistik City Pulse.' },
      { status: 500 },
    );
  }
}

