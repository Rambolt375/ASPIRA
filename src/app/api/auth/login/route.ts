import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/services/db/auth';
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 },
      );
    }

    const user = await authenticateUser({ email, password });

    const response = NextResponse.json({ user, message: 'Login berhasil.' });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user.id, user.role), SESSION_COOKIE_OPTIONS);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

