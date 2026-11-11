import type { Report, ReportStatus } from '@/types';

/**
 * Client service for reports interacting with ASPIRA API routes.
 */

export async function createReport(
  data: Partial<Report> & {
    title: string;
    description: string;
    category: Report['category'];
    authorId: string;
    address: string;
    lat: number;
    lng: number;
  },
): Promise<string> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      mediaFiles: (data.photoUrls || []).map((url) => ({
        fileUrl: url,
        mediaType: 'image/jpeg',
        isDirectCapture: false,
      })),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Gagal mengirim laporan.');
  }

  return json.report.id;
}

export async function getReport(id: string): Promise<Report | null> {
  const res = await fetch(`/api/reports/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Gagal memuat laporan.');
  }

  const json = await res.json();
  const r = json.report;

  return {
    id: r.id,
    ticketNumber: r.ticketNumber,
    title: r.title,
    description: r.description,
    category: r.category,
    severity: r.severity,
    location: { lat: r.lat, lng: r.lng },
    address: r.address,
    kelurahan: r.kelurahan,
    kecamatan: r.kecamatan,
    photoUrls: (r.media || []).map((m: { fileUrl: string }) => m.fileUrl),
    media: r.media,
    status: r.status,
    statusHistory: (r.statusHistory || []).map((sh: { newStatus: ReportStatus; createdAt: string; actorId: string; actor?: { name: string }; note?: string; evidencePhotoUrl?: string }) => ({
      status: sh.newStatus,
      timestamp: sh.createdAt,
      actorId: sh.actorId,
      actorName: sh.actor?.name,
      note: sh.note,
      photoUrl: sh.evidencePhotoUrl,
    })),
    authorId: r.authorId,
    authorName: r.author?.name || 'Warga',
    authorEmail: r.author?.email || null,
    assignedAgency: r.assignedAgency,
    slaDeadline: r.slaDeadline,
    verification: r.verification,
    communityConfirmations: (r.confirmations || []).map((c: { userId: string }) => c.userId),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function getReports(params?: {
  status?: ReportStatus;
  category?: Report['category'];
  kecamatan?: string;
  limit?: number;
  offset?: number;
}): Promise<{ reports: Report[]; total: number }> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.category) search.set('category', params.category);
  if (params?.kecamatan) search.set('kecamatan', params.kecamatan);
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.offset) search.set('offset', String(params.offset));

  const res = await fetch(`/api/reports?${search.toString()}`);
  if (!res.ok) {
    throw new Error('Gagal memuat daftar laporan.');
  }

  const json = await res.json();
  const list = (json.reports || []).map((r: {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    category: Report['category'];
    severity: Report['severity'];
    lat: number;
    lng: number;
    address: string;
    kelurahan?: string;
    kecamatan?: string;
    media: { fileUrl: string }[];
    status: ReportStatus;
    authorId: string;
    author?: { name: string; email?: string | null };
    assignedAgency?: string;
    slaDeadline?: string;
    confirmations?: { userId: string }[];
    createdAt: string;
    updatedAt: string;
  }) => ({
    id: r.id,
    ticketNumber: r.ticketNumber,
    title: r.title,
    description: r.description,
    category: r.category,
    severity: r.severity,
    location: { lat: r.lat, lng: r.lng },
    address: r.address,
    kelurahan: r.kelurahan,
    kecamatan: r.kecamatan,
    photoUrls: (r.media || []).map((m) => m.fileUrl),
    status: r.status,
    statusHistory: [],
    authorId: r.authorId,
    authorName: r.author?.name || 'Warga',
    authorEmail: r.author?.email || null,
    assignedAgency: r.assignedAgency,
    slaDeadline: r.slaDeadline,
    communityConfirmations: (r.confirmations || []).map((c) => c.userId),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  return { reports: list, total: json.total || 0 };
}

export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  actorId: string,
  note?: string,
  evidencePhotoUrl?: string,
): Promise<void> {
  const res = await fetch(`/api/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStatus, actorId, note, evidencePhotoUrl }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Gagal mengubah status laporan.');
  }
}

export async function addCommunityConfirmation(reportId: string, userId: string, note?: string): Promise<void> {
  const res = await fetch(`/api/reports/${reportId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, note }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Gagal menambahkan konfirmasi.');
  }
}
