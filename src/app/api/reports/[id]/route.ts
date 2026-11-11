import { NextRequest, NextResponse } from 'next/server';
import { getReportDetails, updateReportStatus } from '@/services/db/reports';
import type { ReportStatus } from '@prisma/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const report = await getReportDetails(id);

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    // Map statusHistory so both standard types and Prisma properties are fully populated
    const mappedStatusHistory = (report.statusHistory || []).map((sh) => ({
      ...sh,
      status: sh.newStatus,
      timestamp: sh.createdAt.toISOString(),
      actorName: sh.actor?.name,
      photoUrl: sh.evidencePhotoUrl,
    }));

    return NextResponse.json({
      report: {
        ...report,
        authorName: report.author?.name || 'Warga',
        authorEmail: report.author?.email || null,
        statusHistory: mappedStatusHistory,
      },
    });
  } catch (err: unknown) {
    console.error('[/api/reports/[id] GET]', err);
    return NextResponse.json({ error: 'Gagal memuat rincian laporan.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { newStatus, actorId, note, evidencePhotoUrl, assignedAgency, slaDeadline } = body;

    if (!newStatus || !actorId) {
      return NextResponse.json(
        { error: 'Status baru dan ID petugas/pelaku wajib disertakan.' },
        { status: 400 },
      );
    }

    const updated = await updateReportStatus({
      reportId: id,
      newStatus: newStatus as ReportStatus,
      actorId,
      note,
      evidencePhotoUrl,
      assignedAgency,
      slaDeadline: slaDeadline ? new Date(slaDeadline) : undefined,
    });

    return NextResponse.json({ report: updated, message: 'Status berhasil diperbarui.' });
  } catch (err: unknown) {
    console.error('[/api/reports/[id] PATCH]', err);
    const message = err instanceof Error ? err.message : 'Gagal memperbarui status laporan.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

