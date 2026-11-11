'use client';

import React, { useState, useRef } from 'react';
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
  { value: 'DALAM_PENANGANAN', label: 'Sedang Dikerjakan (DALAM_PENANGANAN)', desc: 'Pekerjaan fisik perbaikan sedang berlangsung di lapangan.' },
  { value: 'DIATASI', label: 'Perbaikan Selesai (DIATASI)', desc: 'Pekerjaan fisik selesai 100%. Wajib lampirkan foto dokumentasi hasil akhir.' },
  { value: 'DICEK', label: 'Survei Lapangan (DICEK)', desc: 'Petugas lapangan dikirim untuk mengecek kondisi fisik di lokasi.' },
  { value: 'DITUGASKAN', label: 'Penugasan Tim Teknis (DITUGASKAN)', desc: 'Laporan diteruskan ke unit teknis terkait dengan instruksi kerja.' },
  { value: 'VERIFIKASI', label: 'Verifikasi Laporan (VERIFIKASI)', desc: 'Validasi keabsahan laporan warga dan kelayakan penanganan.' },
  { value: 'PENINJAUAN', label: 'Peninjauan Mutu Warga (PENINJAUAN)', desc: 'Masa uji dan konfirmasi mutu oleh warga sekitar.' },
  { value: 'PERAWATAN', label: 'Perawatan Berkala (PERAWATAN)', desc: 'Fasilitas masuk dalam pemeliharaan berkala Pemkot Bogor.' },
  { value: 'DITOLAK', label: 'Tolak Laporan (DITOLAK)', desc: 'Laporan tidak valid, bukan wewenang kota, atau duplikat (alasan wajib).' },
];

const PROGRESS_PRESETS = [
  { percent: 25, label: '25% (Persiapan Material & Personel)' },
  { percent: 50, label: '50% (Pengerjaan Fisik Sedang Berjalan)' },
  { percent: 75, label: '75% (Tahap Akhir / Finishing)' },
  { percent: 100, label: '100% (Pekerjaan Fisik Tuntas)' },
];

const SAMPLE_FIELD_EVIDENCES = [
  {
    name: 'Penambalan Aspal PUPR',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pekerjaan Saluran Drainase',
    url: 'https://images.unsplash.com/photo-1584463699037-4d7a718b5efb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Perbaikan PJU Dishub',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  },
];

export default function DinasStatusModal({
  report,
  onClose,
  onSuccess,
  actorId,
}: StatusModalProps) {
  const [targetStatus, setTargetStatus] = useState<ReportStatus>(
    report?.status === 'DITERIMA' || report?.status === 'VERIFIKASI'
      ? 'DALAM_PENANGANAN'
      : report?.status || 'DALAM_PENANGANAN'
  );
  const [progressPercent, setProgressPercent] = useState<number | null>(50);
  const [note, setNote] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [slaDeadline, setSlaDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!report) return null;

  // Client-side image compression
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Berkas yang dipilih harus berupa gambar.');
      return;
    }

    setCompressing(true);
    setError(null);
    setPhotoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxWidth = 1200;
          const maxHeight = 900;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Gagal membuat kanvas kompresi');

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          setPhotoPreview(compressedDataUrl);
          setEvidencePhotoUrl(compressedDataUrl);
        } catch {
          // Fallback to original
          const rawUrl = e.target?.result as string;
          setPhotoPreview(rawUrl);
          setEvidencePhotoUrl(rawUrl);
        } finally {
          setCompressing(false);
        }
      };
      img.onerror = () => {
        setError('Gagal memproses gambar dokumentasi.');
        setCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetProgress = (pct: number) => {
    setProgressPercent(pct);
    if (pct === 100) {
      setTargetStatus('DIATASI');
    } else {
      setTargetStatus('DALAM_PENANGANAN');
    }

    const presetLabel = PROGRESS_PRESETS.find((p) => p.percent === pct)?.label || `${pct}%`;
    if (!note.includes('[Progres Fisik:')) {
      setNote(`[Progres Fisik: ${presetLabel}] ${note}`.trim());
    } else {
      const cleaned = note.replace(/\[Progres Fisik:[^\]]+\]\s*/g, '').trim();
      setNote(`[Progres Fisik: ${presetLabel}] ${cleaned}`.trim());
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!report || !targetStatus) return;

    if (targetStatus === 'DITOLAK' && !note.trim()) {
      setError('Alasan penolakan wajib dicatat untuk transparansi warga.');
      return;
    }

    if (targetStatus === 'DIATASI' && !evidencePhotoUrl.trim()) {
      setError('Foto dokumentasi hasil akhir perbaikan selesai wajib disertakan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalNote = note.trim()
        ? note.trim()
        : progressPercent
        ? `[Progres Fisik: ${progressPercent}%] Pembaruan progres pengerjaan di lapangan oleh tim teknis dinas.`
        : undefined;

      const res = await fetch('/api/dinas/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          newStatus: targetStatus,
          actorId,
          note: finalNote,
          evidencePhotoUrl: evidencePhotoUrl.trim() || undefined,
          slaDeadline: slaDeadline ? new Date(slaDeadline).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status laporan.');

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                {report.ticketNumber}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {report.assignedAgency || 'Instansi Terkait'}
              </span>
            </div>
            <h3 className="mt-1.5 text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Pelaporan Progres Fisik & Status Lapangan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dokumentasikan bukti pengerjaan fisik di lokasi agar transparan bagi warga Kota Bogor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              ⚠️ {error}
            </div>
          )}

          {/* 1. Pilih Status Baru */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Status Operasional Lapangan
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
            >
              {STATUS_TRANSITIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {STATUS_TRANSITIONS.find((s) => s.value === targetStatus)?.desc}
            </p>
          </div>

          {/* 2. Estimasi Progres Fisik (%) Preset */}
          {(targetStatus === 'DALAM_PENANGANAN' || targetStatus === 'DIATASI') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Estimasi Progres Fisik Lapangan
                </label>
                {progressPercent && (
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    {progressPercent}%
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROGRESS_PRESETS.map((p) => {
                  const isActive = progressPercent === p.percent;
                  return (
                    <button
                      key={p.percent}
                      type="button"
                      onClick={() => handleSelectPresetProgress(p.percent)}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {p.percent}% Selesai
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. DOKUMENTASI FOTO BUKTI FISIK LAPANGAN (WAJIB / UTAMA) */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                📸 Dokumentasi Bukti Fisik Lapangan
                {targetStatus === 'DIATASI' && (
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">
                    (Wajib)
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 underline font-semibold"
              >
                {showUrlInput ? '« Unggah Berkas Gambar' : 'Gunakan URL Foto »'}
              </button>
            </div>

            {/* Input Berkas / Kamera Langsung */}
            {!showUrlInput ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                {!photoPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 transition-all group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform">
                      📷
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Klik untuk Ambil Foto Kamera / Pilih dari Galeri
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Mendukung format JPG, PNG, WEBP (Otomatis terkompresi &lt; 500KB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 dark:bg-black/30">
                    {/* Image preview */}
                    <div className="relative aspect-video max-h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Pratinjau Bukti Fisik Lapangan"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                        ✓ Foto Terlampir
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate font-mono">
                        {photoFileName || 'dokumentasi-lapangan.jpg'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setEvidencePhotoUrl('');
                            setPhotoFileName(null);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {compressing && (
                  <p className="text-[11px] font-bold text-emerald-600 animate-pulse text-center mt-2">
                    ⏳ Mengompresi resolusi foto lapangan...
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="https://... URL tautan gambar bukti perbaikan"
                  value={evidencePhotoUrl}
                  onChange={(e) => {
                    setEvidencePhotoUrl(e.target.value);
                    setPhotoPreview(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Quick Demo Samples for field officers without camera on laptop */}
            {!photoPreview && (
              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Atau pilih contoh dokumentasi perbaikan dinas (simulasi cepat):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_FIELD_EVIDENCES.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setEvidencePhotoUrl(s.url);
                        setPhotoPreview(s.url);
                        setPhotoFileName(s.name);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                    >
                      🏗️ {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Target Tenggat Waktu (SLA Deadline) */}
          {(targetStatus === 'DITUGASKAN' || targetStatus === 'DALAM_PENANGANAN') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Tenggat Waktu (SLA Deadline)
              </label>
              <input
                type="datetime-local"
                value={slaDeadline}
                onChange={(e) => setSlaDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
              />
            </div>
          )}

          {/* 5. Catatan Resmi Berita Acara Dinas & Rincian Fisik */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Catatan Resmi Berita Acara & Tindakan Fisik {targetStatus === 'DITOLAK' && '(Wajib)'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tim regu 2 telah menambal lubang menggunakan cold-mix asphalt 3 drum. Dilakukan pemadatan baby roller. Kondisi jalan aman dilalui."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || compressing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan Progres...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Simpan Laporan Progres
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
