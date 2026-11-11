import { NextResponse } from 'next/server';
import { ensureOfficialUsers, OFFICIAL_DEFAULT_ACCOUNTS } from '@/services/db/seed-users';

export async function GET() {
  try {
    await ensureOfficialUsers();
    return NextResponse.json({
      success: true,
      message: 'Akun dinas, petugas, admin, dan warga berhasil disinkronkan ke database.',
      accounts: OFFICIAL_DEFAULT_ACCOUNTS.map((a) => ({
        email: a.email,
        name: a.name,
        role: a.role,
      })),
    });
  } catch (err: unknown) {
    console.error('[/api/system/seed-users GET]', err);
    return NextResponse.json(
      { error: 'Gagal menyinkronkan akun bawaan.' },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET();
}

