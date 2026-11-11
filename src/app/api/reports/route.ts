import { NextRequest, NextResponse } from 'next/server';
import { getReports, createReport } from '@/services/db/reports';
import type { ReportCategory, ReportStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as ReportStatus | undefined;
    const category = searchParams.get('category') as ReportCategory | undefined;
    const kecamatan = searchParams.get('kecamatan') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const data = await getReports({
      status,
      category,
      kecamatan,
      limit,
      offset,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[/api/reports GET]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      severity,
      lat,
      lng,
      address,
      kelurahan,
      kecamatan,
      isAnonymous,
      authorId,
      mediaFiles,
      verificationResult,
    } = body;

    if (!title || !description || !category || lat === undefined || lng === undefined || !address || !authorId) {
      return NextResponse.json(
        { error: 'Parameter laporan belum lengkap.' },
        { status: 400 },
      );
    }

    const report = await createReport({
      title,
      description,
      category,
      severity,
      lat,
      lng,
      address,
      kelurahan,
      kecamatan,
      isAnonymous,
      authorId,
      mediaFiles: mediaFiles || [],
      verificationResult,
    });

    return NextResponse.json({ report, message: 'Laporan berhasil dibuat.' }, { status: 201 });
  } catch (err: unknown) {
    console.error('[/api/reports POST]', err);
    const message = err instanceof Error ? err.message : 'Gagal membuat laporan.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

