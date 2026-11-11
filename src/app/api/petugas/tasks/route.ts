import { NextRequest, NextResponse } from 'next/server';
import { getPetugasTasks } from '@/services/db/petugas';
import type { ReportStatus, SeverityLevel } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as ReportStatus) || undefined;
    const kecamatan = searchParams.get('kecamatan') || undefined;
    const severity = (searchParams.get('severity') as SeverityLevel) || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const tasks = await getPetugasTasks({
      status,
      kecamatan,
      severity,
      search,
      limit,
      offset,
    });

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    console.error('[/api/petugas/tasks GET]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil antrean tugas inspeksi lapangan.' },
      { status: 500 },
    );
  }
}
