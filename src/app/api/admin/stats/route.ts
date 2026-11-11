import { NextResponse } from 'next/server';
import { getAdminPlatformStats } from '@/services/db/admin';

export async function GET() {
  try {
    const stats = await getAdminPlatformStats();
    return NextResponse.json({ stats });
  } catch (err: unknown) {
    console.error('[/api/admin/stats GET]', err);
    return NextResponse.json({ error: 'Gagal memuat metrik platform.' }, { status: 500 });
  }
}
