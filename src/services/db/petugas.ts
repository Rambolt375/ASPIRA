import prisma from '@/lib/prisma';
import type { ReportStatus, SeverityLevel } from '@prisma/client';

export interface PetugasTaskFilter {
  kecamatan?: string;
  status?: ReportStatus;
  severity?: SeverityLevel;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface InspectionInput {
  reportId: string;
  actorId: string;
  actorName: string;
  action: 'VERIFIKASI_VALID' | 'SURVEI_SELESAI' | 'REKOMENDASI_TOLAK';
  fieldNote: string;
  fieldPhotoUrl?: string;
  physicalDamageEst?: string;
  trafficImpact?: string;
  confirmedCategory?: string;
  confirmedSeverity?: SeverityLevel;
}

/**
 * Fetch inspection queue for field inspectors.
 */
export async function getPetugasTasks(filter?: PetugasTaskFilter) {
  const where: Record<string, unknown> = {};

  if (filter?.status && filter.status !== ('SEMUA' as unknown as ReportStatus)) {
    where.status = filter.status;
  } else {
    // Default queue: reports in intake, verification, or field check stage
    where.status = { in: ['DITERIMA', 'VERIFIKASI', 'DICEK', 'DITUGASKAN'] };
  }

  if (filter?.kecamatan && filter.kecamatan !== 'SEMUA') {
    where.kecamatan = filter.kecamatan;
  }

  if (filter?.severity && filter.severity !== ('SEMUA' as unknown as SeverityLevel)) {
    where.severity = filter.severity;
  }

  if (filter?.search) {
    where.OR = [
      { ticketNumber: { contains: filter.search, mode: 'insensitive' } },
      { title: { contains: filter.search, mode: 'insensitive' } },
      { address: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  return prisma.report.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, phone: true, email: true },
      },
      media: true,
      verification: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          actor: { select: { name: true, role: true } },
        },
      },
    },
    orderBy: [
      { severity: 'desc' },
      { createdAt: 'asc' },
    ],
    take: filter?.limit ?? 30,
    skip: filter?.offset ?? 0,
  });
}

/**
 * Fetch KPI statistics for Petugas Lapangan.
 */
export async function getPetugasStats(petugasId?: string) {
  const [
    pendingQueue,
    inVerification,
    fieldChecked,
    completedByInspector,
  ] = await Promise.all([
    // All tasks needing immediate field check
    prisma.report.count({
      where: { status: { in: ['DITERIMA', 'VERIFIKASI'] } },
    }),
    // Currently being inspected in field
    prisma.report.count({
      where: { status: 'DICEK' },
    }),
    // Already verified/dispatched to OPD
    prisma.report.count({
      where: { status: 'DITUGASKAN' },
    }),
    // Inspected by this specific officer if ID provided
    petugasId
      ? prisma.statusHistory.count({
          where: { actorId: petugasId, newStatus: { in: ['DICEK', 'DITUGASKAN'] } },
        })
      : prisma.statusHistory.count({
          where: { newStatus: { in: ['DICEK', 'DITUGASKAN'] } },
        }),
  ]);

  return {
    pendingQueue,
    inVerification,
    fieldChecked,
    completedByInspector,
  };
}

/**
 * Record inspector field findings and transition report status append-only.
 */
export async function recordInspectionFinding(input: InspectionInput) {
  const report = await prisma.report.findUnique({
    where: { id: input.reportId },
    include: { verification: true },
  });

  if (!report) {
    throw new Error('Laporan tidak ditemukan.');
  }

  let nextStatus: ReportStatus = 'DICEK';
  if (input.action === 'SURVEI_SELESAI') {
    nextStatus = 'DITUGASKAN';
  } else if (input.action === 'REKOMENDASI_TOLAK') {
    nextStatus = 'DITOLAK';
  }

  return prisma.$transaction(async (tx) => {
    // 1. Update report status and confirmed properties if provided
    const updateData: Record<string, unknown> = {
      status: nextStatus,
    };
    if (input.confirmedSeverity) {
      updateData.severity = input.confirmedSeverity;
    }
    if (input.fieldPhotoUrl) {
      updateData.afterPhotoUrl = input.fieldPhotoUrl;
    }

    const updatedReport = await tx.report.update({
      where: { id: input.reportId },
      data: updateData,
    });

    // 2. Append immutable StatusHistory record
    const statusNote = `[Inspeksi Lapangan] ${input.fieldNote}${
      input.physicalDamageEst ? ` | Dimensi: ${input.physicalDamageEst}` : ''
    }${input.trafficImpact ? ` | Dampak: ${input.trafficImpact}` : ''}`;

    await tx.statusHistory.create({
      data: {
        reportId: input.reportId,
        actorId: input.actorId,
        previousStatus: report.status,
        newStatus: nextStatus,
        note: statusNote,
      },
    });

    // 3. Upsert or update EvidenceVerification with inspection review notes
    if (report.verification) {
      await tx.evidenceVerification.update({
        where: { id: report.verification.id },
        data: {
          reviewerId: input.actorId,
          reviewDecision: input.action,
          reviewNotes: input.fieldNote,
          requiresHumanReview: false,
          suggestedSeverity: input.confirmedSeverity || report.verification.suggestedSeverity,
        },
      });
    }

    return updatedReport;
  });
}
