'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import RoleQuickSwitch from '@/components/dinas/RoleQuickSwitch';
import type { ReportStatus, SeverityLevel } from '@prisma/client';

interface TaskItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  severity: SeverityLevel;
  status: ReportStatus;
  address: string;
  kecamatan?: string | null;
  kelurahan?: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    phone?: string | null;
    email: string;
  };
  media: { fileUrl: string }[];
  verification?: {
    authenticityScore: number;
    isLegitimate: boolean;
    confidence: number;
    suggestedSeverity?: string | null;
    aiFindingsJson?: string | null;
    reviewNotes?: string | null;
  } | null;
  statusHistory: {
    newStatus: string;
    note?: string | null;
    actor: { name: string; role: string };
    createdAt: string;
  }[];
}

const KECAMATAN_LIST = [
  'SEMUA',
  'Bogor Tengah',
  'Bogor Timur',
  'Bogor Barat',
  'Bogor Selatan',
  'Bogor Utara',
  'Tanah Sareal',
];

export default function PetugasWorkspacePage() {
  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'PETUGAS';

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState({
    pendingQueue: 0,
    inVerification: 0,
    fieldChecked: 0,
    completedByInspector: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedKecamatan, setSelectedKecamatan] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection Modal State
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [inspectAction, setInspectAction] = useState<'VERIFIKASI_VALID' | 'SURVEI_SELESAI' | 'REKOMENDASI_TOLAK'>('SURVEI_SELESAI');
  const [fieldNote, setFieldNote] = useState('');
  const [physicalDamageEst, setPhysicalDamageEst] = useState('');
  const [trafficImpact, setTrafficImpact] = useState('Sedang - Memperlambat arus lajur lambat');
  const [confirmedSeverity, setConfirmedSeverity] = useState<SeverityLevel>('SEDANG');
  const [fieldPhotoUrl, setFieldPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const userId = user?.id;

  const fetchStats = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      const res = await fetch(`/api/petugas/stats?userId=${userId || ''}`);
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error('Error fetching petugas stats', e);
    }
  }, [isAuthorized, userId]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedKecamatan !== 'SEMUA') params.set('kecamatan', selectedKecamatan);
      if (selectedStatus !== 'SEMUA') params.set('status', selectedStatus);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/petugas/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (e) {
      console.error('Error fetching tasks', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, selectedKecamatan, selectedStatus, searchQuery]);

  useEffect(() => {
    if (!isAuthorized) return;
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      await Promise.all([fetchStats(), fetchTasks()]);
    });
    return () => {
      active = false;
    };
  }, [fetchStats, fetchTasks, isAuthorized]);

  async function handleRecordInspection(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTask || !fieldNote.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/petugas/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedTask.id,
          actorId: user?.id || 'demo-officer-pupr',
          actorName: user?.name || 'Budi Santoso (Inspektur Lapangan)',
          action: inspectAction,
          fieldNote: fieldNote.trim(),
          fieldPhotoUrl: fieldPhotoUrl || selectedTask.media?.[0]?.fileUrl || undefined,
          physicalDamageEst: physicalDamageEst.trim() || undefined,
          trafficImpact: trafficImpact || undefined,
          confirmedSeverity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan temuan inspeksi.');

      setSuccessMsg(`Berhasil: Temuan inspeksi untuk tiket #${selectedTask.ticketNumber} telah dicatat.`);
      setSelectedTask(null);
      setFieldNote('');
      setPhysicalDamageEst('');
      fetchStats();
      fetchTasks();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kendala.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RoleQuickSwitch />

        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-sm">
            🔍
          </div>
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Akses Terbatas
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            Workspace Khusus Inspektur & Petugas Lapangan
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Halaman ini khusus untuk peran <strong className="text-slate-800 dark:text-slate-200">PETUGAS</strong> (Inspektur Teknis Lapangan Kota Bogor). Gunakan panel simulasi di atas untuk berpindah peran.
          </p>
          <div className="mt-6">
            <Link
              href="/beranda"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors inline-block"
            >
              Kembali ke Beranda Warga
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

      {/* Notification toast */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 shadow-sm">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Unit Reaksi Cepat & Surveyor
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Kota Bogor — SPK Lapangan
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Workspace Inspektur & Tim Lapangan
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Verifikasi keabsahan laporan warga, lakukan survei fisik, dan masukkan berita acara temuan lapangan.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            fetchTasks();
          }}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span>🔄</span> Segarkan Antrean
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Antrean Survei</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.pendingQueue}</p>
          <p className="text-xs text-slate-400 mt-1">Laporan DITERIMA / VERIFIKASI</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sedang Dicek</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.inVerification}</p>
          <p className="text-xs text-slate-400 mt-1">Status DICEK di lapangan</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Siap Disposisi OPD</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.fieldChecked}</p>
          <p className="text-xs text-slate-400 mt-1">Status DITUGASKAN ke dinas</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Survei Tuntas</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.completedByInspector}</p>
          <p className="text-xs text-slate-400 mt-1">Oleh Inspektur aktif</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kecamatan:</span>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {KECAMATAN_LIST.map((kec) => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari No. Tiket, Judul, atau Jalan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-1">Status:</span>
          {['SEMUA', 'DITERIMA', 'VERIFIKASI', 'DICEK', 'DITUGASKAN'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Memuat antrean tugas inspeksi lapangan...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada antrean tugas pada filter ini</p>
          <p className="text-xs text-slate-500 mt-1">Seluruh titik laporan dalam wilayah ini telah terverifikasi atau telah ditugaskan ke dinas pelaksana.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:border-emerald-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {task.ticketNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {task.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      task.severity === 'KRITIS' ? 'bg-rose-100 text-rose-700' :
                      task.severity === 'TINGGI' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {task.severity}
                    </span>
                  </div>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {task.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {task.description}
                </p>

                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p>📍 <span className="font-medium">{task.address}</span> ({task.kecamatan || 'Kota Bogor'})</p>
                  <p>👤 Pelapor: <span className="font-semibold">{task.author.name}</span> {task.author.phone ? `(${task.author.phone})` : ''}</p>
                </div>

                {/* AI Authenticity indicator */}
                {task.verification && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Skor Keaslian AI:</span>
                    <span className="font-bold text-emerald-600">
                      {Math.round(task.verification.authenticityScore * 100)}% (Bukti Terindikasi Valid)
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/laporan/${task.id}`}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Detail Laporan ↗
                </Link>

                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setConfirmedSeverity(task.severity);
                    setFieldNote(task.verification?.reviewNotes || '');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>📋</span> Catat Temuan Survei
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Input Temuan Lapangan */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedTask.ticketNumber}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Berita Acara Temuan Lapangan
                </h2>
                <p className="text-xs text-slate-500">Survei kondisi riil oleh Petugas Teknis Lapangan</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordInspection} className="mt-4 space-y-4">
              {/* Action Decision */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Keputusan Hasil Survei:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectAction('SURVEI_SELESAI')}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      inspectAction === 'SURVEI_SELESAI'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ✅ Siap Ditugaskan ke OPD
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectAction('VERIFIKASI_VALID')}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      inspectAction === 'VERIFIKASI_VALID'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🔍 Dicek Bertahap
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectAction('REKOMENDASI_TOLAK')}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                      inspectAction === 'REKOMENDASI_TOLAK'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ⛔ Tolak / Tidak Valid
                  </button>
                </div>
              </div>

              {/* Field Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Catatan Temuan Fisik Petugas <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  required
                  rows={3}
                  value={fieldNote}
                  onChange={(e) => setFieldNote(e.target.value)}
                  placeholder="Deskripsikan hasil uji fisik di lokasi (misal: lubang jalan perlu agregat kelas A + aspal hotmix 3 cm)..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Physical Dimension Estimation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Dimensi / Volume Kerusakan:
                  </label>
                  <input
                    type="text"
                    value={physicalDamageEst}
                    onChange={(e) => setPhysicalDamageEst(e.target.value)}
                    placeholder="Contoh: P: 2m, L: 1m, D: 10cm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Konfirmasi Tingkat Keparahan:
                  </label>
                  <select
                    value={confirmedSeverity}
                    onChange={(e) => setConfirmedSeverity(e.target.value as SeverityLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="RENDAH">RENDAH</option>
                    <option value="SEDANG">SEDANG</option>
                    <option value="TINGGI">TINGGI</option>
                    <option value="KRITIS">KRITIS</option>
                  </select>
                </div>
              </div>

              {/* Traffic Impact */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Dampak Lalu Lintas & Keselamatan Warga:
                </label>
                <input
                  type="text"
                  value={trafficImpact}
                  onChange={(e) => setTrafficImpact(e.target.value)}
                  placeholder="Contoh: Sangat membahayakan pengendara motor di malam hari"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Photo Evidence URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  URL / Lampiran Foto Survei Petugas (Opsional):
                </label>
                <input
                  type="url"
                  value={fieldPhotoUrl}
                  onChange={(e) => setFieldPhotoUrl(e.target.value)}
                  placeholder="https://... (Foto hasil survei kamera lapangan)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !fieldNote.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Berita Acara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
