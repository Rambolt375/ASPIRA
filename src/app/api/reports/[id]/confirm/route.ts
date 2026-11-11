import { NextRequest, NextResponse } from 'next/server';
import { confirmReport } from '@/services/db/reports';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { userId, note, photoUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib disertakan.' }, { status: 400 });
    }

    const confirmation = await confirmReport({
      reportId: id,
      userId,
      note,
      photoUrl,
    });

    return NextResponse.json({
      confirmation,
      message: 'Konfirmasi lapangan berhasil dicatat (+10 Poin Kontribusi).',
    });
  } catch (err: unknown) {
    console.error('[/api/reports/[id]/confirm POST]', err);
    const message = err instanceof Error ? err.message : 'Gagal mencatat konfirmasi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

