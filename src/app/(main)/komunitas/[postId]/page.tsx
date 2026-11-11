'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
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
  const [voteScore, setVoteScore] = useState(0);
  const [userVote, setUserVote] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const q = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
        const res = await fetch(`/api/community/posts/${postId}${q}`);
        if (res.ok) {
          const data = await res.json();
          if (data.post) {
            setPost(data.post);
            setVoteScore(data.post.upvotes - data.post.downvotes);
            setUserVote(data.post.userVote || 0);
          }
          if (data.comments) {
            setComments(data.comments);
          }
        }
      } catch (err) {
        console.error('Failed to load post details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId, user?.id]);

  async function handleVote(value: number) {
    if (!user) {
      alert('Silakan masuk akun terlebih dahulu untuk memberikan suara.');
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, value }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.action === 'removed') {
          setVoteScore((prev) => prev - (userVote === 1 ? 1 : -1));
          setUserVote(0);
        } else if (data.action === 'updated') {
          setVoteScore((prev) => prev + (value === 1 ? 2 : -2));
          setUserVote(value);
        } else if (data.action === 'created') {
          setVoteScore((prev) => prev + value);
          setUserVote(value);
        }
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  }

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
        if (post) {
          setPost({ ...post, commentCount: post.commentCount + 1 });
        }
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
        <div className="h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
          🔍
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Postingan Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Postingan mungkin telah dihapus atau URL tidak valid.</p>
        <Link href="/komunitas" className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Kembali ke Forum Komunitas
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      <Link
        href="/komunitas"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <span>←</span>
        <span>Kembali ke Forum Komunitas</span>
      </Link>

      {/* Main Post Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm shadow-xs">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {post.authorName}
                </span>
                {post.authorBadge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {post.authorBadge}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {new Date(post.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              post.type === 'NEWS'
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                : post.type === 'UMKM'
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {post.type}
          </span>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {post.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Voting & Tanggapan Summary */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-full p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleVote(1)}
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                userVote === 1
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              ▲ <span>{post.upvotes + (userVote === 1 && post.userVote !== 1 ? 1 : 0)}</span>
            </button>
            <button
              type="button"
              onClick={() => handleVote(-1)}
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                userVote === -1
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              ▼ <span>{post.downvotes + (userVote === -1 && post.userVote !== -1 ? 1 : 0)}</span>
            </button>
          </div>

          <span className="font-bold text-slate-700 dark:text-slate-300">
            💬 {comments.length} Tanggapan Warga
          </span>
        </div>
      </div>

      {/* Comments & Discussion Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Diskusi & Tanggapan ({comments.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Komentar publik warga
          </span>
        </div>

        {/* Existing comments list */}
        <div className="space-y-3.5">
          {comments.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-3xl">💬</span>
              <p className="mt-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada tanggapan
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Jadilah warga pertama yang memberikan tanggapan atau solusi untuk topik ini!
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {c.authorName}
                    </span>
                    {c.authorBadge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {c.authorBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(c.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-9">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add comment input */}
        {user ? (
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>✍️ Berikan Tanggapan sebagai</span>
              <span className="text-emerald-600 dark:text-emerald-400">{user.name}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Tulis tanggapan atau masukan konstruktif Anda..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Kirim</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-400">
            <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Masuk ke akun Anda
            </Link>{' '}
            untuk ikut berpartisipasi dalam diskusi dan tanggapan warga.
          </div>
        )}
      </div>
    </main>
  );
}
