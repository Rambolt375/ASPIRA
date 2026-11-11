import { NextRequest, NextResponse } from 'next/server';
import { getCommunityFeed, createCommunityPost } from '@/services/db/community';
import type { PostType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as PostType | undefined;
    const userId = searchParams.get('userId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const posts = await getCommunityFeed({
      type,
      userId,
      limit,
      offset,
    });

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error('[/api/community/posts GET]', err);
    return NextResponse.json(
      { error: 'Gagal mengambil postingan komunitas.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, type, category, authorId, linkedReportId } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: 'Judul, isi, dan author wajib diisi.' },
        { status: 400 },
      );
    }

    const post = await createCommunityPost({
      title,
      content,
      type: type || 'DISCUSSION',
      category,
      authorId,
      linkedReportId,
    });

    return NextResponse.json(
      { post, message: 'Postingan berhasil dipublikasikan (+5 Poin).' },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('[/api/community/posts POST]', err);
    const message = err instanceof Error ? err.message : 'Gagal membuat postingan.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

