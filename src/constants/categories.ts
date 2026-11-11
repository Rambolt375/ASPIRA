import type { ReportCategory, ReportStatus, SeverityLevel } from '@/types';

export interface CategoryMeta {
  label: string;
  icon: string;
}

export const REPORT_CATEGORIES: Record<ReportCategory, CategoryMeta> = {
  JALAN:       { label: 'Jalan', icon: '🛣️' },
  JEMBATAN:    { label: 'Jembatan', icon: '🌉' },
  DRAINASE:    { label: 'Drainase / Got', icon: '🌊' },
  LAMPU_JALAN: { label: 'Lampu Jalan', icon: '💡' },
  TAMAN:       { label: 'Taman & RTH', icon: '🌳' },
  SAMPAH:      { label: 'Sampah', icon: '🗑️' },
  BANJIR:      { label: 'Banjir', icon: '🌧️' },
  LAINNYA:     { label: 'Lainnya', icon: '📋' },
};

export const SEVERITY_LEVELS: Record<SeverityLevel, { label: string; color: string }> = {
  RENDAH: { label: 'Rendah', color: 'emerald' },
  SEDANG: { label: 'Sedang', color: 'amber' },
  TINGGI: { label: 'Tinggi', color: 'orange' },
  KRITIS: { label: 'Kritis', color: 'red' },
};

export const REPORT_STATUSES: Record<ReportStatus, { label: string; description: string }> = {
  DITERIMA:         { label: 'Diterima',          description: 'Laporan berhasil dibuat' },
  VERIFIKASI:       { label: 'Verifikasi',         description: 'Sedang diverifikasi oleh AI/petugas' },
  DICEK:            { label: 'Dicek Lapangan',     description: 'Survei lapangan oleh dinas terkait' },
  DITUGASKAN:       { label: 'Ditugaskan',         description: 'Diteruskan ke dinas dengan tenggat waktu' },
  DALAM_PENANGANAN: { label: 'Dalam Penanganan',   description: 'Pekerjaan perbaikan sedang berlangsung' },
  DIATASI:          { label: 'Diatasi',            description: 'Perbaikan selesai dengan bukti foto' },
  PENINJAUAN:       { label: 'Peninjauan',         description: 'Menunggu konfirmasi warga' },
  PERAWATAN:        { label: 'Perawatan',          description: 'Jadwal perawatan berkala' },
  DITOLAK:          { label: 'Ditolak',            description: 'Laporan ditolak dengan alasan transparan' },
  DIBUKA_KEMBALI:   { label: 'Dibuka Kembali',     description: 'Laporan dibuka ulang karena perbaikan gagal' },
};

// Ordered pipeline (happy path) — use this for the timeline display
export const STATUS_PIPELINE: ReportStatus[] = [
  'DITERIMA',
  'VERIFIKASI',
  'DICEK',
  'DITUGASKAN',
  'DALAM_PENANGANAN',
  'DIATASI',
  'PENINJAUAN',
  'PERAWATAN',
];
