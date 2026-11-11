'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import type { CommunityPostItem, PostType } from '@/types';

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
        // Optimistic refresh
        refreshFeed();
      }
    } catch (err) {
      console.error('Voting error:', err);
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
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
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
            { key: 'UMKM', label: '🏪 UMKM' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-900'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          Belum ada postingan dalam kategori ini. Jadilah yang pertama memulai diskusi!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{post.authorName}</span>
                      {post.authorBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {post.authorBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{post.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Actions & Voting */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleVote(post.id, 1)}
                    className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                      post.userVote === 1
                        ? 'bg-emerald-600 text-white'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ▲ <span>{post.upvotes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote(post.id, -1)}
                    className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors ${
                      post.userVote === -1
                        ? 'bg-red-600 text-white'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ▼ <span>{post.downvotes}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>💬 {post.commentCount} Tanggapan</span>
                </div>
              </div>
            </div>
          ))}
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
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Jenis Konten</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PostType)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="DISCUSSION">Diskusi / Tanya Warga</option>
                  <option value="NEWS">Informasi Resmi / Pengumuman</option>
                  <option value="UMKM">Promosi UMKM / Kuliner Lokal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Kategori / Topik (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kuliner / Kebersihan / Transportasi"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-500 font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Judul Topik</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Info Pengalihan Arus Sekitar Kebun Raya"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-500 font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Isi Pesan / Penjelasan</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan informasi atau pertanyaan Anda dengan sopan dan jelas..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-500 font-medium outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={posting}>
                  {posting ? 'Memposting...' : 'Terbitkan Postingan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
