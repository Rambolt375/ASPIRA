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

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RoleQuickSwitch />

        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl shadow-sm">
            🛡️
          </div>
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Akses Terbatas
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            Portal Khusus Dinas & OPD Pemkot
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Halaman ini khusus untuk peran <strong className="text-slate-800 dark:text-slate-200">LOCAL_GOVERNMENT</strong> (Dinas & OPD Pelaksana Kota Bogor). Gunakan panel simulasi di atas untuk menguji.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/beranda"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Kembali ke Beranda
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Simulator Switcher for judges */}
      <RoleQuickSwitch />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Pemerintah Kota Bogor
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Sistem Disposisi Terpadu
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Portal Operasional Dinas & Wilayah
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kendali disposisi penugasan teknis, pengawasan SLA, dan audit eskalasi perbaikan fisik lapangan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            📢 Siarkan Pengumuman Kota
          </button>
          <button
            onClick={() => {
              fetchStats();
              fetchReports();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Muat Ulang Data"
          >
            🔄
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
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

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* OPD Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Instansi/OPD:
            </span>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DINAS_LIST.map((d) => (
                <option key={d} value={d}>
                  {d === 'UNASSIGNED' ? '⚠️ Belum Ditugaskan ke Dinas' : d}
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
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          {/* Quick toggle urgent */}
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              🚨 Hanya Prioritas Kritis/Tinggi
            </span>
          </label>
        </div>

        {/* Secondary Filters (Status & Severity) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-1">Status:</span>
          {['SEMUA', 'DITERIMA', 'VERIFIKASI', 'DICEK', 'DITUGASKAN', 'DALAM_PENANGANAN', 'DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reports Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-500">Memuat laporan dinas...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-4xl">📋</span>
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Tidak ada laporan dalam filter ini
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Ubah kriteria instansi atau status di atas untuk melihat data lain.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Laporan / Tiket</th>
                  <th className="py-3.5 px-4">Tingkat Keparahan</th>
                  <th className="py-3.5 px-4">Status & Alur</th>
                  <th className="py-3.5 px-4">Instansi & PIC</th>
                  <th className="py-3.5 px-4">Skor Keaslian AI</th>
                  <th className="py-3.5 px-4">Tenggat Waktu SLA</th>
                  <th className="py-3.5 px-4 text-right">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {reports.map((r) => {
                  const isSlaBreached =
                    r.slaDeadline &&
                    new Date(r.slaDeadline) < new Date() &&
                    !['DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'].includes(r.status);

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. Laporan / Tiket */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                            {r.ticketNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                            {r.category}
                          </span>
                        </div>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white line-clamp-1">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          📍 {r.address}
                        </p>
                      </td>

                      {/* 2. Severity */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.severity === 'KRITIS'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : r.severity === 'TINGGI'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                              : r.severity === 'SEDANG'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.severity === 'KRITIS' ? 'bg-red-600 animate-ping' : 'bg-current'
                            }`}
                          />
                          {r.severity}
                        </span>
                      </td>

                      {/* 3. Status */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {r.status}
                        </span>
                        {r.statusHistory && r.statusHistory[0] && (
                          <p className="mt-1 text-[10px] text-slate-400">
                            oleh {r.statusHistory[0].actor.name}
                          </p>
                        )}
                      </td>

                      {/* 4. Instansi */}
                      <td className="py-4 px-4 max-w-[180px]">
                        {r.assignedAgency ? (
                          <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                            🏢 {r.assignedAgency}
                          </p>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            ⚠️ Belum Didisposisi
                          </span>
                        )}
                      </td>

                      {/* 5. Skor AI */}
                      <td className="py-4 px-4">
                        {r.verification ? (
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {Math.round(r.verification.authenticityScore * 100)}%
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {r.verification.isLegitimate ? 'Keaslian Tinggi' : 'Perlu Tinjauan'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* 6. SLA */}
                      <td className="py-4 px-4">
                        {r.slaDeadline ? (
                          <div
                            className={`text-[11px] font-semibold ${
                              isSlaBreached
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isSlaBreached && '⚠️ Terlewat: '}
                            {new Date(r.slaDeadline).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum diatur</span>
                        )}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveReportForAssign(r)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-[11px] transition-colors"
                            title="Disposisikan ke instansi/petugas"
                          >
                            Disposisi
                          </button>
                          <button
                            onClick={() => setActiveReportForStatus(r)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] transition-colors"
                            title="Perbarui status resmi"
                          >
                            Ubah Status
                          </button>
                          <Link
                            href={`/laporan/${r.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
