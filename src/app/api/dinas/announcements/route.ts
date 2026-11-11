import { NextRequest, NextResponse } from 'next/server';
import { createCityAnnouncement } from '@/services/db/dinas';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const announcements = await prisma.cityAnnouncement.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ announcements });
  } catch (err: unknown) {
    console.error('[/api/dinas/announcements GET]', err);
    return NextResponse.json(
      { error: 'Gagal memuat pengumuman resmi.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, sourceUrl, sourceName, isEmergency } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Judul dan isi pengumuman wajib diisi.' },
        { status: 400 },
      );
    }

    const announcement = await createCityAnnouncement({
      title,
      content,
      sourceUrl,
      sourceName: sourceName || 'Pemerintah Kota Bogor',
      isEmergency: isEmergency ?? false,
    });

    return NextResponse.json({
      success: true,
      announcement,
      message: 'Pengumuman resmi berhasil diterbitkan.',
    });
  } catch (err: unknown) {
    console.error('[/api/dinas/announcements POST]', err);
    return NextResponse.json(
      { error: 'Gagal menerbitkan pengumuman resmi.' },
      { status: 500 },
    );
  }
}
