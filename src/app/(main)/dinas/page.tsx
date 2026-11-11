'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import DinasStatsCards from '@/components/dinas/DinasStatsCards';
import DinasStatusModal from '@/components/dinas/DinasStatusModal';
import DinasAssignModal from '@/components/dinas/DinasAssignModal';
import DinasAnnouncementModal from '@/components/dinas/DinasAnnouncementModal';
import RoleQuickSwitch from '@/components/dinas/RoleQuickSwitch';
import type { ReportStatus, SeverityLevel } from '@prisma/client';

interface ReportItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  severity: SeverityLevel;
  status: ReportStatus;
  address: string;
  kecamatan?: string | null;
  assignedAgency?: string | null;
  slaDeadline?: string | null;
  createdAt: string;
  author: {
    name: string;
    phone?: string | null;
  };
  verification?: {
    authenticityScore: number;
    isLegitimate: boolean;
    suggestedSeverity?: string | null;
  } | null;
  media: { fileUrl: string }[];
  statusHistory: {
    newStatus: string;
    note?: string | null;
    evidencePhotoUrl?: string | null;
    actor: { name: string };
    createdAt: string;
  }[];
}

const DINAS_LIST = [
  'SEMUA',
  'Dinas PUPR (Pekerjaan Umum & Penataan Ruang)',
  'Dinas Perhubungan (Dishub)',
  'Dinas Lingkungan Hidup (DLH)',
  'BPBD Kota Bogor (Kebencanaan)',
  'Disperumkim (Perumahan & Pemukiman)',
  'UNASSIGNED',
];

export default function DinasDashboardPage() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    totalReports: 0,
    pendingVerification: 0,
    activeHandling: 0,
    resolvedCount: 0,
    criticalCount: 0,
    slaBreachedCount: 0,
    announcementsCount: 0,
  });

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedAgency, setSelectedAgency] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [selectedSeverity] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Modals state
  const [activeReportForStatus, setActiveReportForStatus] = useState<ReportItem | null>(null);
  const [activeReportForAssign, setActiveReportForAssign] = useState<ReportItem | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const isAuthorized = user?.role === 'LOCAL_GOVERNMENT';

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      const q = selectedAgency !== 'SEMUA' ? `?agency=${encodeURIComponent(selectedAgency)}` : '';
      const res = await fetch(`/api/dinas/stats${q}`);
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error('Error fetching stats', e);
    }
  }, [selectedAgency, isAuthorized]);

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      const params = new URLSearchParams();
      if (selectedAgency !== 'SEMUA') params.set('agency', selectedAgency);
      if (selectedStatus !== 'SEMUA') params.set('status', selectedStatus);
      if (selectedSeverity !== 'SEMUA') params.set('severity', selectedSeverity);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (urgentOnly) params.set('urgent', 'true');

      const res = await fetch(`/api/dinas/reports?${params.toString()}`);
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (e) {
      console.error('Error fetching dinas reports', e);
    }
  }, [selectedAgency, selectedStatus, selectedSeverity, searchQuery, urgentOnly, isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      try {
        await Promise.all([fetchStats(), fetchReports()]);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [fetchStats, fetchReports, isAuthorized]);

  const isLeader = user?.role === 'ADMIN' || user?.role === 'LOCAL_GOVERNMENT';

  // 1. Guard: Jika bukan aparat dinas/admin, tampilkan halaman pembatas akses yang jelas
  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RoleQuickSwitch />

        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-sm">
            🏛️
          </div>
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Akses Khusus Aparatur Pemerintah
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            Portal Operasional Dinas & OPD Terbatas
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Halaman ini khusus untuk peran <strong className="text-slate-800 dark:text-slate-200">LOCAL_GOVERNMENT</strong> (Dinas & OPD Pelaksana Kota Bogor) serta Administrator. Gunakan panel evaluasi di atas untuk menguji peran.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-left max-w-md mx-auto space-y-2">
            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>ℹ️</span> Status Akses Akun:
            </p>
            <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span>Nama Pengguna</span>
              <strong className="text-slate-800 dark:text-slate-200">{user?.name || 'Tamu / Belum Masuk'}</strong>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Peran Akses</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {user?.role || 'USER (Warga Biasa)'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/beranda"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Kembali ke Beranda Warga
            </Link>
            <Link
              href="/laporan"
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
            >
              Lihat Laporan Publik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* 2. Hierarki Dinas & Identitas Aparatur Aktif */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            {isLeader ? '🏛️' : '🛠️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {user?.name}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isLeader
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}>
                {isLeader ? 'Tingkat 1: Pimpinan / Koordinator Wilayah Kota' : 'Tingkat 2: Pelaksana Teknis Lapangan (Dinas)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isLeader
                ? 'Wewenang Eksekutif: Disposisi Antar-Dinas (PUPR, Dishub, DLH, BPBD), Penetapan Target SLA, dan Siaran Darurat Kota.'
                : 'Wewenang Teknis: Pelaksanaan Pekerjaan Fisik, Update Status Pengerjaan (Dalam Penanganan), dan Bukti Foto Penyelesaian.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Sesi Terhubung
          </span>
        </div>
      </div>

      {/* 3. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              Pemerintah Kota Bogor
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Disposisi & Pengawasan Terpadu
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Portal Operasional Dinas & Wilayah
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Pusat kendali disposisi penugasan teknis dinas, pengawasan batas waktu (SLA), dan audit eskalasi perbaikan infrastruktur Kota Bogor.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isLeader && (
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              📢 Siarkan Pengumuman Kota
            </button>
          )}
          <button
            onClick={() => {
              fetchStats();
              fetchReports();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
            title="Muat Ulang Data"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Executive KPI Stats Cards */}
      <DinasStatsCards
        stats={stats}
        onFilterUrgent={() => {
          setUrgentOnly(true);
          setSelectedStatus('SEMUA');
        }}
        onFilterPending={() => {
          setSelectedStatus('DITERIMA');
          setUrgentOnly(false);
        }}
        onFilterHandling={() => {
          setSelectedStatus('DALAM_PENANGANAN');
          setUrgentOnly(false);
        }}
      />

      {/* 4. Filter Toolbar (Clean Light/Dark Cohesive) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* OPD Selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
              Instansi/OPD:
            </span>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              {DINAS_LIST.map((d) => (
                <option key={d} value={d}>
                  {d === 'UNASSIGNED' ? '⚠️ Belum Didisposisikan' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari No. Tiket, Judul, atau Alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition-colors placeholder:text-slate-400"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          {/* Quick toggle urgent */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              🚨 Hanya Prioritas Kritis/Tinggi
            </span>
          </label>
        </div>

        {/* Status Horizontal Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
            Filter Status:
          </span>
          {['SEMUA', 'DITERIMA', 'VERIFIKASI', 'DICEK', 'DITUGASKAN', 'DALAM_PENANGANAN', 'DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Main Reports Table (Clean White/Dark Cards) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Menghubungkan ke pusat data operasional...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-24 text-center px-4">
            <span className="text-5xl">📋</span>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Tidak ada laporan dalam filter ini
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Silakan atur ulang filter instansi atau status di atas untuk melihat laporan lainnya.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th className="py-4 px-4 sm:px-5">Tiket & Kerusakan</th>
                  <th className="py-4 px-4">Keparahan</th>
                  <th className="py-4 px-4">Status Siklus</th>
                  <th className="py-4 px-4">Instansi Wewenang</th>
                  <th className="py-4 px-4">Validasi AI</th>
                  <th className="py-4 px-4">Tenggat SLA</th>
                  <th className="py-4 px-4 text-right">Tindakan Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {reports.map((r) => {
                  const isSlaBreached =
                    r.slaDeadline &&
                    new Date(r.slaDeadline) < new Date() &&
                    !['DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'].includes(r.status);

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Tiket & Judul */}
                      <td className="py-4 px-4 sm:px-5 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                            {r.ticketNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {r.category}
                          </span>
                        </div>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white line-clamp-1 text-sm">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          📍 {r.address}
                        </p>
                      </td>

                      {/* 2. Keparahan */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            r.severity === 'KRITIS'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : r.severity === 'TINGGI'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-900'
                              : r.severity === 'SEDANG'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.severity === 'KRITIS' ? 'bg-rose-600 animate-ping' : 'bg-current'
                            }`}
                          />
                          {r.severity}
                        </span>
                      </td>

                      {/* 3. Status Siklus & Bukti Fisik Lapangan */}
                      <td className="py-4 px-4 max-w-[180px]">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {r.status}
                        </span>

                        {/* Dokumentasi Foto Lapangan jika ada */}
                        {r.statusHistory && r.statusHistory[0]?.evidencePhotoUrl && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <a
                              href={r.statusHistory[0].evidencePhotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                              title="Lihat foto bukti fisik lapangan"
                            >
                              <span>📸</span>
                              <span>Bukti Fisik</span>
                            </a>
                          </div>
                        )}

                        {r.statusHistory && r.statusHistory[0] && (
                          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                            oleh {r.statusHistory[0].actor.name}
                          </p>
                        )}
                      </td>

                      {/* 4. Instansi Wewenang */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {r.assignedAgency ? (
                          <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                            🏢 {r.assignedAgency}
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            ⚠️ Belum Didisposisi
                          </span>
                        )}
                      </td>

                      {/* 5. Validasi AI */}
                      <td className="py-4 px-4">
                        {r.verification ? (
                          <div>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                              {Math.round(r.verification.authenticityScore * 100)}%
                            </span>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              {r.verification.isLegitimate ? 'Keaslian Tinggi' : 'Perlu Tinjauan'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* 6. Tenggat SLA */}
                      <td className="py-4 px-4">
                        {r.slaDeadline ? (
                          <div
                            className={`text-xs font-bold ${
                              isSlaBreached
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSlaBreached ? '⚠️ Terlewat' : '⏳ Target'}
                            <p className="text-[10px] font-normal text-slate-500">
                              {new Date(r.slaDeadline).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum diatur</span>
                        )}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-4 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLeader && (
                            <button
                              onClick={() => setActiveReportForAssign(r)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200/80 dark:border-blue-800 transition-colors"
                            >
                              Disposisi
                            </button>
                          )}
                          <button
                            onClick={() => setActiveReportForStatus(r)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/80 dark:border-emerald-800 transition-colors"
                          >
                            {isLeader ? 'Ubah Status' : 'Lapor Progres Fisik'}
                          </button>
                          <Link
                            href={`/laporan/${r.id}`}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            title="Buka rincian lengkap"
                          >
                            ↗️
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeReportForStatus && (
        <DinasStatusModal
          report={activeReportForStatus}
          actorId={user?.id || 'officer-pupr-default'}
          onClose={() => setActiveReportForStatus(null)}
          onSuccess={() => {
            fetchStats();
            fetchReports();
          }}
        />
      )}

      {activeReportForAssign && (
        <DinasAssignModal
          report={activeReportForAssign}
          actorId={user?.id || 'officer-pupr-default'}
          onClose={() => setActiveReportForAssign(null)}
          onSuccess={() => {
            fetchStats();
            fetchReports();
          }}
        />
      )}

      <DinasAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSuccess={() => {
          fetchStats();
        }}
      />
    </div>
  );
}
