import { NextRequest, NextResponse } from 'next/server';
import { getDinasDashboardStats } from '@/services/db/dinas';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agency = searchParams.get('agency') || undefined;

    const stats = await getDinasDashboardStats(agency);
    return NextResponse.json({ stats });
  } catch (err: unknown) {
    console.error('[/api/dinas/stats GET]', err);
    return NextResponse.json(
      { error: 'Gagal memuat statistik portal dinas.' },
      { status: 500 },
    );
  }
}
