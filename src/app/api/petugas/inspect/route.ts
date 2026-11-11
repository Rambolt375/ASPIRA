import { NextRequest, NextResponse } from 'next/server';
import { recordInspectionFinding } from '@/services/db/petugas';
import type { SeverityLevel } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      reportId,
      actorId,
      actorName,
      action,
      fieldNote,
      fieldPhotoUrl,
      physicalDamageEst,
      trafficImpact,
      confirmedCategory,
      confirmedSeverity,
    } = body;

    if (!reportId || !actorId || !action || !fieldNote) {
      return NextResponse.json(
        { error: 'reportId, actorId, action, dan fieldNote wajib diisi.' },
        { status: 400 },
      );
    }

    const updated = await recordInspectionFinding({
      reportId,
      actorId,
      actorName: actorName || 'Petugas Lapangan',
      action,
      fieldNote,
      fieldPhotoUrl,
      physicalDamageEst,
      trafficImpact,
      confirmedCategory,
      confirmedSeverity: confirmedSeverity as SeverityLevel,
    });

    return NextResponse.json({
      success: true,
      report: updated,
      message: 'Temuan inspeksi lapangan berhasil dicatat dalam audit resmi.',
    });
  } catch (err: unknown) {
    console.error('[/api/petugas/inspect POST]', err);
    const msg = err instanceof Error ? err.message : 'Gagal mencatat temuan inspeksi.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
