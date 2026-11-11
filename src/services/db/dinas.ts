import prisma from '@/lib/prisma';
import type {
  ReportStatus,
  ReportCategory,
  SeverityLevel,
} from '@prisma/client';

export interface DinasReportFilter {
  agency?: string;
  status?: ReportStatus;
  severity?: SeverityLevel;
  category?: ReportCategory;
  kecamatan?: string;
  search?: string;
  urgentOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Fetch operational stats for local government dashboard
 */
export async function getDinasDashboardStats(agencyFilter?: string) {
  const agencyWhere = agencyFilter && agencyFilter !== 'SEMUA' ? { assignedAgency: agencyFilter } : {};
  const now = new Date();

  const [
    totalReports,
    pendingVerification,
    activeHandling,
    resolvedCount,
    criticalCount,
    slaBreachedCount,
    announcementsCount,
  ] = await Promise.all([
    // Total reports in scope
    prisma.report.count({
      where: { ...agencyWhere },
    }),
    // Pending verification (DITERIMA, VERIFIKASI)
    prisma.report.count({
      where: {
        ...agencyWhere,
        status: { in: ['DITERIMA', 'VERIFIKASI'] },
      },
    }),
    // In active handling (DICEK, DITUGASKAN, DALAM_PENANGANAN)
    prisma.report.count({
      where: {
        ...agencyWhere,
        status: { in: ['DICEK', 'DITUGASKAN', 'DALAM_PENANGANAN'] },
      },
    }),
    // Resolved (DIATASI, PENINJAUAN, PERAWATAN)
    prisma.report.count({
      where: {
        ...agencyWhere,
        status: { in: ['DIATASI', 'PENINJAUAN', 'PERAWATAN'] },
      },
    }),
    // Critical / high severity that are not resolved yet
    prisma.report.count({
      where: {
        ...agencyWhere,
        severity: { in: ['KRITIS', 'TINGGI'] },
        status: { notIn: ['DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'] },
      },
    }),
    // SLA breached (deadline passed and not yet resolved)
    prisma.report.count({
      where: {
        ...agencyWhere,
        slaDeadline: { lt: now },
        status: { notIn: ['DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'] },
      },
    }),
    // Active city announcements
    prisma.cityAnnouncement.count(),
  ]);

  // Counts by status
  const statusGrouping = await prisma.report.groupBy({
    by: ['status'],
    where: { ...agencyWhere },
    _count: { id: true },
  });

  const statusCounts: Record<string, number> = {};
  statusGrouping.forEach((g) => {
    statusCounts[g.status] = g._count.id;
  });

  // Agency distribution
  const agencyGrouping = await prisma.report.groupBy({
    by: ['assignedAgency'],
    _count: { id: true },
  });

  return {
    totalReports,
    pendingVerification,
    activeHandling,
    resolvedCount,
    criticalCount,
    slaBreachedCount,
    announcementsCount,
    statusCounts,
    agencyBreakdown: agencyGrouping.map((a) => ({
      agency: a.assignedAgency ?? 'Belum Ditugaskan',
      count: a._count.id,
    })),
  };
}

/**
 * Fetch reports for government officers with detailed relation information
 */
export async function getDinasReports(filters: DinasReportFilter = {}) {
  const where: Record<string, unknown> = {};

  if (filters.agency && filters.agency !== 'SEMUA') {
    if (filters.agency === 'UNASSIGNED') {
      where.assignedAgency = null;
    } else {
      where.assignedAgency = filters.agency;
    }
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.severity) {
    where.severity = filters.severity;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.kecamatan) {
    where.kecamatan = filters.kecamatan;
  }

  if (filters.urgentOnly) {
    where.severity = { in: ['KRITIS', 'TINGGI'] };
    where.status = { notIn: ['DIATASI', 'PENINJAUAN', 'PERAWATAN', 'DITOLAK'] };
  }

  if (filters.search) {
    const s = filters.search.trim();
    where.OR = [
      { ticketNumber: { contains: s, mode: 'insensitive' } },
      { title: { contains: s, mode: 'insensitive' } },
      { description: { contains: s, mode: 'insensitive' } },
      { address: { contains: s, mode: 'insensitive' } },
    ];
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true, phone: true },
        },
        media: true,
        verification: true,
        statusHistory: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        confirmations: {
          select: { id: true, userId: true },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters.limit ?? 25,
      skip: filters.offset ?? 0,
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, total };
}

/**
 * List available officers and government accounts for assignment
 */
export async function getAvailableOfficers() {
  return await prisma.user.findMany({
    where: {
      role: { in: ['PETUGAS', 'LOCAL_GOVERNMENT', 'ADMIN'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kelurahan: true,
      kecamatan: true,
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Create official City Announcement
 */
export async function createCityAnnouncement(input: {
  title: string;
  content: string;
  sourceUrl?: string;
  sourceName?: string;
  isEmergency?: boolean;
}) {
  return await prisma.cityAnnouncement.create({
    data: {
      title: input.title,
      content: input.content,
      sourceUrl: input.sourceUrl,
      sourceName: input.sourceName ?? 'Pemerintah Kota Bogor',
      isEmergency: input.isEmergency ?? false,
      summarizedByAi: false,
    },
  });
}
