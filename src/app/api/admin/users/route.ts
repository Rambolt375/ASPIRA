import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers, updateUserRole } from '@/services/db/admin';
import type { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = (searchParams.get('role') as Role | 'SEMUA') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const data = await getAdminUsers({ role, search, limit, offset });
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[/api/admin/users GET]', err);
    return NextResponse.json({ error: 'Gagal memuat daftar pengguna.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUserId, newRole, adminId, note } = body;

    if (!targetUserId || !newRole || !adminId) {
      return NextResponse.json(
        { error: 'targetUserId, newRole, dan adminId wajib disertakan.' },
        { status: 400 },
      );
    }

    const updated = await updateUserRole({
      targetUserId,
      newRole,
      adminId,
      note,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `Hak akses berhasil diperbarui menjadi ${newRole}.`,
    });
  } catch (err: unknown) {
    console.error('[/api/admin/users PATCH]', err);
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui peran pengguna.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
