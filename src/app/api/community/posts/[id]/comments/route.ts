import { NextRequest, NextResponse } from 'next/server';
import { addCommunityComment, getPostComments } from '@/services/db/community';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const comments = await getPostComments(id);
    return NextResponse.json({ comments });
  } catch (err: unknown) {
    console.error('[/api/community/posts/[id]/comments GET]', err);
    return NextResponse.json(
      { error: 'Gagal memuat tanggapan/komentar.' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { authorId, content, parentId } = body;

    if (!authorId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Author ID dan isi komentar wajib diisi.' },
        { status: 400 },
      );
    }

    const comment = await addCommunityComment({
      postId: id,
      authorId,
      content: content.trim(),
      parentId,
    });

    return NextResponse.json({ comment, message: 'Komentar berhasil dikirim.' }, { status: 201 });
  } catch (err: unknown) {
    console.error('[/api/community/posts/[id]/comments POST]', err);
    return NextResponse.json({ error: 'Gagal menambahkan komentar.' }, { status: 500 });
  }
}
