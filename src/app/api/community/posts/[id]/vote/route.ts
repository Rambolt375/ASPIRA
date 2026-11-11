import { NextRequest, NextResponse } from 'next/server';
import { votePost } from '@/services/db/community';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { userId, value } = body;

    if (!userId || value === undefined) {
      return NextResponse.json(
        { error: 'User ID dan nilai voting wajib diisi.' },
        { status: 400 },
      );
    }

    const result = await votePost({
      postId: id,
      userId,
      value: Number(value),
    });

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error('[/api/community/posts/[id]/vote POST]', err);
    return NextResponse.json({ error: 'Gagal melakukan voting.' }, { status: 500 });
  }
}

