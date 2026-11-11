'use client';

import React, { useState } from 'react';
import type { ReportStatus } from '@prisma/client';

interface ReportSummary {
  id: string;
  ticketNumber: string;
  title: string;
  status: ReportStatus;
  assignedAgency?: string | null;
}

interface StatusModalProps {
  report: ReportSummary | null;
  onClose: () => void;
  onSuccess: () => void;
  actorId: string;
}

const STATUS_TRANSITIONS: { value: ReportStatus; label: string; desc: string }[] = [
  { value: 'VERIFIKASI', label: 'Verifikasi Laporan', desc: 'Validasi keabsahan laporan warga dan kelayakan penanganan.' },
  { value: 'DICEK', label: 'Survei Lapangan', desc: 'Petugas lapangan dikirim untuk mengecek kondisi fisik di lokasi.' },
  { value: 'DITUGASKAN', label: 'Penugasan Tim Teknis', desc: 'Laporan telah diteruskan ke seksi teknis terkait dengan instruksi kerja.' },
  { value: 'DALAM_PENANGANAN', label: 'Sedang Diperbaiki', desc: 'Pekerjaan fisik perbaikan sedang berlangsung di lapangan.' },
  { value: 'DIATASI', label: 'Perbaikan Selesai (Diatasi)', desc: 'Pekerjaan fisik selesai 100%. Wajib lampirkan foto hasil perbaikan.' },
  { value: 'PENINJAUAN', label: 'Peninjauan Mutu Warga', desc: 'Masa uji dan konfirmasi mutu oleh warga sekitar.' },
  { value: 'PERAWATAN', label: 'Jadwal Perawatan Berkala', desc: 'Fasilitas masuk dalam pemeliharaan berkala Pemkot Bogor.' },
  { value: 'DITOLAK', label: 'Tolak Laporan', desc: 'Laporan tidak valid, bukan wewenang kota, atau duplikat (alasan wajib).' },
];

export default function DinasStatusModal({
  report,
  onClose,
  onSuccess,
  actorId,
}: StatusModalProps) {
  const [targetStatus, setTargetStatus] = useState<ReportStatus>(report?.status || 'VERIFIKASI');
  const [note, setNote] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [slaDeadline, setSlaDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!report) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!report || !targetStatus) return;

    if (targetStatus === 'DITOLAK' && !note.trim()) {
      setError('Alasan penolakan wajib dicatat untuk transparansi warga.');
      return;
    }

    if (targetStatus === 'DIATASI' && !evidencePhotoUrl.trim()) {
      setError('Foto bukti hasil perbaikan selesai wajib disertakan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dinas/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          newStatus: targetStatus,
          actorId,
          note: note.trim() || undefined,
          evidencePhotoUrl: evidencePhotoUrl.trim() || undefined,
          slaDeadline: slaDeadline ? new Date(slaDeadline).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status');

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
              {report.ticketNumber}
            </span>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Eskalasi Status Resmi Dinas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Pilih Status Baru
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            >
              {STATUS_TRANSITIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label} ({st.value})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {STATUS_TRANSITIONS.find((s) => s.value === targetStatus)?.desc}
            </p>
          </div>

          {/* SLA Deadline jika masuk DITUGASKAN atau DALAM_PENANGANAN */}
          {(targetStatus === 'DITUGASKAN' || targetStatus === 'DALAM_PENANGANAN') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Tenggat Waktu (SLA Deadline)
              </label>
              <input
                type="datetime-local"
                value={slaDeadline}
                onChange={(e) => setSlaDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          {/* Bukti Foto jika DIATASI */}
          {targetStatus === 'DIATASI' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                URL Foto Bukti Perbaikan Lapangan (Wajib)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... atau link foto bukti"
                value={evidencePhotoUrl}
                onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Foto ini akan otomatis menjadi komparasi visual Sebelum/Sesudah untuk warga.
              </p>
            </div>
          )}

          {/* Catatan Berita Acara / Alasan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Catatan Resmi Berita Acara Dinas {targetStatus === 'DITOLAK' && '(Wajib)'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan keterangan tindakan fisik, material yang digunakan, atau alasan keputusan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Perbarui Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
