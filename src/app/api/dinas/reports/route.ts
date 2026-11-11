import { NextRequest, NextResponse } from 'next/server';
import { getDinasReports } from '@/services/db/dinas';
import { updateReportStatus } from '@/services/db/reports';
import type { ReportStatus, ReportCategory, SeverityLevel } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const agency = searchParams.get('agency') || undefined;
    const status = (searchParams.get('status') as ReportStatus) || undefined;
    const severity = (searchParams.get('severity') as SeverityLevel) || undefined;
    const category = (searchParams.get('category') as ReportCategory) || undefined;
    const kecamatan = searchParams.get('kecamatan') || undefined;
    const search = searchParams.get('search') || undefined;
    const urgentOnly = searchParams.get('urgent') === 'true';
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const data = await getDinasReports({
      agency,
      status,
      severity,
      category,
      kecamatan,
      search,
      urgentOnly,
      limit,
      offset,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[/api/dinas/reports GET]', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar laporan operasional dinas.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, newStatus, actorId, note, evidencePhotoUrl, assignedAgency, slaDeadline } = body;

    if (!reportId || !newStatus || !actorId) {
      return NextResponse.json(
        { error: 'reportId, newStatus, dan actorId wajib disertakan.' },
        { status: 400 },
      );
    }

    const updated = await updateReportStatus({
      reportId,
      newStatus: newStatus as ReportStatus,
      actorId,
      note: note || `Pembaruan status resmi oleh dinas menjadi ${newStatus}`,
      evidencePhotoUrl,
      assignedAgency,
      slaDeadline: slaDeadline ? new Date(slaDeadline) : undefined,
    });

    return NextResponse.json({
      success: true,
      report: updated,
      message: `Status laporan berhasil diperbarui menjadi ${newStatus}.`,
    });
  } catch (err: unknown) {
    console.error('[/api/dinas/reports PATCH]', err);
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui status laporan dinas.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

