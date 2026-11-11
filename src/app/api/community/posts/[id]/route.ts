import { NextRequest, NextResponse } from 'next/server';
import { getCommunityPostById, getPostComments } from '@/services/db/community';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;

    const post = await getCommunityPostById(id, userId);
    if (!post) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan.' }, { status: 404 });
    }

    const comments = await getPostComments(id);
    return NextResponse.json({ post, comments });
  } catch (err: unknown) {
    console.error('[/api/community/posts/[id] GET]', err);
    return NextResponse.json({ error: 'Gagal memuat rincian postingan.' }, { status: 500 });
  }
}
