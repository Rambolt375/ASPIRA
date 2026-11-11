'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import type { CommunityPostItem, CommunityCommentItem } from '@/types';

interface Props {
  params: Promise<{ postId: string }>;
}

export default function PostDetailPage({ params }: Props) {
  const { postId } = use(params);
  const { user } = useAuthStore();
  const [post, setPost] = useState<CommunityPostItem | null>(null);
  const [comments, setComments] = useState<CommunityCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/community/posts`);
        if (res.ok) {
          const data = await res.json();
          const found = (data.posts || []).find((p: CommunityPostItem) => p.id === postId);
          setPost(found || null);
        }
      } catch (err) {
        console.error('Failed to load post details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          content: commentText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [
          ...prev,
          {
            id: data.comment.id,
            postId,
            authorId: user.id,
            authorName: user.name,
            authorAvatar: user.avatarUrl,
            content: commentText.trim(),
            createdAt: new Date().toISOString(),
          },
        ]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Postingan Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500">Postingan mungkin telah dihapus atau URL tidak valid.</p>
        <Link href="/komunitas" className="inline-block text-xs font-bold text-emerald-600">
          ← Kembali ke Forum Komunitas
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      <Link href="/komunitas" className="text-xs font-semibold text-slate-500 hover:text-emerald-600">
        ← Kembali ke Forum Komunitas
      </Link>

      {/* Main Post Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
            {post.authorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
              {post.authorBadge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {post.authorBadge}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">{post.title}</h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>▲ {post.upvotes} Upvotes</span>
          <span>{comments.length + post.commentCount} Tanggapan Warga</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-slate-900">Diskusi & Tanggapan</h2>

        {/* Existing / Mock comments */}
        <div className="space-y-4">
          {comments.length === 0 && post.commentCount === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              Belum ada komentar. Berikan tanggapan pertama Anda!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{c.authorName}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Add comment input */}
        {user ? (
          <form onSubmit={handleSendComment} className="pt-2 flex gap-2">
            <input
              type="text"
              required
              placeholder="Tulis tanggapan Anda..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-3 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            <Button type="submit" disabled={submitting || !commentText.trim()}>
              {submitting ? '...' : 'Kirim'}
            </Button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
            <Link href="/login" className="text-emerald-600 font-bold hover:underline">
              Masuk akun
            </Link>{' '}
            untuk ikut berkomentar.
          </div>
        )}
      </div>
    </main>
  );
}

