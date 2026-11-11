import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/services/db/auth';

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

    return NextResponse.json({ user, message: 'Login berhasil.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

