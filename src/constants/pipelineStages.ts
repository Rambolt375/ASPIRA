import type { ReportStatus } from '@/types';

export interface StageRoleMeta {
  status: ReportStatus;
  stepNumber: number;
  label: string;
  roleName: string;
  roleType: 'SISTEM' | 'PETUGAS_LAPANGAN' | 'DINAS_PELAKSANA' | 'PENGAWAS_WARGA' | 'OPERATOR';
  roleBadge: string;
  badgeColor: string;
  roleDescription: string;
  slaDefault: string;
  slaHours: number; // in hours for calculation
  icon: string;
  progressPercent: number; // 0 - 100
}

/**
 * 8-stage pipeline configuration with explicit, transparent roles
 * designed to eliminate citizen perception of bureaucratic red tape.
 */
export const STAGE_ROLES: Record<ReportStatus, StageRoleMeta> = {
  DITERIMA: {
    status: 'DITERIMA',
    stepNumber: 1,
    label: 'Diterima Sistem',
    roleName: 'Sistem ASPIRA & AI Validator',
    roleType: 'SISTEM',
    roleBadge: 'Validasi AI & GPS',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    roleDescription: 'Sistem otomatis memverifikasi metadata EXIF foto, mendeteksi potensi duplikasi koordinat, dan menerbitkan nomor tiket resmi.',
    slaDefault: 'Target Verifikasi Awal: 15 Menit',
    slaHours: 0.25,
    icon: '🤖',
    progressPercent: 12.5,
  },
  VERIFIKASI: {
    status: 'VERIFIKASI',
    stepNumber: 2,
    label: 'Verifikasi Berkas',
    roleName: 'Helpdesk & Operator Verifikasi',
    roleType: 'OPERATOR',
    roleBadge: 'Verifikator Disposisi',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    roleDescription: 'Pemeriksaan administratif keabsahan data laporan warga untuk memastikan instansi dinas berwenang dituju secara tepat sasaran.',
    slaDefault: 'Target Verifikasi: 4 Jam Kerja',
    slaHours: 4,
    icon: '📋',
    progressPercent: 25,
  },
  DICEK: {
    status: 'DICEK',
    stepNumber: 3,
    label: 'Pemeriksaan Lapangan',
    roleName: 'Petugas Teknis Lapangan',
    roleType: 'PETUGAS_LAPANGAN',
    roleBadge: 'Inspektur Lapangan PUPR',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    roleDescription: 'Bukan birokrasi berulang! Surveyor teknis langsung terjun ke lokasi untuk mengukur dimensi kerusakan, uji material, dan menyusun SPK perbaikan fisik.',
    slaDefault: 'Target Pemeriksaan: 24 Jam',
    slaHours: 24,
    icon: '🔍',
    progressPercent: 37.5,
  },
  DITUGASKAN: {
    status: 'DITUGASKAN',
    stepNumber: 4,
    label: 'Penugasan Satker',
    roleName: 'Sekretariat Teknis & Disposisi Logistik',
    roleType: 'OPERATOR',
    roleBadge: 'Penerbitan SPK',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    roleDescription: 'Penerbitan Surat Perintah Kerja (SPK) resmi, pemesanan material aspal/beton/lampu, dan alokasi jadwal kru konstruksi.',
    slaDefault: 'Target Disposisi: 12 Jam',
    slaHours: 12,
    icon: '📑',
    progressPercent: 50,
  },
  DALAM_PENANGANAN: {
    status: 'DALAM_PENANGANAN',
    stepNumber: 5,
    label: 'Dalam Penanganan Fisik',
    roleName: 'Dinas Pelaksana Teknis',
    roleType: 'DINAS_PELAKSANA',
    roleBadge: 'Kru Konstruksi Lapangan',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    roleDescription: 'Kru dinas teknis (PUPR / DLH / Dishub Kota Bogor) mengerahkan armada, alat berat, dan tim teknisi langsung melakukan pengerjaan fisik di lokasi.',
    slaDefault: 'Estimasi Selesai: 3x24 Jam (SLA Dinas)',
    slaHours: 72,
    icon: '🏗️',
    progressPercent: 62.5,
  },
  DIATASI: {
    status: 'DIATASI',
    stepNumber: 6,
    label: 'Perbaikan Tuntas',
    roleName: 'Kru Konstruksi & Mandor Teknis',
    roleType: 'DINAS_PELAKSANA',
    roleBadge: 'Pelaksana Pekerjaan',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    roleDescription: 'Pekerjaan fisik selesai 100%. Kru mengunggah foto sesudah pengerjaan sebagai bukti akuntabilitas langsung kepada publik.',
    slaDefault: 'Pelaporan Selesai: Tuntas',
    slaHours: 0,
    icon: '✅',
    progressPercent: 75,
  },
  PENINJAUAN: {
    status: 'PENINJAUAN',
    stepNumber: 7,
    label: 'Peninjauan Publik & Audit',
    roleName: 'Tim Pengawas Independen / Warga',
    roleType: 'PENGAWAS_WARGA',
    roleBadge: 'Audit Warga & Komunitas',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    roleDescription: 'Bukan formalitas meja! Warga pelapor dan komunitas lingkungan memvalidasi kualitas fisik hasil perbaikan sebelum laporan ditutup permanen untuk mencegah laporan fiktif atau perbaikan asal-asalan.',
    slaDefault: 'Target Uji Publik Warga: 48 Jam',
    slaHours: 48,
    icon: '👥',
    progressPercent: 87.5,
  },
  PERAWATAN: {
    status: 'PERAWATAN',
    stepNumber: 8,
    label: 'Perawatan Berkala',
    roleName: 'Unit Pemeliharaan Rutin Kota Bogor',
    roleType: 'DINAS_PELAKSANA',
    roleBadge: 'Patroli Monitoring Rutin',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    roleDescription: 'Lokasi masuk ke daftar patroli preventif berkala agar fasilitas umum tetap terjaga kualitas dan daya tahannya.',
    slaDefault: 'Siklus Monitoring: 30 Hari Berkala',
    slaHours: 720,
    icon: '🛡️',
    progressPercent: 100,
  },
  DITOLAK: {
    status: 'DITOLAK',
    stepNumber: 0,
    label: 'Laporan Ditolak',
    roleName: 'Tim Verifikator & Inspektorat Kota',
    roleType: 'OPERATOR',
    roleBadge: 'Ditolak Transparan',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    roleDescription: 'Laporan ditolak disertai catatan resmi transparan (misalnya lokasi jalan nasional/swasta berpagar atau bukti tidak relevan).',
    slaDefault: 'Status Final: Ditolak',
    slaHours: 0,
    icon: '❌',
    progressPercent: 0,
  },
  DIBUKA_KEMBALI: {
    status: 'DIBUKA_KEMBALI',
    stepNumber: 5,
    label: 'Dibuka Kembali',
    roleName: 'Warga & Tim Supervisi Kota',
    roleType: 'PENGAWAS_WARGA',
    roleBadge: 'Evaluasi Penanganan Ulang',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    roleDescription: 'Laporan dibuka ulang atas komplain warga karena kerusakan berulang atau pengerjaan fisik belum memenuhi standar teknis.',
    slaDefault: 'Target Respons Ulang: 24 Jam',
    slaHours: 24,
    icon: '🔄',
    progressPercent: 50,
  },
};

/**
 * Format dynamic SLA indicator badge text and urgency styling
 */
export function getReportSlaInfo(
  status: ReportStatus,
  slaDeadline?: string | null,
): {
  badgeText: string;
  isUrgent: boolean;
  isOverdue: boolean;
  timeRemainingText?: string;
  targetDescription: string;
} {
  const stageMeta = STAGE_ROLES[status] || STAGE_ROLES.DITERIMA;

  if (slaDeadline) {
    const deadlineDate = new Date(slaDeadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
      const overdueHours = Math.abs(diffHours);
      return {
        badgeText: `⚠️ Terlambat ${overdueHours} Jam dari SLA`,
        isUrgent: true,
        isOverdue: true,
        timeRemainingText: `Melewati tenggat (${deadlineDate.toLocaleDateString('id-ID')})`,
        targetDescription: stageMeta.slaDefault,
      };
    }

    if (diffHours <= 12) {
      return {
        badgeText: `⚡ Sisa Waktu SLA: ${diffHours} Jam Lagi`,
        isUrgent: true,
        isOverdue: false,
        timeRemainingText: `Tenggat: ${deadlineDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        targetDescription: stageMeta.slaDefault,
      };
    }

    const diffDays = Math.ceil(diffHours / 24);
    return {
      badgeText: `⏱️ Estimasi Selesai: ${diffDays} Hari (${diffHours} Jam)`,
      isUrgent: false,
      isOverdue: false,
      timeRemainingText: `Batas: ${deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`,
      targetDescription: stageMeta.slaDefault,
    };
  }

  // Fallback to standard SLA target for the current status
  return {
    badgeText: `⏱️ ${stageMeta.slaDefault}`,
    isUrgent: false,
    isOverdue: false,
    targetDescription: stageMeta.slaDefault,
  };
}
