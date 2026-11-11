'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import type { CommunityPostItem, CommunityCommentItem, PostType } from '@/types';

export default function KomunitasPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // New post modal states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('DISCUSSION');
  const [category, setCategory] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline comments states
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommunityCommentItem[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const baseUrl = activeTab === 'ALL' ? '/api/community/posts' : `/api/community/posts?type=${activeTab}`;
        const sep = baseUrl.includes('?') ? '&' : '?';
        const url = user ? `${baseUrl}${sep}userId=${user.id}` : baseUrl;
        const res = await fetch(url);
        if (res.ok && !ignore) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to load community feed:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [activeTab, user]);

  async function refreshFeed() {
    try {
      const baseUrl = activeTab === 'ALL' ? '/api/community/posts' : `/api/community/posts?type=${activeTab}`;
      const sep = baseUrl.includes('?') ? '&' : '?';
      const url = user ? `${baseUrl}${sep}userId=${user.id}` : baseUrl;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleVote(postId: string, value: number) {
    if (!user) {
      alert('Silakan masuk terlebih dahulu untuk memberikan suara.');
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, value }),
      });

      if (res.ok) {
        refreshFeed();
      }
    } catch (err) {
      console.error('Voting error:', err);
    }
  }

  async function toggleComments(postId: string) {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);

    // Fetch comments if not yet loaded
    if (!commentsMap[postId]) {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  }

  async function handleAddComment(postId: string, e: React.FormEvent) {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!user || !text) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          content: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newComment: CommunityCommentItem = {
          id: data.comment.id,
          postId,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatarUrl,
          content: text,
          createdAt: new Date().toISOString(),
        };

        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment],
        }));

        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));

        // Increment comment count in posts list
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
        );
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPosting(true);
    setError(null);

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type,
          category: category || 'Umum',
          authorId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mempublikasikan postingan.');

      setShowModal(false);
      setTitle('');
      setContent('');
      refreshFeed();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Forum & Komunitas Warga Bogor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
            Ruang diskusi kolaboratif warga, berita pengumuman resmi, dan direktori promosi UMKM lokal.
          </p>
        </div>

        {user ? (
          <Button type="button" onClick={() => setShowModal(true)}>
            + Tulis Postingan Baru
          </Button>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            Masuk untuk Berdiskusi
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 pr-6">
          {[
            { key: 'ALL', label: 'Semua' },
            { key: 'DISCUSSION', label: '💬 Diskusi' },
            { key: 'NEWS', label: '📢 Pengumuman' },
            { key: 'UMKM', label: '🛍️ UMKM' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <span className="text-4xl">💭</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Belum Ada Postingan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Jadilah yang pertama memulai percakapan atau membagikan info warga di Kota Bogor!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const comments = commentsMap[post.id] || [];
            const isLoadingComments = loadingComments[post.id];

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition-colors"
              >
                {/* Author Info & Post Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs shadow-xs">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
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

                {/* Title & Content */}
                <div>
                  <Link href={`/komunitas/${post.id}`}>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-1.5 cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Actions: Voting & Tanggapan Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 rounded-full p-1 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 1)}
                      className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                        post.userVote === 1
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Dukung / Setuju"
                    >
                      ▲ <span>{post.upvotes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, -1)}
                      className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                        post.userVote === -1
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Tidak Setuju"
                    >
                      ▼ <span>{post.downvotes}</span>
                    </button>
                  </div>

                  {/* Tombol Tanggapan Interaktif */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isExpanded
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>💬</span>
                      <span>{post.commentCount} Tanggapan</span>
                      <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                    </button>
                  </div>
                </div>

                {/* INLINE EXPANDED TANGGAPAN / KOMENTAR */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Diskusi Tanggapan Warga ({comments.length})
                      </h4>
                      <Link
                        href={`/komunitas/${post.id}`}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Buka Halaman Diskusi Penuh ↗
                      </Link>
                    </div>

                    {isLoadingComments ? (
                      <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                        Memuat tanggapan warga...
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
                        Belum ada tanggapan untuk postingan ini. Jadilah yang pertama memberikan respon!
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {c.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {new Date(c.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                              {c.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Input Tanggapan */}
                    {user ? (
                      <form
                        onSubmit={(e) => handleAddComment(post.id, e)}
                        className="flex gap-2 pt-1"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Tulis tanggapan Anda..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
                        >
                          {submittingComment[post.id] ? '...' : 'Kirim'}
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
                        <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                          Masuk akun
                        </Link>{' '}
                        untuk memberikan tanggapan.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Buat Postingan Komunitas</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Postingan
                </label>
                <div className="flex gap-2">
                  {[
                    { key: 'DISCUSSION', label: '💬 Diskusi' },
                    { key: 'NEWS', label: '📢 Info/Pengumuman' },
                    { key: 'UMKM', label: '🛍️ Promosi UMKM' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key as PostType)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        type === t.key
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Topik
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Transportasi, Kebersihan, Kuliner..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Postingan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Judul topik diskusi yang jelas..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Postingan
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan aspirasi, ide, atau informasi lengkap yang ingin dibagikan..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button type="submit" loading={posting} disabled={!title.trim() || !content.trim()}>
                  Terbitkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
