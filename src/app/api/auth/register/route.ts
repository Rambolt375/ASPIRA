import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/services/db/auth';
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone, kelurahan, kecamatan } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Nama, email, dan kata sandi wajib diisi.' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal 6 karakter.' },
        { status: 400 },
      );
    }

    const user = await registerUser({
      email,
      password,
      name,
      phone,
      kelurahan,
      kecamatan,
    });

    const response = NextResponse.json({ user, message: 'Registrasi berhasil.' });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user.id, user.role), SESSION_COOKIE_OPTIONS);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

