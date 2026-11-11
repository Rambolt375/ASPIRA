import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuditLogs } from '@/services/db/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '40', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const data = await getAdminAuditLogs(limit, offset);
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[/api/admin/audit-logs GET]', err);
    return NextResponse.json({ error: 'Gagal memuat log audit platform.' }, { status: 500 });
  }
}
