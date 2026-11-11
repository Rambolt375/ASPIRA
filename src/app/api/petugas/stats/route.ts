import { NextRequest, NextResponse } from 'next/server';
import { getPetugasStats } from '@/services/db/petugas';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || undefined;
    const stats = await getPetugasStats(userId);
    return NextResponse.json({ stats });
  } catch (err: unknown) {
    console.error('[/api/petugas/stats GET]', err);
    return NextResponse.json({ error: 'Gagal memuat statistik petugas.' }, { status: 500 });
  }
}
