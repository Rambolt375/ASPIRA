import { NextResponse } from 'next/server';
import { getAvailableOfficers } from '@/services/db/dinas';

export async function GET() {
  try {
    const officers = await getAvailableOfficers();
    return NextResponse.json({ officers });
  } catch (err: unknown) {
    console.error('[/api/dinas/officers GET]', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar personel petugas.' },
      { status: 500 },
    );
  }
}
