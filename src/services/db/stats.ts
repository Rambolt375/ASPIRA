import prisma from '@/lib/prisma';
import type { ReportStatus, ReportCategory } from '@prisma/client';

export interface CityPulseStats {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  inProgressReports: number;
  resolutionRate: number; // percentage 0 - 100
  statusBreakdown: Record<ReportStatus, number>;
  categoryBreakdown: Record<ReportCategory, number>;
  kecamatanBreakdown: Record<string, number>;
}

export async function getCityPulseStats(): Promise<CityPulseStats> {
  const [total, reports] = await Promise.all([
    prisma.report.count(),
    prisma.report.findMany({
      select: {
        status: true,
        category: true,
        kecamatan: true,
      },
    }),
  ]);

  const statusBreakdown: Record<ReportStatus, number> = {
    DITERIMA: 0,
    VERIFIKASI: 0,
    DICEK: 0,
    DITUGASKAN: 0,
    DALAM_PENANGANAN: 0,
    DIATASI: 0,
    PENINJAUAN: 0,
    PERAWATAN: 0,
    DITOLAK: 0,
    DIBUKA_KEMBALI: 0,
  };

  const categoryBreakdown: Record<ReportCategory, number> = {
    JALAN: 0,
    JEMBATAN: 0,
    DRAINASE: 0,
    LAMPU_JALAN: 0,
    TAMAN: 0,
    SAMPAH: 0,
    BANJIR: 0,
    LAINNYA: 0,
  };

  const kecamatanBreakdown: Record<string, number> = {};

  for (const r of reports) {
    if (statusBreakdown[r.status] !== undefined) {
      statusBreakdown[r.status]++;
    }
    if (categoryBreakdown[r.category] !== undefined) {
      categoryBreakdown[r.category]++;
    }
    const kec = r.kecamatan || 'Lainnya';
    kecamatanBreakdown[kec] = (kecamatanBreakdown[kec] || 0) + 1;
  }

  const resolved =
    statusBreakdown.DIATASI + statusBreakdown.PENINJAUAN + statusBreakdown.PERAWATAN;
  const inProgress =
    statusBreakdown.DICEK + statusBreakdown.DITUGASKAN + statusBreakdown.DALAM_PENANGANAN;
  const pending = statusBreakdown.DITERIMA + statusBreakdown.VERIFIKASI;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return {
    totalReports: total,
    resolvedReports: resolved,
    pendingReports: pending,
    inProgressReports: inProgress,
    resolutionRate,
    statusBreakdown,
    categoryBreakdown,
    kecamatanBreakdown,
  };
}

