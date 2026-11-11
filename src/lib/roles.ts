import type { Role } from '@prisma/client';

export const ROLE_WORKSPACES: Record<Role, string> = {
  USER: '/beranda',
  PETUGAS: '/petugas',
  LOCAL_GOVERNMENT: '/dinas',
  ADMIN: '/admin',
};

export const WORKSPACE_PERMITTED_ROLES: Record<string, Role[]> = {
  '/dinas': ['LOCAL_GOVERNMENT'],
  '/petugas': ['PETUGAS'],
  '/admin': ['ADMIN'],
};

export function getRoleWorkspace(role: Role | 'WARGA' | undefined | null): string {
  if (!role || role === 'WARGA') return '/beranda';
  return ROLE_WORKSPACES[role] || '/beranda';
}
