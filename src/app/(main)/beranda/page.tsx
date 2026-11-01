'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { getReports } from '@/services/reports';
import { palette } from '@/constants/theme';
import type { Report, ReportStatus } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

const statusLabel: Record<ReportStatus, string> = {
  DITERIMA: 'Diterima',
  VERIFIKASI: 'Verifikasi',
  DICEK: 'Dicek Lapangan',
  DITUGASKAN: 'Ditugaskan',
  DALAM_PENANGANAN: 'Dalam Penanganan',
  DIATASI: 'Diatasi',
  PENINJAUAN: 'Peninjauan',
  PERAWATAN: 'Perawatan',
  DITOLAK: 'Ditolak',
  DIBUKA_KEMBALI: 'Dibuka Kembali',
};

const categoryIcon: Record<string, string> = {
  JALAN: '🛣️',
  JEMBATAN: '🌉',
  DRAINASE: '🌊',
  LAMPU_JALAN: '💡',
  TAMAN: '🌳',
  SAMPAH: '🗑️',
  BANJIR: '🌧️',
  LAINNYA: '📋',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${palette.status[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

function ReportCard({ report }: { report: Report }) {
  return (
    <Link
      href={`/laporan/${report.id}`}
      className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0 border border-slate-100">
        {categoryIcon[report.category] ?? '📋'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
          {report.title}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          📍 {report.address || 'Kota Bogor'}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <StatusBadge status={report.status} />
          <span className="text-xs text-slate-400">{timeAgo(report.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BerandaPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { reports: data } = await getReports();
        setReports(data);
      } catch {
        setError('Gagal memuat data laporan.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const total = reports.length;
  const resolved = reports.filter((r) => r.status === 'DIATASI' || r.status === 'PERAWATAN').length;
  const inProgress = reports.filter((r) =>
    ['VERIFIKASI', 'DICEK', 'DITUGASKAN', 'DALAM_PENANGANAN', 'PENINJAUAN'].includes(r.status),
  ).length;
  const pending = reports.filter((r) => r.status === 'DITERIMA').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const recentReports = reports.slice(0, 6);

  // ── Category breakdown ───────────────────────────────────────────────────
  const categoryCount = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const greet = (): string => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

      {/* ── Welcome ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 text-white">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="relative">
          <p className="text-emerald-200 text-sm font-medium mb-1">
            {greet()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Selamat datang di ASPIRA
          </h1>
          <p className="text-emerald-100 text-sm max-w-md leading-relaxed">
            Platform pelaporan infrastruktur publik Kota Bogor. Bersama kita wujudkan kota yang lebih baik.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link
              href="/lapor"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Buat Laporan
            </Link>
            <Link
              href="/komunitas"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Lihat Komunitas
            </Link>
          </div>
        </div>
      </section>

      {/* ── City Pulse stats ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">City Pulse</h2>
            <p className="text-xs text-slate-400">Kondisi kota saat ini</p>
          </div>
          <Link href="/pantau" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Lihat detail →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Laporan"
              value={total}
              sub="sepanjang waktu"
              color="bg-slate-100"
              icon={
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              }
            />
            <StatCard
              label="Diatasi"
              value={resolved}
              sub={`${resolutionRate}% resolusi`}
              color="bg-emerald-50"
              icon={
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Dalam Proses"
              value={inProgress}
              sub="sedang ditangani"
              color="bg-amber-50"
              icon={
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Menunggu"
              value={pending}
              sub="perlu verifikasi"
              color="bg-blue-50"
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              }
            />
          </div>
        )}
      </section>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/lapor', icon: '📝', label: 'Buat Laporan', color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400' },
            { href: '/komunitas', icon: '👥', label: 'Komunitas', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
            { href: '/peta', icon: '🗺️', label: 'Peta Laporan', color: 'bg-amber-50 border-amber-200 hover:border-amber-400' },
            { href: '/asisten', icon: '🤖', label: 'Tanya AI', color: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all hover:shadow-sm ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-semibold text-slate-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Recent reports ───────────────────────────────────────────────── */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Laporan Terbaru</h2>
            <Link href="/laporan" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Lihat semua →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm font-semibold text-slate-700 mb-1">Belum ada laporan</p>
              <p className="text-xs text-slate-400 mb-4">Jadilah yang pertama melaporkan masalah infrastruktur.</p>
              <Link
                href="/lapor"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Buat laporan pertama →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>

        {/* ── Sidebar panel ────────────────────────────────────────────────── */}
        <section className="space-y-5">

          {/* Category breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Kategori Teratas</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-3 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {topCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg">{categoryIcon[cat] ?? '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {cat.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.round((count / total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution ring */}
          {!loading && total > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Tingkat Resolusi</h3>
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-3">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeDasharray={`${resolutionRate} ${100 - resolutionRate}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">{resolutionRate}%</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {resolved} dari {total} laporan berhasil diatasi
              </p>
            </div>
          )}

          {/* CTA for guests */}
          {!user && (
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 text-center">
              <p className="text-2xl mb-2">👋</p>
              <p className="text-sm font-semibold text-slate-800 mb-1">Bergabunglah sekarang</p>
              <p className="text-xs text-slate-500 mb-4">
                Daftar gratis dan mulai berkontribusi untuk kota yang lebih baik.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Daftar Gratis
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* ── Community teaser ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Komunitas</h2>
            <p className="text-xs text-slate-400">Diskusi, berita, dan promosi lokal</p>
          </div>
          <Link href="/komunitas" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Lihat semua →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: '💬', label: 'Diskusi Warga', desc: 'Bahas isu infrastruktur lokal', href: '/komunitas?tipe=DISCUSSION' },
            { icon: '📰', label: 'Berita Kota', desc: 'Informasi dan pengumuman terkini', href: '/komunitas?tipe=NEWS' },
            { icon: '🏪', label: 'UMKM Lokal', desc: 'Dukung usaha mikro Kota Bogor', href: '/komunitas?tipe=UMKM' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
