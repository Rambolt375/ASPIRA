import prisma from '@/lib/prisma';
import type { Role } from '@prisma/client';

export interface AdminUserFilter {
  role?: Role | 'SEMUA';
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Fetch platform-wide executive metrics for the Admin Dashboard.
 */
export async function getAdminPlatformStats() {
  const [
    totalUsers,
    usersByRole,
    totalReports,
    totalAuditLogs,
    totalAnnouncements,
    totalPointsIssued,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    }),
    prisma.report.count(),
    prisma.statusHistory.count(),
    prisma.cityAnnouncement.count(),
    prisma.pointTransaction.aggregate({
      _sum: { points: true },
    }),
  ]);

  const roleCounts: Record<string, number> = {
    USER: 0,
    PETUGAS: 0,
    LOCAL_GOVERNMENT: 0,
    ADMIN: 0,
  };

  usersByRole.forEach((g) => {
    roleCounts[g.role] = g._count._all;
  });

  return {
    totalUsers,
    roleCounts,
    totalReports,
    totalAuditLogs,
    totalAnnouncements,
    totalPointsIssued: totalPointsIssued._sum.points || 0,
  };
}

/**
 * Fetch users with filter and pagination for user management.
 */
export async function getAdminUsers(filter?: AdminUserFilter) {
  const where: Record<string, unknown> = {};

  if (filter?.role && filter.role !== 'SEMUA') {
    where.role = filter.role;
  }

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { email: { contains: filter.search, mode: 'insensitive' } },
      { kecamatan: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        kecamatan: true,
        kelurahan: true,
        phone: true,
        contributionPoints: true,
        reputationLevel: true,
        createdAt: true,
        _count: {
          select: { reports: true, posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.limit ?? 25,
      skip: filter?.offset ?? 0,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

/**
 * Provision / update a user's role (Restricted to ADMIN).
 */
export async function updateUserRole(input: {
  targetUserId: string;
  newRole: Role;
  adminId: string;
  note?: string;
}) {
  const admin = await prisma.user.findUnique({
    where: { id: input.adminId },
    select: { role: true, name: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    throw new Error('Hanya akun dengan peran ADMIN yang dapat mengubah hak akses pengguna.');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: input.targetUserId },
  });

  if (!targetUser) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  const updated = await prisma.user.update({
    where: { id: input.targetUserId },
    data: { role: input.newRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return updated;
}

/**
 * Fetch immutable city-wide audit logs.
 */
export async function getAdminAuditLogs(limit = 40, offset = 0) {
  const [logs, total] = await Promise.all([
    prisma.statusHistory.findMany({
      include: {
        report: {
          select: {
            id: true,
            ticketNumber: true,
            title: true,
            category: true,
            assignedAgency: true,
          },
        },
        actor: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.statusHistory.count(),
  ]);

  return { logs, total };
}
