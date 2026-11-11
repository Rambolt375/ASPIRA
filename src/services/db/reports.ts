import prisma from '@/lib/prisma';
import { awardPointsAndUpdateLevel } from './reputation';
import type {
  ReportCategory,
  SeverityLevel,
  ReportStatus,
  CaptureSource,
} from '@prisma/client';

export interface CreateReportInput {
  title: string;
  description: string;
  category: ReportCategory;
  severity?: SeverityLevel;
  lat: number;
  lng: number;
  address: string;
  kelurahan?: string;
  kecamatan?: string;
  isAnonymous?: boolean;
  authorId: string;
  mediaFiles: {
    fileUrl: string;
    mediaType?: string;
    isDirectCapture?: boolean;
    captureSource?: CaptureSource;
    metadataJson?: string;
    blurredUrl?: string;
  }[];
  verificationResult?: {
    authenticityScore: number;
    isLegitimate: boolean;
    confidence: number;
    aiFindingsJson?: string;
    suggestedCategory?: ReportCategory;
    suggestedSeverity?: SeverityLevel;
  };
}

/**
 * Generate a unique ticket number: ASP-BGR-YYYYMM-XXXX
 */
async function generateTicketNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const count = await prisma.report.count();
  const sequence = String(count + 1).padStart(4, '0');
  return `ASP-BGR-${dateStr}-${sequence}`;
}

/**
 * Create a new infrastructure report with full audit history and verification.
 */
export async function createReport(input: CreateReportInput) {
  const ticketNumber = await generateTicketNumber();

  return await prisma.$transaction(async (tx) => {
    // 1. Create Report
    const report = await tx.report.create({
      data: {
        ticketNumber,
        title: input.title,
        description: input.description,
        category: input.category,
        severity: input.severity ?? 'SEDANG',
        status: 'DITERIMA',
        lat: input.lat,
        lng: input.lng,
        address: input.address,
        kelurahan: input.kelurahan,
        kecamatan: input.kecamatan,
        isAnonymous: input.isAnonymous ?? false,
        authorId: input.authorId,
      },
    });

    // 2. Insert Media Attachments
    if (input.mediaFiles && input.mediaFiles.length > 0) {
      await tx.reportMedia.createMany({
        data: input.mediaFiles.map((m) => ({
          reportId: report.id,
          fileUrl: m.fileUrl,
          mediaType: m.mediaType ?? 'image/jpeg',
          isDirectCapture: m.isDirectCapture ?? false,
          captureSource: m.captureSource ?? 'GALLERY',
          metadataJson: m.metadataJson,
          blurredUrl: m.blurredUrl,
        })),
      });
    }

    // 3. Create Initial Status History (Append-only audit trail)
    await tx.statusHistory.create({
      data: {
        reportId: report.id,
        newStatus: 'DITERIMA',
        actorId: input.authorId,
        note: 'Laporan berhasil dibuat oleh warga dan tercatat dalam sistem.',
      },
    });

    // 4. Create Evidence Verification Record
    if (input.verificationResult) {
      await tx.evidenceVerification.create({
        data: {
          reportId: report.id,
          authenticityScore: input.verificationResult.authenticityScore,
          isLegitimate: input.verificationResult.isLegitimate,
          confidence: input.verificationResult.confidence,
          aiFindingsJson: input.verificationResult.aiFindingsJson,
          suggestedCategory: input.verificationResult.suggestedCategory,
          suggestedSeverity: input.verificationResult.suggestedSeverity,
          requiresHumanReview: input.verificationResult.authenticityScore < 0.7,
        },
      });
    }

    return report;
  });
}

/**
 * Transition report status with immutable audit history.
 */
export async function updateReportStatus(params: {
  reportId: string;
  newStatus: ReportStatus;
  actorId: string;
  note?: string;
  evidencePhotoUrl?: string;
  assignedAgency?: string;
  slaDeadline?: Date;
}) {
  return await prisma.$transaction(async (tx) => {
    const current = await tx.report.findUnique({
      where: { id: params.reportId },
    });

    if (!current) {
      throw new Error('Laporan tidak ditemukan.');
    }

    // Update Report status & agency details
    const updated = await tx.report.update({
      where: { id: params.reportId },
      data: {
        status: params.newStatus,
        assignedAgency: params.assignedAgency ?? current.assignedAgency,
        slaDeadline: params.slaDeadline ?? current.slaDeadline,
      },
    });

    // Append to Status History
    await tx.statusHistory.create({
      data: {
        reportId: params.reportId,
        previousStatus: current.status,
        newStatus: params.newStatus,
        actorId: params.actorId,
        note: params.note,
        evidencePhotoUrl: params.evidencePhotoUrl,
      },
    });

    // If evidence photo is provided (physical progress documentation), record to ReportMedia
    if (params.evidencePhotoUrl) {
      await tx.reportMedia.create({
        data: {
          reportId: params.reportId,
          fileUrl: params.evidencePhotoUrl,
          mediaType: 'IMAGE',
          isAfterPhoto: params.newStatus === 'DIATASI',
          isDirectCapture: true,
          captureSource: 'CAMERA_DIRECT',
        },
      });
    }

    // If reaching VERIFIKASI and author hasn't received reward yet, award points
    if (params.newStatus === 'VERIFIKASI') {
      const idempotencyKey = `report-verified-${current.id}`;
      await awardPointsAndUpdateLevel(
        tx,
        current.authorId,
        25,
        'REPORT_VERIFIED',
        current.id,
        idempotencyKey,
      );
    }

    return updated;
  });
}

/**
 * Get single report by ID or Ticket Number with all relations.
 */
export async function getReportDetails(identifier: string) {
  return await prisma.report.findFirst({
    where: {
      OR: [{ id: identifier }, { ticketNumber: identifier }],
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          reputationLevel: true,
        },
      },
      media: true,
      statusHistory: {
        include: {
          actor: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      verification: true,
      confirmations: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });
}

/**
 * Fetch reports with filters and pagination.
 */
export async function getReports(params?: {
  status?: ReportStatus;
  category?: ReportCategory;
  kecamatan?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  if (params?.status) where.status = params.status;
  if (params?.category) where.category = params.category;
  if (params?.kecamatan) where.kecamatan = params.kecamatan;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        media: true,
        confirmations: true,
      },
      orderBy: { createdAt: 'desc' },
      take: params?.limit ?? 20,
      skip: params?.offset ?? 0,
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, total };
}

/**
 * Confirm a report condition in the field (Citizen confirmation).
 */
export async function confirmReport(params: {
  reportId: string;
  userId: string;
  note?: string;
  photoUrl?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const confirmation = await tx.reportConfirmation.create({
      data: {
        reportId: params.reportId,
        userId: params.userId,
        note: params.note,
        photoUrl: params.photoUrl,
      },
    });

    // Award +10 points for field confirmation
    const idempotencyKey = `confirm-${params.reportId}-${params.userId}`;
    await awardPointsAndUpdateLevel(
      tx,
      params.userId,
      10,
      'CONFIRMATION_VALID',
      params.reportId,
      idempotencyKey,
    );

    return confirmation;
  });
}

