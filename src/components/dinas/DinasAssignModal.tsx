'use client';

import React, { useState, useEffect } from 'react';

interface ReportSummary {
  id: string;
  ticketNumber: string;
  title: string;
  assignedAgency?: string | null;
}

interface Officer {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignModalProps {
  report: ReportSummary | null;
  onClose: () => void;
  onSuccess: () => void;
  actorId: string;
}

const DINAS_OPTIONS = [
  'Dinas PUPR (Pekerjaan Umum & Penataan Ruang)',
  'Dinas Perhubungan (Dishub)',
  'Dinas Lingkungan Hidup (DLH)',
  'BPBD Kota Bogor (Kebencanaan)',
  'Disperumkim (Perumahan & Pemukiman)',
  'Satpol PP Kota Bogor',
  'Pemerintah Kecamatan / Kelurahan',
];

export default function DinasAssignModal({
  report,
  onClose,
  onSuccess,
  actorId,
}: AssignModalProps) {
  const [agency, setAgency] = useState(report?.assignedAgency || DINAS_OPTIONS[0]);
  const [officerId, setOfficerId] = useState('');
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfficers() {
      try {
        const res = await fetch('/api/dinas/officers');
        const data = await res.json();
        if (data.officers) {
          setOfficers(data.officers);
          if (data.officers.length > 0) {
            setOfficerId(data.officers[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load officers', e);
      }
    }
    fetchOfficers();
  }, []);

  if (!report) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!report) return;
    setLoading(true);
    setError(null);

    const selectedOfficer = officers.find((o) => o.id === officerId);
    const assignmentNote = note.trim()
      ? `${note} (Disposisi ke: ${agency}${selectedOfficer ? `, Petugas: ${selectedOfficer.name}` : ''})`
      : `Disposisi penugasan ke ${agency}${selectedOfficer ? ` dengan PIC petugas: ${selectedOfficer.name}` : ''}.`;

    try {
      const res = await fetch('/api/dinas/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          newStatus: 'DITUGASKAN',
          actorId,
          assignedAgency: agency,
          note: assignmentNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendisposisikan laporan');

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
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
              {report.ticketNumber}
            </span>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Disposisi & Penugasan Dinas
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
              Instansi / Satuan Kerja Teknis (OPD)
            </label>
            <select
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {DINAS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Pilih Petugas / Inspektur Lapangan (PIC)
            </label>
            <select
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Instruksi Kerja Lapangan (Opsional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Lakukan penambalan aspal darurat dengan cold-mix sebelum musim hujan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menugaskan...' : 'Tugaskan ke Dinas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
